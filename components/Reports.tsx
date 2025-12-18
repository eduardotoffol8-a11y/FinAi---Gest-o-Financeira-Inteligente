
import React, { useState, useEffect } from 'react';
import { Transaction, GeneratedReport } from '../types';
import { generateExecutiveReport, performAudit, getStrategicSuggestions } from '../services/geminiService';
import { FileText, Download, ShieldAlert, Cpu, BrainCircuit, Trash2, Edit3, Save, ChevronRight, Activity, ShieldCheck, Target, TrendingUp, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translations } from '../translations';

interface ReportsProps {
  transactions: Transaction[];
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Reports: React.FC<ReportsProps> = ({ transactions, language }) => {
  const t = translations[language];
  const [reports, setReports] = useState<GeneratedReport[]>(() => {
    const saved = localStorage.getItem('maestria_reports_library_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    localStorage.setItem('maestria_reports_library_v2', JSON.stringify(reports));
  }, [reports]);

  const runAnalysis = async (type: 'audit' | 'strategic' | 'executive') => {
    setLoading(true);
    try {
        let result = '';
        let title = '';
        const date = new Date().toLocaleDateString(language);
        
        if (type === 'executive') {
            result = await generateExecutiveReport(transactions, 'Análise de Ciclo Atual');
            title = `EXECUTIVE DRE - ${date}`;
        } else if (type === 'audit') {
            result = await performAudit(transactions);
            title = `AUDIT REPORT - ${date}`;
        } else {
            result = await getStrategicSuggestions(transactions);
            title = `PROFIT PLAN - ${date}`;
        }

        const newReport: GeneratedReport = {
            id: Date.now().toString(),
            title,
            content: result,
            date,
            type,
            period: 'Análise de IA'
        };

        setReports(prev => [newReport, ...prev]);
        setActiveReport(newReport);
        setEditContent(result);
    } catch (err) {
        alert("Erro na consulta neural. Verifique sua chave API.");
    } finally {
        setLoading(false);
    }
  };

  const handleExportPDF = (report: GeneratedReport) => {
    const doc = new jsPDF();
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(report.content, 180);
    doc.text(report.title, 14, 20);
    doc.text(splitText, 14, 35);
    doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
  };

  if (activeReport) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-32">
            <div className="flex items-center justify-between">
                <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-slate-900 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar à Biblioteca
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
                        <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Editar Parecer</button>
                    )}
                    <button onClick={() => handleExportPDF(activeReport)} className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Baixar PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                        <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">Auditoria de Inteligência Artificial</span>
                        <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter mt-1">{activeReport.title}</h3>
                    </div>
                    <div className="p-10 md:p-16">
                        {isEditing ? (
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full min-h-[600px] p-8 bg-slate-50 rounded-3xl border border-slate-200 font-mono text-sm leading-relaxed outline-none" />
                        ) : (
                            <div className="prose max-w-none whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">{activeReport.content}</div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-indigo-400 mb-6" />
                        <h4 className="font-black uppercase text-xs italic mb-2 tracking-tighter">Certificado Digital</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Este dossiê foi gerado analisando {transactions.length} transações ativas no banco de dados corporativo.</p>
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
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Biblioteca de Dossiês e Auditorias Neurais</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <BrainCircuit className="w-5 h-5 text-brand animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motor Neural Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button onClick={() => runAnalysis('executive')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-brand group-hover:text-white transition-all duration-500"><TrendingUp className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Raio-X Executivo</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">DRE Neural e análise de performance global.</p>
          </button>
          <button onClick={() => runAnalysis('audit')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500"><ShieldAlert className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Auditoria de Riscos</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Identificação de anomalias e erros fiscais.</p>
          </button>
          <button onClick={() => runAnalysis('strategic')} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-left group hover:-translate-y-2">
              <div className="p-5 bg-slate-50 text-slate-950 rounded-[1.5rem] w-fit mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Target className="w-8 h-8"/></div>
              <h4 className="font-black text-slate-950 uppercase italic text-lg mb-3 tracking-tighter">Alavancagem de Lucro</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Planos proativos para redução de custos e margem.</p>
          </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">Biblioteca de Dossiês</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} Arquivos</span>
          </div>
          {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-8">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black uppercase tracking-[0.4em] text-indigo-600 text-xs animate-pulse">Consultando Inteligência Cloud...</p>
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
