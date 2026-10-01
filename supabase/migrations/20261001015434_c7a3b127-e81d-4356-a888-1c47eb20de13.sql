DO $$
DECLARE def text;
BEGIN
  SELECT pg_get_functiondef('public.handle_new_user()'::regprocedure) INTO def;
  def := replace(def, 'Sisonke Wealth & Property Syndicate', 'Sisonke Family Savings Club');
  def := replace(def, '"type":"Investment"', '"type":"Savings"');
  def := replace(def, 'A forward-thinking investment group focused on purchasing commercial REITs and suburban rental property assets.', 'A community savings club where members contribute monthly and take turns receiving the pooled payout.');
  def := replace(def, ' plus interest accrual dividend', '');
  def := replace(def, '"adminIdNumber":"8604125800084"', '"adminIdNumber":""');
  EXECUTE def;
END $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;