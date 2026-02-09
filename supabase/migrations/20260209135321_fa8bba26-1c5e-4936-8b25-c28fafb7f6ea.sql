
-- Drop and recreate only the missing referral-related triggers
-- Use IF NOT EXISTS pattern via DO block

DO $$
BEGIN
  -- Drop if exists, then create referral triggers
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'assign_referral_code_trigger') THEN
    CREATE TRIGGER assign_referral_code_trigger
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.assign_referral_code();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'credit_referral_bonus_trigger') THEN
    CREATE TRIGGER credit_referral_bonus_trigger
      AFTER UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.credit_referral_bonus();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_task_earnings_trigger') THEN
    CREATE TRIGGER sync_task_earnings_trigger
      BEFORE INSERT OR UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_task_earnings();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_referrals_updated_at') THEN
    CREATE TRIGGER update_referrals_updated_at
      BEFORE UPDATE ON public.referrals
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_withdrawal_requests_updated_at') THEN
    CREATE TRIGGER update_withdrawal_requests_updated_at
      BEFORE UPDATE ON public.withdrawal_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- Create a secure function for referral code lookup (bypasses RLS)
CREATE OR REPLACE FUNCTION public.lookup_referral_code(p_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE referral_code = p_code LIMIT 1;
$$;
