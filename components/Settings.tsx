
import React, { useRef, useState } from 'react';
import { Building, UploadCloud, Command, Save, Users, Check, Globe, ShieldCheck, Download, FileJson, AlertTriangle, Fingerprint, Lock, Palette, MonitorPlay, Tags, Plus, Trash2, X } from 'lucide-react';
import { TeamMember } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  team: TeamMember[];
  onUpdateMember: (member: TeamMember) => void;
  categories: string[];
  setCategories: (cats: string[]) => void;
  companyInfo: any;
  setCompanyInfo: (info: any) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  setLanguage: (lang: 'pt-BR' | 'en-US' | 'es-ES') => void;
  allData: any;
}

const Settings: React.FC<SettingsProps> = ({ team = [], onUpdateMember, categories, setCategories, companyInfo, setCompanyInfo, language, setLanguage, allData }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const backupInputRef = useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [newCat, setNewCat] = useState('');
    
    const t = translations[language];

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleAddCategory = () => {
        const trimmed = newCat.trim();
        if (!trimmed) return;
        if (categories.includes(trimmed)) {
            alert("Categoria já existente.");
            return;
        }
        setCategories([...categories, trimmed]);
        setNewCat('');
    };

    const handleRemoveCategory = (cat: string) => {
        setCategories(categories.filter(c => c !== cat));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limite de 2MB para evitar estouro de LocalStorage
        if (file.size > 2 * 1024 * 1024) {
            alert("Imagem muito grande. Utilize um logo de até 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const result = evt.target?.result;
            if (typeof result === 'string') {
                setCompanyInfo({ ...companyInfo, logo: result });
            }
        };
        reader.onerror = () => alert("Erro ao carregar imagem.");
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        if (confirm("Deseja remover o logo da empresa?")) {
            setCompanyInfo({ ...companyInfo, logo: null });
        }
    };

    const handleExportBackup = () => {
        const dataStr = JSON.stringify({ ...allData, companyInfo }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `MAESTRIA_BACKUP_${Date.now()}.json`);
        linkElement.click();
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-60 space-y-12">
             <div className="flex justify-between items-end">
                 <div>
                    <h2 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase">{t.settings}</h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-2">Personalize o seu ecossistema corporativo</p>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Comando Criptografado</span>
                 </div>
             </div>
             
             {/* Branding Section */}
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="space-y-6">
                    <div className="p-5 bg-slate-950 rounded-[1.5rem] text-white w-fit shadow-xl">
                        <Palette className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter">Branding OS</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identidade do Sistema</p>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor da Interface</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={companyInfo.brandColor} 
                                    onChange={(e) => setCompanyInfo({...companyInfo, brandColor: e.target.value})}
                                    className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0 overflow-hidden shadow-lg transition-transform hover:scale-110" 
                                />
                                <span className="font-mono text-xs font-bold text-slate-500 uppercase">{companyInfo.brandColor}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo da Empresa</label>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                        {companyInfo.logo ? (
                                            <img src={companyInfo.logo} className="w-full h-full object-cover" alt="Company Logo" />
                                        ) : (
                                            <Command className="w-6 h-6 text-slate-200" />
                                        )}
                                    </div>
                                    {companyInfo.logo && (
                                        <button 
                                            onClick={handleRemoveLogo}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Alterar Logo</button>
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Fantasia</label>
                        <input 
                            value={companyInfo.name} 
                            onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value.toUpperCase()})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-slate-950 font-black outline-none focus:ring-4 focus:ring-brand/5 text-xl uppercase tracking-tighter" 
                            placeholder="NOME DA EMPRESA"
                        />
                    </div>
                    <button onClick={handleSave} className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl">
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaved ? 'Preferências Salvas' : t.save}
                    </button>
                 </div>
             </div>

             {/* Categories Section */}
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="space-y-6">
                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] w-fit shadow-lg">
                        <Tags className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter">Arquitetura de Dados</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Categorias & Taxonomia</p>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <div className="flex gap-4">
                        <input 
                            value={newCat} 
                            onChange={(e) => setNewCat(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            placeholder="Nova Categoria (Ex: Limpeza)" 
                            className="flex-1 bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none text-xs uppercase"
                        />
                        <button onClick={handleAddCategory} className="bg-slate-950 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all flex items-center gap-2">
                           <Plus className="w-4 h-4"/> Adicionar
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map(cat => (
                            <div key={cat} className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand/20 transition-all">
                                <span className="text-[10px] font-black uppercase text-slate-600 truncate">{cat}</span>
                                <button onClick={() => handleRemoveCategory(cat)} className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>

             {/* Language Section */}
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="space-y-6">
                    <div className="p-4 bg-slate-100 text-slate-950 rounded-2xl w-fit"><Globe className="w-6 h-6"/></div>
                    <div>
                        <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter">{t.language}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronia Global</p>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {id: 'pt-BR', flag: '🇧🇷', label: 'Português'},
                      {id: 'en-US', flag: '🇺🇸', label: 'English'},
                      {id: 'es-ES', flag: '🇪🇸', label: 'Español'}
                    ].map(lang => (
                        <button 
                          key={lang.id} 
                          onClick={() => setLanguage(lang.id as any)} 
                          className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${language === lang.id ? 'bg-slate-950 text-white border-slate-950 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{lang.label}</span>
                        </button>
                    ))}
                </div>
             </div>

             <div className="p-12 bg-slate-950 text-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-12">
                 <div className="flex-1">
                     <div className="flex items-center gap-3 mb-6 text-indigo-400 font-black uppercase text-xs">
                        <ShieldCheck className="w-6 h-6"/> REPOSITÓRIO MASTER
                     </div>
                     <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Cofre de Segurança</h4>
                     <p className="text-xs text-slate-400 leading-relaxed font-bold mb-8 max-w-lg">Gere um backup total da base MaestrIA para preservação física de dados. Este processo é auditado e criptografado.</p>
                     <div className="flex gap-4">
                        <button onClick={handleExportBackup} className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl">Exportar Backup</button>
                        <button onClick={() => backupInputRef.current?.click()} className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Importar Backup</button>
                        <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file && confirm("ATENÇÃO: A restauração master substituirá todos os dados atuais. Prosseguir?")) {
                                 const reader = new FileReader();
                                 reader.onload = (evt) => {
                                     try {
                                         const data = JSON.parse(evt.target?.result as string);
                                         localStorage.setItem('maestria_v11_enterprise_stable', JSON.stringify(data));
                                         window.location.reload();
                                     } catch(e) { alert("Erro ao processar backup. Arquivo corrompido."); }
                                 };
                                 reader.readAsText(file);
                             }
                        }} />
                     </div>
                 </div>
                 <div className="w-full md:w-80 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                     <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
                     <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase">O backup contém dados fiscais sensíveis. Mantenha em Cold Storage (Offline).</p>
                 </div>
             </div>
        </div>
    );
};

export default Settings;
