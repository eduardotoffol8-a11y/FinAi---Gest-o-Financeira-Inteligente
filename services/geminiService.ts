
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Acesso à inteligência não configurado.");
  return new GoogleGenAI({ apiKey });
};

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
      description: { type: Type.STRING, description: "Descrição detalhada do gasto/receita" },
      amount: { type: Type.NUMBER, description: "Valor total do documento" },
      type: { type: Type.STRING, enum: ["income", "expense"] },
      category: { type: Type.STRING },
      supplier: { type: Type.STRING, description: "Emissor do documento (Fornecedor/Prestador)" },
      paymentMethod: { type: Type.STRING },
      costCenter: { type: Type.STRING }
    },
    required: ["date", "description", "amount", "type"]
  }
};

const contactSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome completo ou Razão Social" },
      company: { type: Type.STRING, description: "Nome Fantasia" },
      taxId: { type: Type.STRING, description: "CNPJ ou CPF formatado" },
      email: { type: Type.STRING },
      phone: { type: Type.STRING },
      address: { type: Type.STRING, description: "Logradouro e número" },
      neighborhood: { type: Type.STRING },
      city: { type: Type.STRING },
      state: { type: Type.STRING, description: "UF (2 letras)" },
      zipCode: { type: Type.STRING, description: "CEP formatado" },
      type: { type: Type.STRING, enum: ["client", "supplier", "both"] }
    },
    required: ["name", "taxId", "type"]
  }
};

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const ai = getAIClient();
    await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: "ping",
      config: { maxOutputTokens: 5, thinkingBudget: 0 }
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
      ? `AÇÃO: Analise este documento (NFSe, Recibo, Boleto). 
         REGRAS: 
         1. Se for nota de saída/venda -> 'income'. Se for compra/pagamento/recibo de gasto -> 'expense'.
         2. Extraia o valor total exato.
         3. Categorias Sugeridas: ${catsString}.`
      : `AÇÃO: Extraia TODOS os dados cadastrais deste parceiro. 
         IMPORTANTE: Capture endereço completo (Rua, CEP, Cidade, UF) e CNPJ/CPF com precisão absoluta para fins de CONTRATO JURÍDICO. 
         Se houver múltiplos cartões ou lista, extraia todos como itens do array.`;

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
    const catsString = categories.join(", ");
    
    const prompt = type === "transaction" 
      ? `Converta em JSON financeiro: ${text}. Categorias: ${catsString}.`
      : `Extraia dados de parceiros para CRM deste texto: ${text}. Capture endereço completo para contratos.`;

    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: prompt,
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
      config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "";
  } catch (error) { return "Erro na conexão neural."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO CFO. Gere um DRE Master: ${JSON.stringify(transactions)}. Período: ${period}.`,
      config: { thinkingConfig: { thinkingBudget: 15000 } }
    });
    return response.text || "";
  } catch (error) { return ""; }
};

export const generateServiceContract = async (companyInfo: any, client: Contact, details: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `AJA COMO ADVOGADO EMPRESARIAL MASTER. Gere uma minuta de contrato master.
    CONTRATADA: ${JSON.stringify(companyInfo)}
    CONTRATANTE: ${JSON.stringify(client)}
    OBJETO: ${details}`;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 20000 } }
    });
    return response.text || "";
  } catch (error) { return ""; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO AUDITOR. Verifique inconsistências: ${JSON.stringify(transactions)}`,
      config: { thinkingConfig: { thinkingBudget: 10000 } }
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO CONSULTOR. Sugira melhorias: ${JSON.stringify(transactions)}`,
      config: { thinkingConfig: { thinkingBudget: 10000 } }
    });
    return response.text || "";
  } catch (e) { return ""; }
};
