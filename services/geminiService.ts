
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Contact } from "../types";

const getAI = () => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    console.error("MaestrIA Cloud Error:", error);
    return "[]";
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
    console.error("MaestrIA Cloud Text Error:", error);
    return "[]";
  }
};

export const generateServiceContract = async (company: any, client: Contact, serviceDetails: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Aja como um Advogado Especialista em Direito Civil e Empresarial (Nível Sênior). 
                    Gere um INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS de altíssima formalidade e elegância.
                    
                    DADOS DA CONTRATADA:
                    Nome: ${company.name}
                    CNPJ: ${company.taxId || '[Informar CNPJ]'}
                    Endereço: ${company.address || '[Endereço]'}, ${company.city || '[Cidade]'}
                    Contato: ${company.email || '[E-mail]'} | ${company.phone || '[Telefone]'}
                    
                    DADOS DA CONTRATANTE:
                    Nome/Razão: ${client.name}
                    Empresa: ${client.company || 'N/A'}
                    CPF/CNPJ: ${client.taxId || '[Documento]'}
                    Endereço: ${client.address || '[Endereço]'}, ${client.neighborhood || '[Bairro]'}, ${client.city || '[Cidade]'}, ${client.state || '[UF]'}, CEP: ${client.zipCode || '[CEP]'}
                    
                    ESCOPO DO SERVIÇO: ${serviceDetails}
                    
                    ESTRUTURA JURÍDICA:
                    - Qualificação das partes com rigor formal.
                    - Cláusula 1ª - Do Objeto e Escopo.
                    - Cláusula 2ª - Das Obrigações da Contratada.
                    - Cláusula 3ª - Das Obrigações da Contratante.
                    - Cláusula 4ª - Do Preço e Condições de Pagamento.
                    - Cláusula 5ª - Do Prazo e Rescisão.
                    - Cláusula 6ª - Do Sigilo e LGPD.
                    - Cláusula 7ª - Do Foro de Eleição.
                    
                    Utilize linguagem culta, elegante e profissional. Adicione um Sumário Executivo de Orientação Jurídica da IA ao final.
                    Formate em Markdown profissional.`;

    // Tenta o Pro, se falhar cai no Flash
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { temperature: 0.3 }
      });
      return response.text || "Erro ao gerar minuta contratual.";
    } catch {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { temperature: 0.3 }
      });
      return response.text || "Erro ao gerar minuta contratual.";
    }
  } catch (error) {
    return "IA Indisponível ou API KEY ausente.";
  }
};

export const generateExecutiveReport = async (transactions: Transaction[], period: string): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} (${t.type}) R$${t.amount}`).join('\n');
    const prompt = `Gere um Relatório de Performance Executiva para ${period}. Analise tendências de fluxo de caixa baseando-se em:\n${summary}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    return "Erro ao gerar relatório neural.";
  }
};

export const performAudit = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} R$${t.amount} [ID: ${t.id}]`).join('\n');
    const resp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Aja como um Auditor Fiscal Sênior. Procure por duplicidades e anomalias nestes lançamentos:\n${summary}`,
    });
    return resp.text || "Nenhuma anomalia detectada.";
  } catch (error) {
    return "Erro no motor de auditoria.";
  }
};

export const getStrategicSuggestions = async (transactions: Transaction[]): Promise<string> => {
  try {
    const ai = getAI();
    const summary = transactions.slice(0, 50).map(t => `${t.category}: R$${t.amount}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira 3 ações estratégicas de otimização financeira baseadas nestes gastos:\n${summary}`,
    });
    return response.text || "Dicas estratégicas indisponíveis no momento.";
  } catch (error) {
    return "Erro estratégica neural.";
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
    return "O MaestrIA está em modo offline ou sem API KEY configurada.";
  }
};
