import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://c834b204-9da6-4c90-9317-fd953bd37e70.lovableproject.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  console.log(`[CREATE-CHECKOUT] REQUEST: ${req.method} ${req.url}`);
  console.log(`[CREATE-CHECKOUT] Origin: ${req.headers.get("origin")}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[CREATE-CHECKOUT] Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log("[CREATE-CHECKOUT] Starting checkout process");
    
    // Check environment variables immediately
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("[CREATE-CHECKOUT] Stripe key exists:", !!stripeKey);
    console.log("[CREATE-CHECKOUT] Stripe key prefix:", stripeKey?.substring(0, 10));
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not found in environment");
    }

    // Parse body
    const body = await req.json();
    console.log("[CREATE-CHECKOUT] Request body:", body);
    
    const { planType } = body;
    if (!planType) {
      throw new Error("planType is required");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    console.log("[CREATE-CHECKOUT] Auth header exists:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error) {
      console.log("[CREATE-CHECKOUT] Auth error:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }

    const user = data.user;
    if (!user?.email) {
      throw new Error("User not found or email missing");
    }

    console.log("[CREATE-CHECKOUT] User authenticated:", user.email);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("[CREATE-CHECKOUT] Stripe initialized");

    // Find or create customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
    } else {
      console.log("[CREATE-CHECKOUT] No existing customer found");
    }

    // Plan configuration
    const planConfig = {
      pro: "price_1Rw1amDvlKsOk1LY38WQbjmm",
      enterprise: "price_1Rw1bQDvlKsOk1LYs1yogWsv"
    };

    const priceId = planConfig[planType as keyof typeof planConfig];
    if (!priceId) {
      throw new Error(`Invalid plan type: ${planType}`);
    }

    console.log("[CREATE-CHECKOUT] Creating session with price:", priceId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/perfil?success=true`,
      cancel_url: `${req.headers.get("origin")}/perfil?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
    });

    console.log("[CREATE-CHECKOUT] Session created:", session.id);
    console.log("[CREATE-CHECKOUT] Checkout URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[CREATE-CHECKOUT] ERROR:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});