
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Zap, Bell, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Transaction, ViewState } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  onViewChange?: (view: ViewState) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, onViewChange, onOpenChatWithPrompt }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netIncome = totalIncome - totalExpense;

  const monthlyData = [
    { name: 'Jan', receita: 4000, despesa: 2400 },
    { name: 'Fev', receita: 3000, despesa: 1398 },
    { name: 'Mar', receita: 2000, despesa: 9800 },
    { name: 'Abr', receita: 2780, despesa: 3908 },
    { name: 'Mai', receita: 1890, despesa: 4800 },
    { name: 'Jun', receita: 2390, despesa: 3800 },
    { name: 'Jul', receita: totalIncome, despesa: totalExpense },
  ];

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, trendValue }: any) => (
    <button 
      onClick={() => onViewChange?.(ViewState.TRANSACTIONS)}
      className="w-full text-left bg-white p-6 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-slate-100 active:scale-95"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
          <Icon className="w-24 h-24 -mr-8 -mt-8" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 border border-white/30`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 border ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
            </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
        </h3>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Receitas do Mês" value={totalIncome} trend="up" trendValue="12.5%" icon={Wallet} colorClass="bg-emerald-500" />
        <StatCard title="Despesas Totais" value={totalExpense} trend="down" trendValue="4.2%" icon={TrendingDown} colorClass="bg-rose-500" />
        <StatCard title="Saldo em Caixa" value={netIncome} trend="up" trendValue="Saudável" icon={Zap} colorClass="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Saúde Financeira</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="receita" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} strokeWidth={4} />
                <Area type="monotone" dataKey="despesa" stroke="#ec4899" fill="#ec4899" fillOpacity={0.05} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Centro de Mensagens e Dicas IA */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" /> CENTRAL DE ALERTAS
          </h3>

          <div className="space-y-4 flex-1">
              {/* Lembrete de Agenda */}
              <button 
                onClick={() => onViewChange?.(ViewState.SCHEDULE)}
                className="w-full text-left bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition group"
              >
                  <div className="flex items-center gap-3 mb-1">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximo Vencimento</span>
                  </div>
                  <p className="text-sm font-bold group-hover:text-indigo-300">Folha de Pagamento em 3 dias</p>
              </button>

              {/* Dica da IA */}
              <button 
                onClick={() => onOpenChatWithPrompt?.("FinAI, como posso reduzir minhas despesas operacionais este mês?")}
                className="w-full text-left bg-indigo-500/20 border border-indigo-500/30 p-4 rounded-2xl hover:bg-indigo-500/30 transition group"
              >
                  <div className="flex items-center gap-3 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Sugestão FinAI</span>
                  </div>
                  <p className="text-sm font-bold">Identificamos gastos altos com tecnologia. Quer analisar?</p>
              </button>
          </div>

          <button 
            onClick={() => onViewChange?.(ViewState.REPORTS)}
            className="mt-8 flex items-center justify-between bg-white text-slate-900 p-4 rounded-2xl font-black text-xs tracking-widest hover:bg-indigo-50 transition"
          >
              RELATÓRIO COMPLETO <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
