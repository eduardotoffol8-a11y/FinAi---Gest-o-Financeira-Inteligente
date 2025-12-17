
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

// Always initialize GoogleGenAI with the apiKey from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o MaestrIA, um CFO Virtual e Auditor Sênior de nível Big Four.
Seu objetivo é fornecer inteligência financeira estratégica e auditoria de precisão.

Ao gerar relatórios:
1. Use terminologia técnica correta (DRE, EBITDA, Margem de Contribuição, Capital de Giro).
2. Estruture as respostas com seções claras: Sumário Executivo, Análise de Dados, Riscos Detectados e Recomendações.
3. Utilize tabelas Markdown para apresentar números e comparativos.
4. Identifique-se sempre como MaestrIA.
5. O tom deve ser formal, executivo e extremamente analítico.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    // Access .text property directly as per @google/genai guidelines
    return response.text || "Sem resposta do núcleo neural.";
  } catch (error) { 
    console.error("MaestrIA error:", error);
    return "Interferência no processamento neural."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Gere um Relatório Executivo de Desempenho para o período ${period}.
  Dados:
  ${summary}
  
  Exigências:
  - Análise de tendências de receita vs despesa.
  - Tabela com Top 5 categorias de gastos.
  - Sugestões de otimização fiscal.
  - Formato profissional para diretoria.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    console.error("MaestrIA Report error:", error);
    return "";
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `Realize uma Auditoria Contábil e de Risco nas seguintes transações:
  ${summary}
  
  Exigências:
  - Identificar duplicidades ou valores atípicos.
  - Analisar conformidade com as categorias.
  - Avaliar riscos de fluxo de caixa futuro.
  - Concluir com um parecer de auditor sênior.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    console.error("MaestrIA Audit error:", error);
    return "";
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.slice(0, 30).map(t => `- ${t.description}: R$ ${t.amount}`).join('\n');
  const prompt = `Como consultor estratégico MaestrIA, analise estes dados e forneça 3 planos de ação para aumentar a lucratividade imediata:
  ${summary}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) {
    console.error("MaestrIA Strategic error:", error);
    return "";
  }
};

export const analyzeReceipt = async (base64Data: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: `Extraia dados deste documento. JSON APENAS: {"description": "...", "supplier": "...", "amount": 0.00, "date": "YYYY-MM-DD", "category": "...", "type": "expense" | "income"}` }
                ]
            }
        });
        let text = response.text || "{}";
        // Clean JSON markdown blocks if the model returned any
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return text;
    } catch (e) { 
        console.error("MaestrIA Vision error:", e);
        return "{}"; 
    }
}
