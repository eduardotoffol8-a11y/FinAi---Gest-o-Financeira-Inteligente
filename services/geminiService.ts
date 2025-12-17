
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o MaestrIA, um CFO Virtual e Auditor Sênior de nível Big Four.
Seu objetivo é fornecer inteligência financeira estratégica e auditoria de precisão.
Identifique-se sempre como MaestrIA. O tom deve ser formal, executivo e extremamente analítico.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Sem resposta do núcleo neural.";
  } catch (error) { 
    console.error("MaestrIA error:", error);
    return "Interferência no processamento neural."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Gere um RAIO-X DE PERFORMANCE para o período ${period}. Analise tendências e saúde do caixa baseado em:\n${summary}`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    return "Erro ao gerar relatório.";
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Realize uma AUDITORIA DE RISCOS E ERROS nas seguintes transações:\n${summary}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    return "Erro na auditoria.";
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.slice(0, 30).map(t => `- ${t.description}: R$ ${t.amount}`).join('\n');
  const prompt = `Gere um PLANO ESTRATÉGICO DE LUCRO com 3 planos de ação baseados nestes dados:\n${summary}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    return "Erro no plano estratégico.";
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact'): Promise<string> => {
    const schema = type === 'transaction' 
        ? `{"description": "...", "supplier": "...", "amount": 0.00, "date": "YYYY-MM-DD", "category": "...", "type": "expense" | "income", "paymentMethod": "...", "costCenter": "..."}`
        : `{"name": "...", "taxId": "...", "email": "...", "phone": "...", "address": "...", "paymentTerms": "...", "type": "client" | "supplier" | "both"}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: `Extraia os dados deste documento para a base do MaestrIA. Retorne APENAS o JSON no formato: ${schema}` }
                ]
            }
        });
        let text = response.text || "{}";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (e) { 
        console.error("Scan Error:", e);
        return "{}"; 
    }
}
