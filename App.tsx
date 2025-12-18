
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutDashboard, PieChart, Users, Settings as SettingsIcon, Bell, Sparkles, FileText, Calendar as CalendarIcon, LogOut, Command, MessageSquare, BookOpen, ChevronRight, Zap, Cpu, Loader2, Key, AlertTriangle } from 'lucide-react';
import { Transaction, ViewState, Contact, ScheduledItem, TeamMember, CorporateMessage } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Schedule from './components/Schedule';
import Contacts from './components/Contacts';
import Settings from './components/Settings';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import Docs from './components/Docs';
import MobileNav from './components/MobileNav';
import CorporateChat from './components/CorporateChat';
import { translations } from './translations';
import { analyzeDocument, extractFromText, testConnection } from './services/geminiService';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'maestria_v11_enterprise_stable';
const BRAND_STORAGE_KEY = 'maestria_brand_v2';
const DEFAULT_CATEGORIES = ['Alimentação', 'Vendas', 'Salário', 'Mercado', 'Carro', 'Saúde', 'Saída Geral', 'Entrada Geral'];

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<TeamMember | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState<boolean | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
  const [pendingReviewTx, setPendingReviewTx] = useState<Transaction | null>(null);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US' | 'es-ES'>(() => (localStorage.getItem('maestria_lang') as any) || 'pt-BR');
  
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem(BRAND_STORAGE_KEY);
    if (!saved) return { name: 'Empresa', logo: null, brandColor: '#6366f1' };
    try { 
      return JSON.parse(saved);
    } catch (e) { 
      return { name: 'Empresa', logo: null, brandColor: '#6366f1' }; 
    }
  });

  const [view, setView] = useState<ViewState>(() => (localStorage.getItem('maestria_last_view') as any) || ViewState.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [corporateMessages, setCorporateMessages] = useState<CorporateMessage[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const checkKeyStatus = useCallback(async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(selected);
      if (selected) {
        const res = await testConnection();
        setIsAiActive(res.success);
      }
    } else if (process.env.API_KEY) {
      setIsKeySelected(true);
      const res = await testConnection();
      setIsAiActive(res.success);
    }
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
      // Aguarda injeção da chave e valida
      setTimeout(async () => {
        const res = await testConnection();
        setIsAiActive(res.success);
      }, 500);
    }
  };

  const saveAllData = useCallback(() => {
    if (!isLoaded || !user) return;
    try {
      const data = { transactions, contacts, schedule, team, corporateMessages, categories };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem('maestria_auth', JSON.stringify(user));
      localStorage.setItem('maestria_last_view', view);
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(companyInfo));
      localStorage.setItem('maestria_lang', language);
    } catch (err) {}
  }, [transactions, contacts, schedule, team, corporateMessages, categories, isLoaded, user, view, companyInfo, language]);

  useEffect(() => {
    saveAllData();
  }, [saveAllData]);

  useEffect(() => {
    checkKeyStatus();

    const savedAuth = localStorage.getItem('maestria_auth');
    if (savedAuth) try { setUser(JSON.parse(savedAuth)); } catch (e) {}

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTransactions(parsed.transactions || []);
        setContacts(parsed.contacts || []);
        setSchedule(parsed.schedule || []);
        setTeam(parsed.team || []);
        setCorporateMessages(parsed.corporateMessages || []);
        setCategories(parsed.categories || DEFAULT_CATEGORIES);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, [checkKeyStatus]);

  const handleGlobalScan = async (file: File, type: 'transaction' | 'contact', reviewRequired: boolean = false) => {
    if (!isKeySelected) {
      handleSelectKey();
      return;
    }
    setIsThinking(true);
    const reader = new FileReader();
    try {
      if (file.name.match(/\.(csv|txt|xlsx|xls)$/i)) {
        reader.onload = async (e) => {
          let content = '';
          const result = e.target ? e.target.result : '';
          if (file.name.match(/\.(xlsx|xls)$/i)) {
            const wb = XLSX.read(result, { type: 'binary' });
            content = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
          } else {
            content = result as string;
          }
          const json = await extractFromText(content, categories, type);
          processAIResult(json, type, reviewRequired);
        };
        if (file.name.match(/\.(xlsx|xls)$/i)) reader.readAsBinaryString(file);
        else reader.readAsText(file);
      } else {
        reader.onload = async (e) => {
          const result = e.target ? (e.target.result as string) : '';
          const base64 = result.split(',')[1];
          const json = await analyzeDocument(base64, file.type, type, categories);
          processAIResult(json, type, reviewRequired);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setIsThinking(false);
    }
  };

  const processAIResult = (json: string, targetType: 'transaction' | 'contact', reviewRequired: boolean) => {
    try {
      const cleanJson = json.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      const items = Array.isArray(data) ? data : [data];

      if (targetType === 'transaction') {
          const mapped: Transaction[] = items.map((item: any) => {
            const rawAmount = parseFloat(item.amount) || 0;
            return {
                id: Math.random().toString(36).substring(2, 11),
                date: item.date || new Date().toISOString().split('T')[0],
                description: item.description || 'Lançamento IA',
                category: categories.indexOf(item.category) !== -1 ? item.category : categories[0],
                amount: Math.abs(rawAmount),
                type: (item.type === 'income' || rawAmount > 0) ? 'income' : 'expense',
                status: 'paid',
                source: 'ai',
                supplier: item.supplier || '',
                paymentMethod: item.paymentMethod || '',
                costCenter: item.costCenter || ''
            };
          });

          if (reviewRequired && mapped.length > 0) {
            setPendingReviewTx(mapped[0]);
            setView(ViewState.TRANSACTIONS);
          } else {
            setTransactions(prev => [...mapped, ...prev]);
            setView(ViewState.TRANSACTIONS);
          }
      } else {
          const mapped: Contact[] = items.map((item: any) => ({
                id: (Date.now() + Math.random()).toString(),
                name: item.name || 'Parceiro Identificado',
                company: item.company || '',
                taxId: item.taxId || '',
                email: item.email || '',
                phone: item.phone || '',
                address: item.address || '',
                neighborhood: item.neighborhood || '',
                city: item.city || '',
                state: item.state || '',
                zipCode: item.zipCode || '',
                type: item.type || 'client',
                totalTraded: 0,
                source: 'ai'
          }));
          setContacts(prev => [...mapped, ...prev]);
          setView(ViewState.CONTACTS);
      }
    } catch (e) {
    } finally {
      setIsThinking(false);
    }
  };

  const handleImportFullBackup = (data: any) => {
    if (!data) return;
    try {
      if (data.transactions) setTransactions(data.transactions);
      if (data.contacts) setContacts(data.contacts);
      if (data.schedule) setSchedule(data.schedule);
      if (data.team) setTeam(data.team);
      if (data.corporateMessages) setCorporateMessages(data.corporateMessages);
      if (data.categories) setCategories(data.categories);
      if (data.companyInfo) setCompanyInfo(data.companyInfo);
    } catch (e) {}
  };

  if (!isLoaded) return null;
  if (!user) return <Auth onLogin={(u) => setUser({ id: '1', name: u.name, role: u.role, status: 'online' })} />;

  const t = translations[language];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {isThinking && (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[999] overflow-hidden">
          <div className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-loading-line"></div>
        </div>
      )}

      {!isKeySelected && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter mb-4">Ativar Inteligência</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
              Conecte sua chave de acesso para desbloquear a análise neural financeira e automação de documentos.
            </p>
            <button 
              onClick={handleSelectKey}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" /> Conectar Agora
            </button>
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase">Consulte os detalhes de faturamento em ai.google.dev</p>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col p-6 z-20 shadow-sm">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl overflow-hidden">
             {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" alt="Logo" /> : <Command className="w-6 h-6"/>}
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 tracking-tighter uppercase italic truncate max-w-[140px] leading-tight">{companyInfo.name}</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500">Inteligência Financeira</p>
          </div>
        </div>
        <nav className="space-y-1.5 flex-1 overflow-y-auto">
          {[
            { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: t.dashboard },
            { id: ViewState.TRANSACTIONS, icon: FileText, label: t.transactions },
            { id: ViewState.REPORTS, icon: PieChart, label: t.ia },
            { id: ViewState.SCHEDULE, icon: CalendarIcon, label: t.agenda },
            { id: ViewState.CONTACTS, icon: Users, label: t.partners },
            { id: ViewState.TEAM_CHAT, icon: MessageSquare, label: t.chat },
            { id: ViewState.DOCS, icon: BookOpen, label: 'Manual' },
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${view === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon className={`w-4.5 h-4.5 ${view === item.id ? 'text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-slate-100">
            <button onClick={() => setView(ViewState.SETTINGS)} className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[10px] font-black uppercase ${view === ViewState.SETTINGS ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><SettingsIcon className="w-4.5 h-4.5"/> {t.settings}</button>
            <button onClick={() => setUser(null)} className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase transition-colors"><LogOut className="w-4.5 h-4.5"/> {t.logout}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-[140]">
          <div className="flex items-center gap-5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">{view}</h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-2">
                <div className="flex flex-col items-end">
                    <span className={`text-[7px] font-black uppercase tracking-widest leading-none mb-1 transition-colors ${isThinking ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`}>
                      {isThinking ? 'SINCRO NEURAL ATIVA' : isAiActive ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isAiActive === null ? 'bg-slate-300' : isAiActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                </div>
             </div>
             <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black bg-slate-900 text-white shadow-lg hover:bg-indigo-600 transition-all uppercase tracking-widest">
               <Sparkles className="w-4 h-4 text-indigo-400" /> ACESSAR IA
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fcfdfe]">
            <div className="max-w-[1800px] mx-auto h-full">
                {view === ViewState.DASHBOARD && <Dashboard transactions={transactions} language={language} onViewChange={setView} aiConnected={!!isAiActive} onOpenChatWithPrompt={p => { setInitialChatPrompt(p); setIsChatOpen(true); }} />}
                {view === ViewState.TRANSACTIONS && <TransactionList transactions={transactions} companyInfo={companyInfo} categories={categories} pendingReview={pendingReviewTx} onReviewComplete={() => setPendingReviewTx(null)} onEditTransaction={t => setTransactions(p => p.map(o => o.id === t.id ? t : o))} onDeleteTransaction={id => setTransactions(p => p.filter(t => t.id !== id))} onImportTransactions={l => setTransactions(p => [...l, ...p])} onStartScan={(f, r) => handleGlobalScan(f, 'transaction', r)} language={language} />}
                {view === ViewState.REPORTS && <Reports transactions={transactions} companyInfo={companyInfo} language={language} />}
                {view === ViewState.TEAM_CHAT && <CorporateChat currentUser={user} team={team} messages={corporateMessages} onSendMessage={(rid, txt, opt) => setCorporateMessages(prev => [...prev, {id: Date.now().toString(), senderId: user.id, receiverId: rid, text: txt, timestamp: new Date(), ...opt}])} onEditMessage={(id, t) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, text: t} : m))} onDeleteMessage={(id) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, isDeleted: true} : m))} language={language} />}
                {view === ViewState.SCHEDULE && <Schedule items={schedule} setItems={setSchedule} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString(), status: 'paid', source: 'manual'}, ...prev] as Transaction[])} language={language} />}
                {view === ViewState.CONTACTS && <Contacts contacts={contacts} companyInfo={companyInfo} onAddContact={(c) => setContacts(p => [c, ...p])} onEditContact={(c) => setContacts(p => p.map(o => o.id === c.id ? c : o))} onDeleteContact={(id) => setContacts(p => p.filter(c => c.id !== id))} onImportContacts={(l) => setContacts(p => [...l, ...p])} onStartScan={(f) => handleGlobalScan(f, 'contact', false)} language={language} />}
                {view === ViewState.SETTINGS && <Settings team={team} categories={categories} setCategories={setCategories} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} language={language} setLanguage={setLanguage as any} allData={{transactions, contacts, schedule, team, corporateMessages, categories, companyInfo}} onImportAllData={handleImportFullBackup} onStatusUpdate={setIsAiActive} />}
                {view === ViewState.DOCS && <Docs />}
            </div>
        </div>
        <MobileNav currentView={view} onViewChange={setView} />
      </main>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()} as Transaction, ...prev])} initialPrompt={initialChatPrompt} />
      
      <style>{`
        @keyframes loading-line {
          0% { left: -100%; width: 100%; }
          100% { left: 100%; width: 100%; }
        }
        .animate-loading-line {
          position: absolute;
          animation: loading-line 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
export default App;
