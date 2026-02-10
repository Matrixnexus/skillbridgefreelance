
-- Fix handle_new_user to process referral codes server-side
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    public.generate_referral_code()
  );
  
  -- Assign freelancer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'freelancer');
  
  -- Process referral code if provided
  v_referral_code := NEW.raw_user_meta_data ->> 'referral_code';
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Look up the referrer
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE referral_code = v_referral_code
    LIMIT 1;
    
    IF v_referrer_id IS NOT NULL THEN
      -- Set referred_by on the new user's profile
      UPDATE public.profiles
      SET referred_by = v_referrer_id
      WHERE id = NEW.id;
      
      -- Create referral record with $5 pending bonus
      INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount, status)
      VALUES (v_referrer_id, NEW.id, 5, 'pending');
      
      -- Add $5 to referrer's pending earnings immediately
      UPDATE public.profiles
      SET pending_earnings = COALESCE(pending_earnings, 0) + 5,
          updated_at = now()
      WHERE id = v_referrer_id;
      
      -- Notify the referrer
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (
        v_referrer_id,
        'New Referral!',
        'Someone signed up using your referral code! $5 is now pending in your account.',
        'referral_pending'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
