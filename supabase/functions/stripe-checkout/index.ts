import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  // Headers CORS para TODAS as respostas
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  // OPTIONS sempre retorna 200
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const { planType } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    
    const { data } = await supabase.auth.getUser(authHeader!.replace("Bearer ", ""));
    const user = data.user!;
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
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

    return new Response(JSON.stringify({ url: session.url }), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { status: 500, headers }
    );
  }
});