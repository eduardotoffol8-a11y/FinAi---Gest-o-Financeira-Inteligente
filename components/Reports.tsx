
import React, { useState, useEffect } from 'react';
import { Transaction, GeneratedReport } from '../types';
import { generateExecutiveReport, performAudit, getStrategicSuggestions } from '../services/geminiService';
import { FileText, Sparkles, Download, Loader2, ShieldAlert, Cpu, BrainCircuit, Trash2, Edit3, Save, X, FilePlus, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
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
        const date = new Date().toLocaleDateString('pt-BR');
        
        if (type === 'executive') {
            result = await generateExecutiveReport(transactions, 'Mês Atual');
            title = `RELATÓRIO EXECUTIVO - ${date}`;
        } else if (type === 'audit') {
            result = await performAudit(transactions);
            title = `AUDITORIA DE RISCO - ${date}`;
        } else {
            result = await getStrategicSuggestions(transactions);
            title = `PLANO ESTRATÉGICO - ${date}`;
        }

        const newReport: GeneratedReport = {
            id: Date.now().toString(),
            title,
            content: result,
            date,
            type,
            period: 'Mensal'
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
    doc.setFontSize(20);
    doc.text("MAESTRIA ENTERPRISE", 14, 20);
    doc.setFontSize(10);
    doc.text(`Documento de Inteligência Financeira - ${report.date}`, 14, 28);
    doc.line(14, 32, 196, 32);
    
    doc.setFontSize(14);
    doc.text(report.title, 14, 45);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(report.content, 180);
    doc.text(splitText, 14, 55);
    
    doc.save(`${report.title.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  const saveEdit = () => {
    if (activeReport) {
        const updated = { ...activeReport, content: editContent };
        setReports(prev => prev.map(r => r.id === activeReport.id ? updated : r));
        setActiveReport(updated);
        setIsEditing(false);
    }
  };

  const deleteReport = (id: string) => {
    if (confirm("Deseja apagar permanentemente este documento neural?")) {
        setReports(prev => prev.filter(r => r.id !== id));
        if (activeReport?.id === id) setActiveReport(null);
    }
  };

  if (activeReport) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-slate-900 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar à Biblioteca
                </button>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={saveEdit} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"><Save className="w-4 h-4"/> Salvar Alterações</button>
                            <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest"><X className="w-4 h-4"/></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"><Edit3 className="w-4 h-4"/> Editar Documento</button>
                            <button onClick={() => handleExportPDF(activeReport)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20"><Download className="w-4 h-4"/> Exportar PDF</button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-950 p-10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl w-fit"><FileText className="w-8 h-8 text-indigo-400"/></div>
                        <span className="text-[10px] font-black border border-white/20 px-3 py-1 rounded-full uppercase tracking-widest">{activeReport.type}</span>
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">{activeReport.title}</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Documento de Auditoria MaestrIA v4.2</p>
                </div>
                
                <div className="p-10 md:p-16">
                    {isEditing ? (
                        <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[600px] p-8 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-medium leading-relaxed text-slate-700"
                        />
                    ) : (
                        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                            {activeReport.content}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Inteligência MaestrIA</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Biblioteca de Auditoria e Estratégia</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black">
                <BrainCircuit className="w-4 h-4" /> HUB DE COMANDO CFO
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => runAnalysis('executive')} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6"><FilePlus className="w-6 h-6"/></div>
              <h4 className="font-black text-slate-900 uppercase italic tracking-tight mb-2">Novo Relatório Executivo</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Analise DRE e performance para investidores.</p>
          </button>
          
          <button onClick={() => runAnalysis('audit')} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-6"><ShieldAlert className="w-6 h-6"/></div>
              <h4 className="font-black text-slate-900 uppercase italic tracking-tight mb-2">Nova Auditoria de Risco</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Escaneie anomalias e falhas contábeis.</p>
          </button>

          <button onClick={() => runAnalysis('strategic')} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6"><Sparkles className="w-6 h-6"/></div>
              <h4 className="font-black text-slate-900 uppercase italic tracking-tight mb-2">Plano de Ação Neural</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Sugestões estratégicas para lucro imediato.</p>
          </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">Biblioteca de Inteligência</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} Documentos</span>
          </div>
          
          {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/10 rounded-full animate-ping"></div>
                    <Cpu className="w-10 h-10 text-indigo-600 absolute inset-0 m-auto animate-pulse"/>
                  </div>
                  <div className="text-center">
                      <p className="text-xl font-black italic uppercase text-slate-900">Sincronizando Rede Neural...</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-2">Formatando Auditoria Contábil Profissional</p>
                  </div>
              </div>
          ) : reports.length > 0 ? (
              <div className="divide-y divide-slate-50">
                  {reports.map(report => (
                      <div key={report.id} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                          <button onClick={() => { setActiveReport(report); setEditContent(report.content); }} className="flex items-center gap-6 flex-1 text-left">
                              <div className={`p-4 rounded-2xl ${report.type === 'audit' ? 'bg-rose-50 text-rose-600' : report.type === 'executive' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  <FileText className="w-6 h-6"/>
                              </div>
                              <div>
                                  <h5 className="font-black text-slate-900 uppercase italic text-sm group-hover:text-indigo-600 transition-colors">{report.title}</h5>
                                  <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date}</span>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{report.type}</span>
                                  </div>
                              </div>
                          </button>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleExportPDF(report)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all"><Download className="w-4 h-4"/></button>
                              <button onClick={() => deleteReport(report.id)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4"/></button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="py-32 text-center opacity-20">
                  <Cpu className="w-20 h-20 mx-auto mb-6"/>
                  <p className="font-black uppercase tracking-widest text-xs">Aguardando geração de dados estratégicos</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Reports;
