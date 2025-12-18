
import React, { useRef, useState } from 'react';
import { Save, Check, Download, Upload, Plus, Layout, Image as ImageIcon, Shield, RefreshCw, Loader2, X, MapPin, Mail, Phone, Building2, Globe, FileJson, Import, Key } from 'lucide-react';
import { TeamMember } from '../types';
import { translations } from '../translations';
import { testConnection } from '../services/geminiService';

interface SettingsProps {
  team: TeamMember[];
  onUpdateMember?: (member: TeamMember) => void;
  categories: string[];
  setCategories: (cats: string[]) => void;
  companyInfo: any;
  setCompanyInfo: (info: any) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  setLanguage: (lang: 'pt-BR' | 'en-US' | 'es-ES') => void;
  allData: any;
  onImportAllData?: (data: any) => void;
  onStatusUpdate?: (status: boolean | null) => void;
  onOpenKeySelector?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  team,
  onUpdateMember,
  categories, 
  setCategories, 
  companyInfo, 
  setCompanyInfo, 
  language, 
  setLanguage, 
  allData, 
  onImportAllData, 
  onStatusUpdate,
  onOpenKeySelector
}) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const importBackupRef = useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isTestingAi, setIsTestingAi] = useState(false);
    
    const t = translations[language];

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleTestAi = async () => {
        setIsTestingAi(true);
        const result = await testConnection();
        setIsTestingAi(false);
        if (onStatusUpdate) onStatusUpdate(result.success);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const result = evt.target?.result as string;
                if (result.length > 1000000) {
                    alert("A imagem é muito grande. Por favor, use um arquivo menor que 1MB.");
                    return;
                }
                setCompanyInfo({ ...companyInfo, logo: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImportAllData) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target?.result as string);
                    if (confirm("Isso substituirá todos os dados atuais. Deseja continuar?")) {
                        onImportAllData(data);
                        alert("Backup restaurado com sucesso!");
                    }
                } catch (err) {
                    alert("Arquivo de backup inválido.");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExportBackup = () => {
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maestria_full_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const languagesList = [
      { id: 'pt-BR', label: 'Português', flag: '🇧🇷' },
      { id: 'en-US', label: 'English', flag: '🇺🇸' },
      { id: 'es-ES', label: 'Español', flag: '🇪🇸' }
    ];

    const updateField = (field: string, value: any) => {
        setCompanyInfo({ ...companyInfo, [field]: value });
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-60 space-y-12">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                    <h2 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase">Cloud Control</h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-2">Central de Preferências Master</p>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={onOpenKeySelector} className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100">
                        <Key className="w-4 h-4" /> Autenticar IA
                    </button>
                    <button onClick={handleTestAi} disabled={isTestingAi} className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 transition-all flex items-center gap-2">
                        {isTestingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sincronizar Sinal IA
                    </button>
                    <button onClick={handleSave} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-2">
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {isSaved ? 'Preferências Salvas' : 'Aplicar Mudanças'}
                    </button>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 text-slate-950">
                            <Globe className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">{t.language}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {languagesList.map((lang) => (
                                <button 
                                  key={lang.id}
                                  onClick={() => setLanguage(lang.id as any)}
                                  className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all ${language === lang.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                >
                                    <span className="text-3xl">{lang.flag}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-4 text-slate-950">
                            <Building2 className="w-6 h-6" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Branding & Perfil Corporativo</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo da Empresa</label>
                                <div onClick={() => logoInputRef.current?.click()} className="group relative w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden shadow-inner">
                                    {companyInfo.logo ? (
                                        <img src={companyInfo.logo} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform" />
                                    )}
                                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Dica: Use PNG transparente para melhores PDFs.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nome Fantasia (Exibição)</label>
                                    <input value={companyInfo.name || ''} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tax ID / CNPJ</label>
                                    <input value={companyInfo.taxId || ''} onChange={(e) => updateField('taxId', e.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">E-mail para Documentos</label>
                                    <input value={companyInfo.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="financeiro@empresa.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Telefone Oficial</label>
                                    <input value={companyInfo.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="(00) 00000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3"/> Endereço Sede (Cabeçalho de Documentos)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Logradouro / Número</label>
                                    <input value={companyInfo.address || ''} onChange={(e) => updateField('address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CEP</label>
                                    <input value={companyInfo.zipCode || ''} onChange={(e) => updateField('zipCode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bairro</label>
                                    <input value={companyInfo.neighborhood || ''} onChange={(e) => updateField('neighborhood', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Cidade</label>
                                    <input value={companyInfo.city || ''} onChange={(e) => updateField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Estado (UF)</label>
                                    <input value={companyInfo.state || ''} onChange={(e) => updateField('state', e.target.value)} maxLength={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs uppercase" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-10">
                        <div className="p-4 bg-white/10 rounded-2xl w-fit"><Shield className="w-8 h-8 text-indigo-400" /></div>
                        <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Vault de Soberania</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Soberania Total dos Dados</p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={handleExportBackup} className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Backup Total (.json)</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Exportar Lançamentos, Parceiros e Configurações</p>
                                </div>
                                <Download className="w-5 h-5 text-slate-500 group-hover:text-white" />
                            </button>

                            <button onClick={() => importBackupRef.current?.click()} className="w-full flex items-center justify-between p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-all text-left group">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-400">Restaurar Sistema</p>
                                    <p className="text-[9px] text-indigo-300/50 font-bold uppercase">Carregar arquivo de backup completo</p>
                                </div>
                                <Import className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                                <input type="file" ref={importBackupRef} className="hidden" accept=".json" onChange={handleImportBackup} />
                            </button>
                        </div>
                        <p className="text-[8px] font-black text-slate-500 uppercase leading-relaxed">Nota: Recomenda-se realizar um backup semanal para garantir a integridade dos dados fora do cache do navegador.</p>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Settings;
