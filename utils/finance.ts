
import { InvestmentData, FinancialMetrics, CurrencyCode, CURRENCIES } from '../types';

export const formatCurrency = (value: number, currencyCode: CurrencyCode): string => {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode === 'AOA' ? 'AOA' : currencyCode, // AOA is recognized by most browsers
    minimumFractionDigits: 2,
  }).format(value);
};

export const calculateNPV = (data: InvestmentData): number => {
  const { initialInvestment, discountRate, cashFlows } = data;
  const rate = discountRate / 100;
  let npv = -initialInvestment;
  cashFlows.forEach((cf) => {
    npv += cf.amount / Math.pow(1 + rate, cf.period);
  });
  return npv;
};

export const calculateIRR = (data: InvestmentData): number => {
  const { initialInvestment, cashFlows } = data;
  const flows = [-initialInvestment, ...cashFlows.map(cf => cf.amount)];
  let guest = 0.1;
  const MAX_ITERATIONS = 1000;
  const PRECISION = 1e-7;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let f = 0;
    let df = 0;
    for (let t = 0; t < flows.length; t++) {
      f += flows[t] / Math.pow(1 + guest, t);
      df -= (t * flows[t]) / Math.pow(1 + guest, t + 1);
    }
    const newGuest = guest - f / df;
    if (Math.abs(newGuest - guest) < PRECISION) return newGuest * 100;
    guest = newGuest;
  }
  return 0;
};

export const calculatePayback = (data: InvestmentData): number => {
  const { initialInvestment, cashFlows } = data;
  let cumulative = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    const prevCumulative = cumulative;
    cumulative += cashFlows[i].amount;
    if (cumulative >= 0) {
      const fraction = Math.abs(prevCumulative) / cashFlows[i].amount;
      return i + fraction;
    }
  }
  return -1;
};

export const getFullMetrics = (data: InvestmentData): FinancialMetrics => {
  const npv = calculateNPV(data);
  const irr = calculateIRR(data);
  const payback = calculatePayback(data);
  const totalRevenue = data.cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  const roi = ((totalRevenue - data.initialInvestment) / data.initialInvestment) * 100;
  const profitabilityIndex = (npv + data.initialInvestment) / data.initialInvestment;

  return { npv, irr, roi, payback, totalRevenue, profitabilityIndex };
};
