-- =============================================
-- REFERRAL SYSTEM AND WITHDRAWAL REQUEST TABLES
-- =============================================

-- 1. Add referral-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS task_earnings NUMERIC DEFAULT 0;

-- 2. Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_tier membership_tier NOT NULL DEFAULT 'none',
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, credited, expired
  credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id) -- One person can only be referred once
);

-- 3. Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  balance_type VARCHAR(20) NOT NULL CHECK (balance_type IN ('referral', 'task')),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
  payment_details JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for referrals
CREATE POLICY "Users can view own referrals as referrer" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view if they were referred" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referred_id);

CREATE POLICY "Admins can manage all referrals" 
ON public.referrals 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- 6. RLS Policies for withdrawal_requests
CREATE POLICY "Users can view own withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests" 
ON public.withdrawal_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- 7. Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 8. Function to assign referral code to premium users
CREATE OR REPLACE FUNCTION public.assign_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Only assign code if upgrading to a premium tier and don't have one
  IF NEW.membership_tier IN ('regular', 'pro', 'vip') 
     AND OLD.membership_tier = 'none' 
     AND NEW.referral_code IS NULL THEN
    
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.referral_code := new_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Create trigger for referral code assignment
DROP TRIGGER IF EXISTS trigger_assign_referral_code ON public.profiles;
CREATE TRIGGER trigger_assign_referral_code
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_referral_code();

-- 10. Function to credit referral bonus when referred user upgrades
CREATE OR REPLACE FUNCTION public.credit_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  bonus NUMERIC := 0;
BEGIN
  -- Check if user was referred and is upgrading to a paid tier
  IF NEW.membership_tier IN ('regular', 'pro', 'vip') 
     AND OLD.membership_tier = 'none' 
     AND NEW.referred_by IS NOT NULL THEN
    
    -- Get referrer's user id
    referrer_user_id := NEW.referred_by;
    
    -- Calculate bonus based on tier
    CASE NEW.membership_tier
      WHEN 'regular' THEN bonus := 5;
      WHEN 'pro' THEN bonus := 10;
      WHEN 'vip' THEN bonus := 15;
      ELSE bonus := 0;
    END CASE;
    
    -- Check if referrer has a premium tier
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = referrer_user_id 
      AND membership_tier IN ('regular', 'pro', 'vip')
    ) THEN
      -- Update referrer's referral earnings
      UPDATE profiles 
      SET referral_earnings = COALESCE(referral_earnings, 0) + bonus,
          total_earnings = COALESCE(total_earnings, 0) + bonus,
          approved_earnings = COALESCE(approved_earnings, 0) + bonus
      WHERE id = referrer_user_id;
      
      -- Update referral record
      UPDATE referrals 
      SET status = 'credited',
          bonus_amount = bonus,
          referred_tier = NEW.membership_tier,
          credited_at = now(),
          updated_at = now()
      WHERE referred_id = NEW.id AND referrer_id = referrer_user_id;
      
      -- Create notification for referrer
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        referrer_user_id,
        'Referral Bonus Earned!',
        'You earned $' || bonus || ' from a referral! Your friend just joined as a ' || NEW.membership_tier || ' member.',
        'referral_bonus'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. Create trigger for referral bonus credit
DROP TRIGGER IF EXISTS trigger_credit_referral_bonus ON public.profiles;
CREATE TRIGGER trigger_credit_referral_bonus
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_referral_bonus();

-- 12. Function to update task earnings when approved_earnings changes (sync)
CREATE OR REPLACE FUNCTION public.sync_task_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate task_earnings = approved_earnings - referral_earnings
  NEW.task_earnings := GREATEST(0, COALESCE(NEW.approved_earnings, 0) - COALESCE(NEW.referral_earnings, 0));
  RETURN NEW;
END;
$$;

-- 13. Create trigger to sync task earnings
DROP TRIGGER IF EXISTS trigger_sync_task_earnings ON public.profiles;
CREATE TRIGGER trigger_sync_task_earnings
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_earnings();

-- 14. Update updated_at trigger for new tables
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 15. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
