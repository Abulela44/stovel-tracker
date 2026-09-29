CREATE TYPE public.app_role AS ENUM ('admin', 'officer', 'member');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.stokvel_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  stokvels jsonb NOT NULL DEFAULT '[]'::jsonb,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  contributions jsonb NOT NULL DEFAULT '[]'::jsonb,
  payouts jsonb NOT NULL DEFAULT '[]'::jsonb,
  loans jsonb NOT NULL DEFAULT '[]'::jsonb,
  proposals jsonb NOT NULL DEFAULT '[]'::jsonb,
  transactions jsonb NOT NULL DEFAULT '[]'::jsonb,
  notifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  security_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stokvel_workspaces TO authenticated;
GRANT ALL ON public.stokvel_workspaces TO service_role;
ALTER TABLE public.stokvel_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workspace" ON public.stokvel_workspaces FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own workspace" ON public.stokvel_workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own workspace" ON public.stokvel_workspaces FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete own workspace" ON public.stokvel_workspaces FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON public.stokvel_workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)), COALESCE(NEW.email, ''));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');

  INSERT INTO public.stokvel_workspaces (
    owner_id, stokvels, members, contributions, payouts, loans, proposals, transactions, notifications, security_settings
  ) VALUES (
    NEW.id,
    '[{"id":"stokvel-1","name":"Sisonke Wealth & Property Syndicate","code":"SWPS-2025","type":"Investment","totalBalance":485000,"monthlyContribution":3500,"targetAmount":750000,"cycleDay":25,"memberCount":6,"currency":"ZAR","bankName":"First National Bank (FNB)","accountNumber":"62849102847","photoUrl":"https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800","description":"A forward-thinking investment group focused on purchasing commercial REITs and suburban rental property assets.","yieldRate":11.2,"createdDate":"2023-01-15"}]'::jsonb,
    '[{"id":"mem-1","stokvelId":"stokvel-1","name":"Thabo Mokoena","role":"Chairperson","avatar":"https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 82 491 0293","email":"thabo.m@sisonke.co.za","totalContributed":45500,"status":"paid","joinDate":"2023-01-15","equityPercentage":12.5,"payoutMonth":"December","payoutOrder":12},{"id":"mem-2","stokvelId":"stokvel-1","name":"Nomvula Khumalo","role":"Treasurer","avatar":"https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 73 182 9384","email":"nomvula.k@gmail.com","totalContributed":42000,"status":"paid","joinDate":"2023-01-15","equityPercentage":11.8,"payoutMonth":"May","payoutOrder":5},{"id":"mem-3","stokvelId":"stokvel-1","name":"Sipho Dlamini","role":"Secretary","avatar":"https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 84 920 1823","email":"sipho.dlamini@outlook.com","totalContributed":38500,"status":"pending","joinDate":"2023-02-01","equityPercentage":10.2,"payoutMonth":"June","payoutOrder":6},{"id":"mem-4","stokvelId":"stokvel-1","name":"Zanele Naidoo","role":"Member","avatar":"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 71 883 9201","email":"zanele.n@techfirm.co.za","totalContributed":35000,"status":"overdue","joinDate":"2023-03-10","equityPercentage":9.5,"payoutMonth":"July","payoutOrder":7},{"id":"mem-5","stokvelId":"stokvel-1","name":"Kagiso Lekota","role":"Member","avatar":"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 83 291 0022","email":"k.lekota@construction.co.za","totalContributed":42000,"status":"paid","joinDate":"2023-01-15","equityPercentage":11.8,"payoutMonth":"August","payoutOrder":8},{"id":"mem-6","stokvelId":"stokvel-1","name":"Lerato Ndlovu","role":"Member","avatar":"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200","phone":"+27 79 384 1029","email":"lerato.ndlovu@health.gov.za","totalContributed":31500,"status":"paid","joinDate":"2023-04-01","equityPercentage":8.5,"payoutMonth":"September","payoutOrder":9}]'::jsonb,
    '[]'::jsonb,
    '[{"id":"pay-1","stokvelId":"stokvel-1","memberId":"mem-2","memberName":"Nomvula Khumalo","memberAvatar":"https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200","month":"May 2025","amount":42000,"payoutDate":"2025-05-30","status":"upcoming","notes":"Mid-year rotation distribution plus interest accrual dividend."}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[{"id":"welcome","title":"Welcome to Sisonke","message":"Your secure stokvel workspace is ready.","kind":"success","read":false}]'::jsonb,
    '{"groupName":"Sisonke Wealth & Property Syndicate","adminName":"Sipho Ndlovu","adminIdNumber":"8604125800084","adminPhone":"+27 82 555 1234","isIdVerified":true,"multiSignThreshold":1000,"requiredApprovals":2,"constitutionAgreed":true,"bankAccountVerified":true}'::jsonb
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();