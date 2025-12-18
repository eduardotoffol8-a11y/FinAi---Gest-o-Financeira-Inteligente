
import React, { useState, useRef } from 'react';
import { Contact } from '../types';
import { Trash2, Edit, Plus, X, Search, Sparkles, Loader2, Mail, Phone, Building2, Upload, FileText, Download, ShieldCheck, MapPin, CheckCircle2, Printer, FileDown } from 'lucide-react';
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
      
      const isExisting = contacts.some(o => o.id === data.id);
      if (isExisting) onEditContact?.(data);
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
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    if (companyInfo.logo) {
      doc.addImage(companyInfo.logo, 'PNG', margin, 10, 25, 25);
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.name.toUpperCase(), margin + 30, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const headerDetails = [
      `CNPJ: ${companyInfo.taxId || 'N/A'}`,
      `ENDEREÇO: ${companyInfo.address || ''}, ${companyInfo.city || ''}/${companyInfo.state || ''}`,
      `E-MAIL: ${companyInfo.email || ''} | TEL: ${companyInfo.phone || ''}`
    ];
    headerDetails.forEach((line, i) => doc.text(line, margin + 30, 25 + (i * 4)));
    
    doc.setDrawColor(200);
    doc.line(margin, 40, pageWidth - margin, 40);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const splitText = doc.splitTextToSize(generatedContract, pageWidth - (margin * 2));
    doc.text(splitText, margin, 55);

    doc.save(`Contrato_${contractClient?.name.replace(/ /g, '_')}.pdf`);
  };

  const downloadContractWord = () => {
    const content = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${companyInfo.name}</h2>
            <p>${companyInfo.taxId || ''} | ${companyInfo.email || ''}</p>
          </div>
          <div class="content">${generatedContract}</div>
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrato_${contractClient?.name.replace(/ /g, '_')}.doc`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Impressão de Contrato - ${companyInfo.name}</title>
          <style>
            @media print { body { padding: 40px; } }
            body { font-family: 'Times New Roman', Times, serif; color: #1a202c; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .content { white-space: pre-wrap; text-align: justify; }
            .logo { max-width: 100px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${companyInfo.logo ? `<img src="${companyInfo.logo}" class="logo">` : ''}
            <h2>${companyInfo.name}</h2>
            <p>${companyInfo.taxId || ''} | ${companyInfo.address || ''} | ${companyInfo.email || ''}</p>
          </div>
          <div class="content">${generatedContract}</div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col h-full animate-in fade-in overflow-hidden mb-12">
      <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{t.partners}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Gestão Panorâmica de Stakeholders</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,.csv,.xlsx" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black bg-white border-2 border-slate-200 text-slate-900 hover:border-brand transition-all uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> Scan de Parceiros IA
            </button>
            <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand transition-all shadow-lg flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Novo Parceiro
            </button>
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Filtrar parceiros..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm" />
        </div>
        <div className="flex gap-2">
           {['all', 'client', 'supplier'].map(f => (
             <button key={f} onClick={() => setTypeFilter(f as any)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${typeFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>
               {f === 'all' ? 'Todos' : f === 'client' ? 'Clientes' : 'Fornecedores'}
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
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{contact.taxId || 'Doc: N/A'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-5 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase italic">
                        <Mail className="w-3 h-3 text-brand" /> {contact.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                        <MapPin className="w-3 h-3" /> {contact.address ? `${contact.address}, ${contact.city || ''}` : 'N/A'}
                    </div>
                </td>
                <td className="px-8 py-5 text-center">
                   <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${contact.type === 'supplier' ? 'bg-amber-50 text-amber-600 border border-amber-100' : contact.type === 'client' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                      {contact.type === 'supplier' ? 'Fornecedor' : contact.type === 'client' ? 'Cliente' : 'Híbrido'}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setContractClient(contact); setIsContractModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 transition-colors">
                            <FileText className="w-3.5 h-3.5" /> Minuta IA Master
                        </button>
                        <button onClick={() => { setEditingContact(contact); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-brand transition-all"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => onDeleteContact?.(contact.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4"/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter">Dados do Parceiro</h3>
                      <button onClick={() => { setIsModalOpen(false); setEditingContact(null); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Identificação Principal</label>
                                <input name="name" defaultValue={editingContact?.name} placeholder="Nome Completo / Razão" required className="w-full bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none focus:ring-2 focus:ring-brand/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Documento Fiscal</label>
                                <input name="taxId" defaultValue={editingContact?.taxId} placeholder="CNPJ / CPF" className="w-full bg-slate-50 border p-4 rounded-xl text-xs font-bold outline-none" />
                            </div>
                            <input name="email" type="email" defaultValue={editingContact?.email} placeholder="Email corporativo" className="bg-slate-50 border p-4 rounded-xl text-xs font-bold outline-none" />
                            <input name="phone" defaultValue={editingContact?.phone} placeholder="Telefone / WhatsApp" className="bg-slate-50 border p-4 rounded-xl text-xs font-bold outline-none" />
                            <select name="type" defaultValue={editingContact?.type || 'client'} className="bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none">
                                <option value="client">Cliente</option>
                                <option value="supplier">Fornecedor</option>
                                <option value="both">Híbrido</option>
                            </select>
                            <input name="zipCode" defaultValue={editingContact?.zipCode} placeholder="CEP" className="bg-slate-50 border p-4 rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <input name="address" defaultValue={editingContact?.address} placeholder="Logradouro e Nº" className="md:col-span-2 bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none" />
                            <input name="neighborhood" defaultValue={editingContact?.neighborhood} placeholder="Bairro" className="bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none" />
                            <input name="city" defaultValue={editingContact?.city} placeholder="Cidade" className="md:col-span-2 bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none" />
                            <input name="state" defaultValue={editingContact?.state} placeholder="UF" maxLength={2} className="bg-slate-50 border p-4 rounded-xl text-xs uppercase font-bold outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-slate-950 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-brand transition-all shadow-lg">Confirmar Cadastro Master</button>
                  </form>
              </div>
          </div>
      )}

      {isContractModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
              <div className="bg-[#f0f2f5] rounded-[2rem] shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
                  <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><FileText className="w-6 h-6"/></div>
                        <div>
                          <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">Editor de Minutas Enterprise</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Soberania Jurídica & Timbrado Corporativo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {generatedContract && (
                            <>
                              <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm">
                                  <Printer className="w-4 h-4" /> Imprimir
                              </button>
                              <button onClick={downloadContractWord} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm">
                                  <FileDown className="w-4 h-4" /> Word (.doc)
                              </button>
                              <button onClick={downloadContractPDF} className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg">
                                  <Download className="w-4 h-4" /> PDF Timbrado
                              </button>
                            </>
                          )}
                          <div className="w-px h-8 bg-slate-200 mx-2"></div>
                          <button onClick={() => { setIsContractModalOpen(false); setGeneratedContract(''); setServiceDetails(''); }} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-600 transition-colors"><X className="w-6 h-6"/></button>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-12 bg-slate-100 custom-scrollbar">
                      {!generatedContract ? (
                        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-200 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.2em]">Escopo & Condições Master</label>
                                <textarea 
                                    value={serviceDetails}
                                    onChange={(e) => setServiceDetails(e.target.value)}
                                    placeholder="Descreva o serviço, valores e prazos. A IA cuidará da redação jurídica formal..."
                                    className="w-full bg-slate-50 border border-slate-200 p-8 rounded-2xl font-bold outline-none text-sm min-h-[300px] shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                            <button 
                                onClick={handleGenerateContract}
                                disabled={isGenerating || !serviceDetails}
                                className="w-full bg-slate-950 text-white font-black py-6 rounded-3xl shadow-2xl uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-indigo-400" />}
                                Gerar Minuta Profissional (IA MASTER)
                            </button>
                        </div>
                      ) : (
                        <div className="max-w-[800px] mx-auto bg-white p-16 shadow-2xl border border-slate-200 min-h-[1123px] relative animate-in zoom-in-95 duration-500">
                            <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{companyInfo.name}</h1>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{companyInfo.taxId} | {companyInfo.address} | {companyInfo.email}</p>
                                </div>
                                {companyInfo.logo && <img src={companyInfo.logo} className="h-16 w-auto object-contain opacity-80" />}
                            </div>
                            
                            <textarea
                                value={generatedContract}
                                onChange={(e) => setGeneratedContract(e.target.value)}
                                className="w-full min-h-[800px] font-serif text-lg leading-relaxed text-slate-800 outline-none border-none resize-none bg-transparent selection:bg-indigo-100"
                                spellCheck={false}
                            />

                            <div className="mt-20 flex justify-between gap-12">
                                <div className="flex-1 border-t border-slate-400 pt-4 text-center">
                                    <p className="text-[10px] font-black uppercase">{companyInfo.name}</p>
                                    <p className="text-[9px] text-slate-400 uppercase">Contratada</p>
                                </div>
                                <div className="flex-1 border-t border-slate-400 pt-4 text-center">
                                    <p className="text-[10px] font-black uppercase">{contractClient?.name}</p>
                                    <p className="text-[9px] text-slate-400 uppercase">Contratante</p>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Contacts;
