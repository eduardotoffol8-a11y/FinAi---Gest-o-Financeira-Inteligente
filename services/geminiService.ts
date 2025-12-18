
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

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
    return "ERRO_IA: Chave API ausente ou inválida no ambiente.";
  }
  return `ERRO_IA: ${msg}`;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const categoriesList = categories?.join(', ') || 'Geral, Operacional, Outros';
    
    const prompt = type === 'transaction' 
      ? `Analise este documento (Recibo/NF) e extraia um JSON ARRAY:
         - date: YYYY-MM-DD
         - description: Descrição do gasto/serviço
         - amount: Valor numérico positivo
         - type: 'expense' (saída) ou 'income' (entrada)
         - category: Use uma destas: [${categoriesList}]
         - supplier: Nome da empresa emissora
         - paymentMethod: Meio de pagamento.`
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
    
    const prompt = type === 'transaction'
      ? `Analise este CSV de LANÇAMENTOS (Colunas: Data, Tipo, Categoria, Montante, Moeda, Memorando).
         MAPEAMENTO OBRIGATÓRIO:
         1. "Memorando" -> description.
         2. "Montante" -> amount (se for -100.00, salvar 100.00 e type='expense').
         3. "Tipo" -> Se "Despesa" use 'expense', se "Receita" use 'income'.
         4. "Data" -> Formato YYYY-MM-DD.
         5. "Categoria" -> Escolha entre: [${categoriesList}].
         RETORNE APENAS JSON ARRAY.`
      : `Analise este CSV de CONTATOS (Colunas: ID, Nome, Empresa, Email, Telefone, Tipo).
         MAPEAMENTO OBRIGATÓRIO:
         1. "Nome" -> name.
         2. "Empresa" -> company.
         3. "Email" -> email.
         4. "Telefone" -> phone.
         5. "Tipo" -> Se "Cliente" use 'client', se "Fornecedor" use 'supplier'.
         RETORNE APENAS JSON ARRAY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nCONTEÚDO:\n${text}`,
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
      config: { systemInstruction: "Você é o MaestrIA OS, assistente financeiro de elite." }
    });
    return response.text || "Sem resposta.";
  } catch (error) { return handleAIError(error); }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um contrato entre ${company.name} e ${client.name}. Escopo: ${serviceDetails}`,
    });
    return response.text || "";
  } catch { return "Erro no contrato."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 15).map(t => `${t.description}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Relatório Executivo ${period}:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro no relatório."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 15).map(t => `${t.description}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Auditoria de riscos:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro na auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 15).map(t => `${t.category}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugestões estratégicas:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro nas sugestões."; }
};
