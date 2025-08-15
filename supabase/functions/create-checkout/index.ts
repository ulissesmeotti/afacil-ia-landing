import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("CREATE-CHECKOUT: Request received", req.method);
  
  // SEMPRE responder OPTIONS primeiro
  if (req.method === "OPTIONS") {
    console.log("CREATE-CHECKOUT: Returning OPTIONS response");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("CREATE-CHECKOUT: Processing POST request");
    
    // Verificar chave do Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not found");
    }
    console.log("CREATE-CHECKOUT: Stripe key found:", stripeKey.substring(0, 12) + "...");

    // Parse body
    const body = await req.json();
    const { planType } = body;
    console.log("CREATE-CHECKOUT: Plan type:", planType);

    if (!planType || !["pro", "enterprise"].includes(planType)) {
      throw new Error("Invalid plan type");
    }

    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      throw new Error(`Auth failed: ${authError?.message}`);
    }

    const user = userData.user;
    if (!user.email) {
      throw new Error("User email required");
    }
    console.log("CREATE-CHECKOUT: User authenticated:", user.email);

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    console.log("CREATE-CHECKOUT: Stripe initialized");

    // Buscar cliente existente
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("CREATE-CHECKOUT: Found customer:", customerId);
    }

    // ⚠️ ATENÇÃO: Estes price IDs podem estar diferentes na conta LIVE
    // Você precisa verificar os IDs corretos no dashboard do Stripe
    const priceIds = {
      pro: "price_1Rw1amDvlKsOk1LY38WQbjmm",
      enterprise: "price_1Rw1bQDvlKsOk1LYs1yogWsv"
    };

    const priceId = priceIds[planType as keyof typeof priceIds];
    console.log("CREATE-CHECKOUT: Using price ID:", priceId);

    // Criar sessão de checkout
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
        plan_type: planType,
      },
    });

    console.log("CREATE-CHECKOUT: Session created:", session.id);
    console.log("CREATE-CHECKOUT: URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("CREATE-CHECKOUT: Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});