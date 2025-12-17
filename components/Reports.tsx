
import React, { useState, useEffect } from 'react';
import { Transaction, GeneratedReport } from '../types';
import { generateExecutiveReport, performAudit, getStrategicSuggestions } from '../services/geminiService';
import { FileText, Sparkles, Download, Loader2, ShieldAlert, Cpu, BrainCircuit, Trash2, Edit3, Save, X, FilePlus, ChevronRight, Activity, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translations } from '../translations';

interface ReportsProps {
  transactions: Transaction[];
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Reports: React.FC<ReportsProps> = ({ transactions, language }) => {
  const t = translations[language];
  const [reports, setReports] = useState<GeneratedReport[]>(() => {
    const saved = localStorage.getItem('maestria_reports_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    localStorage.setItem('maestria_reports_library', JSON.stringify(reports));
  }, [reports]);

  const runAnalysis = async (type: 'audit' | 'strategic' | 'executive') => {
    setLoading(true);
    try {
        let result = '';
        let title = '';
        const date = new Date().toLocaleDateString(language);
        
        if (type === 'executive') {
            result = await generateExecutiveReport(transactions, 'Mês Atual');
            title = `MASTER EXECUTIVE DOSSIER - ${date}`;
        } else if (type === 'audit') {
            result = await performAudit(transactions);
            title = `SYSTEM AUDIT PROTOCOL - ${date}`;
        } else {
            result = await getStrategicSuggestions(transactions);
            title = `NEURAL STRATEGIC PLAN - ${date}`;
        }

        const newReport: GeneratedReport = {
            id: Date.now().toString(),
            title,
            content: result,
            date,
            type,
            period: 'Real-Time Analysis'
        };

        setReports(prev => [newReport, ...prev]);
        setActiveReport(newReport);
        setEditContent(result);
    } finally {
        setLoading(false);
    }
  };

  const handleExportPDF = (report: GeneratedReport) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // Slate 950
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("MAESTRIA ENTERPRISE", 14, 25);
    doc.setFontSize(8);
    doc.text("NEURAL FINANCIAL OPERATING SYSTEM", 14, 32);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`ID: ${report.id}`, 14, 50);
    doc.text(`DATE: ${report.date}`, 14, 55);
    doc.text(`TYPE: ${report.type.toUpperCase()}`, 14, 60);
    
    doc.line(14, 65, 196, 65);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(report.content, 180);
    doc.text(splitText, 14, 80);
    
    doc.save(`MAESTRIA_${report.type}_${report.id}.pdf`);
  };

  if (activeReport) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-slate-900 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> {t.dashboard}
                </button>
                <div className="flex gap-3">
                    {isEditing ? (
                        <button onClick={() => {
                          const updated = { ...activeReport, content: editContent };
                          setReports(prev => prev.map(r => r.id === activeReport.id ? updated : r));
                          setActiveReport(updated);
                          setIsEditing(false);
                        }} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                          <Save className="w-4 h-4 mr-2 inline"/> {t.save}
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95">
                          <Edit3 className="w-4 h-4 mr-2 inline"/> Editar
                        </button>
                    )}
                    <button onClick={() => handleExportPDF(activeReport)} className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4 mr-2 inline"/> Exportar PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Neural Document</span>
                            <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter mt-1">{activeReport.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">98% Neural Confidence</span>
                        </div>
                    </div>
                    <div className="p-10 md:p-16">
                        {isEditing ? (
                            <textarea 
                              value={editContent} 
                              onChange={(e) => setEditContent(e.target.value)} 
                              className="w-full min-h-[600px] p-8 bg-slate-50 rounded-3xl border border-slate-200 font-mono text-sm leading-relaxed outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                            />
                        ) : (
                            <div className="prose prose-slate max-w-none">
                                <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">
                                    {activeReport.content}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-indigo-400 mb-6" />
                        <h4 className="font-black uppercase text-xs italic mb-2 tracking-tighter">Validação de Integridade</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Este relatório foi gerado via rede neural criptografada e auditado conforme protocolos MaestrIA v8.0.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="font-black uppercase text-[10px] text-slate-400 mb-6 tracking-widest">Key Insights</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-[11px] font-black text-slate-900 uppercase">Fluxo Otimizado</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-[11px] font-black text-slate-900 uppercase">Risco Controlado</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span className="text-[11px] font-black text-slate-900 uppercase">IA Proativa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{t.ia}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Comando Financeiro de Alta Performance</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <BrainCircuit className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Núcleo Neural Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button onClick={() => runAnalysis('executive')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] w-fit mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500"><TrendingUp className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Executive Intelligence</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">DRE Neural, EBITDA e Análise de Performance Global.</p>
          </button>
          <button onClick={() => runAnalysis('audit')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-rose-50 text-rose-600 rounded-[1.5rem] w-fit mb-8 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500"><ShieldAlert className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Deep System Audit</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Escaneamento total de anomalias, riscos e conformidade.</p>
          </button>
          <button onClick={() => runAnalysis('strategic')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] w-fit mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Target className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Neural Strategy</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Plano de ações proativas para aumento de margem e lucro.</p>
          </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">Biblioteca de Dossiês</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} Documentos</span>
          </div>
          {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                      <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <BrainCircuit className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="font-black uppercase tracking-[0.4em] text-slate-900 mb-2">Processando Lógica Neural</p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase animate-pulse">Cruzando dados operacionais com diretrizes MaestrIA...</p>
                  </div>
              </div>
          ) : reports.length > 0 ? (
              <div className="divide-y divide-slate-50">
                  {reports.map(report => (
                      <div key={report.id} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                          <button onClick={() => { setActiveReport(report); setEditContent(report.content); }} className="flex items-center gap-8 flex-1 text-left">
                              <div className={`p-5 rounded-[1.5rem] shadow-sm ${report.type === 'audit' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <FileText className="w-6 h-6"/>
                              </div>
                              <div>
                                  <h5 className="font-black text-slate-950 uppercase italic text-base group-hover:text-indigo-600 transition-colors">{report.title}</h5>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date}</span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">{report.period}</span>
                                  </div>
                              </div>
                          </button>
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleExportPDF(report)} className="p-4 text-slate-300 hover:text-indigo-600 transition-colors"><Download className="w-5 h-5"/></button>
                             <button onClick={() => setReports(prev => prev.filter(r => r.id !== report.id))} className="p-4 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-40 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 opacity-40">
                    <Cpu className="w-12 h-12 text-slate-300"/>
                </div>
                <p className="font-black uppercase text-xs text-slate-300 tracking-[0.3em]">Aguardando Comando Executivo</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Reports;
