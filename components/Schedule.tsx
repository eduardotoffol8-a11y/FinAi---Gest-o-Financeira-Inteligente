
import React, { useState, useEffect } from 'react';
import { ScheduledItem, Transaction } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock, Plus, X, Save, ExternalLink, RefreshCw, Smartphone, Trash2, Check, Mail, Globe, Edit2, Loader2, Database } from 'lucide-react';
import { translations } from '../translations';

interface ScheduleProps {
  items: ScheduledItem[];
  setItems: React.Dispatch<React.SetStateAction<ScheduledItem[]>>;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Schedule: React.FC<ScheduleProps> = ({ items, setItems, onAddTransaction, language }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduledItem | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [search, setSearch] = useState(() => localStorage.getItem('maestria_agenda_search') || '');
  
  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('maestria_agenda_search', search);
  }, [search]);

  const handleSync = (platform: string) => {
      setIsSyncing(platform);
      setTimeout(() => {
          const mockItems: ScheduledItem[] = [
            { id: `ext-${Date.now()}-1`, description: `[${platform}] Pagamento Servidor Cloud AWS`, amount: 1540.00, dueDate: new Date().toISOString().split('T')[0], type: 'expense', status: 'pending', recurrence: 'monthly', autoPay: false },
            { id: `ext-${Date.now()}-2`, description: `[${platform}] Receivable - Project Alpha`, amount: 12500.00, dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], type: 'income', status: 'pending', recurrence: 'one-time', autoPay: false }
          ];
          setItems(prev => [...mockItems, ...prev]);
          setIsSyncing(null);
      }, 2500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
          description: formData.get('desc') as string,
          amount: parseFloat(formData.get('amount') as string),
          dueDate: formData.get('date') as string,
          type: (formData.get('type') as any) || 'expense',
          status: 'pending' as const,
          recurrence: 'one-time' as const,
          autoPay: false
      };
      if (editingItem) {
          setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
          setEditingItem(null);
      } else {
          setItems(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
      }
      setIsModalOpen(false);
  };

  const filteredItems = items.filter(i => i.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12 animate-in fade-in pb-40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{t.agenda}</h2>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mt-1">Integração Global em Tempo Real</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Database className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar agenda..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none shadow-sm"
                    />
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 text-white px-8 py-4 rounded-2xl transition shadow-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 active:scale-95">
                    <Plus className="w-5 h-5"/> <span className="text-[10px] font-black uppercase tracking-widest">Agendar</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <button onClick={() => handleSync('Google')} disabled={!!isSyncing} className="flex items-center gap-8 p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all text-left group disabled:opacity-50">
                <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    {isSyncing === 'Google' ? <Loader2 className="w-8 h-8 animate-spin"/> : <Globe className="w-8 h-8" />}
                </div>
                <div>
                    <h4 className="font-black text-slate-950 uppercase text-sm italic tracking-tighter">Google Calendar Protocol</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{isSyncing === 'Google' ? 'Handshake de segurança...' : 'Importar compromissos do ecossistema Google'}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-200 ml-auto group-hover:text-blue-500 transition-colors" />
            </button>
            <button onClick={() => handleSync('Outlook')} disabled={!!isSyncing} className="flex items-center gap-8 p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all text-left group disabled:opacity-50">
                <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    {isSyncing === 'Outlook' ? <Loader2 className="w-8 h-8 animate-spin"/> : <Mail className="w-8 h-8" />}
                </div>
                <div>
                    <h4 className="font-black text-slate-950 uppercase text-sm italic tracking-tighter">Outlook Enterprise Sync</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{isSyncing === 'Outlook' ? 'Validando token corporativo...' : 'Conectar com Microsoft Office 365'}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-200 ml-auto group-hover:text-indigo-500 transition-colors" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
                <div key={item.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${item.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.status === 'paid' ? 'Sincronizado' : 'Pendente'}
                        </span>
                        <div className="flex gap-2">
                             <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit2 className="w-5 h-5"/></button>
                             <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    </div>
                    
                    <h3 className="font-black text-slate-950 text-2xl leading-tight mb-4 uppercase italic tracking-tighter truncate relative z-10">{item.description}</h3>
                    <p className={`text-4xl font-black mb-8 tracking-tighter relative z-10 ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-8 uppercase tracking-widest relative z-10">
                        <CalendarIcon className="w-5 h-5 text-indigo-500"/> {new Date(item.dueDate).toLocaleDateString(language)}
                    </div>

                    {item.status !== 'paid' && (
                        <button 
                            onClick={() => {
                              onAddTransaction({ amount: item.amount, category: 'Agendado', date: new Date().toISOString().split('T')[0], description: `[LIQ] ${item.description}`, status: 'paid', type: item.type });
                              setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'paid' } : i));
                            }} 
                            className="w-full bg-slate-950 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg active:scale-95"
                        >
                            <Check className="w-5 h-5"/> Efetivar no Caixa
                        </button>
                    )}
                </div>
            ))}
        </div>
        
        {isModalOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md p-12 border border-white/20 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter">{editingItem ? 'Edit Protocol' : 'New Schedule'}</h3>
                        <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                            <label className="flex-1">
                                <input type="radio" name="type" value="expense" defaultChecked={editingItem?.type !== 'income'} className="hidden peer" />
                                <div className="text-center py-4 rounded-xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-rose-600 shadow-sm transition-all uppercase tracking-widest">Saída</div>
                            </label>
                            <label className="flex-1">
                                <input type="radio" name="type" value="income" defaultChecked={editingItem?.type === 'income'} className="hidden peer" />
                                <div className="text-center py-4 rounded-xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-emerald-600 shadow-sm transition-all uppercase tracking-widest">Entrada</div>
                            </label>
                        </div>
                        <div className="space-y-4">
                            <input name="desc" defaultValue={editingItem?.description} required placeholder="Título do Compromisso" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-950 font-black outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm uppercase" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="amount" type="number" step="0.01" defaultValue={editingItem?.amount} required placeholder="Valor R$" className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-950 font-black outline-none text-sm" />
                                <input name="date" type="date" defaultValue={editingItem?.dueDate} required className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-950 font-black outline-none text-sm" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-6 rounded-3xl shadow-2xl transition-all uppercase text-xs tracking-widest hover:bg-indigo-600 active:scale-95 shadow-indigo-500/20">
                            {editingItem ? 'Confirmar Alterações' : 'Salvar no Sistema'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Schedule;
