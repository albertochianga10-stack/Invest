
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { InvestmentData, FinancialMetrics, CurrencyCode, CURRENCIES } from './types';
import { getFullMetrics, formatCurrency } from './utils/finance';
import { getStrategicAnalysis } from './services/geminiService';
import MetricCard from './components/MetricCard';

const STORAGE_KEY = 'applemar_invest_data';

const App: React.FC = () => {
  // Load initial state from LocalStorage or use defaults
  const [data, setData] = useState<InvestmentData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      initialInvestment: 5000000,
      discountRate: 15,
      currency: 'AOA',
      cashFlows: [
        { period: 1, amount: 1000000 },
        { period: 2, amount: 1500000 },
        { period: 3, amount: 2000000 },
        { period: 4, amount: 2500000 },
        { period: 5, amount: 3000000 },
      ]
    };
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const metrics = useMemo(() => getFullMetrics(data), [data]);

  const chartData = useMemo(() => {
    let cumulative = -data.initialInvestment;
    return [
      { name: 'Inv.', cash: -data.initialInvestment, cum: cumulative },
      ...data.cashFlows.map(cf => {
        cumulative += cf.amount;
        return {
          name: `P${cf.period}`,
          cash: cf.amount,
          cum: cumulative
        };
      })
    ];
  }, [data]);

  const handleUpdateFlow = (index: number, value: string) => {
    const newVal = parseFloat(value) || 0;
    const newFlows = [...data.cashFlows];
    newFlows[index].amount = newVal;
    setData({ ...data, cashFlows: newFlows });
  };

  const generateAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const insight = await getStrategicAnalysis(data, metrics);
      setAiAnalysis(insight);
    } catch (e) {
      setAiAnalysis("Erro ao conectar com a IA. Verifique sua conexão.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8">
        <div className="flex flex-col mb-4 md:mb-0">
          <h1 className="text-3xl font-light tracking-[0.2em] applemar-gold uppercase">APPLEMAR</h1>
          <p className="text-gray-500 text-[10px] font-light mt-1 uppercase tracking-[0.4em]">Angola Strategic Investment Unit</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Currency Selector */}
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setData({ ...data, currency: code })}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  data.currency === code 
                    ? 'applemar-bg-gold text-black' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button 
            onClick={generateAiAnalysis}
            disabled={loadingAi}
            className="px-6 py-2.5 bg-[#e5aa70]/10 border border-[#e5aa70]/30 rounded-full text-[#e5aa70] text-sm hover:bg-[#e5aa70]/20 transition-all flex items-center gap-2"
          >
            {loadingAi ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>}
            Consultar IA
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Indicators Grid */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="VPL" 
            value={formatCurrency(metrics.npv, data.currency)}
            icon="fas fa-landmark"
            trend={metrics.npv > 0 ? 'up' : 'down'}
            description="Valor Presente Líquido"
          />
          <MetricCard 
            label="TIR" 
            value={`${metrics.irr.toFixed(2)}%`}
            icon="fas fa-percent"
            trend={metrics.irr > data.discountRate ? 'up' : 'down'}
            description="Taxa Interna de Retorno"
          />
          <MetricCard 
            label="Payback" 
            value={metrics.payback === -1 ? "N/A" : `${metrics.payback.toFixed(1)} Anos`}
            icon="fas fa-hourglass-half"
            trend={metrics.payback > 0 && metrics.payback <= data.cashFlows.length / 2 ? 'up' : 'neutral'}
            description="Retorno do Capital"
          />
          <MetricCard 
            label="ROI Global" 
            value={`${metrics.roi.toFixed(1)}%`}
            icon="fas fa-chart-line"
            trend={metrics.roi > 50 ? 'up' : 'neutral'}
            description="Return on Investment"
          />
        </section>

        {/* Form & Controls */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest opacity-70">
              <i className="fas fa-sliders-h applemar-gold"></i> Parâmetros de Entrada
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1 tracking-tighter">Investimento Inicial ({CURRENCIES[data.currency].symbol})</label>
                <input 
                  type="number" 
                  value={data.initialInvestment}
                  onChange={(e) => setData({ ...data, initialInvestment: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#e5aa70]/50 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase mb-1 tracking-tighter">Taxa de Desconto / TMA (%)</label>
                <input 
                  type="number" 
                  value={data.discountRate}
                  onChange={(e) => setData({ ...data, discountRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#e5aa70]/50 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex-grow overflow-hidden flex flex-col">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest opacity-70">
              <i className="fas fa-calendar-alt applemar-gold"></i> Fluxo por Período
            </h2>
            <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[350px]">
              {data.cashFlows.map((cf, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                  <span className="text-[10px] text-gray-400 font-mono w-6">A{cf.period}</span>
                  <input 
                    type="number"
                    value={cf.amount}
                    onChange={(e) => handleUpdateFlow(idx, e.target.value)}
                    className="flex-grow bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-600">{data.currency}</span>
                </div>
              ))}
              <button 
                onClick={() => setData({ ...data, cashFlows: [...data.cashFlows, { period: data.cashFlows.length + 1, amount: 0 }] })}
                className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] uppercase text-gray-500 hover:text-white hover:border-white/20 transition-all"
              >
                + Adicionar Período
              </button>
            </div>
          </div>
        </aside>

        {/* Charts & Analysis */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Chart */}
          <div className="glass-card p-6 rounded-3xl h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Desempenho Acumulado ({data.currency})</h2>
              <i className="fas fa-expand-alt text-gray-700 text-xs"></i>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5aa70" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e5aa70" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#444" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#444" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #e5aa7033', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cum" 
                  stroke="#e5aa70" 
                  fillOpacity={1} 
                  fill="url(#colorCum)" 
                  strokeWidth={2}
                  name="Saldo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights */}
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <i className="fas fa-quote-right text-6xl text-[#e5aa70]"></i>
            </div>
            <h3 className="text-xs font-bold mb-6 text-[#e5aa70] uppercase tracking-[0.3em] flex items-center gap-2">
              <i className="fas fa-atom animate-pulse"></i> Relatório de Inteligência
            </h3>
            {aiAnalysis ? (
              <div className="text-sm text-gray-300 leading-relaxed font-light italic">
                {aiAnalysis.split('\n').map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-600 text-center">
                <p className="text-[10px] uppercase tracking-widest max-w-xs">Análise profunda offline disponível. Ative a IA para insights estratégicos em tempo real.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-16 text-center text-gray-800 text-[9px] uppercase tracking-[0.5em] py-8 border-t border-white/5">
        &copy; {new Date().getFullYear()} Applemar Angola &bull; Global Investment Dashboard &bull; Offline Enabled
      </footer>
    </div>
  );
};

export default App;
