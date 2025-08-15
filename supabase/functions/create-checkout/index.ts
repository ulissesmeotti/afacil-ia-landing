import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers - aceita todos os domínios Lovable
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // SEMPRE responder OPTIONS com sucesso - SEM EXCEÇÕES
  if (req.method === "OPTIONS") {
    console.log("[CORS] OPTIONS request received - returning 200");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Wrapper para garantir CORS em TODAS as respostas
  const corsResponse = (body: any, status: number = 200) => {
    return new Response(
      typeof body === 'string' ? body : JSON.stringify(body),
      {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  };

  try {
    console.log(`[CREATE-CHECKOUT] ${req.method} request started`);
    console.log(`[CREATE-CHECKOUT] Origin: ${req.headers.get("origin")}`);

    // Verificar método
    if (req.method !== "POST") {
      return corsResponse({ error: "Method not allowed" }, 405);
    }

    // Verificar variáveis de ambiente
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeKey) {
      console.error("[CREATE-CHECKOUT] STRIPE_SECRET_KEY not found");
      return corsResponse({ error: "Stripe configuration missing" }, 500);
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error("[CREATE-CHECKOUT] Supabase configuration missing");
      return corsResponse({ error: "Supabase configuration missing" }, 500);
    }

    console.log("[CREATE-CHECKOUT] Environment variables OK");

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("[CREATE-CHECKOUT] Invalid JSON:", e);
      return corsResponse({ error: "Invalid JSON body" }, 400);
    }

    const { planType } = body;
    if (!planType || !["pro", "enterprise"].includes(planType)) {
      return corsResponse({ error: "Invalid plan type" }, 400);
    }

    console.log(`[CREATE-CHECKOUT] Plan type: ${planType}`);

    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return corsResponse({ error: "Authorization header missing" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      console.error("[CREATE-CHECKOUT] Auth error:", authError);
      return corsResponse({ error: "Authentication failed" }, 401);
    }

    const user = userData.user;
    if (!user.email) {
      return corsResponse({ error: "User email required" }, 400);
    }

    console.log(`[CREATE-CHECKOUT] User authenticated: ${user.email}`);

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Buscar cliente existente
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[CREATE-CHECKOUT] Found customer: ${customerId}`);
    }

    // IDs dos preços
    const priceIds = {
      pro: "price_1Rw1amDvlKsOk1LY38WQbjmm",
      enterprise: "price_1Rw1bQDvlKsOk1LYs1yogWsv"
    };

    const priceId = priceIds[planType as keyof typeof priceIds];
    console.log(`[CREATE-CHECKOUT] Using price ID: ${priceId}`);

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || "https://preview--afacil-ia-landing.lovable.app"}/perfil?success=true`,
      cancel_url: `${req.headers.get("origin") || "https://preview--afacil-ia-landing.lovable.app"}/perfil?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    });

    console.log(`[CREATE-CHECKOUT] Session created: ${session.id}`);
    console.log(`[CREATE-CHECKOUT] Checkout URL: ${session.url}`);

    return corsResponse({ url: session.url });

  } catch (error) {
    console.error("[CREATE-CHECKOUT] Unexpected error:", error);
    return corsResponse(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : String(error)
      }, 
      500
    );
  }
});