import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your Supabase Edge Function secrets.");
    }

    const {
      customerEmail,
      customerId,
      amount, // in cents (Stripe uses cents)
      description,
      serviceName,
      clientId,
    } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!customerEmail && !customerId) {
      throw new Error("Either customerEmail or customerId is required");
    }

    // Import Stripe SDK for Deno
    const Stripe = await import("https://esm.sh/stripe@14.21.0?target=deno");
    const stripe = new Stripe.default(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    let stripeCustomerId = customerId;

    // If no Stripe customer ID provided, find or create customer by email
    if (!stripeCustomerId && customerEmail) {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        console.log("Found existing Stripe customer:", stripeCustomerId);
      } else {
        // Create new Stripe customer
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            clientId: clientId || "",
          },
        });
        stripeCustomerId = newCustomer.id;
        console.log("Created new Stripe customer:", stripeCustomerId);
      }
    }

    if (!stripeCustomerId) {
      throw new Error("Could not find or create Stripe customer");
    }

    // Create invoice item (line item)
    const invoiceItem = await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: amount, // Amount in cents
      description: description || serviceName || "Service charge",
      currency: "usd",
    });

    console.log("Created invoice item:", invoiceItem.id);

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: true, // Automatically finalize invoice
      collection_method: "send_invoice",
      days_until_due: 30, // Payment due in 30 days
      description: description || serviceName || "Service charge",
      metadata: {
        clientId: clientId || "",
        serviceName: serviceName || "",
      },
    });

    // Finalize the invoice (this also sends it to the customer)
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Send the invoice to the customer via email
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    console.log("Invoice created and sent:", finalizedInvoice.id);

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: finalizedInvoice.id,
        invoiceNumber: finalizedInvoice.number,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        customerId: stripeCustomerId,
        amount: amount / 100, // Convert back to dollars
        status: finalizedInvoice.status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Stripe invoice creation error:", error);
    
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Stripe API key errors
      if (errorMessage.includes("Invalid API Key") || errorMessage.includes("No such API key")) {
        errorMessage = "Invalid Stripe API key. Please check that STRIPE_SECRET_KEY is correct and starts with sk_test_ or sk_live_";
      } else if (errorMessage.includes("API key") && errorMessage.includes("test") && errorMessage.includes("live")) {
        errorMessage = "Stripe API key mismatch. Make sure you're using the correct key (test vs live mode)";
      } else if (error.message.includes("STRIPE_SECRET_KEY")) {
        errorMessage = error.message; // Keep our custom error messages
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
