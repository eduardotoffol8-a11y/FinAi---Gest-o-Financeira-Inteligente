
import React from 'react';
import { LayoutDashboard, FileText, PieChart, Calendar, MessageSquare, Users, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface MobileNavProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Geral' },
    { id: ViewState.TRANSACTIONS, icon: FileText, label: 'Razão' },
    { id: ViewState.REPORTS, icon: PieChart, label: 'IA' },
    { id: ViewState.TEAM_CHAT, icon: MessageSquare, label: 'Chat' },
    { id: ViewState.SCHEDULE, icon: Calendar, label: 'Agenda' },
    { id: ViewState.SETTINGS, icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 pb-safe-area pt-2 z-[150] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-around items-center max-w-full mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 shadow-inner' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
