
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { generateExecutiveReport, performAudit, getStrategicSuggestions } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Sparkles, Download, Loader2, ShieldAlert, Cpu, Calendar, TrendingUp, ArrowRight, BrainCircuit, Activity } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [activeTool, setActiveTool] = useState<'report' | 'audit' | 'suggest'>('report');
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const runTool = async (tool: 'report' | 'audit' | 'suggest') => {
    setLoading(true);
    setActiveTool(tool);
    try {
        let result = '';
        if (tool === 'report') result = await generateExecutiveReport(transactions, `${dateRange.start || 'Início'} até ${dateRange.end || 'Hoje'}`);
        if (tool === 'audit') result = await performAudit(transactions);
        if (tool === 'suggest') result = await getStrategicSuggestions(transactions, 'mensal');
        setOutput(result);
    } finally {
        setLoading(false);
    }
  };

  const ToolCard = ({ id, title, description, icon: Icon, color }: any) => (
      <button 
        onClick={() => { setOutput(''); setActiveTool(id); }}
        className={`flex-1 text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${activeTool === id ? 'bg-white border-indigo-500 shadow-xl ring-4 ring-indigo-500/5' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
      >
          <div className={`p-3 rounded-2xl w-fit mb-4 ${color} bg-opacity-10 text-slate-900`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight mb-2 italic">{title}</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{description}</p>
      </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Hub de Inteligência FinAI</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Sessão Neural de Comando Financeiro</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black">
                <BrainCircuit className="w-4 h-4" /> ENGINE: GEMINI 3 PRO
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
        </div>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToolCard 
            id="report" 
            title="Relatório Executivo" 
            description="Gera uma análise densa de performance para stakeholders e sócios." 
            icon={FileText} 
            color="bg-indigo-500"
          />
          <ToolCard 
            id="audit" 
            title="Auditoria de Risco" 
            description="Escaneia anomalias, erros de lançamento e possíveis fraudes fiscais." 
            icon={ShieldAlert} 
            color="bg-rose-500"
          />
          <ToolCard 
            id="suggest" 
            title="Insights Estratégicos" 
            description="Sugestões semanais baseadas em inteligência de mercado e fluxo." 
            icon={Sparkles} 
            color="bg-emerald-500"
          />
      </div>

      {/* Painel de Ação */}
      <div className="bg-slate-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
          
          {/* Header do Painel */}
          <div className="bg-white/5 backdrop-blur-md p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                      {activeTool === 'report' ? <FileText /> : activeTool === 'audit' ? <ShieldAlert /> : <Sparkles />}
                  </div>
                  <div>
                      <h4 className="text-white font-black uppercase italic tracking-widest text-lg">{activeTool.toUpperCase()} NEURAL</h4>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Configure os parâmetros abaixo</p>
                  </div>
              </div>

              {activeTool === 'report' && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl">
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="bg-transparent text-white text-[10px] font-bold outline-none border border-white/10 p-2 rounded-xl focus:border-indigo-400 transition-colors"
                      />
                      <span className="text-slate-600 font-black">→</span>
                      <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="bg-transparent text-white text-[10px] font-bold outline-none border border-white/10 p-2 rounded-xl focus:border-indigo-400 transition-colors"
                      />
                  </div>
              )}

              <button 
                onClick={() => runTool(activeTool)}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
              >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Cpu className="w-4 h-4"/>}
                  {loading ? 'PROCESSANDO...' : 'EXECUTAR AGORA'}
              </button>
          </div>

          {/* Resultado */}
          <div className="flex-1 p-8 md:p-12 relative z-10">
              {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-400/80 gap-6">
                      <div className="w-24 h-24 relative">
                          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full animate-ping"></div>
                          <div className="absolute inset-2 border-4 border-indigo-500/30 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <BrainCircuit className="w-10 h-10 animate-bounce"/>
                          </div>
                      </div>
                      <div className="text-center space-y-2">
                          <p className="text-xl font-black italic uppercase tracking-tighter">Sincronizando Rede Neural...</p>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Acessando memórias de transações v4.0</p>
                      </div>
                  </div>
              ) : output ? (
                  <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/5 prose prose-invert max-w-none animate-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                          <h5 className="text-xs font-black uppercase text-indigo-400 tracking-[0.4em]">Resultado da Operação</h5>
                          <button onClick={() => window.print()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all shadow-xl">
                              <Download className="w-5 h-5"/>
                          </button>
                      </div>
                      <div className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                          {output}
                      </div>
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 text-center">
                      <Sparkles className="w-20 h-20 mb-6 opacity-20"/>
                      <p className="text-lg font-black italic tracking-tight">O FinAI aguarda seu comando...</p>
                      <p className="text-xs font-bold uppercase tracking-widest mt-2 max-w-xs">Selecione uma ferramenta acima e clique em EXECUTAR para iniciar a análise neural de dados.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Reports;
