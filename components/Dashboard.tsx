
import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Wallet, TrendingDown, Zap, Sparkles, ArrowRight, Clock, ShieldCheck, Activity, PieChart as PieIcon, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, Cpu, Globe } from 'lucide-react';
import { Transaction, ViewState } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  transactions: Transaction[];
  onViewChange?: (view: ViewState) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  aiConnected?: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, onViewChange, language, aiConnected = true }) => {
  const t = translations[language];
  const [period, setPeriod] = useState<'all' | '7d' | '30d' | 'month'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const matchesPeriod = period === 'all' ? true :
        period === '7d' ? (now.getTime() - txDate.getTime()) <= 7 * 24 * 60 * 60 * 1000 :
        period === '30d' ? (now.getTime() - txDate.getTime()) <= 30 * 24 * 60 * 60 * 1000 :
        period === 'month' ? txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear() : true;
      
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      return matchesPeriod && matchesCategory;
    });
  }, [transactions, period, selectedCategory]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  const categoryTotals = useMemo(() => {
    return filteredTransactions.reduce((acc: any, tx) => {
      if (tx.type === 'expense') {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      }
      return acc;
    }, {});
  }, [filteredTransactions]);

  const barData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    total: categoryTotals[cat]
  })).sort((a, b) => b.total - a.total).slice(0, 8);

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, trendValue, viewTarget }: any) => (
    <button onClick={() => onViewChange?.(viewTarget || ViewState.TRANSACTIONS)} className="w-full text-left bg-white p-8 rounded-[2.5rem] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-2xl group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex justify-between items-start mb-6 relative z-10">
          <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 text-slate-900`}>
              <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
            {trendValue}
          </div>
      </div>
      <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </h3>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Visão Panorâmica</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Performance Financeira Consolidada</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'month', label: 'Mês' },
                { id: '30d', label: '30d' },
                { id: '7d', label: '7d' }
              ].map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setPeriod(p.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title={t.income} value={totalIncome} trend="up" trendValue="+12.4%" icon={Wallet} colorClass="bg-emerald-500" viewTarget={ViewState.TRANSACTIONS} />
        <StatCard title={t.expenses} value={totalExpense} trend="down" trendValue="-3.2%" icon={TrendingDown} colorClass="bg-rose-500" viewTarget={ViewState.TRANSACTIONS} />
        <StatCard title={t.balance} value={netIncome} trend={netIncome >= 0 ? "up" : "down"} trendValue={netIncome >= 0 ? "Positivo" : "Alerta"} icon={Zap} colorClass="bg-indigo-500" viewTarget={ViewState.TRANSACTIONS} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-950 italic tracking-tighter flex items-center gap-3 uppercase">
                  <Activity className="w-6 h-6 text-indigo-500"/> Fluxo por Categoria
              </h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top {barData.length} Áreas</div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} width={100} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                          formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                        />
                        <Bar dataKey="total" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center group">
            <h3 className="text-xl font-black text-slate-950 italic tracking-tighter mb-10 self-start flex items-center gap-3 uppercase">
                <PieIcon className="w-6 h-6 text-purple-500"/> Composição de Custos
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 w-full px-4">
               {pieData.map((d, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                   <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 truncate max-w-[80px]">{d.name}</span>
                    <span className="text-[10px] font-bold text-slate-900">R$ {d.value.toLocaleString('pt-BR')}</span>
                   </div>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
