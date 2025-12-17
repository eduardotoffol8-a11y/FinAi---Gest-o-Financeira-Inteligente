
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, PieChart, Users, Settings as SettingsIcon, Bell, Sparkles, FileText, Calendar as CalendarIcon, LogOut, Command, MessageSquare, CheckCircle2, WifiOff, Clock, Loader2 } from 'lucide-react';
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

const STORAGE_KEY = 'maestria_v11_enterprise_stable';

// Dados de referência solicitados pelo usuário
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'L001', date: '2025-01-05', description: 'Recebimento de cliente Ana Souza', type: 'income', amount: 2500.00, category: 'Vendas', status: 'paid', supplier: 'Ana Souza' },
  { id: 'L002', date: '2025-01-06', description: 'Pagamento fornecedor SupplyMax', type: 'expense', amount: 1200.00, category: 'Compras', status: 'paid', supplier: 'Ricardo Almeida' },
  { id: 'L003', date: '2025-01-07', description: 'Pagamento de aluguel', type: 'expense', amount: 3000.00, category: 'Aluguel', status: 'paid' },
  { id: 'L004', date: '2025-01-08', description: 'Recebimento de cliente João Pereira', type: 'income', amount: 1800.00, category: 'Vendas', status: 'paid', supplier: 'João Pereira' },
  { id: 'L005', date: '2025-01-09', description: 'Compra de material de escritório', type: 'expense', amount: 450.00, category: 'Operacional', status: 'paid' },
  { id: 'L006', date: '2025-01-10', description: 'Recebimento de cliente Maria Oliveira', type: 'income', amount: 3200.00, category: 'Vendas', status: 'paid', supplier: 'Maria Oliveira' },
  { id: 'L007', date: '2025-01-11', description: 'Pagamento fornecedor FoodLine', type: 'expense', amount: 2100.00, category: 'Compras', status: 'paid', supplier: 'Marcos Silva' },
  { id: 'L008', date: '2025-01-12', description: 'Transferência para conta poupança', type: 'expense', amount: 1000.00, category: 'Financeiro', status: 'paid' },
  { id: 'L009', date: '2025-01-13', description: 'Recebimento de cliente Carlos Mendes', type: 'income', amount: 2750.00, category: 'Vendas', status: 'paid', supplier: 'Carlos Mendes' },
  { id: 'L010', date: '2025-01-14', description: 'Pagamento de energia elétrica', type: 'expense', amount: 680.00, category: 'Utilidades', status: 'paid' },
];

