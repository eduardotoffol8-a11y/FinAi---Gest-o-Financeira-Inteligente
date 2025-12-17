
import React, { useRef, useState, useEffect } from 'react';
import { Building, UploadCloud, Command, Save, Users, Shield, Star } from 'lucide-react';
import { TeamMember } from '../types';

interface SettingsProps {
  team?: TeamMember[];
  onPromote?: (id: string, role: 'admin' | 'leader' | 'member') => void;
  currentRole?: string;
  companyInfo: any;
  setCompanyInfo: (info: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ team = [], onPromote, currentRole, companyInfo, setCompanyInfo }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    // Estado local isolado para evitar re-renders globais durante a digitação
    const [localName, setLocalName] = useState(companyInfo.name);
    const [localDescription, setLocalDescription] = useState(companyInfo.description);

    // Sincroniza se a logo mudar ou na primeira carga
    useEffect(() => {
        setLocalName(companyInfo.name);
        setLocalDescription(companyInfo.description);
    }, [companyInfo.logo]);

    const handleSync = () => {
        setCompanyInfo({ ...companyInfo, name: localName, description: localDescription });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setCompanyInfo({ ...companyInfo, logo: evt.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                    <Icon className="w-6 h-6"/>
                </div>
                <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase italic">{title}</h3>
                </div>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-32">
             <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter uppercase">Configurações</h2>
             
             <Section title="Branding da Empresa" icon={Building}>
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative shadow-inner">
                            {companyInfo.logo ? (
                                <img src={companyInfo.logo} className="w-full h-full object-cover" />
                            ) : (
                                <Command className="w-12 h-12 text-slate-200" />
                            )}
                            <button 
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <UploadCloud className="w-6 h-6" />
                            </button>
                        </div>
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nome Comercial</label>
                            <input 
                                type="text" 
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                onBlur={handleSync}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                                placeholder="Ex: FinAI da Minha Empresa"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Descrição</label>
                            <textarea 
                                value={localDescription}
                                onChange={(e) => setLocalDescription(e.target.value)}
                                onBlur={handleSync}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[100px]" 
                                placeholder="Breve resumo para contextualizar a IA..."
                            />
                        </div>
                        <button onClick={handleSync} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                            <Save className="w-4 h-4"/> Salvar Branding
                        </button>
                    </div>
                 </div>
             </Section>

             {(currentRole === 'admin' || currentRole === 'leader') && (
               <Section title="Gestão de Equipe" icon={Users}>
                   <div className="space-y-4">
                       <div className="divide-y divide-slate-50">
                           {team.map(member => (
                               <div key={member.id} className="py-4 flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black italic text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all overflow-hidden">
                                           {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                                       </div>
                                       <div>
                                           <p className="text-sm font-black text-slate-900">{member.name}</p>
                                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</span>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </Section>
             )}
        </div>
    );
};

export default Settings;
