
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutDashboard, PieChart, Users, Settings as SettingsIcon, Bell, Sparkles, Menu, FileText, Calendar as CalendarIcon, LogOut, UploadCloud, Plus, X, Loader2, CheckCircle2, Command, MessageSquare, Share2, Cloud } from 'lucide-react';
import { Transaction, ViewState, Contact, ScheduledItem, TeamMember, CorporateMessage } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Schedule from './components/Schedule';
import Contacts from './components/Contacts';
import Settings from './components/Settings';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import MobileNav from './components/MobileNav';
import CorporateChat from './components/CorporateChat';

const STORAGE_KEY = 'finai_enterprise_v5';

function App() {
  const [user, setUser] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('finai_auth_v5');
    return saved ? JSON.parse(saved) : null;
  });

  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('finai_company_brand');
    return saved ? JSON.parse(saved) : {
      name: 'FINAI ENTERPRISE',
      description: 'Célula de comando financeiro corporativo.',
      logo: null
    };
  });

  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sharingModal, setSharingModal] = useState<{ open: boolean; item: any; type: 'transaction' | 'contact' }>({ open: false, item: null, type: 'transaction' });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [corporateMessages, setCorporateMessages] = useState<CorporateMessage[]>([]);

  const updateCompanyInfo = useCallback((info: any) => {
    setCompanyInfo(info);
  }, []);

  useEffect(() => {
    localStorage.setItem('finai_company_brand', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let parsedData: any = null;
    
    if (saved) {
      try {
        parsedData = JSON.parse(saved);
        setTransactions(parsedData.transactions || []);
        setContacts(parsedData.contacts || []);
        setSchedule(parsedData.schedule || []);
        setTeam(parsedData.team || []);
        setCorporateMessages(parsedData.corporateMessages || []);
      } catch (e) {
        console.error("Erro ao carregar dados locais:", e);
      }
    }
    
    // Inicialização da equipe caso esteja vazia ou parse falhou
    const hasTeam = parsedData?.team && parsedData.team.length > 0;
    if (!hasTeam) {
      setTeam([
        { id: '1', name: 'Admin FinAI', role: 'admin', status: 'online', avatar: 'https://i.pravatar.cc/150?u=admin' },
        { id: '2', name: 'Gestor Comercial', role: 'leader', status: 'online', avatar: 'https://i.pravatar.cc/150?u=leader' },
        { id: '3', name: 'Analista Financeiro', role: 'member', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=member' },
      ]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsSaving(true);
      const dataToSave = { transactions, contacts, schedule, team, corporateMessages };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      const timer = setTimeout(() => setIsSaving(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [transactions, contacts, schedule, team, corporateMessages, user]);

  const handleLogin = (u: any) => {
    const existing = team.find(m => m.name.toLowerCase() === u.name.toLowerCase());
    const finalUser: TeamMember = existing || { 
      id: Date.now().toString(), 
      name: u.name, 
      role: u.role, 
      status: 'online', 
      avatar: `https://i.pravatar.cc/150?u=${u.name}` 
    };
    setUser(finalUser);
    localStorage.setItem('finai_auth_v5', JSON.stringify(finalUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('finai_auth_v5');
  };

  const handleSendCorporateMessage = (receiverId: string, text: string, options?: Partial<CorporateMessage>) => {
    if (!user) return;
    const newMessage: CorporateMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      text,
      timestamp: new Date(),
      ...options
    };
    setCorporateMessages(prev => [...prev, newMessage]);
  };

  const handleEditCorporateMessage = (id: string, newText: string) => {
    setCorporateMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText, isEdited: true } : m));
  };

  const handleDeleteCorporateMessage = (id: string) => {
    setCorporateMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true, text: 'Mensagem apagada' } : m));
  };

  const handlePromoteMember = (id: string, role: 'admin' | 'leader' | 'member') => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  };

  const handleShareToChat = (item: any, type: 'transaction' | 'contact') => {
    setSharingModal({ open: true, item, type });
  };

  const confirmShare = (receiverId: string) => {
    handleSendCorporateMessage(receiverId, `Discussão sobre: ${sharingModal.item.description || sharingModal.item.name}`, { 
      sharedItem: { type: sharingModal.type, data: sharingModal.item } 
    });
    setSharingModal({ open: false, item: null, type: 'transaction' });
    setView(ViewState.TEAM_CHAT);
  };

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all duration-300 relative overflow-hidden group ${
        active 
        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-indigo-400' : ''}`} />
      <span className="relative z-10 tracking-tight uppercase text-[10px]">{label}</span>
      {active && <div className="absolute right-6 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
    </button>
  );

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-100 flex-col p-8 z-20 shadow-[8px_0_32px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl ring-4 ring-slate-50 overflow-hidden">
             {companyInfo.logo ? <img src={companyInfo.logo} className="w-full h-full object-cover" /> : <Command className="w-7 h-7"/>}
          </div>
          <div>
              <h1 className="font-black text-xl text-slate-900 tracking-tighter leading-none truncate max-w-[160px] uppercase italic">{companyInfo.name}</h1>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] mt-1">Enterprise OS</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={LayoutDashboard} label="Painel" active={view === ViewState.DASHBOARD} onClick={() => setView(ViewState.DASHBOARD)} />
          <NavItem icon={FileText} label="Lançamentos" active={view === ViewState.TRANSACTIONS} onClick={() => setView(ViewState.TRANSACTIONS)} />
          <NavItem icon={MessageSquare} label="Chat Equipe" active={view === ViewState.TEAM_CHAT} onClick={() => setView(ViewState.TEAM_CHAT)} />
          <NavItem icon={CalendarIcon} label="Agenda Sync" active={view === ViewState.SCHEDULE} onClick={() => setView(ViewState.SCHEDULE)} />
          <NavItem icon={Users} label="Parceiros" active={view === ViewState.CONTACTS} onClick={() => setView(ViewState.CONTACTS)} />
        </nav>

        <div className="pt-8 border-t border-slate-100 space-y-3">
            <NavItem icon={SettingsIcon} label="Configurações" active={view === ViewState.SETTINGS} onClick={() => setView(ViewState.SETTINGS)} />
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-[10px] font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest">
                <LogOut className="w-5 h-5"/> Sair
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#f8fafc]">
        <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 z-[140] sticky top-0">
          <div className="flex items-center gap-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight lg:text-2xl uppercase italic">
                  {view.replace('_', ' ')}
              </h2>
              <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${isSaving ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isSaving ? 'SINC...' : 'SISTEMA SEGURO'}
              </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button onClick={() => setIsChatOpen(!isChatOpen)} className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] text-xs font-black transition-all border shadow-2xl active:scale-95 group relative overflow-hidden ${isChatOpen ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-100 hover:border-indigo-200'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Sparkles className="w-4 h-4 text-indigo-500 group-hover:rotate-12 transition-transform" /> <span className="hidden sm:inline">FINAI - GPT</span>
             </button>
             
             <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-black text-slate-900 leading-none">{user.name.toUpperCase()}</span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{user.role}</span>
                </div>
                <div className="w-12 h-12 rounded-[1.25rem] bg-slate-950 border-4 border-white shadow-2xl overflow-hidden ring-1 ring-slate-100 cursor-pointer hover:rotate-6 transition-transform">
                   {user.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white font-black italic">{user.name.charAt(0)}</div>
                   )}
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 pb-40 lg:pb-12 scroll-smooth">
            <div className="max-w-[1400px] mx-auto h-full">
                {view === ViewState.DASHBOARD && <Dashboard transactions={transactions} onViewChange={setView} />}
                {view === ViewState.TRANSACTIONS && <TransactionList transactions={transactions} onEditTransaction={(t) => setTransactions(prev => prev.map(old => old.id === t.id ? t : old))} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onImportTransactions={(l) => setTransactions(prev => [...l, ...prev])} onShareToChat={(item) => handleShareToChat(item, 'transaction')} />}
                {view === ViewState.TEAM_CHAT && <CorporateChat currentUser={user} team={team} messages={corporateMessages} onSendMessage={handleSendCorporateMessage} onEditMessage={handleEditCorporateMessage} onDeleteMessage={handleDeleteCorporateMessage} />}
                {view === ViewState.REPORTS && <Reports transactions={transactions} />}
                {view === ViewState.SCHEDULE && <Schedule items={schedule} setItems={setSchedule} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} />}
                {view === ViewState.CONTACTS && <Contacts contacts={contacts} onAddContact={(c) => setContacts(prev => [c, ...prev])} onEditContact={(c) => setContacts(prev => prev.map(old => old.id === c.id ? c : old))} onDeleteContact={(id) => setContacts(prev => prev.filter(c => c.id !== id))} onImportContacts={(l) => setContacts(prev => [...l, ...prev])} onShareToChat={(item) => handleShareToChat(item, 'contact')} />}
                {view === ViewState.SETTINGS && <Settings team={team} onPromote={handlePromoteMember} currentRole={user.role} companyInfo={companyInfo} setCompanyInfo={updateCompanyInfo} />}
            </div>
        </div>
        
        <MobileNav currentView={view} onViewChange={setView} />
      </main>

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onAddTransaction={(t) => setTransactions(prev => [{...t, id: Date.now().toString()}, ...prev])} />

      {sharingModal.open && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-white/20">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Compartilhar</h3>
                <button onClick={() => setSharingModal({ open: false, item: null, type: 'transaction' })} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
             </div>
             <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {team.filter(m => m.id !== user.id).map(member => (
                   <button 
                      key={member.id} 
                      onClick={() => confirmShare(member.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-200 transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center text-white font-black italic">
                            {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-slate-900">{member.name}</p>
                            <span className="text-[10px] font-black uppercase text-indigo-500">{member.role}</span>
                         </div>
                      </div>
                      <Share2 className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                   </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
