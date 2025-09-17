import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, category, subject, message }: ContactEmailRequest = await req.json();

    console.log("Dados recebidos:", { name, email, category, subject, message });

    const templateParams = {
      from_name: name,
      from_email: email,
      category,
      subject,
      message,
      to_email: "ulissesmeotti@gmail.com",
      reply_to: email,
    };

    const body = {
      service_id: Deno.env.get("EMAILJS_SERVICE_ID"),
      template_id: Deno.env.get("EMAILJS_TEMPLATE_ID"),
      user_id: Deno.env.get("EMAILJS_USER_ID"),
      accessToken: Deno.env.get("EMAILJS_PRIVATE_KEY"),
      template_params: templateParams,
    };

    console.log("Enviando email via EmailJS:", body);

    const emailjsResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!emailjsResponse.ok) {
      const errorText = await emailjsResponse.text();
      console.error("Erro na API EmailJS:", errorText);
      return new Response(JSON.stringify({ success: false, error: errorText }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const result = await emailjsResponse.json();
    console.log("Email enviado com sucesso:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Erro na função send-contact-emailjs:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
