
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutDashboard, PieChart, Users, Settings as SettingsIcon, Bell, Sparkles, Menu, FileText, Calendar as CalendarIcon, LogOut, UploadCloud, Plus, X, Loader2, CheckCircle2, Command, MessageSquare, Share2, Cloud, WifiOff, ShieldCheck, Clock } from 'lucide-react';
import { Transaction, ViewState, Contact, ScheduledItem, TeamMember, CorporateMessage, GeneratedReport } from './types';
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
import { sendMessageToGemini } from './services/geminiService';
import { translations } from './translations';

const STORAGE_KEY = 'maestria_enterprise_v9_ultimate';

function App() {
  const [user, setUser] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('maestria_auth');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [language, setLanguage] = useState<'pt-BR' | 'en-US' | 'es-ES'>(() => {
    return (localStorage.getItem('maestria_lang') as any) || 'pt-BR';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = translations[language];

  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('maestria_brand');
    try {
      return saved ? JSON.parse(saved) : {
        name: 'MAESTRIA',
        description: 'Plataforma de comando financeiro neural.',
        logo: null,
        trialStartDate: new Date().toISOString(),
        isSubscribed: true
      };
    } catch {
      return { name: 'MAESTRIA', description: 'Plataforma de comando financeiro neural.', logo: null, trialStartDate: new Date().toISOString(), isSubscribed: true };
    }
  });

  const trialDaysRemaining = companyInfo.trialStartDate ? Math.max(0, 60 - Math.floor((Date.now() - new Date(companyInfo.trialStartDate).getTime()) / (1000 * 60 * 60 * 24))) : 60;

  // Persistência da última aba acessada
  const [view, setView] = useState<ViewState>(() => {
    return (localStorage.getItem('maestria_last_view') as ViewState) || ViewState.DASHBOARD;
  });

  useEffect(() => {
    localStorage.setItem('maestria_last_view', view);
  }, [view]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [sharingModal, setSharingModal] = useState<{ open: boolean; item: any; type: 'transaction' | 'contact' }>({ open: false, item: null, type: 'transaction' });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [corporateMessages, setCorporateMessages] = useState<CorporateMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('maestria_brand', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    localStorage.setItem('maestria_lang', language);
  }, [language]);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTransactions(parsed.transactions || []);
          setContacts(parsed.contacts || []);
          setSchedule(parsed.schedule || []);
          setTeam(parsed.team || []);
          setCorporateMessages(parsed.corporateMessages || []);
        } catch (e) { console.error("Erro ao carregar dados:", e); }
      }
    };
    loadData();
    const handleStorageChange = (e: StorageEvent) => { if (e.key === STORAGE_KEY) loadData(); };
    window.addEventListener('storage', handleStorageChange);
    
    // Equipe inicial mais completa para apresentação
    setTeam(prev => prev.length > 0 ? prev : [
      { id: '1', name: 'CFO MaestrIA', role: 'admin', status: 'online', avatar: 'https://i.pravatar.cc/150?u=cfo' },
      { id: '2', name: 'Gestor Financeiro', role: 'leader', status: 'online', avatar: 'https://i.pravatar.cc/150?u=gestor' },
      { id: '3', name: 'Analista de Auditoria', role: 'member', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=analista' },
    ]);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (user) {
      setIsSaving(true);
      const data = { transactions, contacts, schedule, team, corporateMessages };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const timer = setTimeout(() => setIsSaving(false), 500);
      return () => clearTimeout(timer);
    }
  }, [transactions, contacts, schedule, team, corporateMessages, user]);

  const handleLogin = (u: any) => {
    if (u.isNew) { setShowSubscription(true); return; }
    const finalUser: TeamMember = { id: Date.now().toString(), name: u.name, role: u.role, status: 'online' };
    setUser(finalUser);
    localStorage.setItem('maestria_auth', JSON.stringify(finalUser));
    setTeam(prev => prev.some(m => m.name === finalUser.name) ? prev : [...prev, finalUser]);
  };

  const completeSubscription = () => {
    setShowSubscription(false);
    setCompanyInfo({ ...companyInfo, trialStartDate: new Date().toISOString(), isSubscribed: true });
    const finalUser: TeamMember = { id: Date.now().toString(), name: 'Diretor Enterprise', role: 'admin', status: 'online' };
    setUser(finalUser);
    localStorage.setItem('maestria_auth', JSON.stringify(finalUser));
    setTeam(prev => [...prev, finalUser]);
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('maestria_auth'); };

  const handleSendCorporateMessage = (receiverId: string, text: string, options?: Partial<CorporateMessage>) => {
    if (!user) return;
    const msg: CorporateMessage = { id: Date.now().toString(), senderId: user.id, receiverId, text, timestamp: new Date(), ...options };
    setCorporateMessages(prev => [...prev, msg]);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all duration-300 relative group ${active ? 'bg-slate-900 text-white shadow-2xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-indigo-400' : ''}`} />
      <span className="tracking-tight uppercase text-[10px]">{label}</span>
      {active && <div className="absolute right-6 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
    </button>
  );

  if (showSubscription) return <Subscription onConfirm={completeSubscription} onCancel={() => setShowSubscription(false)} />;
  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-100 flex-col p-8 z-20 shadow-sm">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl overflow-hidden">
             {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-7 h-7"/>}
          </div>
          <div><h1 className="font-black text-xl text-slate-900 tracking-tighter uppercase italic truncate max-w-[160px]">{companyInfo.name}</h1><p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] mt-1">MaestrIA Enterprise</p></div>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem icon={LayoutDashboard} label={t.dashboard} active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} />
          <NavItem icon={FileText} label={t.transactions} active={view === ViewState.TRANSACTIONS} onClick={() => setView(ViewState.TRANSACTIONS)} />
          <NavItem icon={PieChart} label={t.ia} active={view === ViewState.REPORTS} onClick={() => setView(ViewState.REPORTS)} />
          <NavItem icon={MessageSquare} label={t.chat} active={view === ViewState.TEAM_CHAT} onClick={() => setView(ViewState.TEAM_CHAT)} />
          <NavItem icon={CalendarIcon} label={t.agenda} active={view === ViewState.SCHEDULE} onClick={() => setView(ViewState.SCHEDULE)} />
          <NavItem icon={Users} label={t.partners} active={view === ViewState.CONTACTS} onClick={() => setView(ViewState.CONTACTS)} />
        </nav>
        <div className="pt-8 border-t border-slate-100 space-y-3">
            <NavItem icon={SettingsIcon} label={t.settings} active={view === ViewState.SETTINGS} onClick={() => setView(ViewState.SETTINGS)} />
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-[10px] font-black text-slate-400 hover:text-rose-600 transition-all uppercase tracking-widest"><LogOut className="w-5 h-5"/> {t.logout}</button>
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
             {companyInfo.trialStartDate && (
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{trialDaysRemaining} Dias Restantes</span>
                </div>
             )}
             <button onClick={() => setIsChatOpen(!isChatOpen)} className="flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] text-xs font-black bg-slate-950 text-white shadow-xl hover:scale-105 transition-all"><Sparkles className="w-4 h-4 text-indigo-400" /> <span>MAESTRIA - GPT</span></button>
             <div className="w-12 h-12 rounded-[1.25rem] bg-slate-950 flex items-center justify-center text-white font-black italic shadow-2xl border-4 border-white">{user.name.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 pb-40 lg:pb-12 bg-slate-50/50">
            <div className="max-w-[1400px] mx-auto h-full">
                {view === ViewState.DASHBOARD && <Dashboard transactions={transactions} onViewChange={setView} language={language} />}
                {view === ViewState.TRANSACTIONS && <TransactionList transactions={transactions} onEditTransaction={(t) => setTransactions(prev => prev.map(o => o.id === t.id ? t : o))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onImportTransactions={(l) => setTransactions(prev => [...l, ...prev])} onShareToChat={(i) => { setSharingModal({ open: true, item: i, type: 'transaction' }); }} language={language} />}
                {view === ViewState.REPORTS && <Reports transactions={transactions} language={language} />}
                {view === ViewState.TEAM_CHAT && <CorporateChat currentUser={user} team={team} messages={corporateMessages} onSendMessage={handleSendCorporateMessage} onEditMessage={(id, t) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, text: t, isEdited: true} : m))} onDeleteMessage={(id) => setCorporateMessages(prev => prev.map(m => m.id === id ? {...m, isDeleted: true} : m))} onSwitchIdentity={(u) => setUser(u)} language={language} />}
                {view === ViewState.SCHEDULE && <Schedule items={schedule} setItems={setSchedule} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} language={language} />}
                {view === ViewState.CONTACTS && <Contacts contacts={contacts} onAddContact={(c) => setContacts(p => [c, ...p])} onEditContact={(c) => setContacts(p => p.map(o => o.id === c.id ? c : o))} onDeleteContact={(id) => setContacts(p => p.filter(c => c.id !== id))} onImportContacts={(l) => setContacts(p => [...l, ...p])} onShareToChat={(i) => { setSharingModal({ open: true, item: i, type: 'contact' }); }} language={language} />}
                {view === ViewState.SETTINGS && <Settings team={team} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} currentRole={user.role} onUpdateMember={handleUpdateTeamMember} language={language} setLanguage={setLanguage as any} allData={{ transactions, contacts, schedule, team, corporateMessages }} />}
            </div>
        </div>
        <MobileNav currentView={view} onViewChange={setView} />
      </main>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} />
      {sharingModal.open && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-white/20">
             <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-slate-900 italic">Compartilhar</h3><button onClick={() => setSharingModal({ open: false, item: null, type: 'transaction' })} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400"/></button></div>
             <div className="space-y-3">
                {team.filter(m => m.id !== user.id).map(member => (
                   <button key={member.id} onClick={() => { handleSendCorporateMessage(member.id, `Compartilhando ${sharingModal.type}`, { sharedItem: { type: sharingModal.type, data: sharingModal.item } }); setSharingModal({ open: false, item: null, type: 'transaction' }); setView(ViewState.TEAM_CHAT); }} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-200 transition-all"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic">{member.name.charAt(0)}</div><div className="text-left"><p className="font-bold text-sm text-slate-900 uppercase">{member.name}</p><span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{member.role}</span></div></div><Share2 className="w-4 h-4 text-slate-300" /></button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
