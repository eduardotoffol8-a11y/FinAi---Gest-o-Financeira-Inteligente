
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

const createAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("MISSING_KEY");
  return new GoogleGenAI({ apiKey });
};

const MAIN_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const ai = createAI();
    await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: 'ping',
      config: { 
        maxOutputTokens: 5
      }
    });
    return { success: true, message: "OK" };
  } catch (error) {
    return { success: false, message: "OFFLINE" };
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = type === 'transaction' 
      ? `ACT AS A SENIOR FINANCIAL AUDITOR. Extract EVERY detail from this document. 
         CRITICAL RULES FOR SCANNING:
         - DATE: Capture as YYYY-MM-DD.
         - TYPE: Identify if it is an INCOME (Receita/Entrada) or EXPENSE (Despesa/Saída/Pagamento).
         - AMOUNT: Must be a positive number.
         - TERMS: Recognize localized terms like 'Montante', 'Valor', 'Pago', 'Recebido'.
         Required fields per item: 
         - date (YYYY-MM-DD)
         - description (detailed)
         - amount (positive number)
         - type ('expense' or 'income')
         - category (CHOOSE BEST MATCH FROM: ${categories?.join(', ')})
         - supplier (Full legal name)
         - paymentMethod (PIX, Boleto, Credit Card, Bank Transfer)
         Return ONLY the JSON array.`
      : `ACT AS A CORPORATE DATA ENGINEER. Extract ALL PARTNERS/CONTACTS from this document into a detailed JSON ARRAY.
         CRITICAL CLASSIFICATION LOGIC:
         - 'supplier': If the document is an invoice, bill, or receipt where the company is PAYING.
         - 'client': If the document is a sales order, quote, or receipt where the company is RECEIVING.
         - 'both': If there's evidence of a recurring two-way commercial relationship.
         
         Required fields for each partner (MANDATORY):
         - name (Full legal/corporate name)
         - company (Fantasy name/Trade name)
         - taxId (CNPJ or CPF with masks)
         - email (Work email)
         - phone (Phone/WhatsApp)
         - address (Street and number)
         - neighborhood (Bairro)
         - city (Cidade)
         - state (UF - 2 chars, e.g., SP, RJ, SC)
         - zipCode (CEP: 00000-000)
         - type ('client', 'supplier', or 'both') - ANALYZE CONTEXT TO CHOOSE.
         
         Return ONLY raw JSON array. If info is missing, use empty string.`;

    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config: { responseMimeType: "application/json" }
    });
    return response.text || "[]";
  } catch (error) { return "[]"; }
};

export const extractFromText = async (text: string, categories: string[], type: 'transaction' | 'contact' = 'transaction'): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = type === 'transaction' 
      ? `Extract financial transactions from this text. 
         IDENTIFICATION RULES:
         - 'Despesa', 'Saída' or NEGATIVE values = type 'expense'
         - 'Receita', 'Entrada' or POSITIVE values = type 'income'
         - Parse date correctly as YYYY-MM-DD.
         Fields: date, description, amount, type, category (from: ${categories.join(', ')}), supplier, paymentMethod.`
      : `Extract a detailed list of contacts. 
         ANALYZE EACH ROW:
         - If the term 'Cliente' or 'C00x' is present, type is 'client'.
         - If 'Fornecedor' or 'F00x' is present, type is 'supplier'.
         - Extract full address components if available (address, neighborhood, city, state, zipCode).
         Return a JSON array with fields: name, company, taxId, email, phone, address, neighborhood, city, state, zipCode, type ('client', 'supplier', or 'both').
         Return ONLY the JSON array.`;

    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: `${prompt}\n\nCONTENT TO PARSE:\n${text}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text || "[]";
  } catch (error) { return "[]"; }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: MAIN_MODEL,
      contents: `You are MaestrIA, a friendly and highly professional financial assistant. Keep responses helpful and concise.\n\nUser: ${message}`
    });
    return response.text || "Sem resposta.";
  } catch (error) { return "Sistema de IA temporariamente indisponível."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = `ACT AS A CFO. Analyze the following list of transactions for the period: ${period}.
    Generate a detailed Executive Report (DRE).
    Highlight: Total Revenue, Total Expenses, Net Profit, and margin analysis.
    TRANSACTIONS: ${JSON.stringify(transactions)}
    Return the report in professional Markdown.`;
    const response = await ai.models.generateContent({ model: PRO_MODEL, contents: prompt });
    return response.text || "Erro ao gerar relatório.";
  } catch (error) { return "Erro no motor neural."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = `ACT AS A FINANCIAL AUDITOR. Audit the following transactions for potential risks, anomalies, or tax inconsistencies.
    TRANSACTIONS: ${JSON.stringify(transactions)}
    Return a detailed Risk Audit Report in professional Markdown.`;
    const response = await ai.models.generateContent({ model: PRO_MODEL, contents: prompt });
    return response.text || "Erro ao realizar auditoria.";
  } catch (error) { return "Erro no motor neural."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = `ACT AS A STRATEGIC BUSINESS CONSULTANT. Analyze these transactions and provide 3-5 high-impact strategic suggestions.
    TRANSACTIONS: ${JSON.stringify(transactions)}
    Return a Profit Plan in professional Markdown.`;
    const response = await ai.models.generateContent({ model: PRO_MODEL, contents: prompt });
    return response.text || "Erro ao gerar sugestões.";
  } catch (error) { return "Erro no motor neural."; }
};

export const generateServiceContract = async (company: any, client: Contact, details: string): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = `ACT AS A CORPORATE LAWYER. Generate a professional Service Provision Contract.
    SERVICE PROVIDER: ${company.name} (${company.taxId})
    CLIENT: ${client.name} (${client.taxId})
    DETAILS: ${details}
    Return ONLY the contract text in Markdown.`;
    const response = await ai.models.generateContent({ model: PRO_MODEL, contents: prompt });
    return response.text || "Erro ao gerar contrato.";
  } catch (error) { return "Erro no motor neural."; }
};
