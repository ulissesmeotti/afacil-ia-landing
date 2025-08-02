// src/server/server.js
import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyDL6-NNtG2gB2DTAovNdJ4QD9WUI_F4RnE'; // Lembre-se de usar variáveis de ambiente em produção!

app.post('/generate-proposal', async (req, res) => {
  const { prompt, style } = req.body;

  const systemInstruction = {
    role: "user",
    parts: [{
      text: `Você é um assistente de orçamentos. Sua tarefa é criar um orçamento profissional em formato JSON com base na descrição fornecida. Inclua o nome da empresa, nome do cliente, título do orçamento e uma lista de itens com descrição, quantidade e preço unitário. O estilo do orçamento deve ser ${style}. A resposta deve ser APENAS o JSON, sem texto explicativo antes ou depois. Adicione também os campos "deadline", "observations" e "paymentTerms".

      Exemplo de formato JSON:
      {
        "companyName": "Nome da Empresa",
        "clientName": "Nome do Cliente",
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

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      return res.status(geminiResponse.status).json({ error: errorData.error.message });
    }

    const data = await geminiResponse.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : responseText;
    
    try {
      const proposalJson = JSON.parse(jsonContent);
      res.json(proposalJson);
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini:", jsonContent);
      res.status(500).json({ error: "Failed to parse AI response." });
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});