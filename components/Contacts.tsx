
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Trash2, Edit, Plus, X, Search, User, CreditCard, MapPin, Hash, Sparkles, Loader2, Mail, Phone, Briefcase, FileText } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';
import { translations } from '../translations';
import * as XLSX from 'xlsx';

interface ContactsProps {
  contacts: Contact[];
  onAddContact?: (c: Contact) => void;
  onEditContact?: (c: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onImportContacts?: (list: Contact[]) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onEditContact, onDeleteContact, onImportContacts, language }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const t = translations[language];
  const scanInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.taxId?.includes(search)
  );

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1];
        const json = await analyzeDocument(base64, file.type, 'contact');
        try {
            const data = JSON.parse(json);
            const newContact: Contact = {
                id: Date.now().toString(),
                name: data.name || 'Parceiro Scan IA',
                taxId: data.taxId || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                paymentTerms: data.paymentTerms || '',
                type: data.type || 'client',
                totalTraded: 0,
                reliabilityScore: 100,
                source: 'ai'
            };
            onImportContacts?.([newContact]);
            setEditingContact(newContact);
            setIsModalOpen(true);
        } catch(e) { alert("Erro ao processar documento de parceiro."); }
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
        
        const mapped: Contact[] = data.map((row: any, idx) => ({
            id: `import-c-${Date.now()}-${idx}`,
            name: row.Nome || row.name || 'Parceiro Importado',
            taxId: row.CNPJ || row.taxId || '',
            email: row.Email || row.email || '',
            phone: row.Telefone || row.phone || '',
            address: row.Endereço || row.address || '',
            type: (row.Tipo || row.type || 'Cliente').toLowerCase() === 'fornecedor' ? 'supplier' : 'client',
            totalTraded: 0,
            reliabilityScore: 100,
            source: 'manual'
        }));
        onImportContacts?.(mapped);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Contact = {
          id: editingContact?.id || Date.now().toString(),
          name: formData.get('name') as string,
          taxId: formData.get('taxId') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          paymentTerms: formData.get('paymentTerms') as string,
          type: formData.get('type') as any,
          totalTraded: editingContact?.totalTraded || 0,
          reliabilityScore: editingContact?.reliabilityScore || 100,
          source: editingContact?.source || 'manual'
      };

      if (editingContact) onEditContact?.(data);
      else onAddContact?.(data);
      
      setIsModalOpen(false);
      setEditingContact(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-20">
      <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t.partners}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronia com Stakeholders</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Pesquisar por nome ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-brand/5 transition-all" />
            </div>
            <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" /> Novo
            </button>
            <button onClick={() => bulkInputRef.current?.click()} className="bg-white border-2 border-slate-200 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Importar Lista
            </button>
            <button onClick={() => scanInputRef.current?.click()} className="bg-white border-2 border-slate-200 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand transition-all flex items-center gap-2">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-brand" />} Scan IA
            </button>
            <input type="file" ref={scanInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleScan} />
            <input type="file" ref={bulkInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleBulkImport} />
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Parceiro</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Contato & Condições</th>
              <th className="px-10 py-5 text-right uppercase text-[10px] font-black tracking-widest">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/80 transition group">
                <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white italic shadow-lg ${contact.type === 'supplier' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                            {contact.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 uppercase italic text-sm group-hover:text-brand transition-colors">{contact.name}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {contact.taxId || 'N/A'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-10 py-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate max-w-[200px]"><Mail className="w-3.5 h-3.5" /> {contact.email || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><CreditCard className="w-3.5 h-3.5" /> Termos: {contact.paymentTerms || 'Padrão'}</div>
                    </div>
                </td>
                <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingContact(contact); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand transition-colors"><Edit className="w-5 h-5"/></button>
                        <button onClick={() => onDeleteContact?.(contact.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5"/></button>
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
                      <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter">{editingContact ? 'Edição de Parceiro' : 'Conferência de Cadastro'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Razão Social / Nome</label>
                                <input name="name" defaultValue={editingContact?.name} required className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none uppercase text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CPF / CNPJ / ID Fiscal</label>
                                <input name="taxId" defaultValue={editingContact?.taxId} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-sm focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail Corporativo</label>
                                <input name="email" type="email" defaultValue={editingContact?.email} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Parceiro</label>
                                <select name="type" defaultValue={editingContact?.type || 'client'} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs uppercase appearance-none">
                                    <option value="client">Cliente</option>
                                    <option value="supplier">Fornecedor</option>
                                    <option value="both">Híbrido (Ambos)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Localização Física / Digital</label>
                                <input name="address" defaultValue={editingContact?.address} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs uppercase" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Condições de Pagamento / Observações IA</label>
                                <input name="paymentTerms" defaultValue={editingContact?.paymentTerms} placeholder="Ex: 30 DDL, Cartão, Projeto Único" className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs uppercase" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-6 rounded-3xl shadow-2xl transition-all uppercase text-xs tracking-widest hover:bg-brand">
                            {editingContact ? 'Confirmar Atualização' : 'Efetivar Cadastro Master'}
                        </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Contacts;
