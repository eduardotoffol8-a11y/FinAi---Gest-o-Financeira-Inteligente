
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wallet, TrendingDown, Zap, Bell, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Transaction, ViewState } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  transactions: Transaction[];
  onViewChange?: (view: ViewState) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onViewChange, onOpenChatWithPrompt, language }) => {
  const t = translations[language];
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, trendValue }: any) => (
    <button onClick={() => onViewChange?.(ViewState.TRANSACTIONS)} className="w-full text-left bg-white p-6 rounded-3xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl group">
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-slate-900`}>
              <Icon className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{trendValue}</span>
      </div>
      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">R$ {value.toLocaleString()}</h3>
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
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 italic tracking-tight mb-8">Fluxo Neural</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{name: 'D-3', v: 400}, {name: 'D-2', v: 300}, {name: 'D-1', v: 600}, {name: 'Hoje', v: 800}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] flex flex-col shadow-2xl">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" /> COMANDO MAESTRIA
          </h3>
          <div className="space-y-4 flex-1">
              <div className="w-full text-left bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                  </div>
                  <p className="text-sm font-bold">Vencimentos monitorados pela IA.</p>
              </div>
          </div>
          <button onClick={() => onViewChange?.(ViewState.REPORTS)} className="mt-8 flex items-center justify-between bg-white text-slate-900 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition">
              {t.ia} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
