# Quick Start Guide

## Payment Integration Setup

### Step 1: Get PayPal Credentials
1. Create a PayPal Business account at https://www.paypal.com
2. Go to https://developer.paypal.com/dashboard
3. Create an app and copy your Client ID

### Step 2: Update the Code
Open `src/pages/Checkout.tsx` and find this line (around line 47):
```typescript
script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
```

Replace `sb` with your actual PayPal Client ID:
```typescript
script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD';
```

### Step 3: Test the Payment Flow
1. Start your dev server: `npm run dev`
2. Sign up for an account
3. Go to `/pricing`
4. Click on any plan
5. You'll be redirected to `/checkout?plan=regular` (or pro/vip)
6. Complete the PayPal payment
7. Your membership will be automatically upgraded

## Admin Panel Setup

### Step 1: Create Admin Users
1. Have your admin users sign up normally at `/auth`
2. Go to Supabase Dashboard > SQL Editor
3. Run this query for each admin:

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then add admin role
INSERT INTO user_roles (user_id, role)
VALUES ('user_id_here', 'admin');
```

### Step 2: Access Admin Panel
Once a user has admin role:
- Navigate to `/admin`
- The admin link will appear in their dashboard sidebar
- They can now create and manage jobs

### Creating Jobs as Admin
In the admin panel at `/admin`:
1. Click "Create Job" button
2. Fill in:
   - Job title and description
   - Instructions for freelancers
   - Payment amount
   - Difficulty level (easy/medium/hard)
   - Required membership tier
   - Category
   - Estimated time
3. Click "Create Job"

The job will now appear on the Jobs page for freelancers with the appropriate membership tier.

## Quick Admin SQL Setup for 5 Admins

```sql
-- After your 5 admin users have signed up, run this:
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
  'admin1@yourdomain.com',
  'admin2@yourdomain.com',
  'admin3@yourdomain.com',
  'admin4@yourdomain.com',
  'admin5@yourdomain.com'
);
```

Replace the email addresses with your actual admin emails.

## Testing the Complete Flow

1. **Sign Up** - Create a test account at `/auth`
2. **View Pricing** - Go to `/pricing` and see the three plans
3. **Select Plan** - Click any plan button
4. **Checkout** - You'll be redirected to `/checkout?plan=regular` (or pro/vip)
5. **Pay** - Complete PayPal payment (use sandbox for testing)
6. **Verify** - After payment, you'll be redirected to dashboard
7. **Check Membership** - Your profile should show the upgraded tier
8. **Browse Jobs** - Go to `/jobs` and see jobs available for your tier

## Important Notes

- The current implementation uses PayPal sandbox mode (`client-id=sb`)
- Before going live, replace with your real PayPal Client ID
- See PAYPAL_SETUP.md for detailed PayPal configuration
- See ADMIN_SETUP.md for detailed admin setup instructions

## Routes Summary

- `/` - Landing page
- `/auth` - Sign up / Sign in
- `/dashboard` - User dashboard
- `/pricing` - View membership plans
- `/checkout?plan={tier}` - Payment checkout page
- `/jobs` - Browse available jobs
- `/submissions` - View your submissions
- `/earnings` - View earnings and payouts
- `/settings` - Account settings
- `/admin` - Admin panel (admins only)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify PayPal SDK is loading
3. Check Supabase connection
4. Verify admin role is properly set in database
5. See PAYPAL_SETUP.md and ADMIN_SETUP.md for troubleshooting
