
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o FinAI, o assistente virtual de finanças mais prestativo e profissional.
Seu objetivo é ajudar gestores a entenderem seus números com clareza.

Diretrizes:
1. Use português do Brasil claro e sem jargões técnicos excessivos.
2. Seja proativo: se vir uma despesa alta, sugira como economizar.
3. Seu tom é de um parceiro de negócios confiável.
4. Sempre identifique-se como FinAI.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = [],
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> => {
  try {
    const modelId = "gemini-3-flash-preview";
    const parts: any[] = [{ text: message }];

    if (imageBase64 && imageMimeType) {
      parts.unshift({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      });
    }

    const contents = [...history, { role: 'user', parts: parts }];

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text || "Desculpe, tive um problema técnico. Pode repetir?";
  } catch (error) {
    console.error("Erro FinAI:", error);
    return "Estou passando por uma manutenção rápida. Tente novamente em instantes.";
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ text: `Realize uma auditoria financeira detalhada nestas transações. Procure por anomalias, gastos duplicados ou riscos de fluxo de caixa:\n${summary}` }]
      },
      config: { systemInstruction: "Você é um auditor financeiro sênior detalhista." }
    });
    return response.text || "Nenhuma irregularidade detectada no volume atual.";
  } catch (e) { return "Erro ao conectar com o módulo de auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[], period: 'semanal' | 'mensal'): Promise<string> => {
    try {
      const summary = transactions.slice(0, 50).map(t => `- ${t.description}: R$ ${t.amount}`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{ text: `Com base nestes dados, dê 3 sugestões estratégicas de nível ${period} para melhorar o lucro da empresa:\n${summary}` }]
        },
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      return response.text || "Continue com a gestão atual.";
    } catch (e) { return "Sugestões indisponíveis no momento."; }
};

export const analyzeReceipt = async (base64Data: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    {
                        text: `Analise este documento financeiro e extraia os dados para lançamento.
                        Retorne APENAS um JSON:
                        {
                            "description": "Descrição amigável",
                            "supplier": "Nome da Empresa",
                            "amount": 0.00,
                            "date": "YYYY-MM-DD",
                            "category": "Categoria Sugerida",
                            "type": "expense" | "income"
                        }`
                    }
                ]
            }
        });
        
        let text = response.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return text;
    } catch (e) {
        return "{}";
    }
}

export const generateDashboardInsights = async (transactions: Transaction[]): Promise<string> => {
  try {
    const summary = transactions.slice(0, 30).map(t => `- ${t.date}: ${t.description} (R$ ${t.amount})`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ text: `Analise estas transações e forneça 3 insights rápidos e estratégicos em português:\n${summary}` }]
      },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Processando dados neurais...";
  } catch (error) {
    return "Aguardando volume de dados para calibração estratégica.";
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount})`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [{ text: `Gere um relatório executivo financeiro profissional para o período ${period} com base nestas transações:\n${summary}` }]
      },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Relatório executivo não disponível.";
  } catch (error) {
    return "Ocorreu um erro ao gerar o relatório.";
  }
};
