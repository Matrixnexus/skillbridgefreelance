# PayPal Payment Integration Guide

## Overview

The SkillBridge platform uses PayPal for secure membership payments. When users upgrade their membership:

1. They select a plan on `/pricing`
2. Click the upgrade button and get redirected to `/checkout?plan={tier}`
3. A PayPal button appears with the price pre-filled
4. User logs into PayPal and completes payment
5. On successful payment, a callback automatically:
   - Updates the user's membership tier
   - Sets membership expiration date (1 month from purchase)
   - Resets daily task counter
   - Records transaction in the database
   - Redirects user to dashboard
6. User immediately gains access to jobs for their new tier

## Setting Up PayPal

### Step 1: Create a PayPal Business Account

1. Go to [PayPal Business](https://www.paypal.com/business)
2. Click "Sign Up" and select "Business Account"
3. Complete the registration process
4. Verify your email address and add bank account details

### Step 2: Get Your PayPal Client ID

#### For Testing (Sandbox Mode):
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Log in with your PayPal account
3. Click on "Apps & Credentials"
4. Under "Sandbox", you'll see a Default Application
5. Copy the "Client ID" from the Sandbox section

#### For Production (Live Payments):
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Click on "Apps & Credentials"
3. Switch to the "Live" tab
4. Click "Create App"
5. Give your app a name (e.g., "SkillBridge Payments")
6. Copy the "Client ID" from the Live section

### Step 3: Configure Your Application

1. Add the PayPal Client ID to your `.env` file:
   ```
   VITE_PAYPAL_CLIENT_ID=your_actual_client_id_here
   ```

2. For testing, you can use sandbox mode:
   ```
   VITE_PAYPAL_CLIENT_ID=sb
   ```
   (This is the default if you don't set it)

3. Restart your development server after updating the `.env` file

### Step 4: Test the Payment Flow

#### Using Sandbox (Test Mode):
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard) > Sandbox > Accounts
2. Create a test buyer account (or use existing one)
3. On your website, select a membership plan
4. Use the sandbox test account credentials to complete payment
5. Verify that:
   - Payment completes successfully
   - User's membership is upgraded
   - Transaction is recorded in database
   - User can access appropriate jobs

#### Test Credit Cards for Sandbox:
PayPal provides test cards for sandbox testing. You can also create personal sandbox accounts with pre-loaded test balances.

## Payment Flow Details

### What Happens When User Clicks "Upgrade":

1. **Redirect to Checkout**
   - URL: `/checkout?plan=regular` (or pro/vip)
   - Plan prices: Regular ($15), Pro ($25), VIP ($49)

2. **PayPal Button Initialization**
   - PayPal SDK loads with your Client ID
   - Button is rendered with pre-filled amount
   - User sees "PayPal" button

3. **Payment Process**
   - User clicks PayPal button
   - PayPal popup/redirect opens
   - User logs into their PayPal account
   - Amount is already filled ($15, $25, or $49)
   - User confirms payment

4. **Successful Payment Callback**
   ```typescript
   // This happens automatically in the code:
   - Captures the PayPal order
   - Updates user's profile:
     * membership_tier: 'regular'|'pro'|'vip'
     * membership_expires_at: 1 month from now
     * daily_tasks_used: 0 (reset counter)
   - Creates transaction record:
     * type: 'subscription'
     * amount: -$15|-$25|-$49
     * status: 'completed'
     * reference_id: PayPal order ID
   - Refreshes user profile
   - Shows success toast notification
   - Redirects to /dashboard
   ```

5. **After Payment**
   - User immediately sees updated membership tier
   - Jobs for that tier are now accessible
   - Daily task limit is updated
   - User can start working on jobs

## Membership Tiers and Access

| Tier | Price | Jobs Access | Daily Tasks |
|------|-------|-------------|-------------|
| None (Free) | $0 | No jobs | 0 |
| Regular | $15/mo | Regular jobs | 4 |
| Pro | $25/mo | Regular + Pro jobs | 6 |
| VIP | $49/mo | All jobs | Unlimited |

## Security Features

The payment system includes multiple security layers:

1. **Server-Side Validation**
   - Payment status verified before updating membership
   - Transaction records include PayPal order ID for verification

2. **Database Security (RLS)**
   - Users can only update their own profile
   - Transaction records are immutable once created
   - Admin verification for payment disputes

3. **PayPal Security**
   - Payments processed entirely on PayPal's secure platform
   - No credit card data stored on your servers
   - PCI compliance handled by PayPal

## Troubleshooting

### Issue: PayPal button not appearing

**Solution:**
- Check browser console for errors
- Verify `VITE_PAYPAL_CLIENT_ID` is set correctly
- Ensure PayPal SDK loads successfully
- Check network tab for blocked requests

### Issue: Payment completes but membership not upgraded

**Solution:**
- Check browser console for errors in the onApprove callback
- Verify Supabase connection is working
- Check that user's profile exists in database
- Review RLS policies allow profile updates

### Issue: "Client ID not found" error

**Solution:**
- Verify you copied the correct Client ID from PayPal Developer Dashboard
- Ensure `.env` file has `VITE_PAYPAL_CLIENT_ID` set
- Restart your development server after updating `.env`
- For production, use Live Client ID, not Sandbox

### Issue: Test payments not working

**Solution:**
- Make sure you're using Sandbox Client ID for testing
- Create and use PayPal Sandbox test accounts
- Check that test account has sufficient balance
- Verify you're in the correct mode (Sandbox vs Live)

## Going Live Checklist

Before accepting real payments:

- [ ] Get Live PayPal Client ID from Developer Dashboard
- [ ] Update `.env` with Live Client ID
- [ ] Test with real PayPal account (small amount first)
- [ ] Verify membership upgrades work correctly
- [ ] Verify transaction records are created
- [ ] Test that upgraded users can access appropriate jobs
- [ ] Set up PayPal webhook for payment notifications (optional)
- [ ] Enable 2FA on PayPal Business account
- [ ] Review PayPal's seller protection policies
- [ ] Test refund process (if applicable)

## API Reference

### Environment Variables

```bash
VITE_PAYPAL_CLIENT_ID=your_client_id_here
```

### Checkout URL Structure

```
/checkout?plan={tier}

Where {tier} is one of:
- regular (Regular membership, $15/month)
- pro (Pro membership, $25/month)
- vip (VIP membership, $49/month)
```

### Database Updates on Successful Payment

**profiles table:**
```sql
UPDATE profiles SET
  membership_tier = '{tier}',
  membership_expires_at = NOW() + INTERVAL '1 month',
  daily_tasks_used = 0
WHERE id = {user_id};
```

**transactions table:**
```sql
INSERT INTO transactions (
  user_id,
  type,
  amount,
  status,
  description,
  reference_id
) VALUES (
  {user_id},
  'subscription',
  -{amount},
  'completed',
  '{tier} Membership - Monthly Subscription',
  {paypal_order_id}
);
```

## Support Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Integration Guide](https://developer.paypal.com/docs/checkout/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)
- [PayPal Business Support](https://www.paypal.com/businesshelp/)

## Important Notes

1. **Sandbox vs Live**: Always test with Sandbox Client ID before going live
2. **Client ID Security**: Don't commit your Live Client ID to version control (it's already in .gitignore via .env)
3. **Transaction Records**: Keep all transaction records for accounting and dispute resolution
4. **Membership Expiration**: Consider implementing a cron job to check and downgrade expired memberships
5. **Refunds**: Refunds must be processed through PayPal Dashboard, then manually update user's membership
