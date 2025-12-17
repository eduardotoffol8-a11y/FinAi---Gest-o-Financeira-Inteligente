
import React, { useRef, useState } from 'react';
import { Building, UploadCloud, Command, Save, Users, Check, Globe, Shield } from 'lucide-react';
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
}

const Settings: React.FC<SettingsProps> = ({ team = [], onUpdateMember, currentRole, companyInfo, setCompanyInfo, language, setLanguage }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    
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

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="p-3 bg-slate-950 rounded-2xl text-white">
                    <Icon className="w-5 h-5"/>
                </div>
                <h3 className="font-black text-slate-900 text-lg uppercase italic tracking-tighter">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-40">
             <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter uppercase">{t.settings}</h2>
             
             <Section title="Branding" icon={Building}>
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                            {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-12 h-12 text-slate-200" />}
                            <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><UploadCloud className="w-6 h-6" /></button>
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
                    <div className="flex-1 space-y-6 w-full">
                        <input ref={nameRef} defaultValue={companyInfo.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none" placeholder="NOME" />
                        <textarea ref={descRef} defaultValue={companyInfo.description} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none min-h-[100px]" placeholder="MISSÃO" />
                        <button onClick={handleSaveBranding} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                            {isSaved ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>} {t.save}
                        </button>
                    </div>
                 </div>
             </Section>

             <Section title={t.language} icon={Globe}>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {id: 'pt-BR', label: 'Português'},
                      {id: 'en-US', label: 'English'},
                      {id: 'es-ES', label: 'Español'}
                    ].map(lang => (
                        <button 
                          key={lang.id} 
                          onClick={() => setLanguage(lang.id as any)} 
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${language === lang.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                            {lang.label}
                        </button>
                    ))}
                 </div>
             </Section>
        </div>
    );
};

export default Settings;
