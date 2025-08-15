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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Always ensure CORS headers are returned
  try {
    logStep("Request received", { method: req.method, url: req.url });

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      logStep("OPTIONS request - returning CORS headers");
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // Validate environment variables first
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeSecretKey) {
      throw new Error("Missing Stripe configuration");
    }

    logStep("Environment variables validated");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    logStep("Processing POST request");

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Request body parsed", { body: requestBody });
    } catch (e) {
      throw new Error("Invalid JSON in request body");
    }

    const { planType } = requestBody;
    if (!planType || !["pro", "enterprise"].includes(planType)) {
      throw new Error("Invalid plan type");
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: "2023-10-16" 
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Define plan details
    const planDetails = {
      pro: {
        priceId: "price_1Rw1amDvlKsOk1LY38WQbjmm",
        name: "Pro Plan",
        amount: 2990
      },
      enterprise: {
        priceId: "price_1Rw1bQDvlKsOk1LYs1yogWsv", 
        name: "Enterprise Plan",
        amount: 12990
      }
    };

    const selectedPlan = planDetails[planType as keyof typeof planDetails];
    logStep("Creating checkout session", { plan: selectedPlan });
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/perfil?success=true`,
      cancel_url: `${req.headers.get("origin")}/perfil?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});