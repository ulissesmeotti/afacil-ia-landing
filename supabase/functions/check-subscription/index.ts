import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("profiles").upsert({
        id: user.id,
        email: user.email,
        plan_type: "gratuito",
        stripe_customer_id: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      return new Response(JSON.stringify({ subscribed: false, plan_type: "gratuito" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let planType = "gratuito";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      logStep("Active subscription found", { subscriptionId: subscription.id });
      
      // Determine plan type from price
      const priceId = subscription.items.data[0].price.id;
      if (priceId === "price_1Rw1amDvlKsOk1LY38WQbjmm") {
        planType = "pro";
      } else if (priceId === "price_1Rw1bQDvlKsOk1LYs1yogWsv") {
        planType = "enterprise";
      }
      logStep("Determined plan type", { priceId, planType });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      plan_type: planType,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, planType });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});