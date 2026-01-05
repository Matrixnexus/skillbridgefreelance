# PayPal Integration Setup Guide

This guide explains how to set up PayPal payments for the SkillBridge platform.

## Prerequisites

1. A PayPal Business account
2. Access to PayPal Developer Dashboard

## Setup Steps

### 1. Create a PayPal Business Account

If you don't have one already:
1. Go to https://www.paypal.com/businessprofile/create
2. Follow the steps to create a business account
3. Complete business verification

### 2. Get PayPal API Credentials

1. Go to https://developer.paypal.com/
2. Log in with your PayPal account
3. Click on "Dashboard" in the top right
4. Go to "Apps & Credentials"
5. Choose "Live" (for production) or "Sandbox" (for testing)
6. Create a new app or use the default one
7. Copy your "Client ID"

### 3. Update the Checkout Page

In `src/pages/Checkout.tsx`, find this line:

```typescript
script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
```

Replace `sb` with your actual PayPal Client ID:

```typescript
script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID_HERE&currency=USD';
```

### 4. Configure Environment Variables (Recommended)

For better security, store your PayPal Client ID in environment variables:

1. Add to your `.env` file:
```
VITE_PAYPAL_CLIENT_ID=your_client_id_here
```

2. Update `src/pages/Checkout.tsx`:
```typescript
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
```

## Testing

### Sandbox Testing

1. Use the Sandbox Client ID for testing
2. Create test buyer and seller accounts in PayPal Developer Dashboard
3. Use sandbox credentials to test payments
4. No real money is charged during sandbox testing

### Test Credit Cards

PayPal provides test credit cards for sandbox testing:
- Visa: 4032039863990834
- Mastercard: 5415084808806212
- CVV: Any 3 digits
- Expiry: Any future date

## Webhook Setup (Optional but Recommended)

To handle subscription renewals and payment confirmations:

1. In PayPal Developer Dashboard, go to your app
2. Add a webhook endpoint: `https://yourdomain.com/api/paypal/webhook`
3. Select events to listen for:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.CANCELLED

4. Implement webhook handler to update user membership status

## Pricing Plans

Current pricing structure:
- Regular: $15/month
- Pro: $25/month
- VIP: $49/month

These are configured in:
- `src/pages/Pricing.tsx`
- `src/pages/Checkout.tsx`
- `src/components/sections/PricingSection.tsx`

## Important Security Notes

1. Never commit your live PayPal Client ID to version control
2. Use environment variables for sensitive credentials
3. Always validate payments on the server side
4. Verify webhook signatures to prevent fraud
5. Log all transactions for audit purposes

## Troubleshooting

### Payment Button Not Appearing
- Check browser console for errors
- Verify PayPal SDK is loading correctly
- Ensure Client ID is valid

### Payment Fails
- Check PayPal account is verified
- Ensure business account is properly set up
- Verify API credentials are correct

### Membership Not Updating
- Check Supabase connection
- Verify database update queries are executing
- Check for errors in browser console

## Going Live

Before launching to production:

1. Switch from Sandbox to Live credentials
2. Update Client ID in code
3. Test with real PayPal account
4. Set up proper error logging
5. Configure webhook endpoints
6. Enable email notifications for failed payments

## Support

For PayPal-specific issues:
- PayPal Developer Documentation: https://developer.paypal.com/docs/
- PayPal Developer Support: https://developer.paypal.com/support/

For integration issues, check:
- Browser console for JavaScript errors
- Network tab for failed API calls
- Supabase logs for database errors
