
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Building2, Mail, Phone, MoreVertical, Search, Star, ArrowUpRight, Plus, X, Upload, Download, Trash2, Edit, Save, Share2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContactsProps {
  contacts: Contact[];
  onAddContact?: (c: Contact) => void;
  onEditContact?: (c: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onImportContacts?: (list: Contact[]) => void;
  onShareToChat?: (item: Contact) => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onEditContact, onDeleteContact, onImportContacts, onShareToChat }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'supplier'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Contact = {
          id: editingContact ? editingContact.id : Date.now().toString(),
          name: formData.get('name') as string,
          type: formData.get('type') as 'client' | 'supplier',
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          totalTraded: editingContact ? editingContact.totalTraded : 0,
          reliabilityScore: 100
      };
      
      if (editingContact) onEditContact?.(data);
      else onAddContact?.(data);
      
      setIsModalOpen(false);
      setEditingContact(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsname = wb.SheetNames[0];
              const ws = wb.Sheets[wsname];
              const data = XLSX.utils.sheet_to_json(ws) as any[];
              
              const newContacts: Contact[] = data.map((item, idx) => ({
                  id: `contact-import-${Date.now()}-${idx}`,
                  name: item.Nome || item.Name || item.RazaoSocial || 'Parceiro Importado',
                  type: (String(item.Tipo || item.Type || 'client')).toLowerCase().includes('forne') ? 'supplier' : 'client',
                  email: item.Email || item.Contato || '',
                  phone: item.Telefone || item.Phone || '',
                  totalTraded: parseFloat(item.Volume || item.Total || 0) || 0,
                  reliabilityScore: 100
              }));
              
              if (onImportContacts) {
                  onImportContacts(newContacts);
                  alert(`${newContacts.length} parceiros importados com sucesso!`);
              }
          } catch (error) {
              alert("Erro ao processar arquivo Excel. Verifique o formato.");
          }
          if (importInputRef.current) importInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-20">
      <div className="p-6 lg:p-10 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Parceiros Estratégicos</h3>
            <div className="flex gap-2 mt-4 bg-slate-50 p-1 rounded-xl w-fit">
                <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>TODOS</button>
                <button onClick={() => setTypeFilter('client')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${typeFilter === 'client' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>CLIENTES</button>
                <button onClick={() => setTypeFilter('supplier')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${typeFilter === 'supplier' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>FORNECEDORES</button>
            </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <input 
                    type="text" 
                    placeholder="Buscar parceiro..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                  />
            </div>
            <button onClick={() => importInputRef.current?.click()} className="p-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm group" title="Importar Lista Excel">
                <Upload className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform"/>
            </button>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />
            <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl transition shadow-xl flex items-center gap-3 active:scale-95">
                <Plus className="w-5 h-5"/> <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Novo Parceiro</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-slate-50/50 backdrop-blur-sm text-slate-400 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Parceiro</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">Contato</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Volume Acumulado</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/80 transition relative group">
                <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-xl ${contact.type === 'supplier' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                            {contact.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 leading-none text-base">{contact.name}</p>
                            <span className="text-[10px] uppercase font-black text-slate-400 mt-1 block tracking-wider">{contact.type}</span>
                        </div>
                    </div>
                </td>
                <td className="px-10 py-6 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase"><Mail className="w-3.5 h-3.5 text-indigo-500"/> {contact.email || '—'}</div>
                        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase"><Phone className="w-3.5 h-3.5 text-indigo-500"/> {contact.phone || '—'}</div>
                    </div>
                </td>
                <td className="px-10 py-6">
                    <p className={`font-black text-lg ${contact.type === 'client' ? 'text-emerald-600' : 'text-slate-900'}`}>{contact.totalTraded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </td>
                <td className="px-10 py-6 text-right relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === contact.id ? null : contact.id)} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm group-hover:text-slate-500">
                        <MoreVertical className="w-5 h-5"/>
                    </button>
                    {activeMenuId === contact.id && (
                        <div className="absolute right-20 top-4 w-48 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 p-2 animate-in slide-in-from-right-4 duration-200">
                            <button onClick={() => { onShareToChat?.(contact); setActiveMenuId(null); }} className="w-full flex items-center gap-3 p-3.5 hover:bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"><Share2 className="w-4 h-4"/> Enviar no Chat</button>
                            <button onClick={() => { setEditingContact(contact); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"><Edit className="w-4 h-4"/> EDITAR</button>
                            <button onClick={() => { onDeleteContact?.(contact.id); setActiveMenuId(null); }} className="w-full flex items-center gap-3 p-3.5 hover:bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"><Trash2 className="w-4 h-4"/> EXCLUIR</button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-12 animate-in zoom-in-95 duration-200 border border-white/20">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{editingContact ? 'Ajustar Cadastro' : 'Novo Parceiro'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X className="w-7 h-7 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex gap-3 p-2 bg-slate-100 rounded-[1.5rem] mb-4">
                          <label className="flex-1">
                              <input type="radio" name="type" value="client" defaultChecked={editingContact?.type === 'client' || !editingContact} className="hidden peer" />
                              <div className="text-center py-3.5 rounded-2xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-xl transition-all tracking-widest uppercase">CLIENTE</div>
                          </label>
                          <label className="flex-1">
                              <input type="radio" name="type" value="supplier" defaultChecked={editingContact?.type === 'supplier'} className="hidden peer" />
                              <div className="text-center py-3.5 rounded-2xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-amber-600 peer-checked:shadow-xl transition-all tracking-widest uppercase">FORNECEDOR</div>
                          </label>
                      </div>
                      <div className="space-y-5">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Razão Social</label>
                           <input name="name" type="text" defaultValue={editingContact?.name} required className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold text-lg" placeholder="NOME DA EMPRESA" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">E-mail</label>
                              <input name="email" type="email" defaultValue={editingContact?.email} className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold" placeholder="CONTATO@CORP.COM" />
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Telefone</label>
                              <input name="phone" type="text" defaultValue={editingContact?.phone} className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold" placeholder="+55 (00) 00000-0000" />
                           </div>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-3xl shadow-2xl shadow-slate-300 mt-6 transition-all flex items-center justify-center gap-3 active:scale-95 text-xs tracking-widest uppercase">
                        <Save className="w-5 h-5"/> {editingContact ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PARCEIRO'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Contacts;
