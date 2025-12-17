
import React, { useState, useEffect } from 'react';
import { Transaction, GeneratedReport } from '../types';
import { generateExecutiveReport, performAudit, getStrategicSuggestions } from '../services/geminiService';
import { FileText, Download, ShieldAlert, Cpu, BrainCircuit, Trash2, Edit3, Save, ChevronRight, Activity, ShieldCheck, Target, TrendingUp } from 'lucide-react';
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
            title = `RAIO-X DE PERFORMANCE - ${date}`;
        } else if (type === 'audit') {
            result = await performAudit(transactions);
            title = `AUDITORIA DE RISCOS E ERROS - ${date}`;
        } else {
            result = await getStrategicSuggestions(transactions);
            title = `PLANO ESTRATÉGICO DE LUCRO - ${date}`;
        }

        const newReport: GeneratedReport = {
            id: Date.now().toString(),
            title,
            content: result,
            date,
            type,
            period: 'Análise Real-Time'
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
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("MAESTRIA ENTERPRISE", 14, 25);
    doc.setFontSize(8);
    doc.text("SISTEMA DE AUDITORIA NEURAL", 14, 32);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`ID: ${report.id}`, 14, 50);
    doc.text(`DATA: ${report.date}`, 14, 55);
    doc.line(14, 65, 196, 65);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(report.content, 180);
    doc.text(splitText, 14, 80);
    doc.save(`MAESTRIA_RELATORIO_${report.id}.pdf`);
  };

  if (activeReport) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-32">
            <div className="flex items-center justify-between">
                <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-slate-900 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
                <div className="flex gap-3">
                    {isEditing ? (
                        <button onClick={() => {
                          const updated = { ...activeReport, content: editContent };
                          setReports(prev => prev.map(r => r.id === activeReport.id ? updated : r));
                          setActiveReport(updated);
                          setIsEditing(false);
                        }} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"><Save className="w-4 h-4 mr-2 inline"/> Salvar</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Editar</button>
                    )}
                    <button onClick={() => handleExportPDF(activeReport)} className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">Documento Neural MaestrIA</span>
                            <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter mt-1">{activeReport.title}</h3>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confiança da IA: 98%</span>
                        </div>
                    </div>
                    <div className="p-10 md:p-16">
                        {isEditing ? (
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full min-h-[600px] p-8 bg-slate-50 rounded-3xl border border-slate-200 font-mono text-sm leading-relaxed outline-none" />
                        ) : (
                            <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">{activeReport.content}</div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-indigo-400 mb-6" />
                        <h4 className="font-black uppercase text-xs italic mb-2 tracking-tighter">Certificação Neural</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Documento gerado através de processamento massivo de transações e parceiros cadastrados.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="font-black uppercase text-[10px] text-slate-400 mb-6 tracking-widest">Métricas Chave</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[11px] font-black text-slate-900 uppercase">Dados Auditados</span></div>
                            <div className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span className="text-[11px] font-black text-slate-900 uppercase">Riscos Mapeados</span></div>
                            <div className="flex items-center gap-3"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><span className="text-[11px] font-black text-slate-900 uppercase">IA Proativa</span></div>
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
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Inteligência Estratégica para o seu Negócio</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <BrainCircuit className="w-5 h-5 text-brand animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motor Neural Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button onClick={() => runAnalysis('executive')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-brand group-hover:text-white transition-all duration-500"><TrendingUp className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Raio-X de Performance</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">DRE Neural, análise de margens e desempenho global de caixa.</p>
          </button>
          <button onClick={() => runAnalysis('audit')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500"><ShieldAlert className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Auditoria de Riscos</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Identificação automática de duplicidades, erros e fraudes.</p>
          </button>
          <button onClick={() => runAnalysis('strategic')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Target className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Plano Estratégico</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Ações proativas sugeridas pela IA para aumento de lucro real.</p>
          </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">Documentos Gerados</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} Dossiês</span>
          </div>
          {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-8">
                  <div className="w-20 h-20 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black uppercase tracking-[0.4em] text-slate-400 text-xs">Consultando Núcleo Neural...</p>
              </div>
          ) : reports.length > 0 ? (
              <div className="divide-y divide-slate-50">
                  {reports.map(report => (
                      <div key={report.id} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                          <button onClick={() => { setActiveReport(report); setEditContent(report.content); }} className="flex items-center gap-8 flex-1 text-left">
                              <div className={`p-5 rounded-[1.5rem] ${report.type === 'audit' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                <FileText className="w-6 h-6"/>
                              </div>
                              <div>
                                  <h5 className="font-black text-slate-950 uppercase italic text-base group-hover:text-brand transition-colors">{report.title}</h5>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date}</span>
                              </div>
                          </button>
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleExportPDF(report)} className="p-4 text-slate-300 hover:text-brand"><Download className="w-5 h-5"/></button>
                             <button onClick={() => setReports(prev => prev.filter(r => r.id !== report.id))} className="p-4 text-slate-300 hover:text-rose-600"><Trash2 className="w-5 h-5"/></button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-40 text-center flex flex-col items-center">
                <Cpu className="w-12 h-12 text-slate-200 mb-6"/>
                <p className="font-black uppercase text-[10px] text-slate-300 tracking-[0.3em]">Nenhum dossiê gerado ainda</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Reports;
