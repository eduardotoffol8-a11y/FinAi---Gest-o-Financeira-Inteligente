
import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types';
import { Search, MoreHorizontal, Download, Trash2, Edit, X, Save, Upload, FilePlus, Loader2, Plus, Filter, Sparkles, FileText } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';
import { translations } from '../translations';
import * as XLSX from 'xlsx';

interface TransactionListProps {
  transactions: Transaction[];
  categories: string[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (list: Transaction[]) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onEditTransaction, onDeleteTransaction, onImportTransactions, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const t = translations[language];
  const scanInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(tx => 
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          tx.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm]);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1];
        const json = await analyzeDocument(base64, file.type, 'transaction', categories);
        try {
            const data = JSON.parse(json);
            const items = Array.isArray(data) ? data : [data];
            
            const mappedItems: Transaction[] = items.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                date: item.date || new Date().toISOString().split('T')[0],
                description: item.description || 'Processado por MaestrIA',
                category: item.category || (categories[0] || 'Operacional'),
                amount: Math.abs(Number(item.amount)) || 0,
                type: item.amount < 0 || item.type === 'expense' ? 'expense' : 'income',
                status: 'pending',
                source: 'ai',
                supplier: item.supplier || '',
                paymentMethod: item.paymentMethod || '',
                costCenter: item.costCenter || ''
            }));

            onImportTransactions(mappedItems);
            alert(`${mappedItems.length} transações detectadas e adicionadas como pendentes.`);
        } catch(e) { alert("Erro ao processar scan neural."); }
        finally { setIsProcessing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const mapped: Transaction[] = data.map((row: any, idx) => ({
            id: `import-${Date.now()}-${idx}`,
            date: row.Data || row.date || new Date().toISOString().split('T')[0],
            description: row.Descrição || row.description || 'Importação Manual',
            amount: parseFloat(row.Valor || row.amount || 0),
            type: (row.Tipo || row.type || 'expense').toLowerCase() === 'receita' ? 'income' : 'expense',
            category: row.Categoria || row.category || (categories[0] || 'Operacional'),
            supplier: row.Parceiro || row.supplier || '',
            status: 'paid',
            source: 'manual'
        }));
        onImportTransactions(mapped);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Transaction = {
          id: editingTx?.id || Date.now().toString(),
          date: formData.get('date') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          subCategory: formData.get('subCategory') as string,
          amount: parseFloat(formData.get('amount') as string),
          type: formData.get('type') as any,
          status: formData.get('status') as any,
          supplier: formData.get('supplier') as string,
          paymentMethod: formData.get('paymentMethod') as string,
          costCenter: formData.get('costCenter') as string,
          source: editingTx?.source || 'manual'
      };

      if (editingTx && transactions.some(t => t.id === editingTx.id)) {
        onEditTransaction(data);
      } else {
        onImportTransactions([data]);
      }
      
      setIsModalOpen(false);
      setEditingTx(null);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full animate-in fade-in overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t.transactions}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Razão Geral Auditado</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="text" placeholder="Filtrar lançamentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-brand/5 transition-all" />
            </div>
            <button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Novo</button>
            <button onClick={() => scanInputRef.current?.click()} className="bg-white border-2 border-slate-200 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand transition-all flex items-center gap-2">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-brand" />} Scan Extrato IA
            </button>
            <input type="file" ref={scanInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleScan} />
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Protocolo</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Detalhes Operacionais</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Valor</th>
              <th className="px-10 py-5 text-right uppercase text-[10px] font-black tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-10 py-6">
                    <p className="font-black text-slate-900 text-xs">{new Date(tx.date).toLocaleDateString()}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-md ${tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{tx.status}</span>
                </td>
                <td className="px-10 py-6">
                    <p className="font-black text-slate-950 uppercase italic text-sm group-hover:text-brand transition-colors">{tx.description}</p>
                    <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{tx.category}</span>
                    </div>
                </td>
                <td className={`px-10 py-6 font-black text-lg tracking-tighter ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                    {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTx(tx); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand transition-colors"><Edit className="w-5 h-5"/></button>
                        <button onClick={() => onDeleteTransaction(tx.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl p-12 border border-white/20 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter">{editingTx ? 'Conferência de Registro' : 'Novo Lançamento Master'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descrição</label>
                                <input name="description" defaultValue={editingTx?.description} required className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none uppercase text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Valor R$</label>
                                <input name="amount" type="number" step="0.01" defaultValue={editingTx?.amount} required className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-sm focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoria Principal</label>
                                <select name="category" defaultValue={editingTx?.category || categories[0]} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs appearance-none">
                                    {categories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data</label>
                                <input name="date" type="date" defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]} required className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-sm" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-6 rounded-3xl shadow-2xl transition-all uppercase text-xs tracking-widest hover:bg-brand">
                            {editingTx ? 'Confirmar e Efetivar' : 'Salvar no OS MaestrIA'}
                        </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionList;
