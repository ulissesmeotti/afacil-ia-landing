import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, category, subject, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email via EmailJS:", { name, email, category, subject });

    // Prepare EmailJS template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      category: category,
      subject: subject,
      message: message,
      to_email: "ulissesmeotti@gmail.com",
      reply_to: email
    };

    // Send email via EmailJS API
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_saas',
        template_id: 'template_4303fes',
        user_id: '_zmVVnlz9wGKRHCsx',
        accessToken: Deno.env.get("EMAILJS_PRIVATE_KEY"),
        template_params: templateParams
      }),
    });

    if (!emailjsResponse.ok) {
      const errorData = await emailjsResponse.text();
      console.error("EmailJS API error:", emailjsResponse.status, errorData);
      throw new Error(`EmailJS API error: ${emailjsResponse.status} - ${errorData}`);
    }

    const result = await emailjsResponse.text();
    console.log("Contact email sent successfully via EmailJS:", result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso via EmailJS",
      result: result 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-emailjs function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: "Erro ao enviar email via EmailJS" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);