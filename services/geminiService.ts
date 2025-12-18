
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

const getApiKey = () => {
  // @ts-ignore
  const key = (typeof process !== 'undefined' && process.env?.API_KEY) || null;
  if (!key || key === 'undefined' || key.length < 10) return null;
  return key;
};

const handleAIError = (error: any): string => {
  console.error("MaestrIA Diagnostic:", error);
  const msg = error?.message || String(error);
  if (msg.includes("API_KEY_MISSING")) return "ERRO_IA: Chave não configurada.";
  return `ERRO_IA: ${msg}`;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return handleAIError(new Error("API_KEY_MISSING"));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const categoriesList = categories?.join(', ') || 'Geral, Operacional, Outros';
    
    const prompt = type === 'transaction' 
      ? `Aja como um Auditor Contábil. Analise este documento (Recibo/NF/Extrato).
         REGRAS DE EXTRAÇÃO:
         - 'date': Converta para YYYY-MM-DD.
         - 'description': Use o nome do produto ou serviço principal.
         - 'amount': Apenas números (ex: 150.50).
         - 'type': 'expense' (saída/pagamento) ou 'income' (entrada/recebimento).
         - 'category': Escolha a melhor de [${categoriesList}].
         - 'supplier': Nome do estabelecimento ou emissor.
         - 'paymentMethod': PIX, Cartão, Boleto ou Dinheiro.
         Retorne um JSON ARRAY puro.`
      : `Extraia parceiros comerciais. Capture: name (pessoa), company (razão social), taxId (CNPJ/CPF), email, phone (telefone), address (rua, nº), neighborhood (bairro), city, state, zipCode, type ('client' ou 'supplier').
         Retorne um JSON ARRAY puro.`;

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
  const apiKey = getApiKey();
  if (!apiKey) return handleAIError(new Error("API_KEY_MISSING"));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const categoriesList = categories.join(', ');
    
    const prompt = type === 'transaction'
      ? `Aja como um Engenheiro de Dados Financeiros. Analise este texto/CSV.
         MAPEAMENTO OBRIGATÓRIO:
         - Coluna 'Memorando' -> Mapear para 'description'.
         - Coluna 'Montante' -> Mapear para 'amount'. Se for negativo (ex: -50.00), 'amount' deve ser 50.00 e 'type' deve ser 'expense'.
         - Coluna 'Tipo' -> Se 'Despesa' então 'expense', se 'Receita' então 'income'.
         - 'date' -> Converta 'DD/MM/YYYY' para 'YYYY-MM-DD'.
         - 'category' -> Se a categoria original não estiver em [${categoriesList}], escolha a mais próxima desta lista.
         Retorne um JSON ARRAY [{date, description, amount, type, category, supplier, paymentMethod}].`
      : `Analise este CSV de contatos e extraia:
         - 'name' -> Nome da pessoa ou contato principal.
         - 'company' -> Coluna 'Empresa'.
         - 'taxId' -> CNPJ ou CPF se houver.
         - 'email' -> Coluna 'Email'.
         - 'phone' -> Coluna 'Telefone'.
         - 'type' -> Se 'Cliente' -> 'client', se 'Fornecedor' -> 'supplier'.
         Retorne um JSON ARRAY puro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nDados brutos:\n${text}`,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    return response.text || "[]";
  } catch (error) {
    return handleAIError(error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return handleAIError(new Error("API_KEY_MISSING"));
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: "Você é o MaestrIA OS. Especialista em gestão financeira e análise de dados corporativos." }
    });
    return response.text || "Erro no motor neural.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "IA Indisponível";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um contrato de prestação de serviços entre CONTRATADA (${company.name}) e CONTRATANTE (${client.name}). Escopo: ${serviceDetails}`,
    });
    return response.text || "";
  } catch { return ""; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Erro de Chave";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const summary = transactions.slice(0, 30).map(t => `${t.date}: ${t.description} R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um relatório executivo financeiro para ${period} baseado nestes dados:\n${summary}`,
    });
    return response.text || "";
  } catch { return ""; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Erro de Chave";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const summary = transactions.slice(0, 30).map(t => `${t.date}: ${t.description} R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Procure por anomalias ou erros nestes lançamentos:\n${summary}`,
    });
    return response.text || "";
  } catch { return ""; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Erro de Chave";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const summary = transactions.slice(0, 30).map(t => `${t.category}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira 3 ações estratégicas baseadas nestes gastos:\n${summary}`,
    });
    return response.text || "";
  } catch { return ""; }
};
