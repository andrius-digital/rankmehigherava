# Stripe Integration Setup Guide

This guide explains how to connect Stripe to your application for creating invoices and charging clients.

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for production)

## Step 2: Add Stripe Secret Key to Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add a new secret:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe Secret Key (e.g., `sk_test_...` or `sk_live_...`)

### Option B: Using Supabase CLI

```bash
# Set the Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# For production
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_secret_key_here --project-ref your-project-ref
```

## Step 3: Deploy the Edge Function

The Stripe Edge Function has been created at:
- `supabase/functions/stripe-create-invoice/index.ts`

Deploy it using:

```bash
# Deploy the function
supabase functions deploy stripe-create-invoice

# Or if using Supabase CLI locally
cd supabase
supabase functions deploy stripe-create-invoice --project-ref your-project-ref
```

## Step 4: How It Works

### Creating an Invoice

When you click "Create Charge" in the client profile:

1. **Customer Lookup/Creation**: 
   - The function looks for an existing Stripe customer by email
   - If not found, it creates a new Stripe customer
   - The customer ID is stored in Stripe

2. **Invoice Creation**:
   - Creates an invoice item (line item) with the amount and description
   - Creates an invoice for the customer
   - Finalizes the invoice automatically
   - Sends the invoice to the customer via email

3. **Result**:
   - Invoice is created in Stripe
   - Customer receives an email with the invoice
   - Invoice is viewable in Stripe Dashboard

### Data Flow

```
Frontend (IndividualClientProfile.tsx)
  ↓
  Calls: supabase.functions.invoke('stripe-create-invoice', { ... })
  ↓
Edge Function (stripe-create-invoice/index.ts)
  ↓
  Uses: STRIPE_SECRET_KEY (from Supabase secrets)
  ↓
Stripe API
  ↓
  Creates Customer (if needed) → Creates Invoice → Sends Invoice
  ↓
Returns invoice details to frontend
```

## Step 5: Store Stripe Customer ID (Optional)

To improve performance and avoid duplicate customers, you can store the Stripe customer ID in your database:

1. Add a `stripe_customer_id` column to your `clients` table:

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

2. The Edge Function will automatically find customers by email, but storing the ID directly is faster.

## Testing

1. Use Stripe Test Mode keys (`sk_test_...`) for testing
2. Create a test charge through the portal
3. Check Stripe Dashboard → **Invoices** to see the created invoice
4. The test invoice will be sent to the customer's email address

## Production Checklist

- [ ] Switch to production Stripe keys (`sk_live_...`)
- [ ] Update Supabase secrets with production key
- [ ] Deploy Edge Function to production
- [ ] Test invoice creation with real client
- [ ] Verify email delivery

## Troubleshooting

### Error: "STRIPE_SECRET_KEY is not configured"
- Make sure you've added the secret to Supabase Edge Function secrets
- Verify the secret name is exactly `STRIPE_SECRET_KEY`

### Error: "Could not find or create Stripe customer"
- Check that customerEmail is provided in the request
- Verify the email format is valid

### Invoice not appearing in Stripe
- Check Stripe Dashboard → Invoices
- Look at Edge Function logs in Supabase Dashboard
- Verify the Stripe API key has correct permissions

### Invoice email not received
- Check Stripe Dashboard → Invoices → Email status
- Verify customer email is correct
- Check spam/junk folder

## Environment Variables

The Edge Function uses:
- `STRIPE_SECRET_KEY` - From Supabase Edge Function secrets (NOT from vite.config.ts)

The frontend does NOT need the Stripe secret key - it only calls the Edge Function.
