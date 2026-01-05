# Admin Accounts Setup Guide

## Creating Admin Accounts

Since admin accounts need to be authenticated through Supabase Auth, you need to create them first, then assign admin roles.

### Step 1: Create the 5 Admin Accounts

You have two options:

#### Option A: Create via Website UI (Recommended)
1. Go to your website at `/auth`
2. Sign up for each of these 5 accounts:
   - skillbridge0001@gmail.com
   - skillbridge0002@gmail.com
   - skillbridge0003@gmail.com
   - skillbridge0004@gmail.com
   - skillbridge0005@gmail.com
3. Use password: `Matrix@1991` for all accounts
4. Complete email verification if required

#### Option B: Create via Supabase Dashboard
1. Go to your Supabase Dashboard > Authentication > Users
2. Click "Add user" and manually create each account with:
   - Email: skillbridge0001@gmail.com (and so on)
   - Password: Matrix@1991
   - Auto Confirm User: Yes (skip email verification)

### Step 2: Assign Admin Roles

Once all 5 accounts are created, the migration will automatically assign them admin roles.

The migration has been created and will run automatically. If you need to manually verify or add admin roles, you can use this SQL query in Supabase SQL Editor:

```sql
-- Check which admin accounts exist
SELECT email, id
FROM auth.users
WHERE email IN (
  'skillbridge0001@gmail.com',
  'skillbridge0002@gmail.com',
  'skillbridge0003@gmail.com',
  'skillbridge0004@gmail.com',
  'skillbridge0005@gmail.com'
);

-- Manually add admin roles if needed
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
  'skillbridge0001@gmail.com',
  'skillbridge0002@gmail.com',
  'skillbridge0003@gmail.com',
  'skillbridge0004@gmail.com',
  'skillbridge0005@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify Admin Access

1. Sign in with one of the admin accounts
2. Navigate to `/admin`
3. You should see the Admin Panel with options to:
   - Create jobs
   - Manage jobs
   - Review submissions
   - View analytics

### Security Notes

- Only these 5 email addresses will have admin access
- The admin panel is protected by Row Level Security (RLS)
- Regular users cannot access admin functions even if they guess the URL
- Admin roles are checked both in the UI and at the database level

### Troubleshooting

**Issue: "Cannot access admin panel"**
- Solution: Ensure the user account exists in `auth.users` and has a corresponding entry in `user_roles` table with role = 'admin'

**Issue: "Admin link not showing in sidebar"**
- Solution: Sign out and sign back in to refresh the authentication state

**Issue: "Permission denied when creating jobs"**
- Solution: Check that your RLS policies allow admin users to insert into the jobs table
