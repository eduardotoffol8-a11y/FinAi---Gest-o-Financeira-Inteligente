
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Trash2, Edit, Plus, X, Search, Sparkles, Loader2, Mail, Phone, Building2, Upload, FileText, Download, ShieldCheck, MapPin } from 'lucide-react';
import { translations } from '../translations';
import { generateServiceContract } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface ContactsProps {
  contacts: Contact[];
  companyInfo: any;
  onAddContact?: (c: Contact) => void;
  onEditContact?: (c: Contact) => void;
  onDeleteContact?: (id: string) => void;
  onImportContacts?: (list: Contact[]) => void;
  onStartScan?: (file: File) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const Contacts: React.FC<ContactsProps> = ({ contacts, companyInfo, onAddContact, onEditContact, onDeleteContact, onImportContacts, onStartScan, language }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'supplier' | 'both'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractClient, setContractClient] = useState<Contact | null>(null);
  const [serviceDetails, setServiceDetails] = useState('');
  const [generatedContract, setGeneratedContract] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                           c.taxId?.includes(search) ||
                           c.company?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onStartScan) onStartScan(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Contact = {
          id: editingContact?.id || Date.now().toString(),
          name: formData.get('name') as string,
          company: formData.get('company') as string,
          taxId: formData.get('taxId') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          neighborhood: formData.get('neighborhood') as string,
          city: formData.get('city') as string,
          state: formData.get('state') as string,
          zipCode: formData.get('zipCode') as string,
          type: formData.get('type') as any,
          totalTraded: editingContact?.totalTraded || 0,
          source: editingContact?.source || 'manual'
      };
      if (editingContact) onEditContact?.(data);
      else onAddContact?.(data);
      setIsModalOpen(false);
      setEditingContact(null);
  };

  const handleGenerateContract = async () => {
    if (!contractClient || !serviceDetails) return;
    setIsGenerating(true);
    try {
      const contract = await generateServiceContract(companyInfo, contractClient, serviceDetails);
      setGeneratedContract(contract);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadContractPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(generatedContract, 180);
    doc.text(splitText, 15, 15);
    doc.save(`Contrato_${contractClient?.name.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-12">
      <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{t.partners}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Gestão Panorâmica de Stakeholders</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv,.xlsx,.pdf,image/*" />
            
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[9px] font-black bg-white border-2 border-slate-200 text-slate-900 hover:border-indigo-600 transition-all uppercase tracking-widest shadow-sm">
                <Upload className="w-3.5 h-3.5 text-indigo-500" /> Importação Neural (CSV/PDF)
            </button>

            <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand transition-all shadow-lg flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Novo Parceiro
            </button>
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Filtrar por nome, empresa ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm" />
        </div>
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            {['all', 'client', 'supplier', 'both'].map((type) => (
                <button 
                    key={type}
                    onClick={() => setTypeFilter(type as any)}
                    className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {type === 'all' ? 'Todos' : type === 'client' ? 'Clientes' : type === 'supplier' ? 'Fornecedores' : 'Híbridos'}
                </button>
            ))}
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Identificação / Entidade</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest">Contatos / Endereço</th>
              <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-center">Perfil Fiscal</th>
              <th className="px-8 py-4 text-right uppercase text-[9px] font-black tracking-widest">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/80 transition group">
                <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg ${contact.type === 'supplier' ? 'bg-amber-500' : contact.type === 'client' ? 'bg-emerald-500' : 'bg-indigo-600'}`}>{contact.name.charAt(0)}</div>
                        <div>
                            <p className="font-black text-slate-900 uppercase italic text-[12px] leading-tight">{contact.name}</p>
                            {contact.company && <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{contact.company}</p>}
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{contact.taxId || 'Doc: N/A'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-5 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase italic">
                        <Mail className="w-3 h-3 text-brand" /> {contact.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                        <MapPin className="w-3 h-3" /> {contact.address ? `${contact.address}, ${contact.city || ''}` : 'Endereço não informado'}
                    </div>
                </td>
                <td className="px-8 py-5 text-center">
                   <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${contact.type === 'supplier' ? 'bg-amber-50 text-amber-600 border border-amber-100' : contact.type === 'client' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                      {contact.type === 'supplier' ? 'Fornecedor' : contact.type === 'client' ? 'Cliente' : 'Híbrido'}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        {contact.type !== 'supplier' && (
                          <button onClick={() => { setContractClient(contact); setIsContractModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-100 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> Contrato IA
                          </button>
                        )}
                        <button onClick={() => { setEditingContact(contact); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand transition-all"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => onDeleteContact?.(contact.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4"/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Contrato */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/70 backdrop-blur-lg p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl p-10 border border-white/20 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Gerador de Minuta Contratual</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Soberania Jurídica by MaestrIA</p>
                    </div>
                    <button onClick={() => { setIsContractModalOpen(false); setGeneratedContract(''); setServiceDetails(''); }} className="p-2.5 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5 text-slate-400"/></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-8 px-2 custom-scrollbar">
                    {!generatedContract ? (
                      <div className="space-y-6">
                          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Qualificação das Partes</h4>
                              <div className="grid grid-cols-2 gap-6">
                                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Contratada</p>
                                      <p className="font-bold text-sm text-slate-900">{companyInfo.name}</p>
                                      <p className="text-[10px] text-slate-400">{companyInfo.address || 'Sem endereço configurado'}</p>
                                  </div>
                                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Contratante</p>
                                      <p className="font-bold text-sm text-slate-900">{contractClient?.name}</p>
                                      <p className="text-[10px] text-slate-400">{contractClient?.address || 'Sem endereço configurado'}</p>
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escopo, Valor e Prazo</label>
                              <textarea 
                                value={serviceDetails} 
                                onChange={(e) => setServiceDetails(e.target.value)}
                                placeholder="Descreva os serviços detalhadamente, os valores acertados, datas de entrega e qualquer condição especial..."
                                className="w-full h-48 bg-slate-50 border border-slate-200 p-6 rounded-2xl font-medium outline-none text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                              />
                          </div>
                          <button 
                            onClick={handleGenerateContract}
                            disabled={isGenerating || !serviceDetails}
                            className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest hover:bg-brand transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin"/> Elaborando Minuta Jurídica...</> : <><Sparkles className="w-5 h-5 text-indigo-400"/> Gerar Contrato Profissional</>}
                          </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                          <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl font-medium text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                              {generatedContract}
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => setGeneratedContract('')} className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Refinar Dados</button>
                              <button onClick={downloadContractPDF} className="flex-1 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand transition-all flex items-center justify-center gap-2">
                                  <Download className="w-4 h-4" /> Baixar PDF Contratual
                              </button>
                          </div>
                          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-indigo-600" />
                              <p className="text-[9px] font-black text-indigo-900 uppercase">Minuta gerada com conformidade jurídica sugerida pela IA. Revise cuidadosamente antes de assinar.</p>
                          </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Modal de Parceiro */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 border border-white/20 animate-in zoom-in-95 max-h-[95vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Perfil de Parceiro</h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5 text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                                <input name="name" defaultValue={editingContact?.name} required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Razão Social / Empresa</label>
                                <input name="company" defaultValue={editingContact?.company} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CPF / CNPJ</label>
                                <input name="taxId" defaultValue={editingContact?.taxId} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">E-mail de Contato</label>
                                <input name="email" type="email" defaultValue={editingContact?.email} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Telefone Principal</label>
                                <input name="phone" defaultValue={editingContact?.phone} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs focus:ring-4 focus:ring-brand/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Classificação Comercial</label>
                                <select name="type" defaultValue={editingContact?.type || 'client'} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase">
                                    <option value="client">Cliente</option>
                                    <option value="supplier">Fornecedor</option>
                                    <option value="both">Híbrido (Ambos)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço de Correspondência</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Endereço / Nº / Complemento</label>
                                    <input name="address" defaultValue={editingContact?.address} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CEP</label>
                                    <input name="zipCode" defaultValue={editingContact?.zipCode} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bairro</label>
                                    <input name="neighborhood" defaultValue={editingContact?.neighborhood} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Cidade</label>
                                    <input name="city" defaultValue={editingContact?.city} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Estado (UF)</label>
                                    <input name="state" defaultValue={editingContact?.state} maxLength={2} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none text-xs uppercase" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-[10px] tracking-widest hover:bg-brand transition-all">Salvar Dados do Parceiro</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Contacts;
