
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Mail, Phone, MoreVertical, Search, Plus, X, Upload, Trash2, Edit, Save, Share2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { translations } from '../translations';

interface ContactsProps {
  contacts: Contact[];
  onAddContact?: (c: Contact) => void;
  onEditContact?: (c: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onImportContacts?: (list: Contact[]) => void;
  onShareToChat?: (item: Contact) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onEditContact, onDeleteContact, onImportContacts, onShareToChat, language }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'supplier'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];

  const filteredContacts = contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws) as any[];
          
          const newContacts: Contact[] = data.map((item, idx) => ({
              id: item.ID || `import-${Date.now()}-${idx}`,
              name: item.Nome || item.name || 'Importado',
              type: String(item.Tipo || item.type || 'client').toLowerCase().includes('forne') ? 'supplier' : 'client',
              email: item.Email || item.email || '',
              phone: item.Telefone || item.phone || '',
              totalTraded: 0,
              reliabilityScore: 100
          }));
          onImportContacts?.(newContacts);
      };
      reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-20">
      <div className="p-6 lg:p-10 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t.partners}</h3>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <input type="text" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold flex-1 sm:w-64" />
            <button onClick={() => importInputRef.current?.click()} className="p-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"><Upload className="w-5 h-5"/></button>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />
            <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 text-white px-6 py-3.5 rounded-2xl transition shadow-xl flex items-center gap-3">
                <Plus className="w-5 h-5"/> <span className="text-xs font-black uppercase tracking-widest hidden md:inline">NOVO</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black uppercase">Parceiro</th>
              <th className="px-10 py-5 text-[10px] font-black uppercase">E-mail / Tel</th>
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
                <td className="px-10 py-6 text-xs text-slate-500 font-bold">{contact.email || 'N/A'}</td>
                <td className="px-10 py-6 text-right">
                    <button onClick={() => onDeleteContact?.(contact.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;
