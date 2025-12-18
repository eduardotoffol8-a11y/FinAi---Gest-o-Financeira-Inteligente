
import { GoogleGenAI } from "@google/genai";
import { Transaction, Contact } from "../types";

/**
 * Diagnóstico de saúde da conexão.
 */
export const getKeyDiagnostic = (key: string | undefined): string => {
  if (!key) return "🔴 STATUS: CHAVE AUSENTE NO AMBIENTE";
  const cleaned = key.trim().replace(/^['"]|['"]$/g, '');
  if (cleaned === 'undefined' || cleaned === 'null') return "⚠️ STATUS: CONFIGURAÇÃO INVÁLIDA (Valor literal 'undefined')";
  
  const prefix = cleaned.substring(0, 4);
  const isFormatOk = cleaned.startsWith("AIza") || cleaned.startsWith("GEMI");

  if (!isFormatOk) {
    return `⚠️ FORMATO NÃO CONVENCIONAL: ${prefix}... Verifique se a chave é do Google Gemini.`;
  }

  return `✅ CONEXÃO ESTABELECIDA: ${prefix}...${cleaned.substring(cleaned.length - 4)}`;
};

const createAI = () => {
  // @ts-ignore
  let apiKey = process.env.API_KEY;
  if (typeof apiKey === 'string') {
    apiKey = apiKey.trim().replace(/^['"]|['"]$/g, '');
  }

  if (!apiKey || apiKey.length < 5 || apiKey === 'undefined') {
    throw new Error("ERRO_CONFIG: A API_KEY não foi detectada. Verifique as 'Environment Variables' no painel da Vercel.");
  }

  return new GoogleGenAI({ apiKey });
};

const handleAIError = (error: any): string => {
  console.error("MaestrIA Neural Core Error:", error);
  const msg = error?.message || String(error);
  
  if (msg.includes("ERRO_CONFIG")) return msg;
  if (msg.includes("403") || msg.includes("API key not valid")) {
    return "ERRO_AUTENTICACAO: A chave API foi recusada pelo Google. Verifique se ela está ativa no AI Studio.";
  }
  if (msg.includes("429")) return "ERRO_QUOTA: Limite de requisições atingido. Tente novamente em alguns segundos.";
  
  return `ERRO_OPERACIONAL: A IA encontrou uma instabilidade. Tente novamente.`;
};

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Olá, confirme conexão.',
      config: { maxOutputTokens: 20 }
    });
    return { success: true, message: "Conectado com Sucesso!" };
  } catch (error) {
    return { success: false, message: handleAIError(error) };
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, type: 'transaction' | 'contact', categories?: string[]): Promise<string> => {
  try {
    const ai = createAI();
    const cats = categories?.join(', ') || 'Geral';
    const prompt = type === 'transaction' 
      ? `Extract financial data as JSON ARRAY: date (YYYY-MM-DD), description, amount (positive), type ('expense'/'income'), category (from: ${cats}), supplier, paymentMethod.`
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
      : `Map CSV to JSON ARRAY: "Nome"->name, "Empresa"->company.`;

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
      config: { systemInstruction: "Você é o MaestrIA OS. Seja direto, executivo e foque em resultados financeiros." }
    });
    return response.text || "Sem resposta do núcleo.";
  } catch (error) { return handleAIError(error); }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um contrato de prestação de serviços profissional entre Contratada: ${company.name} e Contratante: ${client.name}. Escopo: ${serviceDetails}. Use linguagem jurídica formal brasileira.`,
    });
    return response.text || "Falha ao gerar minuta.";
  } catch { return "Erro no motor de geração contratual."; }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = createAI();
    const summary = transactions.slice(0, 15).map(t => `${t.date}: ${t.description} - R$${t.amount} (${t.type})`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um relatório executivo DRE resumido para o período ${period} baseado nestes dados:\n${summary}. Destaque pontos de atenção e oportunidades de lucro.`,
    });
    return response.text || "Relatório vazio.";
  } catch { return "Erro na análise executiva."; }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise as seguintes transações em busca de anomalias, gastos duplicados ou falta de conformidade:\n${transactions.slice(0,20).map(t => t.description + ' R$' + t.amount).join('\n')}`,
    });
    return response.text || "Auditoria concluída sem observações.";
  } catch { return "Erro no motor de auditoria."; }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base no perfil de gastos destas categorias, sugira 3 ações estratégicas para aumentar o lucro líquido:\n${transactions.slice(0,20).map(t => t.category).join(', ')}`,
    });
    return response.text || "Sem sugestões no momento.";
  } catch { return "Erro no motor estratégico."; }
};
