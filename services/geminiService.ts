
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

/**
 * Função de diagnóstico ultra-detalhada para debug de ambiente.
 * Retorna um relatório do que o browser está "enxergando" na variável de ambiente.
 */
export const getKeyDiagnostic = (key: string | undefined): string => {
  if (!key) return "🔴 STATUS: ABSENT (A variável 'process.env.API_KEY' não existe no ambiente)";
  
  // Limpa possíveis aspas e espaços que o Vercel/Build possa ter injetado
  const cleaned = key.trim().replace(/^['"]|['"]$/g, '');
  
  if (cleaned === 'undefined' || cleaned === 'null') return "⚠️ STATUS: STRING_LITERAL (A variável existe mas contém o texto 'undefined' ou 'null')";
  if (cleaned.length < 5) return `⚠️ STATUS: TOO_SHORT (Valor detectado: "${cleaned}" - Curto demais)`;
  
  const prefix = cleaned.substring(0, 4);
  const suffix = cleaned.substring(cleaned.length - 4);
  
  // Aceita AIza (padrão antigo/GCP) ou GEMI (padrão novo/AI Studio)
  const isFormatOk = cleaned.startsWith("AIza") || cleaned.startsWith("GEMI");

  if (!isFormatOk) {
    return `⚠️ FORMATO INCOMUM: Começa com "${prefix}..." (Esperado: AIza ou GEMI). Tentando conectar mesmo assim...`;
  }

  return `✅ FORMATO OK: ${prefix}...${suffix} (Tamanho: ${cleaned.length} caracteres)`;
};

const createAI = () => {
  // @ts-ignore
  let apiKey = process.env.API_KEY;
  
  // Limpeza profunda para garantir que caracteres de escape não quebrem a chave
  if (typeof apiKey === 'string') {
    apiKey = apiKey.trim().replace(/^['"]|['"]$/g, '');
  }

  const diagnostic = getKeyDiagnostic(apiKey);
  console.log("MaestrIA Cloud Diagnostic:", diagnostic);

  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.length < 5) {
    throw new Error(`ERRO_AMBIENTE_VERCEL: A chave API não foi encontrada ou está vazia.
    
DIAGNÓSTICO: ${diagnostic}

AÇÕES NECESSÁRIAS:
1. Acesse o Painel da Vercel > Settings > Environment Variables.
2. Certifique-se que o nome é exatamente API_KEY (maiusculo).
3. Após salvar, você DEVE fazer um "Redeploy" manual na aba Deployments.`);
  }

  // Removido o throw para chaves que não começam com AIza, permitindo o prefixo GEMI
  // apenas logamos o diagnóstico e prosseguimos.

  return new GoogleGenAI({ apiKey });
};

const handleAIError = (error: any): string => {
  console.error("MaestrIA Critical Error Handler:", error);
  const msg = error?.message || String(error);
  
  // Se for um dos nossos erros de diagnóstico, retorna direto
  if (msg.includes("ERRO_AMBIENTE_VERCEL") || msg.includes("ERRO_GOOGLE_STUDIO")) {
    return msg;
  }
  
  // Erros de API do Google (após a chave ser enviada)
  if (msg.includes("403") || msg.includes("permission") || msg.includes("not found") || msg.includes("API key not valid")) {
    return `ERRO_VALIDACAO_GOOGLE: O Google recusou a sua chave.
    
DIAGNÓSTICO: ${getKeyDiagnostic(process.env.API_KEY)}

Possíveis Causas:
- A chave foi colada incompleta ou com caracteres extras.
- O modelo 'gemini-3-flash-preview' não está habilitado para esta chave.
- O projeto no Google AI Studio não tem faturamento ou está em uma região restrita.
- Você está tentando usar uma API Key de outro serviço (como Google Maps).`;
  }
  
  if (msg.includes("429")) return "ERRO_LIMITE: Muitas requisições. O plano gratuito do Google AI Studio tem limites por minuto.";
  
  return `ERRO_DESCONHECIDO_IA: ${msg}`;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const categoriesList = categories?.join(', ') || 'Geral';
    const prompt = type === 'transaction' 
      ? `Extract financial data as JSON ARRAY: date (YYYY-MM-DD), description, amount (positive), type ('expense'/'income'), category (from: ${categoriesList}), supplier, paymentMethod.`
      : `Extract contacts as JSON ARRAY: name, company, taxId, email, phone, address, type ('client'/'supplier').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return response.text || "[]";
  } catch (error) { return handleAIError(error); }
};

export const extractFromText = async (text: string, categories: string[], type: 'transaction' | 'contact' = 'transaction'): Promise<string> => {
  try {
    const ai = createAI();
    const prompt = type === 'transaction'
      ? `Map CSV to JSON ARRAY: "Memorando"->description, "Montante"->amount(abs), "Tipo"->type('expense' if negative), "Data"->date(YYYY-MM-DD), "Categoria"->category(from: ${categories.join(', ')}).`
      : `Map CSV to JSON ARRAY: "Nome"->name, "Empresa"->company, "Tipo"->type('client'/'supplier').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nCONTENT:\n${text}`,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    return response.text || "[]";
  } catch (error) { return handleAIError(error); }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: "Você é o MaestrIA OS. Seja direto e executivo." }
    });
    return response.text || "No response.";
  } catch (error) { return handleAIError(error); }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contract for ${company.name} and ${client.name}. Scope: ${serviceDetails}`,
    });
    return response.text || "";
  } catch { return "Erro no contrato."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 10).map(t => `${t.description}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Executive report ${period}:\n${summary}`,
    });
    return response.text || "";
  } catch { return "Erro no relatório."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit these transactions:\n${transactions.slice(0,10).map(t => t.description).join('\n')}`,
    });
    return response.text || "";
  } catch { return "Erro na auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Strategic advice for:\n${transactions.slice(0,10).map(t => t.category).join('\n')}`,
    });
    return response.text || "";
  } catch { return "Erro nas sugestões."; }
};
