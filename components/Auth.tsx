
import React, { useState } from 'react';
import { Lock, User, Command, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: { name: string; role: 'admin' | 'member' }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'admin' | 'member'>('admin');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: email.split('@')[0] || 'Gestor', role });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-slate-200 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ring-4 ring-slate-50">
              <Command className="w-8 h-8"/>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">FinAI Enterprise</h1>
            <p className="text-slate-500 font-medium mt-2">Acesse sua célula de comando financeiro</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="E-mail corporativo" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
               </div>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Senha de acesso" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
               </div>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}
                >
                    <ShieldCheck className="w-4 h-4"/> ADMIN
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('member')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${role === 'member' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}
                >
                    <User className="w-4 h-4"/> MEMBRO
                </button>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group">
              Entrar no Sistema
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">© 2023 FinAI Enterprise OS. V2.5.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
