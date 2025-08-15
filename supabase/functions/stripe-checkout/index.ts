import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Stripe checkout function initialized");

serve(async (req) => {
  console.log(`Request method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    console.log("Processing checkout request");
    
    // Verificar se há body
    const body = await req.json();
    const { planType } = body;
    console.log(`Plan type: ${planType}`);

    // Verificar auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    console.log("Auth header found");

    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!supabaseUrl || !supabaseKey || !stripeKey) {
      throw new Error("Missing environment variables");
    }
    console.log("Environment variables verified");

    // Autenticar usuário
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (error || !data.user) {
      throw new Error(`Auth error: ${error?.message || 'No user'}`);
    }
    console.log(`User authenticated: ${data.user.email}`);

    // Criar sessão Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe client initialized");

    const session = await stripe.checkout.sessions.create({
      customer_email: data.user.email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Plano ${planType}` },
          unit_amount: planType === "pro" ? 2990 : 12990,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/perfil?success=true`,
      cancel_url: `${req.headers.get("origin")}/perfil?canceled=true`,
    });
    
    console.log(`Stripe session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in stripe-checkout:", error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});