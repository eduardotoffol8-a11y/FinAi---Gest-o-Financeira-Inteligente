
import React, { useRef, useState } from 'react';
import { Building, UploadCloud, Command, Save, Users, Check, Globe, Shield, ShieldCheck, Download, FileJson, AlertTriangle, ArrowUpCircle, Fingerprint, Lock, ShieldAlert } from 'lucide-react';
import { TeamMember } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  team: TeamMember[];
  onUpdateMember: (member: TeamMember) => void;
  currentRole?: string;
  companyInfo: any;
  setCompanyInfo: (info: any) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  setLanguage: (lang: 'pt-BR' | 'en-US' | 'es-ES') => void;
  allData: any;
}

const Settings: React.FC<SettingsProps> = ({ team = [], onUpdateMember, currentRole, companyInfo, setCompanyInfo, language, setLanguage, allData }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const backupInputRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [showBiometrics, setShowBiometrics] = useState(false);
    
    const t = translations[language];

    const handleSaveBranding = () => {
        setCompanyInfo({
            ...companyInfo,
            name: nameRef.current?.value.toUpperCase() || companyInfo.name,
            description: descRef.current?.value || companyInfo.description
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleRoleChange = (member: TeamMember, newRole: 'admin' | 'leader' | 'member') => {
        onUpdateMember({ ...member, role: newRole });
    };

    const handleExportBackup = () => {
        const dataStr = JSON.stringify({ ...allData, companyInfo }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `MAESTRIA_MASTER_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const Section = ({ title, subtitle, icon: Icon, children }: any) => (
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm mb-12">
            <div className="flex items-center gap-8 mb-12 border-b border-slate-50 pb-10">
                <div className="p-5 bg-slate-950 rounded-[1.5rem] text-white shadow-2xl">
                    <Icon className="w-8 h-8"/>
                </div>
                <div>
                    <h3 className="font-black text-slate-950 text-2xl uppercase italic tracking-tighter leading-none">{title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">{subtitle || 'PROTOCOL CONFIGURATION'}</p>
                </div>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-60">
             <div className="flex justify-between items-end mb-16">
                 <div>
                    <h2 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase">{t.settings}</h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-2">MaestrIA Enterprise Operating System v9.0</p>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Secure Environment</span>
                 </div>
             </div>
             
             <Section title="Visual & Branding" icon={Building}>
                 <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-48 h-48 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative shadow-inner transition-all hover:border-indigo-400">
                            {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-20 h-20 text-slate-200" />}
                            <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white flex-col gap-2">
                                <UploadCloud className="w-10 h-10" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Update Logo</span>
                            </button>
                        </div>
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                                 const reader = new FileReader();
                                 reader.onload = (evt) => setCompanyInfo({...companyInfo, logo: evt.target?.result as string});
                                 reader.readAsDataURL(file);
                             }
                        }} />
                    </div>
                    <div className="flex-1 space-y-8 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                            <input ref={nameRef} defaultValue={companyInfo.name} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 text-slate-950 font-black outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all text-xl uppercase tracking-tighter" placeholder="NOME DA EMPRESA" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Protocol</label>
                             <textarea ref={descRef} defaultValue={companyInfo.description} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 text-slate-950 font-bold outline-none min-h-[140px] focus:ring-8 focus:ring-indigo-500/5 transition-all" placeholder="MISSÃO ESTRATÉGICA" />
                        </div>
                        <button onClick={handleSaveBranding} className={`flex items-center gap-4 px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}>
                            {isSaved ? <Check className="w-6 h-6"/> : <Save className="w-6 h-6"/>} {t.save}
                        </button>
                    </div>
                 </div>
             </Section>

             <Section title={t.governance} subtitle="EQUITY & PERMISSIONS" icon={Users}>
                   <div className="divide-y divide-slate-50">
                       {team.map(member => (
                           <div key={member.id} className="py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 group transition-all hover:bg-slate-50/50 rounded-3xl px-4 -mx-4">
                               <div className="flex items-center gap-6">
                                   <div className="relative">
                                        <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-white font-black italic overflow-hidden shadow-xl ring-4 ring-white transition-transform group-hover:scale-110">
                                            {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                   </div>
                                   <div>
                                       <p className="text-lg font-black text-slate-950 uppercase italic tracking-tighter">{member.name}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                           <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{member.role}</span>
                                       </div>
                                   </div>
                               </div>
                               
                               <div className="flex gap-2">
                                   {['admin', 'leader', 'member'].map(role => (
                                       <button 
                                           key={role} 
                                           onClick={() => handleRoleChange(member, role as any)}
                                           className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${member.role === role ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'}`}
                                       >
                                           {role}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="mt-12 p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Fingerprint className="w-10 h-10 text-indigo-600" />
                            <div>
                                <h4 className="font-black text-slate-900 uppercase italic text-xs">Biometric Control Sync</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Require biometric authentication for high-value operations</p>
                            </div>
                        </div>
                        <button onClick={() => setShowBiometrics(true)} className="px-8 py-4 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Enable Biometrics</button>
                   </div>
             </Section>

             <Section title="Security Vault" subtitle="MASTER ENCRYPTION & BACKUP" icon={ShieldAlert}>
                 <div className="p-12 bg-slate-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
                     <div className="relative z-10">
                         <div className="flex flex-col lg:flex-row items-center gap-12">
                             <div className="flex-1">
                                 <h4 className="font-black text-2xl uppercase italic tracking-tighter mb-4">Neural Data Repository</h4>
                                 <p className="text-xs text-slate-400 font-bold leading-relaxed mb-10 max-w-xl">Nenhum dado é perdido. Gere o arquivo mestre criptografado contendo todo o histórico operacional, financeiro e estratégico. Este é o seu ativo mais valioso.</p>
                                 <div className="flex flex-wrap gap-4">
                                    <button onClick={handleExportBackup} className="flex items-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95">
                                        <Download className="w-5 h-5" /> {t.export_backup}
                                    </button>
                                    <button onClick={() => backupInputRef.current?.click()} className="flex items-center gap-3 px-10 py-5 bg-white/10 border border-white/20 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                        <FileJson className="w-5 h-5" /> {t.import_backup}
                                    </button>
                                    <input type="file" ref={backupInputRef} className="hidden" accept=".json" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && confirm("ATENÇÃO: Este protocolo substituirá todos os dados atuais. Deseja iniciar a restauração master?")) {
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                                const data = JSON.parse(evt.target?.result as string);
                                                localStorage.setItem('maestria_enterprise_v9_ultimate', JSON.stringify(data));
                                                window.location.reload();
                                            };
                                            reader.readAsText(file);
                                        }
                                    }} />
                                 </div>
                             </div>
                             <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl w-full lg:w-80">
                                 <div className="flex items-center gap-3 mb-6 font-black text-xs uppercase tracking-widest text-indigo-400">
                                    <AlertTriangle className="w-6 h-6"/> Warning
                                 </div>
                                 <p className="text-[11px] font-bold leading-relaxed text-slate-300">O arquivo de backup é universal e contém tokens de acesso. Mantenha em armazenamento físico offline (Cold Storage).</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </Section>

             <Section title="System Core" subtitle="LOCALIZATION & PROTOCOLS" icon={Globe}>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      {id: 'pt-BR', label: 'Português - BR', flag: '🇧🇷'},
                      {id: 'en-US', label: 'English - US', flag: '🇺🇸'},
                      {id: 'es-ES', label: 'Español - ES', flag: '🇪🇸'}
                    ].map(lang => (
                        <button 
                          key={lang.id} 
                          onClick={() => setLanguage(lang.id as any)} 
                          className={`flex flex-col items-center gap-3 p-8 rounded-[2rem] text-[11px] font-black uppercase tracking-widest border transition-all ${language === lang.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                        >
                            <span className="text-3xl mb-2">{lang.flag}</span>
                            {lang.label}
                        </button>
                    ))}
                 </div>
             </Section>
        </div>
    );
};

export default Settings;
