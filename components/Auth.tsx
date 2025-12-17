
import React, { useState } from 'react';
import { Lock, User, Command, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

interface AuthProps {
  onLogin: (user: { name: string; role: 'admin' | 'member'; isNew?: boolean }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'admin' | 'member'>('admin');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: email.split('@')[0] || 'Gestor', role, isNew: isRegistering });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ring-4 ring-slate-50">
              <Command className="w-8 h-8"/>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">MaestrIA Enterprise</h1>
            <p className="text-slate-500 font-medium mt-2">{isRegistering ? 'Cadastre sua empresa' : 'Plataforma de Comando Neural'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
               <input 
                  type="email" 
                  placeholder="E-mail corporativo" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
               />
               <input 
                  type="password" 
                  placeholder="Senha segura" 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
               />
            </div>

            {!isRegistering && (
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>ADMIN</button>
                  <button type="button" onClick={() => setRole('member')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${role === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>MEMBRO</button>
              </div>
            )}

            <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
              {isRegistering ? 'Criar Conta Enterprise' : 'Iniciar Sessão'} <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[10px] font-black uppercase text-indigo-500 tracking-widest hover:text-indigo-700 transition"
                >
                  {isRegistering ? 'Já tenho acesso' : 'Quero criar uma nova conta'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
