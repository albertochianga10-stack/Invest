
export type CurrencyCode = 'AOA' | 'USD' | 'EUR' | 'BRL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  AOA: { code: 'AOA', symbol: 'Kz', locale: 'pt-AO' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
};

export interface CashFlowEntry {
  period: number;
  amount: number;
}

export interface InvestmentData {
  initialInvestment: number;
  discountRate: number; // TMA
  cashFlows: CashFlowEntry[];
  currency: CurrencyCode;
}

export interface FinancialMetrics {
  npv: number;       // VPL
  irr: number;       // TIR
  roi: number;       // Retorno sobre Investimento
  payback: number;   // Payback Simples
  totalRevenue: number;
  profitabilityIndex: number;
}
