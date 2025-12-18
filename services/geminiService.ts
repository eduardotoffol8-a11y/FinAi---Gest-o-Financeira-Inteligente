
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

// Função para garantir que o SDK use a chave mais atualizada em cada operação
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Acesso à inteligência não configurado.");
  return new GoogleGenAI({ apiKey });
};

// Tratamento de erro resiliente: se a chave expirar ou for inválida, solicita nova seleção
const handleAiError = async (error: any) => {
  const errorMessage = error?.message || "";
  if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("apiKey")) {
    if (window.aistudio) {
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
    return { success: true, message: "Operacional" };
  } catch (error) {
    return { success: false, message: "Aguardando Conexão" };
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: "transaction" | "contact", categories?: string[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const catsString = categories ? categories.join(", ") : "Geral, Operacional";
    const prompt = type === "transaction" 
      ? `AÇÃO: Analise este documento financeiro e extraia dados estruturados. Categorias: ${catsString}`
      : "AÇÃO: Extraia dados cadastrais deste parceiro comercial.";

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
      contents: `Transforme em JSON os dados deste texto financeiro:\n\n${text}`,
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
      contents: `Você é a MaestrIA, uma inteligência financeira estratégica. Responda de forma direta, clara e executiva.\n\nPergunta: ${message}`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "Não foi possível processar no momento.";
  } catch (error) { 
    await handleAiError(error);
    return "Conexão de dados temporariamente indisponível."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO CFO. Gere um relatório executivo (DRE) com base nestes dados: ${JSON.stringify(transactions)}. Período: ${period}.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao processar relatório.";
  } catch (error) { 
    await handleAiError(error);
    return "Falha no motor neural de análise."; 
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO AUDITOR. Busque inconsistências ou riscos nestas transações: ${JSON.stringify(transactions)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao realizar auditoria.";
  } catch (error) { 
    await handleAiError(error);
    return "Falha no motor neural de auditoria."; 
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO CONSULTOR ESTRATÉGICO. Analise o fluxo e sugira melhorias de margem: ${JSON.stringify(transactions)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar sugestões.";
  } catch (error) { 
    await handleAiError(error);
    return "Falha no motor estratégico."; 
  }
};

export const generateServiceContract = async (companyInfo: any, client: Contact, details: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `AJA COMO ADVOGADO EMPRESARIAL. Gere uma minuta contratual para:
    CONTRATADA: ${JSON.stringify(companyInfo)}
    CONTRATANTE: ${JSON.stringify(client)}
    DETALHES: ${details}`;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar minuta.";
  } catch (error) {
    await handleAiError(error);
    return "Falha no processamento jurídico.";
  }
};
