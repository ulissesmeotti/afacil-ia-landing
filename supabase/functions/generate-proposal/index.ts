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
    const { prompt, style, companyData, clientData } = await req.json();
    
    console.log('Gerando proposta com prompt:', prompt, 'estilo:', style);

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Criar prompt personalizado baseado nos dados existentes
    const companyInfo = companyData ? `
      Use os seguintes dados da empresa:
      - Nome: ${companyData.name || 'Nome da Empresa'}
      - Telefone: ${companyData.number || 'Telefone da empresa'}
      - CNPJ: ${companyData.cnpj || 'CNPJ da empresa'}
      - Email: ${companyData.email || 'Email da empresa'}
    ` : 'Gere dados fictícios para a empresa prestadora do serviço.';

    const clientInfo = clientData ? `
      Use os seguintes dados do cliente:
      - Nome: ${clientData.name || 'Nome do Cliente'}
      - Telefone: ${clientData.number || 'Telefone do cliente'}
      - Localização: ${clientData.location || 'Localização do cliente'}
    ` : 'Gere dados fictícios para o cliente.';

    const systemInstruction = {
      role: "user",
      parts: [{
        text: `Você é um assistente de orçamentos. Sua tarefa é criar um orçamento profissional em formato JSON com base na descrição fornecida. 

        ${companyInfo}
        ${clientInfo}

        IMPORTANTE: Use EXATAMENTE os dados fornecidos acima. NÃO invente ou altere nenhum dado da empresa ou cliente se eles foram fornecidos.

        Gere apenas:
        1. Um título apropriado para o orçamento
        2. Uma lista detalhada de itens do orçamento (lineItems) com descrição, quantidade e preço unitário realistas
        3. Prazo de entrega (deadline)
        4. Observações relevantes (observations)  
        5. Condições de pagamento (paymentTerms)

        O estilo do orçamento deve ser ${style}. A resposta deve ser APENAS o JSON, sem texto explicativo antes ou depois.

        Formato JSON obrigatório:
        {
          "companyName": "${companyData?.name || 'Nome da Empresa'}",
          "companyNumber": "${companyData?.number || 'Telefone da empresa'}",
          "companyCnpj": "${companyData?.cnpj || 'CNPJ da empresa'}",
          "companyEmail": "${companyData?.email || 'Email da empresa'}",
          "clientName": "${clientData?.name || 'Nome do Cliente'}",
          "clientNumber": "${clientData?.number || 'Telefone do cliente'}",
          "clientLocation": "${clientData?.location || 'Localização do cliente'}",
          "title": "Título do Orçamento baseado no serviço",
          "lineItems": [
            {"description": "Item detalhado 1", "quantity": 1, "price": 100.00},
            {"description": "Item detalhado 2", "quantity": 2, "price": 50.00}
          ],
          "deadline": "Prazo realista em dias úteis",
          "observations": "Observações relevantes sobre o projeto",
          "paymentTerms": "Condições de pagamento claras"
        }`
      }]
    };

    const userPrompt = {
      role: "user",
      parts: [{ text: `Gere um orçamento para: ${prompt}` }]
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