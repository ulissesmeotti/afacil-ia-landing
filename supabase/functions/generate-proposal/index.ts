// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const systemPrompt = `Você é um assistente especializado em gerar orçamentos profissionais detalhados.
    
    Com base na descrição do serviço fornecida pelo usuário, gere um orçamento completo em formato JSON com os seguintes campos:
    
    - companyName: Nome da empresa (sugestão baseada no serviço)
    - companyNumber: Telefone da empresa (formato brasileiro)
    - companyCnpj: CNPJ da empresa (formato brasileiro válido)
    - companyEmail: Email da empresa
    - clientName: Nome do cliente (sugestão genérica)
    - clientNumber: Telefone do cliente (formato brasileiro)
    - clientLocation: Localização do cliente (cidade/estado)
    - title: Título do orçamento (baseado no serviço)
    - lineItems: Array de itens do orçamento, cada item com:
      - description: Descrição detalhada do item/serviço
      - quantity: Quantidade
      - price: Preço unitário em reais
    - deadline: Prazo de entrega (ex: "30 dias úteis")
    - observations: Observações importantes do orçamento
    - paymentTerms: Condições de pagamento (ex: "50% antecipado, 50% na entrega")

    Seja específico e realista com preços de mercado brasileiro. O estilo deve ser ${style === 'profissional' ? 'formal e profissional' : 'mais casual'}.
    
    Responda APENAS com um JSON válido, sem texto adicional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI API:', errorText);
      throw new Error(`Erro da OpenAI API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta da OpenAI:', data);
    
    const generatedText = data.choices[0].message.content;
    
    // Parse do JSON gerado pela IA
    let proposalData;
    try {
      proposalData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Texto gerado:', generatedText);
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