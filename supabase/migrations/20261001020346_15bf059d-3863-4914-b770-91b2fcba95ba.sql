-- Membership with roles
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.stokvel_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text NOT NULL DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
GRANT SELECT ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.stokvel_workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);
GRANT SELECT ON public.workspace_invites TO authenticated;
GRANT ALL ON public.workspace_invites TO service_role;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.stokvel_workspaces(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_log_ws_idx ON public.activity_log(workspace_id, created_at DESC);
GRANT SELECT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Helper
CREATE OR REPLACE FUNCTION public.workspace_role(_ws uuid, _uid uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _uid LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.workspace_role(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.workspace_role(uuid, uuid) TO authenticated;

-- Policies
CREATE POLICY "Members see co-members" ON public.workspace_members FOR SELECT TO authenticated
  USING (public.workspace_role(workspace_id, auth.uid()) IS NOT NULL);
CREATE POLICY "Admins see invites" ON public.workspace_invites FOR SELECT TO authenticated
  USING (public.workspace_role(workspace_id, auth.uid()) = 'admin');
CREATE POLICY "Admins see activity" ON public.activity_log FOR SELECT TO authenticated
  USING (public.workspace_role(workspace_id, auth.uid()) = 'admin' OR actor_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own workspace" ON public.stokvel_workspaces;
DROP POLICY IF EXISTS "Users can update own workspace" ON public.stokvel_workspaces;
CREATE POLICY "Members can view workspace" ON public.stokvel_workspaces FOR SELECT TO authenticated
  USING (public.workspace_role(id, auth.uid()) IS NOT NULL);
CREATE POLICY "Admins and officers can update workspace" ON public.stokvel_workspaces FOR UPDATE TO authenticated
  USING (public.workspace_role(id, auth.uid()) IN ('admin','officer'))
  WITH CHECK (public.workspace_role(id, auth.uid()) IN ('admin','officer'));

-- Backfill owners as admins
INSERT INTO public.workspace_members (workspace_id, user_id, email, role)
SELECT w.id, w.owner_id, COALESCE(p.email, ''), 'admin' FROM public.stokvel_workspaces w
LEFT JOIN public.profiles p ON p.id = w.owner_id
ON CONFLICT DO NOTHING;

-- Owner becomes admin automatically on new workspace
CREATE OR REPLACE FUNCTION public.add_owner_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, email, role)
  VALUES (NEW.id, NEW.owner_id, COALESCE((SELECT email FROM public.profiles WHERE id = NEW.owner_id), ''), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.add_owner_membership() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER workspaces_owner_member AFTER INSERT ON public.stokvel_workspaces
FOR EACH ROW EXECUTE FUNCTION public.add_owner_membership();

-- Permission enforcement + audit on workspace changes
CREATE OR REPLACE FUNCTION public.audit_workspace_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role; changed text[] := '{}'; col text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  r := public.workspace_role(NEW.id, auth.uid());
  IF r IS NULL OR r = 'member' THEN RAISE EXCEPTION 'You have view-only access'; END IF;
  IF r = 'officer' AND NEW.security_settings IS DISTINCT FROM OLD.security_settings THEN
    RAISE EXCEPTION 'Only admins can change security settings';
  END IF;
  FOREACH col IN ARRAY ARRAY['stokvels','members','contributions','payouts','loans','proposals','transactions','security_settings'] LOOP
    IF to_jsonb(NEW)->col IS DISTINCT FROM to_jsonb(OLD)->col THEN changed := changed || col; END IF;
  END LOOP;
  IF array_length(changed, 1) > 0 THEN
    INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
    VALUES (NEW.id, auth.uid(), COALESCE(auth.jwt()->>'email',''), 'records_changed',
      jsonb_build_object('sections', to_jsonb(changed), 'role', r));
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.audit_workspace_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER workspaces_audit BEFORE UPDATE ON public.stokvel_workspaces
FOR EACH ROW EXECUTE FUNCTION public.audit_workspace_change();

-- Sign-in logging + invite acceptance (called by the app after sign-in)
CREATE OR REPLACE FUNCTION public.record_sign_in()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE em text := lower(COALESCE(auth.jwt()->>'email','')); inv record; ws uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  FOR inv IN SELECT * FROM public.workspace_invites WHERE lower(email) = em AND accepted_at IS NULL LOOP
    INSERT INTO public.workspace_members (workspace_id, user_id, email, role)
    VALUES (inv.workspace_id, auth.uid(), em, inv.role)
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    UPDATE public.workspace_invites SET accepted_at = now() WHERE id = inv.id;
    INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
    VALUES (inv.workspace_id, auth.uid(), em, 'invite_accepted', jsonb_build_object('role', inv.role));
  END LOOP;
  FOR ws IN SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() LOOP
    INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action)
    VALUES (ws, auth.uid(), em, 'signed_in');
  END LOOP;
END; $$;
REVOKE EXECUTE ON FUNCTION public.record_sign_in() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_sign_in() TO authenticated;

-- Admin actions: invite, change role, remove
CREATE OR REPLACE FUNCTION public.invite_member(_ws uuid, _email text, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE em text := lower(trim(_email));
BEGIN
  IF public.workspace_role(_ws, auth.uid()) IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Only admins can invite'; END IF;
  IF em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(em) > 255 THEN RAISE EXCEPTION 'Invalid email'; END IF;
  INSERT INTO public.workspace_invites (workspace_id, email, role, invited_by)
  VALUES (_ws, em, _role, auth.uid())
  ON CONFLICT (workspace_id, email) DO UPDATE SET role = EXCLUDED.role, accepted_at = NULL;
  INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
  VALUES (_ws, auth.uid(), COALESCE(auth.jwt()->>'email',''), 'member_invited', jsonb_build_object('email', em, 'role', _role));
END; $$;

CREATE OR REPLACE FUNCTION public.set_member_role(_ws uuid, _user uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.workspace_role(_ws, auth.uid()) IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Only admins can change roles'; END IF;
  IF _user = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own role'; END IF;
  UPDATE public.workspace_members SET role = _role WHERE workspace_id = _ws AND user_id = _user;
  INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
  VALUES (_ws, auth.uid(), COALESCE(auth.jwt()->>'email',''), 'role_changed',
    jsonb_build_object('user', (SELECT email FROM public.workspace_members WHERE workspace_id=_ws AND user_id=_user), 'role', _role));
END; $$;

CREATE OR REPLACE FUNCTION public.remove_member(_ws uuid, _user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE em text;
BEGIN
  IF public.workspace_role(_ws, auth.uid()) IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Only admins can remove people'; END IF;
  IF _user = auth.uid() THEN RAISE EXCEPTION 'You cannot remove yourself'; END IF;
  DELETE FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user RETURNING email INTO em;
  INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
  VALUES (_ws, auth.uid(), COALESCE(auth.jwt()->>'email',''), 'member_removed', jsonb_build_object('user', em));
END; $$;

CREATE OR REPLACE FUNCTION public.cancel_invite(_invite uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ws uuid; em text;
BEGIN
  SELECT workspace_id, email INTO ws, em FROM public.workspace_invites WHERE id = _invite;
  IF ws IS NULL OR public.workspace_role(ws, auth.uid()) IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Not allowed'; END IF;
  DELETE FROM public.workspace_invites WHERE id = _invite;
  INSERT INTO public.activity_log (workspace_id, actor_id, actor_email, action, details)
  VALUES (ws, auth.uid(), COALESCE(auth.jwt()->>'email',''), 'invite_cancelled', jsonb_build_object('email', em));
END; $$;

REVOKE EXECUTE ON FUNCTION public.invite_member(uuid, text, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_member_role(uuid, uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_member(uuid, text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_role(uuid, uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_invite(uuid) TO authenticated;