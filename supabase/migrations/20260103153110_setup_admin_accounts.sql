/*
  # Setup Admin Accounts
  
  1. Purpose
    - Assigns admin roles to the 5 designated SkillBridge admin accounts
    - Ensures only these specific emails have admin access
  
  2. Admin Accounts
    - skillbridge0001@gmail.com
    - skillbridge0002@gmail.com
    - skillbridge0003@gmail.com
    - skillbridge0004@gmail.com
    - skillbridge0005@gmail.com
  
  3. Security
    - Uses ON CONFLICT to prevent duplicate role assignments
    - Only works if the auth accounts already exist
    - RLS policies already protect admin functions
  
  4. Notes
    - Admin accounts must be created via Supabase Auth first (either through UI signup or Supabase Dashboard)
    - After running this migration, these users will have access to /admin
    - All other users will be redirected from /admin to /dashboard
*/

-- Insert admin roles for the 5 designated admin accounts
-- This will only work if the accounts have already been created in auth.users
INSERT INTO user_roles (user_id, role)
SELECT 
  au.id,
  'admin'::app_role
FROM auth.users au
WHERE au.email IN (
  'skillbridge0001@gmail.com',
  'skillbridge0002@gmail.com',
  'skillbridge0003@gmail.com',
  'skillbridge0004@gmail.com',
  'skillbridge0005@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify admin roles were assigned
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE au.email IN (
    'skillbridge0001@gmail.com',
    'skillbridge0002@gmail.com',
    'skillbridge0003@gmail.com',
    'skillbridge0004@gmail.com',
    'skillbridge0005@gmail.com'
  )
  AND ur.role = 'admin';
  
  RAISE NOTICE 'Admin roles assigned to % out of 5 accounts', admin_count;
  
  IF admin_count = 0 THEN
    RAISE NOTICE 'No admin accounts found. Please create the admin accounts first via Supabase Auth.';
  END IF;
END $$;
