
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

  // Ativar o modal de edição se houver uma transação pendente de revisão (vinda do Scan Manual)
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    if (companyInfo?.logo) {
      doc.addImage(companyInfo.logo, 'PNG', margin, 10, 25, 25);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo?.name?.toUpperCase() || "MAESTRIA ENTERPRISE", margin + 30, 22);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNPJ: ${companyInfo?.taxId || 'N/A'} | ${companyInfo?.email || ''}`, margin + 30, 28);
    doc.text(`ENDEREÇO: ${companyInfo?.address || 'N/A'}`, margin + 30, 33);

    doc.setFontSize(10);
    doc.text(`DATA: ${new Date().toLocaleDateString(language)}`, pageWidth - margin, 33, { align: 'right' });

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
      startY: 55,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
    });

    doc.save(`Extrato_${companyInfo?.name.replace(/ /g, '_')}_${Date.now()}.pdf`);
  };

  const exportToExcel = () => {
    const headerInfo = [
      [companyInfo?.name?.toUpperCase() || 'MAESTRIA ENTERPRISE'],
      [`Relatório de Lançamentos - Gerado em ${new Date().toLocaleString(language)}`],
      [`CNPJ: ${companyInfo?.taxId || 'N/A'}`],
      [''],
    ];

    const data = filteredTransactions.map(tx => ({
      'Data': tx.date,
      'Descrição': tx.description.toUpperCase(),
      'Categoria': tx.category.toUpperCase(),
      'Parceiro': (tx.supplier || 'N/A').toUpperCase(),
      'Tipo': tx.type === 'income' ? 'ENTRADA' : 'SAÍDA',
      'Valor': tx.amount,
      'Status': tx.status.toUpperCase()
    }));

    const ws = XLSX.utils.json_to_sheet(data, { origin: 'A5' });
    XLSX.utils.sheet_add_aoa(ws, headerInfo, { origin: 'A1' });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fluxo de Caixa");
    XLSX.writeFile(wb, `Planilha_Financeira_${companyInfo?.name.replace(/ /g, '_')}.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onStartScan) onStartScan(file, scanMode === 'review');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                <button onClick={exportToExcel} className="p-2 text-slate-500 hover:text-emerald-600 transition-colors" title="Excel Timbrado"><FileText className="w-5 h-5"/></button>
                <button onClick={exportToPDF} className="p-2 text-slate-500 hover:text-rose-600 transition-colors" title="PDF Timbrado"><Printer className="w-5 h-5"/></button>
            </div>
            <button onClick={() => { setScanMode('review'); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest">
              <FilePlus className="w-3.5 h-3.5" /> Scan Manual (Review)
            </button>
            <button onClick={() => { setScanMode('auto'); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black bg-white border-2 border-slate-200 text-slate-900 hover:border-brand transition-all uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand" /> Scan IA Universal
            </button>
            <button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Novo Lançamento
            </button>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm" />
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Data</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Descrição</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Categoria</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Valor</th>
              <th className="px-8 py-4 text-right uppercase text-[9px] font-black tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 font-black text-slate-900 text-[11px]">{new Date(tx.date).toLocaleDateString(language)}</td>
                <td className="px-8 py-5">
                    <p className="font-black text-slate-950 uppercase italic text-[12px] leading-tight">{tx.description}</p>
                    {tx.supplier && <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{tx.supplier}</p>}
                </td>
                <td className="px-8 py-5"><span className="text-[8px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg uppercase">{tx.category}</span></td>
                <td className={`px-8 py-5 font-black text-[15px] tracking-tighter ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                    {tx.type === 'expense' && '- '} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTx(tx); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => onDeleteTransaction(tx.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">
                        {pendingReview ? 'Revisar Lançamento IA' : 'Lançamento Financeiro'}
                      </h3>
                      <button onClick={() => { setIsModalOpen(false); setEditingTx(null); if(onReviewComplete) onReviewComplete(); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Descrição do Movimento</label>
                        <input name="description" defaultValue={editingTx?.description} placeholder="Ex: NFSe 443 - Consultoria" required className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none uppercase text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Valor Total</label>
                            <input name="amount" type="number" step="0.01" defaultValue={editingTx?.amount} required placeholder="0,00" className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Data de Competência</label>
                            <input name="date" type="date" defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]} required className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none text-xs" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Tipo de Fluxo</label>
                            <select name="type" defaultValue={editingTx?.type || 'expense'} className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none text-xs uppercase">
                                <option value="expense">Saída (Despesa)</option>
                                <option value="income">Entrada (Receita)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Categoria</label>
                            <select name="category" defaultValue={editingTx?.category} className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none text-xs uppercase">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Fornecedor / Cliente</label>
                        <input name="supplier" defaultValue={editingTx?.supplier} placeholder="Nome da Entidade" className="w-full bg-slate-50 border p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                      </div>
                      <button type="submit" className="w-full bg-slate-950 text-white font-black py-4 rounded-2xl shadow-xl uppercase text-[10px] tracking-widest hover:bg-brand transition-all">
                        {pendingReview ? 'Efetivar Lançamento Auditado' : 'Confirmar Registro'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionList;
