
import React, { useRef, useState } from 'react';
import { Building, UploadCloud, Command, Save, Users, Check } from 'lucide-react';
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
    const nameRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveBranding = () => {
        const newName = nameRef.current?.value || companyInfo.name;
        const newDesc = descRef.current?.value || companyInfo.description;
        
        setCompanyInfo({
            ...companyInfo,
            name: newName.toUpperCase(),
            description: newDesc
        });
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const base64 = evt.target?.result as string;
                setCompanyInfo({ ...companyInfo, logo: base64 });
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
             <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter uppercase">Configurações MaestrIA</h2>
             
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
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Logo da Empresa</p>
                    </div>
                    
                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nome Comercial</label>
                            <input 
                                type="text" 
                                ref={nameRef}
                                defaultValue={companyInfo.name}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                                placeholder="NOME DA EMPRESA"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Contexto para a MaestrIA</label>
                            <textarea 
                                ref={descRef}
                                defaultValue={companyInfo.description}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[100px] transition-all" 
                                placeholder="Descreva o foco da sua empresa..."
                            />
                        </div>
                        <button 
                            onClick={handleSaveBranding}
                            className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 w-full md:w-auto ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                        >
                            {isSaved ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
                            {isSaved ? 'DADOS ATUALIZADOS' : 'SALVAR BRANDING'}
                        </button>
                    </div>
                 </div>
             </Section>

             {(currentRole === 'admin' || currentRole === 'leader') && (
               <Section title="Gestão de Equipe" icon={Users}>
                   <div className="space-y-4">
                       <div className="divide-y divide-slate-50">
                           {team.map(member => (
                               <div key={member.id} className="py-5 flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black italic text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all overflow-hidden border border-slate-200">
                                           {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                                       </div>
                                       <div>
                                           <p className="text-sm font-black text-slate-900">{member.name.toUpperCase()}</p>
                                           <div className="flex items-center gap-2 mt-1">
                                               <span className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</span>
                                           </div>
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
