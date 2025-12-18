
import React, { useRef, useState, useEffect } from 'react';
import { Command, Save, Check, ShieldCheck, Download, Upload, Trash2, Plus, Sparkles, Layout, Image as ImageIcon, Languages, Shield, Globe, Zap, MapPin, Phone, Mail, AlertCircle, RefreshCw, Loader2, Play } from 'lucide-react';
import { TeamMember } from '../types';
import { translations } from '../translations';
import { getKeyDiagnostic, testConnection } from '../services/geminiService';

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
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [aiStatus, setAiStatus] = useState('Verificando...');
    const [isTestingAi, setIsTestingAi] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    
    const t = translations[language];

    useEffect(() => {
        // @ts-ignore
        const key = process.env.API_KEY;
        setAiStatus(getKeyDiagnostic(key));
    }, []);

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleTestAi = async () => {
        setIsTestingAi(true);
        setTestResult(null);
        const result = await testConnection();
        setTestResult(result);
        setIsTestingAi(false);
    };

    const exportBackup = () => {
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `maestria_vault_${new Date().toISOString().split('T')[0]}.json`);
        link.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const json = JSON.parse(evt.target?.result as string);
            localStorage.setItem('maestria_v11_enterprise_stable', JSON.stringify(json));
            alert("Backup importado com sucesso. Reiniciando núcleo...");
            window.location.reload();
          } catch (err) {
            alert("Erro ao processar arquivo de backup.");
          }
        };
        reader.readAsText(file);
      }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => setCompanyInfo({ ...companyInfo, logo: evt.target?.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-60 space-y-12">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                    <h2 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase">{t.settings}</h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-2">MaestrIA Cloud Control Center</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-slate-500">Núcleo Cloud Ativo</span>
                    </div>
                    <button onClick={handleSave} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-2">
                        {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {isSaved ? 'Dados Sincronizados' : 'Sincronizar Agora'}
                    </button>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Diagnóstico de IA */}
                    <div className="bg-indigo-50 border-2 border-indigo-200 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-indigo-950">
                                <Sparkles className="w-6 h-6 text-indigo-600" />
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Diagnóstico Neural Cloud</h3>
                            </div>
                            <button onClick={handleTestAi} disabled={isTestingAi} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50">
                                {isTestingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                Testar Conexão Real
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da API Key</p>
                                <p className="text-sm font-bold text-slate-900 break-all">{aiStatus}</p>
                            </div>
                            <div className={`p-5 rounded-2xl border transition-all ${testResult ? (testResult.success ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-white border-indigo-50 opacity-40'}`}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resposta do Modelo</p>
                                <p className={`text-sm font-bold ${testResult?.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {isTestingAi ? 'Consultando...' : (testResult ? testResult.message : 'Aguardando teste...')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-indigo-100">
                            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold text-indigo-800 uppercase leading-relaxed">
                                Suportamos chaves 'AIza' (Google Cloud) e 'GEMI' (AI Studio). Se o teste real falhar, verifique se o modelo 'gemini-3-flash-preview' está disponível em sua região ou projeto.
                            </p>
                        </div>
                    </div>

                    {/* Perfil Corporativo */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-4 text-slate-950">
                            <Layout className="w-6 h-6" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Perfil Corporativo & Jurídico</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo da Empresa</label>
                                <div onClick={() => logoInputRef.current?.click()} className="group relative w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden shadow-inner">
                                    {companyInfo.logo ? (
                                        <img src={companyInfo.logo} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Razão Social</label>
                                    <input value={companyInfo.name} onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CNPJ / CPF</label>
                                    <input value={companyInfo.taxId} onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})} placeholder="00.000.000/0001-00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                            <div className="space-y-4 md:col-span-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><MapPin className="w-3 h-3"/> Endereço Completo Sede</label>
                                    <input value={companyInfo.address} onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})} placeholder="Rua, Número, Complemento, Bairro, Cidade, Estado, CEP" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Mail className="w-3 h-3"/> E-mail Corporativo</label>
                                    <input value={companyInfo.email} onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})} placeholder="contato@empresa.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Phone className="w-3 h-3"/> Telefone de Contato</label>
                                    <input value={companyInfo.phone} onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})} placeholder="(11) 99999-9999" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-950 font-bold outline-none text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regionalização */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 text-slate-950">
                            <Languages className="w-6 h-6" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Regionalização & Idioma</h3>
                        </div>
                        <div className="flex gap-4">
                            {['pt-BR', 'en-US', 'es-ES'].map((lang) => (
                                <button 
                                  key={lang}
                                  onClick={() => setLanguage(lang as any)}
                                  className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                  {lang === 'pt-BR' ? 'Português (BR)' : lang === 'en-US' ? 'English (US)' : 'Español (ES)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plano de Contas */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 text-slate-950">
                            <Zap className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Plano de Contas Customizado</h3>
                        </div>
                        <div className="flex gap-3">
                            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria (ex: Assinaturas Cloud)..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none uppercase" />
                            <button onClick={() => { if(newCategory) {setCategories([...categories, newCategory]); setNewCategory('');} }} className="p-4 bg-slate-950 text-white rounded-2xl hover:bg-brand transition-all shadow-lg"><Plus className="w-6 h-6"/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 group">
                                    <span className="text-[10px] font-black uppercase text-slate-600">{cat}</span>
                                    <button onClick={() => setCategories(categories.filter(c => c !== cat))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Vault & Backup */}
                    <div className="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-10">
                        <div className="p-4 bg-white/10 rounded-2xl w-fit"><Shield className="w-8 h-8 text-brand" /></div>
                        <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tighter">Vault de Segurança</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Soberania de Dados</p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={exportBackup} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Exportar JSON</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Backup Mestre Completo</p>
                                </div>
                                <Download className="w-5 h-5 text-slate-500 group-hover:text-white" />
                            </button>
                            <button onClick={() => importInputRef.current?.click()} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Importar Backup</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Restaurar do Arquivo</p>
                                </div>
                                <Upload className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><Sparkles className="w-6 h-6"/></div>
                        <div>
                            <h5 className="text-[10px] font-black text-emerald-900 uppercase">Motor Jurídico Ativo</h5>
                            <p className="text-[9px] font-bold text-emerald-700/60 uppercase">Contratos Prontos para Gerar</p>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Settings;
