
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Mail, Phone, MoreVertical, Search, Plus, X, Upload, Trash2, Edit, Save, Share2 } from 'lucide-react';
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
              
              if (data.length === 0) {
                  alert("Arquivo sem dados válidos.");
                  return;
              }

              const newContacts: Contact[] = data.map((item, idx) => {
                  const name = item.Nome || item.Name || item.RazaoSocial || item['Razão Social'] || 'Importado ' + (idx + 1);
                  const email = item.Email || item['E-mail'] || item.Mail || '';
                  const phone = item.Telefone || item.Phone || item.Celular || '';
                  const typeVal = String(item.Tipo || item.Type || 'client').toLowerCase();
                  const type = typeVal.includes('forne') ? 'supplier' : 'client';
                  
                  return {
                      id: `import-${Date.now()}-${idx}`,
                      name,
                      type,
                      email,
                      phone,
                      totalTraded: parseFloat(item.Volume || item.Total || 0) || 0,
                      reliabilityScore: 100
                  };
              });
              
              if (onImportContacts) {
                  onImportContacts(newContacts);
                  alert(`${newContacts.length} parceiros importados!`);
              }
          } catch (error) {
              alert("Erro ao ler Excel. Verifique se as colunas estão corretas.");
          }
      };
      reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-20">
      <div className="p-6 lg:p-10 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Parceiros</h3>
            <div className="flex gap-2 mt-4 bg-slate-50 p-1 rounded-xl w-fit">
                <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg ${typeFilter === 'all' ? 'bg-white text-slate-900' : 'text-slate-400'}`}>TODOS</button>
                <button onClick={() => setTypeFilter('client')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg ${typeFilter === 'client' ? 'bg-white text-emerald-600' : 'text-slate-400'}`}>CLIENTES</button>
                <button onClick={() => setTypeFilter('supplier')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg ${typeFilter === 'supplier' ? 'bg-white text-amber-600' : 'text-slate-400'}`}>FORNECEDORES</button>
            </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <input 
                type="text" 
                placeholder="Buscar..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold flex-1 sm:w-64" 
            />
            <button onClick={() => importInputRef.current?.click()} className="p-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-600"/>
            </button>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />
            <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl transition shadow-xl flex items-center gap-3">
                <Plus className="w-5 h-5"/> <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Novo</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase">Parceiro</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase">E-mail / Tel</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase">Volume</th>
              <th className="px-10 py-5 text-right uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${contact.type === 'supplier' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                            {contact.name.charAt(0)}
                        </div>
                        <p className="font-black text-slate-900">{contact.name}</p>
                    </div>
                </td>
                <td className="px-10 py-6">
                    <p className="text-[10px] font-bold text-slate-500">{contact.email || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-400">{contact.phone || ''}</p>
                </td>
                <td className="px-10 py-6 font-black">{contact.totalTraded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="px-10 py-6 text-right">
                    <button onClick={() => onDeleteContact?.(contact.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-12 border border-white/20">
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Cadastro</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full"><X className="w-7 h-7 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex gap-3 p-2 bg-slate-100 rounded-[1.5rem]">
                          <label className="flex-1">
                              <input type="radio" name="type" value="client" defaultChecked className="hidden peer" />
                              <div className="text-center py-3.5 rounded-2xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-emerald-600 transition-all uppercase tracking-widest">CLIENTE</div>
                          </label>
                          <label className="flex-1">
                              <input type="radio" name="type" value="supplier" className="hidden peer" />
                              <div className="text-center py-3.5 rounded-2xl cursor-pointer font-black text-[10px] peer-checked:bg-white peer-checked:text-amber-600 transition-all uppercase tracking-widest">FORNECEDOR</div>
                          </label>
                      </div>
                      <input name="name" type="text" required className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none text-slate-900 font-bold" placeholder="NOME OU RAZÃO SOCIAL" />
                      <div className="grid grid-cols-2 gap-5">
                          <input name="email" type="email" className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none font-bold" placeholder="E-MAIL" />
                          <input name="phone" type="text" className="w-full border border-slate-200 bg-slate-50 p-5 rounded-2xl outline-none font-bold" placeholder="TELEFONE" />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl mt-6 uppercase text-xs tracking-widest">
                        SALVAR PARCEIRO
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Contacts;
