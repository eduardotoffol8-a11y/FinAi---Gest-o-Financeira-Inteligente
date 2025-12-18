
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, PieChart, Users, Settings as SettingsIcon, Bell, Sparkles, FileText, Calendar as CalendarIcon, LogOut, Command, MessageSquare, CheckCircle2, WifiOff, Clock, Loader2, Monitor, FilePlus, AlertTriangle, RefreshCw, Cloud } from 'lucide-react';
import { Transaction, ViewState, Contact, ScheduledItem, TeamMember, CorporateMessage } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Schedule from './components/Schedule';
import Contacts from './components/Contacts';
import Settings from './components/Settings';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import Subscription from './components/Subscription';
import MobileNav from './components/MobileNav';
import CorporateChat from './components/CorporateChat';
import { translations } from './translations';
import { analyzeDocument, extractFromText, getKeyDiagnostic } from './services/geminiService';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'maestria_v11_enterprise_stable';
const BRAND_STORAGE_KEY = 'maestria_brand_v2';
const DEFAULT_CATEGORIES = ['Alimentação', 'Vendas', 'Salário', 'Mercado', 'Carro', 'Saúde', 'Operacional', 'Marketing', 'Aluguel', 'Utilidades', 'Investimento', 'Casa', 'Compras'];

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<TeamMember | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [pendingReviewTx, setPendingReviewTx] = useState<Transaction | null>(null);
  const [aiDiagnosticError, setAiDiagnosticError] = useState<string | null>(null);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<string>('');

  const [language, setLanguage] = useState<'pt-BR' | 'en-US' | 'es-ES'>(() => (localStorage.getItem('maestria_lang') as any) || 'pt-BR');
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem(BRAND_STORAGE_KEY);
    try { return saved ? JSON.parse(saved) : { name: 'EMPRESA MASTER', logo: null, brandColor: '#6366f1', trialStartDate: new Date().toISOString(), isSubscribed: true, taxId: '', address: '', email: '', phone: '', city: '' };
    } catch { return { name: 'EMPRESA MASTER', logo: null, brandColor: '#6366f1', trialStartDate: new Date().toISOString(), isSubscribed: true, taxId: '', address: '', email: '', phone: '', city: '' }; }
  });

  const [view, setView] = useState<ViewState>(() => (localStorage.getItem('maestria_last_view') as any) || ViewState.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [corporateMessages, setCorporateMessages] = useState<CorporateMessage[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
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
    
    // @ts-ignore
    const diag = getKeyDiagnostic(process.env.API_KEY);
    setAiConnectionStatus(diag);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      const data = { transactions, contacts, schedule, team, corporateMessages, categories };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem('maestria_auth', JSON.stringify(user));
      localStorage.setItem('maestria_last_view', view);
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(companyInfo));
    }
  }, [transactions, contacts, schedule, team, corporateMessages, categories, isLoaded, user, view, companyInfo]);

  const handleGlobalScan = async (file: File, type: 'transaction' | 'contact', reviewRequired: boolean = false) => {
    setIsGlobalProcessing(true);
    setAiDiagnosticError(null);
    const reader = new FileReader();

    try {
      if (file.name.match(/\.(csv|txt|xlsx|xls)$/i)) {
        reader.onload = async (e) => {
          let content = '';
          if (file.name.match(/\.(xlsx|xls)$/i)) {
            const wb = XLSX.read(e.target?.result, { type: 'binary' });
            content = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
          } else {
            content = e.target?.result as string;
          }
          const json = await extractFromText(content, categories, type);
          processAIResult(json, type, reviewRequired);
        };
        if (file.name.match(/\.(xlsx|xls)$/i)) reader.readAsBinaryString(file);
        else reader.readAsText(file);
      } else {
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          const json = await analyzeDocument(base64, file.type, type, categories);
          processAIResult(json, type, reviewRequired);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setAiDiagnosticError("Erro fatal na comunicação com o servidor de IA.");
      setIsGlobalProcessing(false);
    }
  };

  const processAIResult = (json: string, targetType: 'transaction' | 'contact', reviewRequired: boolean) => {
    if (json.includes("ERRO_") || json.includes("ERRO_CONFIG")) {
      setAiDiagnosticError(json);
      setIsGlobalProcessing(false);
      return;
    }

    try {
      const cleanJson = json.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      const items = Array.isArray(data) ? data : [data];

      if (targetType === 'transaction') {
        const mapped: Transaction[] = items.map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          date: item.date || new Date().toISOString().split('T')[0],
          description: item.description || 'Lançamento IA',
          category: categories.includes(item.category) ? item.category : categories[0],
          amount: Math.abs(Number(item.amount)) || 0,
          type: (item.type === 'income' || item.type === 'Receita' ? 'income' : 'expense'),
          status: 'paid',
          source: 'ai',
          supplier: item.supplier || '',
          paymentMethod: item.paymentMethod || '',
          costCenter: item.costCenter || ''
        }));
        
        if (reviewRequired && mapped.length > 0) {
          setPendingReviewTx(mapped[0]);
          setView(ViewState.TRANSACTIONS);
        } else {
          setTransactions(prev => [...mapped, ...prev]);
        }
      } else {
        const mapped: Contact[] = items.map((item: any) => ({
          id: (Date.now() + Math.random()).toString(),
          name: item.name || 'Parceiro',
          company: item.company || '',
          taxId: item.taxId || '',
          email: item.email || '',
          phone: item.phone || '',
          address: item.address || '',
          type: (item.type === 'supplier' || item.type === 'Fornecedor' ? 'supplier' : 'client'),
          totalTraded: 0,
          source: 'ai'
        }));
        setContacts(prev => [...mapped, ...prev]);
        setView(ViewState.CONTACTS);
      }
    } catch (e) { 
      setAiDiagnosticError("A IA processou os dados mas o formato está ilegível. Tente novamente."); 
    }
    finally { setIsGlobalProcessing(false); }
  };

  if (!isLoaded) return null;
  if (!user) return <Auth onLogin={(u) => setUser({ id: '1', name: u.name, role: u.role, status: 'online' })} />;

  const t = translations[language];

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Alerta de Diagnóstico de IA */}
      {aiDiagnosticError && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-rose-200 rounded-[3rem] p-10 shadow-2xl max-w-2xl w-full animate-in zoom-in-95">
            <div className="flex gap-6">
                <div className="p-4 bg-rose-600 rounded-2xl text-white h-fit shadow-xl shadow-rose-200">
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-2xl text-slate-900 uppercase italic tracking-tighter">Erro de Conectividade</h4>
                      <button onClick={() => setAiDiagnosticError(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><LogOut className="w-5 h-5 text-slate-400 rotate-180"/></button>
                    </div>
                    <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {aiDiagnosticError}
                    </div>
                    <div className="mt-8 flex gap-3">
                      <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-950 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                        <RefreshCw className="w-4 h-4" /> Atualizar Nucleo
                      </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col p-6 z-20 shadow-sm">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-2xl overflow-hidden ring-2 ring-slate-100 ring-offset-2">
             {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" alt="Logo" /> : <Command className="w-6 h-6"/>}
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 tracking-tighter uppercase italic truncate max-w-[140px] leading-tight">{companyInfo.name}</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500">MaestrIA OS</p>
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{aiConnectionStatus.includes('✅') ? 'Cloud Sync Active' : 'Cloud Offline'}</span>
              </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black bg-slate-950 text-white shadow-lg hover:bg-indigo-600 transition-all uppercase tracking-widest">
               <Sparkles className="w-4 h-4 text-indigo-400" /> MAESTRIA AI
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
            <div className="max-w-[1800px] mx-auto h-full">
                {view === ViewState.DASHBOARD && <Dashboard transactions={transactions} language={language} onViewChange={setView} onOpenChatWithPrompt={p => { setInitialChatPrompt(p); setIsChatOpen(true); }} />}
                {view === ViewState.TRANSACTIONS && <TransactionList transactions={transactions} categories={categories} pendingReview={pendingReviewTx} onReviewComplete={() => setPendingReviewTx(null)} onEditTransaction={t => setTransactions(p => p.map(o => o.id === t.id ? t : o))} onDeleteTransaction={id => setTransactions(p => p.filter(t => t.id !== id))} onImportTransactions={l => setTransactions(p => [...l, ...p])} onStartScan={(f, r) => handleGlobalScan(f, 'transaction', r)} language={language} />}
                {view === ViewState.REPORTS && <Reports transactions={transactions} language={language} />}
                {view === ViewState.TEAM_CHAT && <CorporateChat currentUser={user} team={team} messages={corporateMessages} onSendMessage={(rid, txt, opt) => setCorporateMessages(prev => [...prev, {id: Date.now().toString(), senderId: user.id, receiverId: rid, text: txt, timestamp: new Date(), ...opt}])} onEditMessage={(id, t) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, text: t} : m))} onDeleteMessage={(id) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, isDeleted: true} : m))} language={language} />}
                {view === ViewState.SCHEDULE && <Schedule items={schedule} setItems={setSchedule} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString(), status: 'paid', source: 'manual'}, ...prev] as Transaction[])} language={language} />}
                {view === ViewState.CONTACTS && <Contacts contacts={contacts} companyInfo={companyInfo} onAddContact={(c) => setContacts(p => [c, ...p])} onEditContact={(c) => setContacts(p => p.map(o => o.id === c.id ? c : o))} onDeleteContact={(id) => setContacts(p => p.filter(c => c.id !== id))} onImportContacts={(l) => setContacts(p => [...l, ...p])} onStartScan={(f) => handleGlobalScan(f, 'contact', false)} language={language} />}
                {view === ViewState.SETTINGS && <Settings team={team} categories={categories} setCategories={setCategories} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} onUpdateMember={(m) => setTeam(prev => prev.map(o => o.id === m.id ? m : o))} language={language} setLanguage={setLanguage as any} allData={{transactions, contacts, schedule, team, corporateMessages, categories}} />}
            </div>
        </div>
        <MobileNav currentView={view} onViewChange={setView} />
      </main>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()} as Transaction, ...prev])} initialPrompt={initialChatPrompt} />
    </div>
  );
}
export default App;
