
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingDown, Zap, Bell, Sparkles, ArrowRight, Clock, ShieldCheck, Activity, PieChart as PieIcon } from 'lucide-react';
import { Transaction, ViewState } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  transactions: Transaction[];
  onViewChange?: (view: ViewState) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, onViewChange, onOpenChatWithPrompt, language }) => {
  const t = translations[language];
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  // Processamento para Radar e Pie
  const categoryTotals = transactions.reduce((acc: any, tx) => {
    if (tx.type === 'expense') {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    }
    return acc;
  }, {});

  const radarData = Object.keys(categoryTotals).map(cat => ({
    subject: cat,
    A: categoryTotals[cat],
    fullMark: Math.max(...(Object.values(categoryTotals) as number[])) || 100
  })).sort((a, b) => b.A - a.A).slice(0, 6);

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, trendValue, viewTarget }: any) => (
    <button onClick={() => onViewChange?.(viewTarget || ViewState.TRANSACTIONS)} className="w-full text-left bg-white p-6 rounded-3xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl group">
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-slate-900 group-hover:bg-opacity-20 transition-all`}>
              <Icon className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{trendValue}</span>
      </div>
      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">R$ {value.toLocaleString('pt-BR')}</h3>
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.income} value={totalIncome} trend="up" trendValue="+12%" icon={Wallet} colorClass="bg-emerald-500" />
        <StatCard title={t.expenses} value={totalExpense} trend="down" trendValue="-4%" icon={TrendingDown} colorClass="bg-rose-500" />
        <StatCard title={t.balance} value={netIncome} trend="up" trendValue="Saudável" icon={Zap} colorClass="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <h3 className="text-xl font-black text-slate-950 italic tracking-tighter mb-8 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500"/> Dispersão de Categorias
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                            <Radar name="Gastos" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} strokeWidth={2} />
                            <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                <h3 className="text-xl font-black text-slate-950 italic tracking-tighter mb-8 flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-purple-500"/> Mix de Despesas
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-2 justify-center">
                   {pieData.map((d, i) => (
                     <div key={i} className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                       <span className="text-[9px] font-black uppercase text-slate-400">{d.name}</span>
                     </div>
                   ))}
                </div>
            </div>
        </div>

        <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2 relative z-10">
              <Bell className="w-5 h-5 text-indigo-400" /> COMANDO MAESTRIA
          </h3>
          <div className="space-y-4 flex-1 relative z-10">
              <button onClick={() => onViewChange?.(ViewState.SCHEDULE)} className="w-full text-left bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Próximos Vencimentos</span>
                  </div>
                  <p className="text-sm font-bold">Vencimentos monitorados pela IA.</p>
              </button>
              <button onClick={() => onOpenChatWithPrompt?.("Analise meu extrato em busca de furos e anomalias de categoria. Gere uma auditoria de precisão agora.")} className="w-full text-left bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl hover:bg-indigo-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Auditoria Neural Sênior</span>
                  </div>
                  <p className="text-sm font-bold">Localizar furos operacionais agora.</p>
              </button>
          </div>
          <button onClick={() => onViewChange?.(ViewState.REPORTS)} className="mt-8 flex items-center justify-between bg-white text-slate-900 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition shadow-xl relative z-10">
              {t.ia} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
