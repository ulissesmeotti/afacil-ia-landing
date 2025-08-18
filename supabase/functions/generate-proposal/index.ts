// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();
    
    console.log('Gerando proposta com prompt:', prompt, 'estilo:', style);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const systemInstruction = {
      role: "user",
      parts: [{
        text: `Você é um assistente de orçamentos. Sua tarefa é criar um orçamento profissional em formato JSON com base na descrição fornecida. Inclua o nome da empresa, nome do cliente, título do orçamento e uma lista de itens com descrição, quantidade e preço unitário. O estilo do orçamento deve ser ${style}. A resposta deve ser APENAS o JSON, sem texto explicativo antes ou depois. Adicione também os campos "deadline", "observations" e "paymentTerms".

        Exemplo de formato JSON:
        {
          "companyName": "Nome da Empresa",
          "companyNumber": "Telefone da empresa (formato brasileiro)",
          "companyCnpj": "CNPJ da empresa (formato brasileiro válido)",
          "companyEmail": "Email da empresa",
          "clientName": "Nome do Cliente",
          "clientNumber": "Telefone do cliente (formato brasileiro)",
          "clientLocation": "Localização do cliente (cidade/estado)",
          "title": "Título do Orçamento",
          "lineItems": [
            {"description": "Item 1", "quantity": 1, "price": 100.00},
            {"description": "Item 2", "quantity": 2, "price": 50.00}
          ],
          "deadline": "15 dias úteis",
          "observations": "Validade da proposta de 30 dias.",
          "paymentTerms": "50% de entrada, 50% na conclusão."
        }
        `
      }]
    };

    const userPrompt = {
      role: "user",
      parts: [{ text: prompt }]
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [systemInstruction, userPrompt],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Erro da Gemini API: ${geminiResponse.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await geminiResponse.json();
    console.log('Resposta da Gemini:', data);
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : responseText;
    
    let proposalData;
    try {
      proposalData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", jsonContent);
      throw new Error('Erro ao processar resposta da IA');
    }

    console.log('Proposta gerada:', proposalData);

    return new Response(JSON.stringify(proposalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-proposal:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro ao gerar orçamento com IA' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});