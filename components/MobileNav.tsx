
import React from 'react';
import { LayoutDashboard, FileText, PieChart, Calendar, MessageSquare, Settings, Users } from 'lucide-react';
import { ViewState } from '../types';

interface MobileNavProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Início' },
    { id: ViewState.TRANSACTIONS, icon: FileText, label: 'Razão' },
    { id: ViewState.REPORTS, icon: PieChart, label: 'IA' },
    { id: ViewState.SCHEDULE, icon: Calendar, label: 'Agenda' },
    { id: ViewState.CONTACTS, icon: Users, label: 'Sócios' }, // Item Sócios/Parceiros garantido
    { id: ViewState.TEAM_CHAT, icon: MessageSquare, label: 'Chat' },
    { id: ViewState.SETTINGS, icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[95%] max-w-lg">
      <nav className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-1.5 flex justify-around items-center shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2.5 transition-all duration-300 relative ${isActive ? 'text-white' : 'text-slate-500'}`}
            >
              <div className={`transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-400' : ''}`} />
              </div>
              <span className={`text-[7px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