const INITIAL_CONTACTS: Contact[] = [
  { id: 'C001', name: 'Ana Souza', type: 'client', email: 'ana.souza@techwave.com', phone: '(47) 99999-1111', totalTraded: 2500, reliabilityScore: 100 },
  { id: 'C002', name: 'João Pereira', type: 'client', email: 'joao.p@agromax.com', phone: '(11) 98888-2222', totalTraded: 1800, reliabilityScore: 100 },
  { id: 'C003', name: 'Maria Oliveira', type: 'client', email: 'maria.o@greenlife.com', phone: '(21) 97777-3333', totalTraded: 3200, reliabilityScore: 100 },
  { id: 'C004', name: 'Carlos Mendes', type: 'client', email: 'carlos.m@buildpro.com', phone: '(31) 96666-4444', totalTraded: 2750, reliabilityScore: 100 },
  { id: 'C005', name: 'Fernanda Lima', type: 'client', email: 'fernanda.l@fp.com', phone: '(48) 95555-5555', totalTraded: 0, reliabilityScore: 100 },
  { id: 'F001', name: 'Ricardo Almeida', type: 'supplier', email: 'ricardo.a@supplymax.com', phone: '(11) 94444-6666', totalTraded: 1200, reliabilityScore: 100 },
  { id: 'F002', name: 'Patrícia Santos', type: 'supplier', email: 'patricia.s@gparts.com', phone: '(21) 93333-7777', totalTraded: 0, reliabilityScore: 100 },
  { id: 'F003', name: 'Marcos Silva', type: 'supplier', email: 'marcos.s@foodline.com', phone: '(47) 92222-8888', totalTraded: 2100, reliabilityScore: 100 },
  { id: 'F004', name: 'Juliana Costa', type: 'supplier', email: 'juliana.c@paperworld.com', phone: '(31) 91111-9999', totalTraded: 0, reliabilityScore: 100 },
  { id: 'F005', name: 'Tiago Rocha', type: 'supplier', email: 'tiago.r@cleanpro.com', phone: '(48) 90000-0000', totalTraded: 0, reliabilityScore: 100 },
];

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<TeamMember | null>(null);

  const [language, setLanguage] = useState<'pt-BR' | 'en-US' | 'es-ES'>(() => {
    return (localStorage.getItem('maestria_lang') as any) || 'pt-BR';
  });

  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('maestria_brand');
    try {
      return saved ? JSON.parse(saved) : {
        name: 'EMPRESA MASTER',
        description: 'Gestão Inteligente',
        logo: null,
        brandColor: '#6366f1',
        trialStartDate: new Date().toISOString(),
        isSubscribed: true
      };
    } catch {
      return { name: 'EMPRESA MASTER', description: 'Gestão Inteligente', logo: null, brandColor: '#6366f1', trialStartDate: new Date().toISOString(), isSubscribed: true };
    }
  });

  const [view, setView] = useState<ViewState>(() => {
    return (localStorage.getItem('maestria_last_view') as ViewState) || ViewState.DASHBOARD;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [corporateMessages, setCorporateMessages] = useState<CorporateMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const savedAuth = localStorage.getItem('maestria_auth');
    if (savedAuth) {
      try { setUser(JSON.parse(savedAuth)); } catch (e) { console.error("Auth Load Error"); }
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTransactions(parsed.transactions || INITIAL_TRANSACTIONS);
        setContacts(parsed.contacts || INITIAL_CONTACTS);
        setSchedule(parsed.schedule || []);
        setTeam(parsed.team || []);
        setCorporateMessages(parsed.corporateMessages || []);
      } catch (e) { console.error("Data Load Error"); }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      setContacts(INITIAL_CONTACTS);
    }
    
    setTeam(prev => prev.length > 0 ? prev : [
      { id: '1', name: 'Gestor Master', role: 'admin', status: 'online' },
      { id: '2', name: 'Analista de Dados', role: 'leader', status: 'online' }
    ]);

    setIsLoaded(true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      const data = { transactions, contacts, schedule, team, corporateMessages };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem('maestria_auth', JSON.stringify(user));
    }
  }, [transactions, contacts, schedule, team, corporateMessages, isLoaded, user]);

  useEffect(() => {
    localStorage.setItem('maestria_brand', JSON.stringify(companyInfo));
    localStorage.setItem('maestria_lang', language);
    localStorage.setItem('maestria_last_view', view);
    document.documentElement.style.setProperty('--brand-color', companyInfo.brandColor);
  }, [companyInfo, language, view]);

  const handleLogin = (u: any) => {
    const finalUser: TeamMember = { id: Date.now().toString(), name: u.name, role: u.role, status: 'online' };
    setUser(finalUser);
  };

  if (!isLoaded) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-white mb-6" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Ecossistema MaestrIA...</p>
    </div>
  );

  if (!user) return <Auth onLogin={handleLogin} />;

  const t = translations[language];
  const trialDaysRemaining = companyInfo.trialStartDate ? Math.max(0, 60 - Math.floor((Date.now() - new Date(companyInfo.trialStartDate).getTime()) / (1000 * 60 * 60 * 24))) : 60;

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all duration-300 relative group ${active ? 'bg-slate-900 text-white shadow-2xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} style={active ? {color: companyInfo.brandColor} : {}} />
      <span className="tracking-tight uppercase text-[10px]">{label}</span>
      {active && <div className="absolute right-6 w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: companyInfo.brandColor}}></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <style>{`
        :root { --brand-color: ${companyInfo.brandColor}; }
        .text-brand { color: var(--brand-color); }
        .bg-brand { background-color: var(--brand-color); }
        .border-brand { border-color: var(--brand-color); }
      `}</style>

      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-100 flex-col p-8 z-20 shadow-sm">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl overflow-hidden">
             {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-7 h-7"/>}
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-900 tracking-tighter uppercase italic truncate max-w-[160px]">{companyInfo.name}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{color: companyInfo.brandColor}}>Enterprise OS</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <NavItem icon={LayoutDashboard} label={t.dashboard} active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} />
          <NavItem icon={FileText} label={t.transactions} active={view === ViewState.TRANSACTIONS} onClick={() => setView(ViewState.TRANSACTIONS)} />
          <NavItem icon={PieChart} label={t.ia} active={view === ViewState.REPORTS} onClick={() => setView(ViewState.REPORTS)} />
          <NavItem icon={CalendarIcon} label={t.agenda} active={view === ViewState.SCHEDULE} onClick={() => setView(ViewState.SCHEDULE)} />
          <NavItem icon={Users} label={t.partners} active={view === ViewState.CONTACTS} onClick={() => setView(ViewState.CONTACTS)} />
          <NavItem icon={MessageSquare} label={t.chat} active={view === ViewState.TEAM_CHAT} onClick={() => setView(ViewState.TEAM_CHAT)} />
        </nav>

        <div className="pt-8 border-t border-slate-100 space-y-3">
            <NavItem icon={SettingsIcon} label={t.settings} active={view === ViewState.SETTINGS} onClick={() => setView(ViewState.SETTINGS)} />
            <button onClick={() => { setUser(null); localStorage.removeItem('maestria_auth'); }} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-[10px] font-black text-slate-400 hover:text-rose-600 transition-all uppercase tracking-widest"><LogOut className="w-5 h-5"/> {t.logout}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 z-[140]">
          <div className="flex items-center gap-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{view}</h2>
              <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${isOnline ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {isOnline ? <CheckCircle2 className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>} {isOnline ? t.secure_system : t.offline_mode}
              </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                 <Clock className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{trialDaysRemaining} Dias Disponíveis</span>
             </div>
             <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] text-xs font-black bg-slate-950 text-white shadow-xl hover:scale-105 transition-all">
               <Sparkles className="w-4 h-4" style={{color: companyInfo.brandColor}} /> 
               <span>MAESTRIA AI</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 pb-40 lg:pb-12 bg-slate-50/50">
            <div className="max-w-[1400px] mx-auto h-full">
                {view === ViewState.DASHBOARD && <Dashboard transactions={transactions} language={language} />}
                {view === ViewState.TRANSACTIONS && <TransactionList transactions={transactions} onEditTransaction={(t) => setTransactions(prev => prev.map(o => o.id === t.id ? t : o))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onImportTransactions={(l) => setTransactions(prev => [...l, ...prev])} language={language} />}
                {view === ViewState.REPORTS && <Reports transactions={transactions} language={language} />}
                {view === ViewState.TEAM_CHAT && <CorporateChat currentUser={user} team={team} messages={corporateMessages} onSendMessage={(rid, txt, opt) => setCorporateMessages(prev => [...prev, {id: Date.now().toString(), senderId: user.id, receiverId: rid, text: txt, timestamp: new Date(), ...opt}])} onEditMessage={(id, t) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, text: t} : m))} onDeleteMessage={(id) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, isDeleted: true} : m))} language={language} />}
                {view === ViewState.SCHEDULE && <Schedule items={schedule} setItems={setSchedule} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} language={language} />}
                {view === ViewState.CONTACTS && <Contacts contacts={contacts} onAddContact={(c) => setContacts(p => [c, ...p])} onEditContact={(c) => setContacts(p => p.map(o => o.id === c.id ? c : o))} onDeleteContact={(id) => setContacts(p => p.filter(c => c.id !== id))} onImportContacts={(l) => setContacts(p => [...l, ...p])} language={language} />}
                {view === ViewState.SETTINGS && <Settings team={team} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} onUpdateMember={(m) => setTeam(prev => prev.map(o => o.id === m.id ? m : o))} language={language} setLanguage={setLanguage as any} allData={{transactions, contacts, schedule, team, corporateMessages}} />}
            </div>
        </div>
        <MobileNav currentView={view} onViewChange={setView} />
      </main>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} />
    </div>
  );
}

export default App;
