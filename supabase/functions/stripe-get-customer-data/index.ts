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
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const { customerEmail, customerId } = await req.json();
    if (!customerEmail && !customerId) {
      throw new Error("customerEmail or customerId required");
    }

    const Stripe = await import("https://esm.sh/stripe@14.21.0?target=deno");
    const stripe = new Stripe.default(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    let stripeCustomerId = customerId;

    // Find customer by email if ID not provided
    if (!stripeCustomerId && customerEmail) {
      const customers = await stripe.customers.list({ 
        email: customerEmail, 
        limit: 1 
      });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        // No customer found - return empty data
        return new Response(JSON.stringify({
          success: true,
          customerId: null,
          currentSubscription: null,
          recentInvoices: [],
          totalPaid: 0,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // Get invoices
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 50, // Get more invoices to calculate total paid
    });

    const paidInvoices = invoices.data.filter((inv) => inv.status === "paid");
    const totalPaid = paidInvoices.reduce(
      (sum, inv) => sum + (inv.amount_paid || 0),
      0
    );

    const currentSubscription = activeSubscription
      ? {
          planName:
            activeSubscription.items.data[0]?.price?.nickname ||
            activeSubscription.items.data[0]?.price?.product ||
            "Subscription",
          amount:
            (activeSubscription.items.data[0]?.price?.unit_amount || 0) / 100,
          interval:
            activeSubscription.items.data[0]?.price?.recurring?.interval ||
            "month",
        }
      : null;

    const recentInvoices = paidInvoices
      .slice(0, 10)
      .map((inv) => ({
        date: new Date(inv.created * 1000).toISOString().split("T")[0],
        amount: (inv.amount_paid || 0) / 100,
        description:
          inv.description ||
          inv.lines.data[0]?.description ||
          "Invoice",
        status: inv.status,
        invoiceId: inv.id,
        invoiceUrl: inv.hosted_invoice_url,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(
      JSON.stringify({
        success: true,
        customerId: stripeCustomerId,
        currentSubscription,
        recentInvoices,
        totalPaid: totalPaid / 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe get customer data error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
