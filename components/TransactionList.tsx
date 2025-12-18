
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction } from '../types';
import { Search, Trash2, Edit, X, Plus, Sparkles, FilePlus, CreditCard, Landmark, Banknote, ShieldCheck, Download, FileText, Share2, Printer, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionListProps {
  transactions: Transaction[];
  categories: string[];
  pendingReview?: Transaction | null;
  onReviewComplete?: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (list: Transaction[]) => void;
  onStartScan?: (file: File, reviewRequired: boolean) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  companyInfo?: any;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, pendingReview, onReviewComplete, onEditTransaction, onDeleteTransaction, onImportTransactions, onStartScan, language, companyInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanMode, setScanMode] = useState<'review' | 'auto'>('auto');

  useEffect(() => {
    if (pendingReview) {
      setEditingTx(pendingReview);
      setIsModalOpen(true);
    }
  }, [pendingReview]);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(tx => 
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          tx.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onStartScan) {
      onStartScan(file, scanMode === 'review');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString(language);

    // Header Design
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo?.name || "MAESTRIA ENTERPRISE", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`RELATÓRIO DE LANÇAMENTOS FINANCEIROS`, 15, 30);
    doc.text(dateStr, 195, 30, { align: 'right' });

    // Body
    const tableColumn = ["Data", "Descrição", "Parceiro", "Categoria", "Valor"];
    const tableRows = filteredTransactions.map(tx => [
      new Date(tx.date).toLocaleDateString(language),
      tx.description.toUpperCase(),
      (tx.supplier || 'N/A').toUpperCase(),
      tx.category.toUpperCase(),
      `${tx.type === 'expense' ? '-' : ''} R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'striped',
      headStyles: { 
        fillColor: [79, 70, 229], // Indigo 600
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        cellPadding: 5
      },
      styles: { 
        fontSize: 9,
        font: 'helvetica',
        cellPadding: 4,
        lineColor: [241, 245, 249],
        lineWidth: 0.1
      },
      columnStyles: {
        4: { fontStyle: 'bold', halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`${t.report_generated_by} MaestrIA Intelligence OS`, 15, 285);
        doc.text(`${t.page} ${data.pageNumber}`, 195, 285, { align: 'right' });
      }
    });

    doc.save(`Relatorio_Financeiro_${Date.now()}.pdf`);
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map(tx => ({
      'ID': tx.id,
      'Data': tx.date,
      'Descrição': tx.description,
      'Categoria': tx.category,
      'Parceiro': tx.supplier || 'N/A',
      'Tipo': tx.type === 'income' ? 'Entrada' : 'Saída',
      'Valor': tx.amount,
      'Status': tx.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");
    XLSX.writeFile(wb, `maestria_export_${Date.now()}.xlsx`);
  };

  const getPaymentIcon = (method?: string) => {
      const m = method?.toLowerCase() || '';
      if (m.includes('pix') || m.includes('ted')) return <Landmark className="w-3.5 h-3.5" />;
      if (m.includes('cartao') || m.includes('card')) return <CreditCard className="w-3.5 h-3.5" />;
      return <Banknote className="w-3.5 h-3.5" />;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Transaction = {
          id: editingTx?.id || Date.now().toString(),
          date: formData.get('date') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          amount: parseFloat(formData.get('amount') as string),
          type: formData.get('type') as any,
          status: 'paid',
          supplier: formData.get('supplier') as string,
          paymentMethod: formData.get('paymentMethod') as string,
          source: editingTx?.source || 'manual'
      };
      
      const isExisting = transactions.some(o => o.id === data.id);
      if (isExisting) onEditTransaction(data);
      else onImportTransactions([data]);
      
      setIsModalOpen(false);
      setEditingTx(null);
      if (onReviewComplete) onReviewComplete();
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full animate-in fade-in overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{t.transactions}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Gestão de Fluxo Corporativo Auditado</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,.csv,.xlsx" />
            
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                <button onClick={exportToExcel} className="p-2 text-slate-500 hover:text-emerald-600 transition-colors" title="Exportar Excel"><FileText className="w-5 h-5"/></button>
                <button onClick={exportToPDF} className="p-2 text-slate-500 hover:text-rose-600 transition-colors" title="Exportar PDF"><Printer className="w-5 h-5"/></button>
            </div>

            <button onClick={() => { setScanMode('review'); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest">
              <FilePlus className="w-3.5 h-3.5" /> NFSe / Extrato Scan
            </button>

            <button onClick={() => { setScanMode('auto'); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black bg-white border-2 border-slate-200 text-slate-900 hover:border-brand transition-all uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand" /> Scan Universal IA
            </button>

            <button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-lg">
                <Plus className="w-3.5 h-3.5" /> Novo Lançamento
            </button>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-brand/5 transition-all shadow-sm" />
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>{filteredTransactions.length} Registros</span>
            <div className="w-px h-4 bg-slate-200"></div>
            <span className="text-emerald-600">Auditado por MaestrIA Cloud</span>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Data / Status</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Descrição / Parceiro</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-center">Meio</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Categoria</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Valor</th>
              <th className="px-8 py-4 text-right uppercase text-[9px] font-black tracking-widest">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                    <p className="font-black text-slate-900 text-[11px]">{new Date(tx.date).toLocaleDateString(language)}</p>
                    {tx.source === 'ai' ? (
                        <div className="flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-[8px] font-black uppercase text-emerald-600">Auditado IA</span>
                        </div>
                    ) : (
                        <span className="text-[8px] font-black uppercase text-slate-400 mt-1 block">Manual</span>
                    )}
                </td>
                <td className="px-8 py-5">
                    <p className="font-black text-slate-950 uppercase italic text-[12px] leading-tight">{tx.description}</p>
                    {tx.supplier && <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">{tx.supplier}</p>}
                </td>
                <td className="px-8 py-5 text-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mx-auto" title={tx.paymentMethod}>
                        {getPaymentIcon(tx.paymentMethod)}
                    </div>
                </td>
                <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg uppercase">{tx.category}</span>
                </td>
                <td className={`px-8 py-5 font-black text-[15px] tracking-tighter ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                    {tx.type === 'expense' && '- '} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTx(tx); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand transition-colors"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => onDeleteTransaction(tx.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 border border-white/20 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Revisão Estratégica</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validação final dos dados extraídos</p>
                      </div>
                      <button onClick={() => { setIsModalOpen(false); setEditingTx(null); if(onReviewComplete) onReviewComplete(); }} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Descrição do Lançamento</label>
                                <input name="description" defaultValue={editingTx?.description} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none uppercase text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Montante R$</label>
                                <input name="amount" type="number" step="0.01" defaultValue={editingTx?.amount} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-sm focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Data Competência</label>
                                <input name="date" type="date" defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Categoria de Fluxo</label>
                                <select name="category" defaultValue={editingTx?.category || categories[0]} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Natureza</label>
                                <select name="type" defaultValue={editingTx?.type || 'expense'} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase">
                                    <option value="expense">Despesa (Saída)</option>
                                    <option value="income">Receita (Entrada)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Parceiro / Entidade</label>
                                <input name="supplier" defaultValue={editingTx?.supplier} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none uppercase text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Meio de Pagamento</label>
                                <input name="paymentMethod" defaultValue={editingTx?.paymentMethod} placeholder="Ex: PIX, Cartão..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none uppercase text-xs" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest hover:bg-brand flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-5 h-5" /> Efetivar no Fluxo de Caixa
                        </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionList;
