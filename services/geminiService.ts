
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

// Função utilitária para capturar erros de chave e abrir o seletor se necessário
const handleAIError = async (error: any) => {
  console.error("Neural Engine Error:", error);
  if (error.message && (error.message.includes("Requested entity was not found") || error.message.includes("API_KEY"))) {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
  }
};

const createAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("MISSING_KEY");
  return new GoogleGenAI({ apiKey });
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
    const ai = createAI();
    await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: "ping",
      config: { maxOutputTokens: 5 }
    });
    return { success: true, message: "OK" };
  } catch (error) {
    await handleAIError(error);
    return { success: false, message: "OFFLINE" };
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: "transaction" | "contact", categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const catsString = categories ? categories.join(", ") : "Operacional, Vendas, Outros";
    const prompt = type === "transaction" 
      ? "EXTRAÇÃO AUDITADA: Analise o documento e extraia todas as transações financeiras. Categorias permitidas: " + catsString
      : "EXTRAÇÃO CADASTRAL: Extraia todos os parceiros comerciais (clientes/fornecedores).";

    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        responseSchema: type === "transaction" ? transactionSchema : contactSchema
      }
    });
    return response.text || "[]";
  } catch (error) { 
    await handleAIError(error);
    return "[]"; 
  }
};

export const extractFromText = async (text: string, categories: string[], type: "transaction" | "contact" = "transaction"): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: "Extraia dados estruturados deste texto:\n\n" + text,
      config: { 
        responseMimeType: "application/json",
        responseSchema: type === "transaction" ? transactionSchema : contactSchema
      }
    });
    return response.text || "[]";
  } catch (error) { 
    await handleAIError(error);
    return "[]"; 
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: "Você é MaestrIA, uma inteligência financeira de elite. Responda de forma executiva e estratégica.\n\nUsuário: " + message,
      config: {
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });
    return response.text || "Sem resposta.";
  } catch (error) { 
    await handleAIError(error);
    return "Sistema temporariamente indisponível."; 
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: "AJA COMO UM CFO. Realize uma análise profunda (Deep Thinking) destas transações para o período " + period + ": " + JSON.stringify(transactions) + ". Gere um DRE Executivo em Markdown com insights de liquidez.",
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar relatório.";
  } catch (error) { 
    await handleAIError(error);
    return "Erro no motor neural."; 
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: "AJA COMO UM AUDITOR FISCAL. Realize uma auditoria completa nestes dados em busca de anomalias, riscos de compliance ou duplicidades: " + JSON.stringify(transactions),
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao realizar auditoria.";
  } catch (error) { 
    await handleAIError(error);
    return "Erro no motor neural."; 
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: "AJA COMO UM CONSULTOR ESTRATÉGICO DA MCKINSEY. Analise o fluxo de caixa e proponha 5 ações de alto impacto para dobrar o lucro líquido: " + JSON.stringify(transactions),
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar sugestões.";
  } catch (error) { 
    await handleAIError(error);
    return "Erro no motor neural."; 
  }
};

export const generateServiceContract = async (companyInfo: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = "AJA COMO UM ADVOGADO ESPECIALISTA EM DIREITO EMPRESARIAL. Gere um contrato de prestação de serviços profissional em Markdown entre a contratada (" + companyInfo.name + ") e o contratante (" + client.name + "). Detalhes: " + serviceDetails;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Erro ao gerar minuta do contrato.";
  } catch (error) { 
    await handleAIError(error);
    return "Falha na conexão com o motor neural jurídico."; 
  }
};
