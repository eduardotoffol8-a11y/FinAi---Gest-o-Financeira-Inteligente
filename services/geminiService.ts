import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

// ✅ Agora usa import.meta.env.VITE_GEMINI_API_KEY
const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
      config: { maxOutputTokens: 50, thinkingConfig: { thinkingBudget: 25 } }
    });
    return { success: true, message: "Operacional" };
  } catch (error) {
    return { success: false, message: "Aguardando Conexão" };
  }
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string,
  type: "transaction" | "contact",
  categories?: string[]
): Promise<string> => {
  try {
    const ai = getAIClient();
    const catsString = categories ? categories.join(", ") : "Geral, Operacional";
    
    const prompt = type === "transaction" 
      ? `AÇÃO: Analise este documento (NFSe, Recibo, Boleto). 
         REGRAS: 1. Se venda -> 'income'. Se gasto -> 'expense'. 2. Extraia valor total. Categorias: ${catsString}.`
      : `AÇÃO: Extraia TODOS os dados cadastrais para CONTRATO JURÍDICO. Capture endereço completo e CNPJ.`;

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

export const extractFromText = async (
  text: string,
  categories: string[],
  type: "transaction" | "contact" = "transaction"
): Promise<string> => {
  try {
    const ai = getAIClient();
    const catsString = categories.join(", ");
    
    const prompt = type === "transaction" 
      ? `Converta em JSON financeiro: ${text}. Categorias: ${catsString}.`
      : `Extraia dados de parceiros deste texto para contratos: ${text}.`;

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
      contents: `Você é a MaestrIA, uma inteligência financeira estratégica. Responda de forma direta.\n\nPergunta: ${message}`,
      config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    return response.text || "";
  } catch (error) { return "Erro na conexão neural."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `AJA COMO CFO MASTER. Gere um DRE Executivo Master: ${JSON.stringify(transactions)}. Período: ${period}.`,
      config: { thinkingConfig: { thinkingBudget: 15000 } }
    });
    return response.text || "";
  } catch (error) { return ""; }
};

export const generateServiceContract = async (companyInfo: any, client: Contact, details: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `AJA COMO ADVOGADO EMPRESARIAL MASTER. 
    Gere uma minuta de contrato de prestação de serviços profissional e completa, com rigor jurídico.
    DADOS DA CONTRATADA (NOSSA EMPRESA): ${JSON.stringify(companyInfo)}
    DADOS DA CONTRATANTE (CLIENTE/PARCEIRO): ${JSON.stringify(client)}
    OBJETO E CONDIÇÕES ESPECÍFICAS: ${details}
    
    O contrato deve conter: 
    1. Preâmbulo detalhado com qualificação de ambas as partes.
    2. Objeto do contrato.
    3. Obrigações da Contratada e da Contratante.
    4. Preço e condições de pagamento (baseado nos detalhes).
    5. Prazo, Rescisão e Multas.
    6. Confidencialidade e LGPD.
    7. Foro de eleição.
    8. Campos para assinatura e testemunhas.
    
    Gere o texto pronto para impressão, sem comentários extras.`;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text || "";
  } catch (error) { return "Falha ao processar minuta jurídica."; }
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
