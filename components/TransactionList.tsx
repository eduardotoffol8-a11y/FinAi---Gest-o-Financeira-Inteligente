
import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types';
import { Search, MoreHorizontal, Download, Trash2, Edit, X, Save, Upload, FileSpreadsheet, File, Share2, FilePlus, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { analyzeReceipt } from '../services/geminiService';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (list: Transaction[]) => void;
  onShareToChat?: (item: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditTransaction, onDeleteTransaction, onImportTransactions, onShareToChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItem, setReviewItem] = useState<Omit<Transaction, 'id'> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingestInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(tx => 
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          tx.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm]);

  const handleExportCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Valor", "Tipo", "Status", "Entidade"];
    const rows = filteredTransactions.map(tx => [
      tx.date,
      tx.description,
      tx.category,
      tx.amount.toString(),
      tx.type === 'income' ? 'Receita' : 'Despesa',
      tx.status,
      tx.supplier || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finai_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions.map(tx => ({
        Data: tx.date,
        Descrição: tx.description,
        Categoria: tx.category,
        Valor: tx.amount,
        Tipo: tx.type === 'income' ? 'Receita' : 'Despesa',
        Status: tx.status,
        Entidade: tx.supplier || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");
    XLSX.writeFile(wb, "finai_relatorio.xlsx");
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Lançamentos - FinAI", 14, 15);
    
    autoTable(doc, {
      head: [['Data', 'Descrição', 'Valor', 'Tipo', 'Entidade']],
      body: filteredTransactions.map(tx => [
        tx.date, 
        tx.description, 
        tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        tx.type === 'income' ? 'Receita' : 'Despesa',
        tx.supplier || '-'
      ]),
      startY: 20,
    });
    
    doc.save("finai_relatorio.pdf");
    setIsExportMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws) as any[];
          
          const newTxs: Transaction[] = data.map((item, idx) => ({
              id: `import-${Date.now()}-${idx}`,
              date: item.Data || new Date().toISOString().split('T')[0],
              description: item.Descrição || item.Description || 'Importado',
              category: item.Categoria || 'Geral',
              amount: parseFloat(item.Valor || item.Amount || 0),
              type: (item.Tipo || item.Type || 'Despesa').toLowerCase().includes('recei') ? 'income' : 'expense',
              status: 'paid',
              supplier: item.Fornecedor || item.Supplier || item.Entidade || ''
          }));
          
          onImportTransactions(newTxs);
          alert(`${newTxs.length} registros importados.`);
      };
      reader.readAsBinaryString(file);
  };

  const handleIngestFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = (evt.target?.result as string).split(',')[1];
      const json = await analyzeReceipt(base64, file.type);
      try {
        const data = JSON.parse(json);
        setReviewItem({
          amount: data.amount || 0,
          category: data.category || 'Geral',
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.description || file.name,
          status: 'pending',
          type: data.type || 'expense',
          supplier: data.supplier || ''
        });
      } catch (err) {
        alert("Erro ao processar o arquivo. Tente novamente.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmReview = () => {
    if (reviewItem) {
      onImportTransactions([{ ...reviewItem, id: Date.now().toString() }]);
      setReviewItem(null);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full animate-in fade-in overflow-hidden">
      <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Fluxo de Caixa</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Lançamentos e Conciliações</p>
            </div>
            <button 
              onClick={() => ingestInputRef.current?.click()}
              className="ml-4 bg-indigo-50 text-indigo-600 px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition shadow-sm"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <FilePlus className="w-4 h-4" />}
              ADICIONAR ARQUIVO (NF/BOLETO)
            </button>
            <input type="file" ref={ingestInputRef} className="hidden" onChange={handleIngestFile} />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                />
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm group">
                <Upload className="w-5 h-5 text-slate-600 group-hover:scale-110" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />

            <div className="relative">
                <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl flex items-center gap-3">
                    <Download className="w-5 h-5"/> <span className="text-xs font-black uppercase tracking-widest">EXPORTAR</span>
                </button>
                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl z-[160] p-2 space-y-1">
                        <button onClick={handleExportExcel} className="w-full flex items-center gap-3 p-4 hover:bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black transition-colors"><FileSpreadsheet className="w-5 h-5"/> EXCEL (.xlsx)</button>
                        <button onClick={handleExportCSV} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-black transition-colors"><FileSpreadsheet className="w-5 h-5"/> CSV (Semicolon)</button>
                        <button onClick={handleExportPDF} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 text-rose-700 rounded-2xl text-xs font-black transition-colors"><File className="w-5 h-5"/> PDF</button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Data</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Descrição</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Valor</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-10 py-5 text-xs text-slate-500 font-bold">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-10 py-5">
                    <p className="font-black text-slate-900 leading-none">{tx.description}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">{tx.category} • {tx.supplier || 'Geral'}</span>
                </td>
                <td className={`px-10 py-5 font-black text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-10 py-5 text-right relative">
                    <button onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all">
                        <MoreHorizontal className="w-5 h-5"/>
                    </button>
                    {openMenuId === tx.id && (
                        <div className="absolute right-12 top-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in slide-in-from-right-2">
                            <button onClick={() => { onShareToChat?.(tx); setOpenMenuId(null); }} className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest"><Share2 className="w-4 h-4"/> Enviar no Chat</button>
                            <button onClick={() => { setEditingTx(tx); setOpenMenuId(null); }} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest"><Edit className="w-4 h-4"/> Editar</button>
                            <button onClick={() => { onDeleteTransaction(tx.id); setOpenMenuId(null); }} className="w-full flex items-center gap-3 p-3 hover:bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest"><Trash2 className="w-4 h-4"/> Excluir</button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Revisão de Ingestão */}
      {reviewItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 border border-white/20 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Revisar Informações Lidas</h3>
                  <button onClick={() => setReviewItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
              </div>
              <div className="space-y-5">
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Descrição Lida</label>
                      <input type="text" value={reviewItem.description} onChange={e => setReviewItem({...reviewItem, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Valor Detectado</label>
                          <input type="number" value={reviewItem.amount} onChange={e => setReviewItem({...reviewItem, amount: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none" />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Data</label>
                          <input type="date" value={reviewItem.date} onChange={e => setReviewItem({...reviewItem, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none" />
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Fornecedor / Entidade</label>
                      <input type="text" value={reviewItem.supplier} onChange={e => setReviewItem({...reviewItem, supplier: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none" />
                  </div>
                  <button onClick={confirmReview} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl mt-4 shadow-xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
                    <Check className="w-5 h-5"/> Confirmar Lançamento
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Edição Manual */}
      {editingTx && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 border border-white/20">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Editar Lançamento</h3>
                      <button onClick={() => setEditingTx(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Descrição</label>
                          <input 
                            type="text" 
                            value={editingTx.description} 
                            onChange={e => setEditingTx({...editingTx, description: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Valor</label>
                            <input 
                                type="number" 
                                value={editingTx.amount} 
                                onChange={e => setEditingTx({...editingTx, amount: parseFloat(e.target.value)})} 
                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Status</label>
                            <select value={editingTx.status} onChange={e => setEditingTx({...editingTx, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none">
                                <option value="paid">REALIZADO</option>
                                <option value="pending">PENDENTE</option>
                            </select>
                          </div>
                      </div>
                      <button onClick={() => { onEditTransaction(editingTx); setEditingTx(null); }} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-4 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">Salvar Alterações</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionList;
