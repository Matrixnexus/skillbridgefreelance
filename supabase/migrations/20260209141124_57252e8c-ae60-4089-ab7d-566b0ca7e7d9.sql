
-- Backfill referral codes for existing premium users who don't have one
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR rec IN SELECT id FROM profiles WHERE membership_tier IN ('regular', 'pro', 'vip') AND referral_code IS NULL LOOP
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE profiles SET referral_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;

-- Backfill task_earnings for all existing users
UPDATE profiles 
SET task_earnings = GREATEST(0, COALESCE(approved_earnings, 0) - COALESCE(referral_earnings, 0))
WHERE task_earnings = 0 AND approved_earnings > 0;
