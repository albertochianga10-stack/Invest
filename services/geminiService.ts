
import { GoogleGenAI } from "@google/genai";
import { InvestmentData, FinancialMetrics, CURRENCIES } from "../types";

export const getStrategicAnalysis = async (data: InvestmentData, metrics: FinancialMetrics): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const currency = CURRENCIES[data.currency];
  
  const prompt = `
    Atue como um analista financeiro sênior da Applemar Invest, focado no mercado de Angola e Internacional.
    Analise os dados financeiros abaixo e forneça uma síntese executiva de alto nível.
    
    Contexto Financeiro (${data.currency}):
    - Investimento: ${currency.symbol} ${data.initialInvestment.toLocaleString(currency.locale)}
    - VPL: ${currency.symbol} ${metrics.npv.toLocaleString(currency.locale)}
    - TIR: ${metrics.irr.toFixed(2)}% (TMA de ${data.discountRate}%)
    - Payback: ${metrics.payback === -1 ? 'Inviável no período' : metrics.payback.toFixed(1) + ' períodos'}
    - ROI: ${metrics.roi.toFixed(2)}%
    - Índice de Lucratividade: ${metrics.profitabilityIndex.toFixed(2)}

    Se a moeda for AOA, considere o contexto inflacionário e a taxa de câmbio se apropriado. 
    Seja elegante, direto e use um tom de consultoria premium. Limite-se a 3 parágrafos curtos.
    Responda em Português (PT-AO/PT-BR).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Sem insights no momento.";
  } catch (error) {
    console.error("AI connection error:", error);
    throw error;
  }
};
