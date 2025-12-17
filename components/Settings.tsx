
import React, { useRef, useState } from 'react';
import { Building, UploadCloud, Command, Save, Users, Check, Globe, ShieldCheck, Download, FileJson, AlertTriangle, Fingerprint, Lock, Palette } from 'lucide-react';
import { TeamMember } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  team: TeamMember[];
  onUpdateMember: (member: TeamMember) => void;
  companyInfo: any;
  setCompanyInfo: (info: any) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  setLanguage: (lang: 'pt-BR' | 'en-US' | 'es-ES') => void;
  allData: any;
}

const Settings: React.FC<SettingsProps> = ({ team = [], onUpdateMember, companyInfo, setCompanyInfo, language, setLanguage, allData }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const backupInputRef = useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    const t = translations[language];

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
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
                                    className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0 overflow-hidden shadow-lg" 
                                />
                                <span className="font-mono text-xs font-bold text-slate-500 uppercase">{companyInfo.brandColor}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo da Empresa</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                    {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-6 h-6 text-slate-200" />}
                                </div>
                                <button onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Upload Logo</button>
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (evt) => setCompanyInfo({...companyInfo, logo: evt.target?.result as string});
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Fantasia</label>
                        <input 
                            value={companyInfo.name} 
                            onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value.toUpperCase()})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-slate-950 font-black outline-none focus:ring-4 focus:ring-brand/5 text-xl uppercase tracking-tighter" 
                        />
                    </div>
                    <button onClick={handleSave} className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl">
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaved ? 'Confirmado' : t.save}
                    </button>
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
                      {id: 'pt-BR', label: 'Português', flag: '🇧🇷'},
                      {id: 'en-US', label: 'English', flag: '🇺🇸'},
                      {id: 'es-ES', label: 'Español', flag: '🇪🇸'}
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

             {/* Governance Section */}
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-slate-950 text-white rounded-2xl shadow-lg"><Users className="w-6 h-6"/></div>
                    <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter">{t.governance}</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {team.map(member => (
                        <div key={member.id} className="py-8 flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-950 uppercase">{member.name}</p>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {['admin', 'leader', 'member'].map(role => (
                                    <button 
                                        key={role}
                                        onClick={() => onUpdateMember({...member, role: role as any})}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${member.role === role ? 'bg-slate-950 text-white border-slate-950 shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Security Vault */}
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
                                     const data = JSON.parse(evt.target?.result as string);
                                     localStorage.setItem('maestria_v10_ultimate_stable', JSON.stringify(data));
                                     window.location.reload();
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
