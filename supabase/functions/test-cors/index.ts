import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("TEST-CORS: Request received", req.method, req.url);
  
  if (req.method === "OPTIONS") {
    console.log("TEST-CORS: OPTIONS request - returning 200");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ 
    message: "CORS test successful", 
    method: req.method,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});