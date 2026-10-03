CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE gname text := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(COALESCE(NEW.email,''),'@',1)) || '''s Stokvel';
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)), COALESCE(NEW.email, ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  INSERT INTO public.stokvel_workspaces (owner_id, stokvels, security_settings) VALUES (
    NEW.id,
    jsonb_build_array(jsonb_build_object('id','stokvel-1','name',gname,'code','','type','Savings','totalBalance',0,'monthlyContribution',0,'targetAmount',0,'cycleDay',25,'memberCount',0,'currency','ZAR','bankName','','accountNumber','','photoUrl','','description','Add your members and record contributions to get started.','yieldRate',0,'createdDate',to_char(now(),'YYYY-MM-DD'))),
    jsonb_build_object('groupName',gname,'adminName','','adminIdNumber','','adminPhone','','isIdVerified',false,'multiSignThreshold',1000,'requiredApprovals',2,'constitutionAgreed',false,'bankAccountVerified',false)
  );
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;