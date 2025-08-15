import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    // Por enquanto, retornar apenas teste
    return new Response(JSON.stringify({ 
      success: true,
      message: "Function is working",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("CREATE-CHECKOUT: Error:", error);
    return new Response(JSON.stringify({ 
      error: String(error) 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});