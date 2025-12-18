
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

const getAI = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key.length < 10) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: key });
};

const handleAIError = (error: any): string => {
  console.error("Gemini API Error:", error);
  if (error.message?.includes("API_KEY_MISSING")) return "ERRO_IA: Chave API não configurada ou inválida. Faça o Redeploy na Vercel.";
  if (error.message?.includes("429")) return "ERRO_IA: Limite de requisições atingido (Cota do Google).";
  if (error.message?.includes("403")) return "ERRO_IA: Acesso negado. Verifique se a API Gemini está ativa no Google Cloud.";
  return `ERRO_IA: ${error.message || "Falha na comunicação com o cérebro neural."}`;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = getAI();
    const categoriesList = categories?.join(', ') || 'Geral, Operacional, Outros';
    
    const prompt = type === 'transaction' 
      ? `Aja como um Auditor Financeiro Digital de precisão. Analise este documento (Recibo/NF/Extrato).
         EXTRAIA OBRIGATORIAMENTE EM JSON ARRAY:
         - date: YYYY-MM-DD
         - description: Nome claro e conciso do item
         - amount: Valor numérico positivo (sempre absoluto)
         - type: 'expense' para débitos/saídas, 'income' para créditos/entradas
         - category: Mapeie para uma destas: [${categoriesList}]
         - supplier: Identifique o Fornecedor/Cliente/Estabelecimento
         - paymentMethod: PIX, Cartão, Boleto ou TED
         Retorne APENAS o JSON ARRAY puro.`
      : `Analise o documento e extraia parceiros comerciais.
         Extraia: name, company, taxId, email, phone, address, neighborhood, city, state, zipCode, type.
         Retorne JSON ARRAY.`;

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
    const ai = getAI();
    const categoriesList = categories.join(', ');
    const prompt = type === 'transaction'
      ? `Aja como um Engenheiro de Dados Financeiros. Converta estes dados brutos de extrato bancário em uma lista estruturada.
         MAPEAMENTO SEMÂNTICO:
         - Campo 'Memorando' ou 'Histórico' -> description
         - Campo 'Montante' ou 'Valor' -> amount (SEMPRE POSITIVO)
         - Se o valor original for negativo, marque type='expense'. Se positivo, type='income'.
         - Campo 'Data' -> date (YYYY-MM-DD)
         - Categoria: Escolha a melhor de: [${categoriesList}].
         Retorne JSON ARRAY [{date, description, amount, type, category, supplier, paymentMethod}].`
      : `Converta este texto/CSV em parceiros comerciais com endereço completo: name, company, email, phone, taxId, address, neighborhood, city, state, zipCode, type. Retorne JSON ARRAY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nDados:\n${text}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text || "[]";
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Aja como um Advogado Especialista em Direito Civil e Empresarial (Nível Sênior). 
                    Gere um INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS formal.
                    CONTRATADA: ${company.name}, CNPJ: ${company.taxId}.
                    CONTRATANTE: ${client.name}, CPF/CNPJ: ${client.taxId}.
                    ESCOPO: ${serviceDetails}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text || "Erro ao gerar minuta.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} (${t.type}) R$${t.amount}`).join('\n');
    const prompt = `Analise financeiramente os seguintes dados e gere um relatório executivo para o período ${period}:\n${summary}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} R$${t.amount}`).join('\n');
    const resp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Procure por duplicidades e anomalias nestes lançamentos:\n${summary}`,
    });
    return resp.text || "Auditoria concluída sem anomalias.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.category}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira 3 ações estratégicas baseadas nestes gastos:\n${summary}`,
    });
    return response.text || "Dicas estratégicas indisponíveis.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: "Você é o MaestrIA, o OS financeiro mais avançado do mundo. Foco em lucro e eficiência." }
    });
    return response.text || "O MaestrIA não pôde processar essa mensagem.";
  } catch (error) {
    return handleAIError(error);
  }
};
