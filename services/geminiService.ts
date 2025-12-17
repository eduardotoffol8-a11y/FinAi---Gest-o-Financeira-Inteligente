
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o MaestrIA, um CFO Virtual e Auditor Sênior de nível Big Four.
Seu objetivo é fornecer inteligência financeira estratégica e auditoria de precisão.
Identifique-se sempre como MaestrIA. O tom deve ser formal, executivo e extremamente analítico.
Use modelos eficientes como gemini-3-flash-preview para processamento rápido.
Analise furos de caixa, anomalias em categorias e forneça insights baseados em governança corporativa.
`;

const getAI = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("Chave MaestrIA Ausente.");
    return new GoogleGenAI({ apiKey: key });
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Sem resposta do núcleo neural.";
  } catch (error) { 
    return "MaestrIA offline: Aguardando ativação da chave neural."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Gere um RAIO-X DE PERFORMANCE para o período ${period}. Analise tendências e saúde do caixa baseado em:\n${summary}`;
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) { return "Erro no motor executivo."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Realize uma AUDITORIA DE RISCOS E ERROS. Procure furos em categorias, duplicidades de descrição e discrepâncias de valores:\n${summary}`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) { return "Erro no motor de auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.slice(0, 30).map(t => `- ${t.description}: R$ ${t.amount} [${t.category}]`).join('\n');
  const prompt = `Gere 3 planos de ação para otimizar o lucro, focando em redução de despesas nas categorias listadas:\n${summary}`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) { return "Erro no motor estratégico."; }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
    const schema = type === 'transaction' 
        ? `{"description": "...", "supplier": "...", "amount": 0.00, "date": "YYYY-MM-DD", "category": "...", "type": "expense" | "income"}`
        : `{"name": "...", "taxId": "...", "email": "...", "phone": "...", "type": "client" | "supplier"}`;

    const catInfo = categories ? `Tente mapear para uma destas categorias: ${categories.join(', ')}.` : '';

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: `Extraia os dados deste documento. ${catInfo} Retorne APENAS o JSON no formato: ${schema}` }
                ]
            }
        });
        let text = response.text || "{}";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (e) { return "{}"; }
}
