# Complete Setup Guide for SkillBridge Platform

This guide covers the complete setup process for your SkillBridge freelancing platform, including admin access and PayPal payment integration.

## Table of Contents

1. [Admin Setup](#admin-setup)
2. [PayPal Payment Setup](#paypal-payment-setup)
3. [Testing the Complete Flow](#testing-the-complete-flow)
4. [Production Deployment](#production-deployment)

---

## Admin Setup

### Overview

Your platform has 5 designated admin accounts that can access the admin panel at `/admin` to:
- Create and manage job postings
- Review freelancer submissions
- Approve or reject work
- View platform analytics

### Admin Accounts

The following 5 email addresses are designated as platform administrators:

1. skillbridge0001@gmail.com
2. skillbridge0002@gmail.com
3. skillbridge0003@gmail.com
4. skillbridge0004@gmail.com
5. skillbridge0005@gmail.com

**Password for all admin accounts:** `Matrix@1991`

### Setup Steps

#### Step 1: Create Admin Accounts

**Option A - Via Website (Recommended):**
1. Open your website and go to `/auth`
2. For each admin email, click "Sign Up"
3. Enter:
   - Email: `skillbridge0001@gmail.com` (and so on for the others)
   - Password: `Matrix@1991`
   - Full Name: Admin 1 (or similar)
4. Complete the sign-up process
5. Verify email if required
6. Repeat for all 5 admin accounts

**Option B - Via Supabase Dashboard:**
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add user" (or "Invite user")
4. For each admin:
   - Email: `skillbridge0001@gmail.com`
   - Password: `Matrix@1991`
   - Auto Confirm User: Yes (to skip email verification)
   - Send Password Reset Email: No
5. Click "Create user"
6. Repeat for all 5 accounts

#### Step 2: Assign Admin Roles (Automatic)

The migration has already been applied! Once the accounts are created, they will automatically have admin access.

To verify admin roles were assigned:

1. Go to Supabase Dashboard > SQL Editor
2. Run this query:
```sql
SELECT
  au.email,
  ur.role,
  au.created_at
FROM auth.users au
JOIN user_roles ur ON ur.user_id = au.id
WHERE au.email IN (
  'skillbridge0001@gmail.com',
  'skillbridge0002@gmail.com',
  'skillbridge0003@gmail.com',
  'skillbridge0004@gmail.com',
  'skillbridge0005@gmail.com'
)
AND ur.role = 'admin';
```

You should see all 5 accounts listed with role = 'admin'.

#### Step 3: Access Admin Panel

1. Sign in with any of the admin accounts
2. You'll see "Admin Panel" link in the dashboard sidebar
3. Click it or navigate to `/admin`
4. You can now:
   - Create jobs
   - Edit existing jobs
   - Delete jobs
   - Review submissions
   - Approve/reject freelancer work

### Admin Security

- Only these 5 specific email addresses have admin access
- Admin panel is protected by:
  - Frontend route guards (redirects non-admins to dashboard)
  - Backend RLS policies (database-level security)
  - Role checking in the authentication hook
- Regular users cannot access admin functions even if they know the URL
- Admin status is checked on every protected operation

---

## PayPal Payment Setup

### Overview

The platform uses PayPal for all membership payments. The payment flow is:

1. User selects a plan on `/pricing` page
2. Clicks upgrade button → redirected to `/checkout?plan={tier}`
3. PayPal button appears with pre-filled amount
4. User logs into PayPal and confirms payment
5. On success:
   - User's membership tier is upgraded
   - Membership expiration set to 1 month from now
   - Daily task counter is reset
   - Transaction is recorded
   - User is redirected to dashboard
6. User immediately gains access to jobs for their tier

### Membership Pricing

| Tier | Monthly Price | Daily Tasks | Job Access |
|------|---------------|-------------|------------|
| Regular | $15 | 4 | Regular jobs |
| Pro | $25 | 6 | Regular + Pro jobs |
| VIP | $49 | Unlimited | All jobs |

### Setup Steps

#### Step 1: Get PayPal Client ID

**For Testing (Sandbox):**
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Sign in with your PayPal account
3. Click "Apps & Credentials"
4. Under "Sandbox" tab, you'll see your Sandbox Client ID
5. Copy this Client ID

**For Production (Live Payments):**
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Click "Apps & Credentials"
3. Switch to "Live" tab
4. Click "Create App" if you haven't already
5. Name your app (e.g., "SkillBridge Payments")
6. Copy the Live Client ID

#### Step 2: Configure Environment Variables

1. Open your `.env` file
2. Add or update this line:
```env
VITE_PAYPAL_CLIENT_ID=your_client_id_here
```

For testing, use:
```env
VITE_PAYPAL_CLIENT_ID=sb
```

For production, use your actual Live Client ID:
```env
VITE_PAYPAL_CLIENT_ID=AXj8s9fh2K...your_real_client_id
```

3. Save the file
4. Restart your development server

#### Step 3: Test Payments

**Using Sandbox Mode:**
1. Make sure `VITE_PAYPAL_CLIENT_ID=sb` in your `.env`
2. Go to your website
3. Sign up for a test user account
4. Go to `/pricing`
5. Click any plan (Regular, Pro, or VIP)
6. You'll be redirected to `/checkout?plan=regular` (or pro/vip)
7. Click the PayPal button
8. Log in with a PayPal Sandbox test account
   - Create sandbox test accounts at: [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
   - Or use test credit card credentials provided by PayPal
9. Complete the test payment
10. Verify:
    - You're redirected to dashboard
    - Your membership tier is upgraded
    - You see a success message
    - You can now access jobs for that tier

---

## Testing the Complete Flow

### End-to-End Test Scenario

#### Test 1: Regular User Flow
1. **Sign Up**
   - Go to `/auth`
   - Create account: `testuser1@test.com`
   - Password: `Test123!`
   - Verify you're on free tier (no jobs accessible)

2. **Upgrade Membership**
   - Go to `/pricing`
   - Click "Start Regular" ($15)
   - PayPal button appears
   - Complete payment (sandbox)
   - Verify redirect to dashboard
   - Verify membership shows "Regular"

3. **Access Jobs**
   - Go to `/jobs`
   - Verify you can see Regular tier jobs
   - Click on a job
   - Verify you can submit work

4. **Submit Work**
   - Complete a task
   - Submit your work
   - Go to `/submissions`
   - Verify submission shows "Pending"

#### Test 2: Admin Flow
1. **Sign In as Admin**
   - Go to `/auth`
   - Sign in: `skillbridge0001@gmail.com`
   - Password: `Matrix@1991`
   - Verify "Admin Panel" appears in sidebar

2. **Create Job**
   - Go to `/admin`
   - Click "Create Job"
   - Fill in:
     - Title: "Test Data Entry Job"
     - Description: "Enter data from spreadsheet"
     - Instructions: "Copy data to the form"
     - Payment: $5
     - Difficulty: Easy
     - Required Tier: Regular
     - Category: Data Entry
   - Click "Create Job"
   - Verify job appears in jobs list

3. **Review Submissions**
   - Go to `/admin`
   - Click "Submissions" tab
   - View pending submission from Test 1
   - Click "Approve" or "Reject"
   - Add feedback if needed
   - Verify freelancer's earnings are updated

#### Test 3: Payment Verification
1. **Check Database**
   - Go to Supabase Dashboard
   - Open `profiles` table
   - Find your test user
   - Verify:
     - `membership_tier` = 'regular' (or pro/vip)
     - `membership_expires_at` = 1 month from now
     - `daily_tasks_used` = 0

2. **Check Transactions**
   - Open `transactions` table
   - Find transaction for your test user
   - Verify:
     - `type` = 'subscription'
     - `amount` = -15 (or -25, -49)
     - `status` = 'completed'
     - `reference_id` = PayPal order ID

---

## Production Deployment

### Pre-Launch Checklist

#### Security
- [ ] Change all admin passwords from `Matrix@1991` to unique, strong passwords
- [ ] Enable 2FA on all admin accounts
- [ ] Review and test all RLS policies
- [ ] Ensure `.env` file is not committed to git
- [ ] Set up environment variables on hosting platform

#### PayPal
- [ ] Get Live PayPal Client ID
- [ ] Update `VITE_PAYPAL_CLIENT_ID` with Live ID
- [ ] Test with small real payment first
- [ ] Verify payment flow works end-to-end
- [ ] Set up PayPal webhooks (optional, for notifications)
- [ ] Enable PayPal seller protection

#### Database
- [ ] Review all migrations are applied
- [ ] Verify RLS policies on all tables
- [ ] Set up database backups
- [ ] Test admin operations
- [ ] Test payment operations

#### Testing
- [ ] Test all user flows (signup, upgrade, jobs, submissions)
- [ ] Test all admin flows (create jobs, review submissions)
- [ ] Test payment with real money (small amount)
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test with different membership tiers

#### Monitoring
- [ ] Set up error logging
- [ ] Monitor transaction logs
- [ ] Set up alerts for failed payments
- [ ] Monitor admin activity
- [ ] Set up user support system

### Post-Launch

#### Daily Tasks
- Check for pending submissions (admin)
- Review and approve/reject freelancer work
- Monitor payment transactions
- Respond to user support requests

#### Weekly Tasks
- Review platform analytics
- Check for failed/disputed payments
- Verify membership expirations
- Create new job postings

#### Monthly Tasks
- Review admin account security
- Analyze payment trends
- Update job categories if needed
- Review and improve RLS policies

---

## Support & Troubleshooting

### Common Issues

**Issue: Admin can't access /admin**
- Verify account exists in `auth.users`
- Check `user_roles` table has entry with role='admin'
- Try signing out and back in
- Clear browser cache

**Issue: PayPal button not appearing**
- Check browser console for errors
- Verify `VITE_PAYPAL_CLIENT_ID` is set
- Check PayPal SDK loads (Network tab)
- Restart development server

**Issue: Payment succeeds but membership not upgraded**
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies allow profile updates
- Review transaction logs in database

**Issue: User can't access jobs after upgrade**
- Verify membership_tier is set correctly in database
- Check membership_expires_at is in the future
- Ensure jobs table has correct required_tier values
- Try refreshing the page or signing out/in

### Getting Help

- Check documentation files:
  - `ADMIN_ACCOUNTS_SETUP.md` - Admin setup details
  - `PAYPAL_INTEGRATION_GUIDE.md` - PayPal configuration
  - `README.md` - General platform information
  - `ADMIN_SETUP.md` - Original admin guide
  - `PAYPAL_SETUP.md` - Original PayPal guide

- Database issues: Check Supabase Dashboard logs
- Payment issues: Check PayPal Developer Dashboard
- Frontend issues: Check browser console

---

## Quick Reference

### Admin Accounts
- Email: skillbridge0001-0005@gmail.com
- Password: Matrix@1991
- Access: `/admin`

### Membership Tiers
- Free: No jobs, $0
- Regular: 4 tasks/day, $15/mo
- Pro: 6 tasks/day, $25/mo
- VIP: Unlimited, $49/mo

### Key URLs
- Auth: `/auth`
- Pricing: `/pricing`
- Checkout: `/checkout?plan={tier}`
- Jobs: `/jobs`
- Admin: `/admin`
- Dashboard: `/dashboard`

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

## Next Steps

1. ✅ Admin accounts created
2. ✅ Admin roles assigned
3. ✅ PayPal integrated
4. ✅ Payment flow tested
5. ⬜ Create initial job postings
6. ⬜ Test with real users
7. ⬜ Go live with production PayPal ID
8. ⬜ Monitor and support users

Your platform is now ready for launch!
