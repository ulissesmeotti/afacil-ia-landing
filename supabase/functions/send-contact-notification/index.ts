import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
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
    const { name, email, category, subject, message }: ContactNotificationRequest = await req.json();

    console.log("Sending contact notification:", { name, email, category, subject });

    // Create a beautiful email template
    const emailTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">📧 Nova Mensagem de Contato</h1>
          <p style="color: #f8f9ff; margin: 8px 0 0 0; opacity: 0.9;">Orça Fácil - Sistema de Orçamentos</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="background-color: #f8fafc; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #475569; font-size: 16px;">
              Uma nova mensagem foi recebida através do formulário de contato. Responda o mais breve possível.
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
            <div style="background-color: #f1f5f9; padding: 20px; border-bottom: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  👤
                </div>
                <div>
                  <h3 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 600;">${name}</h3>
                  <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${email}</p>
                  <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">${new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
              
              ${category ? `
                <div style="margin-top: 15px;">
                  <span style="background-color: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    📋 ${category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
              ` : ''}
            </div>
            
            <div style="padding: 20px;">
              ${subject ? `
                <div style="margin-bottom: 15px;">
                  <h4 style="margin: 0 0 5px 0; color: #374151; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Assunto</h4>
                  <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${subject}</p>
                </div>
              ` : ''}
              
              <div>
                <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Mensagem</h4>
                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 3px solid #667eea;">
                  <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
              💡 Responda diretamente para: <strong style="color: #1e293b;">${email}</strong>
            </p>
            <a href="mailto:${email}?subject=Re: ${subject || 'Sua mensagem no Orça Fácil'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block; transition: all 0.2s;">
              📩 Responder Agora
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">
            Este é um email automático do sistema Orça Fácil<br>
            <strong>Não responda para este email</strong> - Use o botão acima para responder ao cliente
          </p>
        </div>
      </div>
    `;

    // Use fetch to call Resend API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Orça Fácil <noreply@orcafacil.com.br>",
        to: ["suporte@orcafacil.com.br"],
        subject: `🔔 Nova Mensagem: ${subject || `Contato de ${name}`} ${category ? `[${category.toUpperCase()}]` : ''}`,
        html: emailTemplate,
        reply_to: email,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", resendResponse.status, errorData);
      throw new Error(`Resend API error: ${resendResponse.status} - ${errorData}`);
    }

    const emailData = await resendResponse.json();
    console.log("Contact notification sent successfully:", emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Notificação enviada com sucesso",
      emailId: emailData?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: "Erro ao enviar notificação" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);