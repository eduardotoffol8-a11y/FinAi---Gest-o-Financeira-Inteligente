
import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types';
import { Search, MoreHorizontal, Download, Trash2, Edit, X, Save, Upload, FileSpreadsheet, File, Share2, FilePlus, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { analyzeReceipt } from '../services/geminiService';
import { translations } from '../translations';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (list: Transaction[]) => void;
  onShareToChat?: (item: Transaction) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditTransaction, onDeleteTransaction, onImportTransactions, onShareToChat, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItem, setReviewItem] = useState<Omit<Transaction, 'id'> | null>(null);
  
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingestInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = useMemo(() => {
      return transactions.filter(tx => 
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          tx.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm]);

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
              date: item.Data || item.date || new Date().toISOString().split('T')[0],
              description: item.Descrição || item.description || 'Importado',
              category: item.Categoria || item.category || 'Geral',
              amount: parseFloat(String(item.Valor || item.amount || 0).replace('R$', '').replace(',', '.')),
              type: (item.Tipo || item.type || 'Despesa').toLowerCase().includes('recei') ? 'income' : 'expense',
              status: 'paid',
              supplier: item.supplier || ''
          }));
          
          onImportTransactions(newTxs);
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
      } finally { setIsProcessing(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full animate-in fade-in overflow-hidden">
      <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t.transactions}</h3>
          <button 
              onClick={() => ingestInputRef.current?.click()}
              className="mt-3 bg-slate-950 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition shadow-sm"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <FilePlus className="w-4 h-4" />}
              MAESTRIA VISION (NF/BOLETO)
            </button>
            <input type="file" ref={ingestInputRef} className="hidden" onChange={handleIngestFile} />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  type="text" 
                  placeholder={t.search} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold outline-none" 
                />
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm group">
                <Upload className="w-5 h-5 text-slate-600 group-hover:scale-110" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />

            <div className="relative">
                <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 shadow-xl flex items-center gap-3">
                    <Download className="w-5 h-5"/> <span className="text-xs font-black uppercase tracking-widest">{t.export}</span>
                </button>
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
                <td className="px-10 py-5 text-xs text-slate-500 font-bold">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-10 py-5">
                    <p className="font-black text-slate-900 leading-none">{tx.description}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">{tx.category}</span>
                </td>
                <td className={`px-10 py-5 font-black text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-10 py-5 text-right">
                    <button onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all">
                        <MoreHorizontal className="w-5 h-5"/>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
