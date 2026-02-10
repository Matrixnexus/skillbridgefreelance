
-- Drop the old trigger/function with CASCADE
DROP TRIGGER IF EXISTS trigger_assign_referral_code ON profiles;
DROP FUNCTION IF EXISTS public.assign_referral_code() CASCADE;

-- Create function for payment-based referral crediting
CREATE OR REPLACE FUNCTION public.credit_referral_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referred_by UUID;
  v_referral_record RECORD;
BEGIN
  IF NEW.status = 'captured' AND (OLD.status IS NULL OR OLD.status != 'captured') THEN
    SELECT referred_by INTO v_referred_by
    FROM profiles WHERE id = NEW.user_id;
    
    IF v_referred_by IS NOT NULL THEN
      SELECT * INTO v_referral_record
      FROM referrals 
      WHERE referred_id = NEW.user_id 
        AND referrer_id = v_referred_by 
        AND status = 'pending'
      LIMIT 1;
      
      IF v_referral_record.id IS NOT NULL THEN
        UPDATE profiles 
        SET referral_earnings = COALESCE(referral_earnings, 0) + v_referral_record.bonus_amount,
            approved_earnings = COALESCE(approved_earnings, 0) + v_referral_record.bonus_amount,
            total_earnings = COALESCE(total_earnings, 0) + v_referral_record.bonus_amount,
            pending_earnings = GREATEST(0, COALESCE(pending_earnings, 0) - v_referral_record.bonus_amount),
            updated_at = now()
        WHERE id = v_referred_by;
        
        UPDATE referrals 
        SET status = 'credited', credited_at = now(), updated_at = now()
        WHERE id = v_referral_record.id;
        
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (v_referred_by, 'Referral Bonus Credited!', 
          'Your $' || v_referral_record.bonus_amount || ' referral bonus has been credited!', 'referral_bonus');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create triggers
DROP TRIGGER IF EXISTS credit_referral_on_payment_trigger ON paypal_orders;
CREATE TRIGGER credit_referral_on_payment_trigger
  AFTER UPDATE ON paypal_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_referral_on_payment();

DROP TRIGGER IF EXISTS credit_referral_bonus_trigger ON profiles;
CREATE TRIGGER credit_referral_bonus_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_referral_bonus();

DROP TRIGGER IF EXISTS sync_task_earnings_trigger ON profiles;
CREATE TRIGGER sync_task_earnings_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_earnings();

-- Backfill 6-digit codes
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM profiles WHERE referral_code IS NULL OR length(referral_code) != 6 LOOP
    LOOP
      new_code := (SELECT string_agg(substr('0123456789', floor(random()*10+1)::int, 1), '') FROM generate_series(1,6));
      SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE profiles SET referral_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;
