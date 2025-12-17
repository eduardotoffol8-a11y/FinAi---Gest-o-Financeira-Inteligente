
import React, { useState } from 'react';
import { ScheduledItem, Transaction } from '../types';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock, Plus, X, Save, ExternalLink, RefreshCw, Smartphone, Trash2, Check } from 'lucide-react';

interface ScheduleProps {
  items: ScheduledItem[];
  setItems: React.Dispatch<React.SetStateAction<ScheduledItem[]>>;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ items, setItems, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          alert("Sincronizado com nuvem corporativa.");
      }, 1500);
  };

  const handleAddLocal = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newItem: ScheduledItem = {
          id: Date.now().toString(),
          description: formData.get('desc') as string,
          amount: parseFloat(formData.get('amount') as string),
          dueDate: formData.get('date') as string,
          type: (formData.get('type') as any) || 'expense',
          status: 'pending',
          recurrence: 'one-time',
          autoPay: false
      };
      setItems(prev => [newItem, ...prev]);
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja remover este agendamento?")) {
        setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSettle = (item: ScheduledItem) => {
    if (confirm(`Dar baixa em ${item.description}? Isso gerará um lançamento efetivo.`)) {
        onAddTransaction({
            amount: item.amount,
            category: item.category || 'Agendado',
            date: new Date().toISOString().split('T')[0],
            description: `[LIQUIDADO] ${item.description}`,
            status: 'paid',
            type: item.type,
            source: 'manual'
        });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'paid' } : i));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">Previsão de Caixa</h2>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Agenda de Obrigações e Recebíveis</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleSync} disabled={isSyncing} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black border transition shadow-sm uppercase tracking-widest ${isSyncing ? 'bg-slate-50 text-slate-400' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}>
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}/> {isSyncing ? 'Sincronizando...' : 'Cloud Sync'}
                </button>
                <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl transition shadow-xl flex items-center justify-center gap-2 active:scale-95">
                    <Plus className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">NOVO AGENDAMENTO</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compromisso</span>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight truncate max-w-[180px]">{item.description}</h3>
                        </div>
                        <div className={`p-2.5 rounded-2xl shadow-inner ${item.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.status === 'paid' ? <CheckCircle2 className="w-6 h-6"/> : <Clock className="w-6 h-6"/>}
                        </div>
                    </div>
                    <p className={`text-3xl font-black mb-6 tracking-tight ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 uppercase tracking-widest">
                        <CalendarIcon className="w-4 h-4"/> Vence em: {new Date(item.dueDate).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                        {item.status !== 'paid' && (
                            <button 
                                onClick={() => handleSettle(item)} 
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4"/> Baixar
                            </button>
                        )}
                        <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum agendamento pendente</p>
                </div>
            )}
        </div>
        
        {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200 border border-white/20">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Novo Compromisso</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
                    </div>
                    <form onSubmit={handleAddLocal} className="space-y-5">
                        <div className="flex gap-3 p-1.5 bg-slate-100 rounded-2xl">
                            <label className="flex-1">
                                <input type="radio" name="type" value="expense" defaultChecked className="hidden peer" />
                                <div className="text-center py-2.5 rounded-xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm transition-all tracking-widest uppercase">Pagamento</div>
                            </label>
                            <label className="flex-1">
                                <input type="radio" name="type" value="income" className="hidden peer" />
                                <div className="text-center py-2.5 rounded-xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm transition-all tracking-widest uppercase">Recebível</div>
                            </label>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Título</label>
                                <input name="desc" type="text" required placeholder="Ex: AWS Cloud Hosting" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Valor R$</label>
                                    <input name="amount" type="number" required placeholder="0,00" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Vencimento</label>
                                    <input name="date" type="date" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 mt-4 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                            <Save className="w-5 h-5"/> AGENDAR E SINCRONIZAR
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Schedule;
