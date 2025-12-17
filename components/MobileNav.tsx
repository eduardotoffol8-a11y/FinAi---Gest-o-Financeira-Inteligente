
import React from 'react';
import { LayoutDashboard, FileText, PieChart, Calendar, MessageSquare, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface MobileNavProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Painel' },
    { id: ViewState.TRANSACTIONS, icon: FileText, label: 'Razão' },
    { id: ViewState.REPORTS, icon: PieChart, label: 'IA' },
    { id: ViewState.TEAM_CHAT, icon: MessageSquare, label: 'Chat' },
    { id: ViewState.SCHEDULE, icon: Calendar, label: 'Agenda' },
    { id: ViewState.SETTINGS, icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-md">
      <nav className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-around items-center shadow-2xl shadow-indigo-500/20">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 p-3 transition-all duration-300 relative ${isActive ? 'text-white' : 'text-slate-500'}`}
            >
              <div className={`transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
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
