
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

// Função centralizada para instanciar a IA seguindo rigorosamente as normas de process.env.API_KEY
const createAI = () => {
  // @ts-ignore
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY_NOT_FOUND");
  }
  return new GoogleGenAI({ apiKey });
};

const handleAIError = (error: any): string => {
  console.error("MaestrIA Cloud Diagnostic:", error);
  const msg = error?.message || String(error);
  
  if (msg.includes("API_KEY_NOT_FOUND") || msg.includes("apiKey")) {
    return "ERRO_IA: A chave API não foi injetada no sistema. Certifique-se de que a variável 'API_KEY' está na Vercel e que você fez um 'Redeploy' após salvá-la.";
  }
  if (msg.includes("429")) return "ERRO_IA: Limite de cota excedido.";
  return `ERRO_IA: ${msg}`;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const categoriesList = categories?.join(', ') || 'Geral, Operacional, Outros';
    
    const prompt = type === 'transaction' 
      ? `Analise este documento financeiro e extraia um JSON ARRAY:
         - date: YYYY-MM-DD
         - description: Descrição concisa
         - amount: Valor numérico absoluto
         - type: 'expense' ou 'income'
         - category: Use uma destas: [${categoriesList}]
         - supplier: Nome da empresa/pessoa
         - paymentMethod: Meio de pagamento identificado.`
      : `Extraia contatos deste documento em JSON ARRAY: name, company, taxId, email, phone, address, type ('client' ou 'supplier').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }]
      }],
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return response.text || "[]";
  } catch (error) {
    return handleAIError(error);
  }
};

export const extractFromText = async (text: string, categories: string[], type: 'transaction' | 'contact' = 'transaction'): Promise<string> => {
  try {
    const ai = createAI();
    const categoriesList = categories.join(', ');
    
    // Prompt customizado para os cabeçalhos do usuário: "Data","Tipo","Categoria","Montante","Moeda","Memorando"
    const prompt = type === 'transaction'
      ? `Aja como um extrator de dados financeiro de alta precisão. Analise o CSV/Texto fornecido.
         REGRAS DE MAPEAMENTO PARA O ARQUIVO DO USUÁRIO:
         1. A coluna "Memorando" deve ser mapeada para o campo "description".
         2. A coluna "Montante" deve ser o "amount". Se o valor for negativo (ex: -100.00), salve o valor positivo em "amount" e defina o "type" como 'expense'.
         3. A coluna "Tipo" define a natureza: "Despesa" -> 'expense', "Receita" -> 'income'.
         4. A "Data" deve ser convertida para o formato YYYY-MM-DD.
         5. "Categoria": Tente mapear para uma destas: [${categoriesList}].
         
         RETORNE APENAS UM JSON ARRAY: [{date, description, amount, type, category, supplier, paymentMethod}].`
      : `Analise este CSV de contatos (Colunas: Nome, Empresa, Email, Telefone, Tipo).
         Mapeie: "Nome" -> name, "Empresa" -> company, "Email" -> email, "Telefone" -> phone.
         Se "Tipo" for "Cliente", type = 'client'. Se for "Fornecedor", type = 'supplier'.
         RETORNE APENAS UM JSON ARRAY puro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nCONTEÚDO DO ARQUIVO:\n${text}`,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    return response.text || "[]";
  } catch (error) {
    return handleAIError(error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: "Você é o MaestrIA OS, assistente financeiro de elite. Seja direto e focado em resultados." }
    });
    return response.text || "Sem resposta.";
  } catch (error) {
    return handleAIError(error);
  }
};

// Mantendo as outras funções com a mesma lógica de segurança
export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um contrato de serviço: CONTRATADA: ${company.name}, CONTRATANTE: ${client.name}. ESCOPO: ${serviceDetails}`,
    });
    return response.text || "";
  } catch { return "Erro ao gerar contrato."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 20).map(t => `${t.description}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um relatório executivo para ${period}:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro no relatório."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 20).map(t => `${t.description}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Procure erros nestes lançamentos:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro na auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 20).map(t => `${t.category}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dê 3 dicas para economizar baseado nisso:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro nas sugestões."; }
};
