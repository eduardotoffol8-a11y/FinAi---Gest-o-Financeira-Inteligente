
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

// Função para garantir que o SDK use a chave mais atualizada do ambiente (Mandatório para Vercel/Produção)
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

// Tratamento de erro silencioso para o usuário, mas funcional para o sistema
const handleAiError = async (error: any) => {
  const errorMessage = error?.message || "";
  if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API_KEY_MISSING")) {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
    }
  }
  throw error;
};

const MAIN_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview";

const transactionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
      description: { type: Type.STRING },
      amount: { type: Type.NUMBER },
      type: { type: Type.STRING, enum: ["income", "expense"] },
      category: { type: Type.STRING },
      supplier: { type: Type.STRING },
      paymentMethod: { type: Type.STRING },
      costCenter: { type: Type.STRING }
    },
    required: ["date", "description", "amount", "type", "category"]
  }
};

const contactSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      company: { type: Type.STRING },
      taxId: { type: Type.STRING },
      email: { type: Type.STRING },
      phone: { type: Type.STRING },
      address: { type: Type.STRING },
      neighborhood: { type: Type.STRING },
      city: { type: Type.STRING },
      state: { type: Type.STRING },
      zipCode: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["client", "supplier", "both"] }
    },
    required: ["name", "type"]
  }
};

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const ai = getAIClient();
    await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: "ping",
      config: { maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } }
    });
    return { success: true, message: "Conectado" };
  } catch (error) {
    return { success: false, message: "Aguardando Chave" };
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: "transaction" | "contact", categories?: string[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const catsString = categories ? categories.join(", ") : "Operacional, Outros";
    const prompt = type === "transaction" 
      ? `Ação: Extração de dados financeiros de documento/imagem. Categorias permitidas: ${catsString}`
      : "Ação: Extração de dados cadastrais de parceiro comercial.";

    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: type === "transaction" ? transactionSchema : contactSchema,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "[]";
  } catch (error) { 
    await handleAiError(error);
    return "[]"; 
  }
};

export const extractFromText = async (text: string, categories: string[], type: "transaction" | "contact" = "transaction"): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: `Transforme o seguinte texto em dados estruturados JSON:\n\n${text}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: type === "transaction" ? transactionSchema : contactSchema,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "[]";
  } catch (error) { 
    await handleAiError(error);
    return "[]"; 
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: `Você é a MaestrIA, uma assistente financeira executiva de alto nível. Responda de forma curta, direta e estratégica.\n\nPergunta do usuário: ${message}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "Não foi possível processar a resposta.";
  } catch (error) { 
    await handleAiError(error);
    return "Conexão com o motor neural interrompida."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO UM CFO SENIOR. Analise profundamente estas transações do período ${period}: ${JSON.stringify(transactions)}. Gere um relatório DRE executivo com análise de queima de caixa e sugestões de liquidez.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Falha ao gerar relatório.";
  } catch (error) { 
    await handleAiError(error);
    return "Erro no processamento neural Pro."; 
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO UM AUDITOR FISCAL. Realize uma busca exaustiva por anomalias, duplicidades ou riscos fiscais nestes dados: ${JSON.stringify(transactions)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Falha na auditoria.";
  } catch (error) { 
    await handleAiError(error);
    return "Erro no motor de auditoria."; 
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO UM CONSULTOR ESTRATÉGICO. Com base no fluxo de caixa atual, proponha 3 ações práticas de redução de custos e 2 de aumento de margem: ${JSON.stringify(transactions)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Falha nas sugestões.";
  } catch (error) { 
    await handleAiError(error);
    return "Erro no motor estratégico."; 
  }
};

export const generateServiceContract = async (companyInfo: any, client: Contact, details: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `AJA COMO UM ADVOGADO EMPRESARIAL.
    Gere uma minuta de contrato de prestação de serviços profissional em Markdown entre:
    CONTRATADA: ${JSON.stringify(companyInfo)}
    CONTRATANTE: ${JSON.stringify(client)}
    
    DETALHES DO SERVIÇO E CONDIÇÕES: ${details}
    
    Inclua cláusulas de rescisão, foro, obrigações das partes e validade.`;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar minuta contratual.";
  } catch (error) {
    await handleAiError(error);
    return "Falha na conexão jurídica neural.";
  }
};
