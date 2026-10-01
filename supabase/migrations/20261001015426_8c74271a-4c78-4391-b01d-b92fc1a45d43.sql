CREATE UNIQUE INDEX IF NOT EXISTS stokvel_workspaces_owner_unique ON public.stokvel_workspaces(owner_id);

CREATE OR REPLACE FUNCTION public.validate_workspace()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF pg_column_size(NEW.*) > 2000000 THEN
    RAISE EXCEPTION 'Workspace data too large';
  END IF;
  IF jsonb_typeof(NEW.stokvels) <> 'array' OR jsonb_typeof(NEW.members) <> 'array'
     OR jsonb_typeof(NEW.contributions) <> 'array' OR jsonb_typeof(NEW.payouts) <> 'array'
     OR jsonb_typeof(NEW.loans) <> 'array' OR jsonb_typeof(NEW.proposals) <> 'array'
     OR jsonb_typeof(NEW.transactions) <> 'array' OR jsonb_typeof(NEW.notifications) <> 'array'
     OR jsonb_typeof(NEW.security_settings) <> 'object' THEN
    RAISE EXCEPTION 'Invalid workspace format';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.owner_id <> OLD.owner_id THEN
    RAISE EXCEPTION 'Owner cannot be changed';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.validate_workspace() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS workspaces_validate ON public.stokvel_workspaces;
CREATE TRIGGER workspaces_validate BEFORE INSERT OR UPDATE ON public.stokvel_workspaces
FOR EACH ROW EXECUTE FUNCTION public.validate_workspace();

UPDATE public.stokvel_workspaces SET
  stokvels = replace(replace(replace(stokvels::text, 'Sisonke Wealth & Property Syndicate', 'Sisonke Family Savings Club'), '"type":"Investment"', '"type":"Savings"'), 'A forward-thinking investment group focused on purchasing commercial REITs and suburban rental property assets.', 'A community savings club where members contribute monthly and take turns receiving the pooled payout.')::jsonb,
  security_settings = (security_settings || '{"groupName":"Sisonke Family Savings Club","adminIdNumber":""}'::jsonb),
  payouts = replace(payouts::text, ' plus interest accrual dividend', '')::jsonb;