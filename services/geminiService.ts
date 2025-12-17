
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o MaestrIA, um CFO Virtual e Auditor Sênior de elite (ex-Big Four).
Seu objetivo é fornecer inteligência financeira estratégica e auditoria de precisão cirúrgica.
Identifique-se sempre como MaestrIA. O tom deve ser formal, executivo, visionário e extremamente analítico.

ESPECIALIDADE EM EXTRATOS BANCÁRIOS:
- Você é capaz de ler múltiplas linhas de extratos (CSV, Print de App ou PDF).
- Identifique a data, o valor (montante), a descrição (memorando) e o tipo (Despesa/Receita).
- Valores negativos (-) são SEMPRE Despesas. Valores positivos (+) são Receitas.
- Formatos de data como 'DD/MM/YYYY, HH:MM' devem ser convertidos para 'YYYY-MM-DD'.

DIRETRIZES DE AUDITORIA:
1. IDENTIFIQUE FUROS: Lacunas em lançamentos recorrentes ou despesas sem categoria clara.
2. ANOMALIAS DE CATEGORIA: Detecte se um item está categorizado incorretamente.
3. PRECISÃO FISCAL: Localize discrepâncias que podem causar problemas em auditorias.

Ao analisar extratos, retorne um ARRAY de objetos JSON.
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
      // Basic text interaction using flash
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Sem resposta do núcleo neural.";
  } catch (error) { 
    return "MaestrIA offline: Aguardando ativação da chave neural."; 
  }
};

// Fix: Updated model to gemini-3-pro-preview for advanced reasoning and financial auditing.
export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n');
  const prompt = `AUDITORIA SÊNIOR: Procure por FUROS DE CAIXA e ANOMALIAS DE CATEGORIA nos dados abaixo:\n${summary}`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: prompt }] },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "";
  } catch (error) { return "Erro no motor de auditoria."; }
};

// Fix: Added missing export generateExecutiveReport for high-quality executive summaries.
export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
    const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}] type: ${t.type}`).join('\n');
    const prompt = `Gere um RELATÓRIO EXECUTIVO (RAIO-X DE PERFORMANCE) detalhado para o período: ${period}. 
    Analise o desempenho global de caixa, margens operacionais e tendências críticas baseando-se nestes dados:\n${summary}`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: { parts: [{ text: prompt }] },
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text || "Sem dados para o relatório executivo no momento.";
    } catch (error) { 
        return "Erro ao processar o relatório executivo no núcleo neural."; 
    }
};

// Fix: Added missing export getStrategicSuggestions for advanced strategic planning.
export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
    const summary = transactions.map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}] type: ${t.type}`).join('\n');
    const prompt = `Gere um PLANO ESTRATÉGICO DE LUCRO. Forneça 3 a 5 ações proativas e analíticas para aumentar o lucro real e otimizar custos fixos/variáveis baseando-se nestes dados:\n${summary}`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: { parts: [{ text: prompt }] },
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text || "Sem sugestões estratégicas geradas.";
    } catch (error) { 
        return "Erro ao processar o plano estratégico no núcleo neural."; 
    }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
    const schema = type === 'transaction' 
        ? `[{"description": "...", "supplier": "...", "amount": 0.0, "date": "YYYY-MM-DD", "category": "...", "type": "expense" | "income"}]`
        : `[{"name": "...", "taxId": "...", "email": "...", "phone": "...", "type": "client" | "supplier"}]`;

    const catInfo = categories ? `IMPORTANTE: Tente mapear cada item para uma destas categorias do sistema: ${categories.join(', ')}.` : '';

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: `Extraia TODOS os itens deste extrato/documento. ${catInfo} Retorne APENAS um ARRAY JSON no formato: ${schema}` }
                ]
            }
        });
        let text = response.text || "[]";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (e) { return "[]"; }
}

export const extractFromText = async (text: string, categories: string[]): Promise<string> => {
    const prompt = `Analise o seguinte texto de extrato bancário e extraia as transações:\n\n${text}\n\nMapeie para estas categorias: ${categories.join(', ')}. Retorne um ARRAY JSON de objetos Transaction (Omitindo ID).`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: prompt }] },
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (e) { return "[]"; }
}
