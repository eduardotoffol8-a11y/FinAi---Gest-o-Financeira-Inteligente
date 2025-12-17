
import React from 'react';
import { Check, Rocket, ShieldCheck, Zap, Brain, CreditCard, ArrowRight, MessageSquare } from 'lucide-react';

interface SubscriptionProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ onConfirm, onCancel }) => {
  const benefits = [
    { icon: Brain, title: "Auditoria Neural MaestrIA", desc: "IA nível Big Four auditando cada centavo do seu negócio." },
    { icon: MessageSquare, title: "MaestrIA Connect Real", desc: "Chat corporativo seguro com persistência e troca de arquivos." },
    { icon: Zap, title: "Automação de Notas", desc: "Upload de arquivos com extração automática de dados via visão computacional." },
    { icon: ShieldCheck, title: "Governança de Cargos", desc: "Controle quem vê o quê com permissões de Admin, Líder e Membro." }
  ];

  return (
    <div className="fixed inset-0 z-[250] bg-slate-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="p-12 lg:p-16 bg-slate-950 text-white flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Rocket className="w-6 h-6"/></div>
                <span className="font-black italic uppercase tracking-tighter text-xl">MaestrIA Enterprise</span>
            </div>
            
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-8 leading-tight">Domine suas finanças com inteligência absoluta.</h2>
            
            <div className="space-y-8">
                {benefits.map((b, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="p-2 bg-white/10 rounded-lg text-indigo-400"><b.icon className="w-5 h-5"/></div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">{b.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{b.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-12 lg:p-16 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Plano Enterprise Anual</span>
            <div className="mb-10">
                <span className="text-2xl font-black text-slate-400 align-top">R$</span>
                <span className="text-7xl font-black text-slate-900 tracking-tighter">498,55</span>
                <span className="text-slate-400 font-bold">/mês</span>
            </div>

            <div className="w-full space-y-4 mb-10">
                <div className="flex items-center gap-3 justify-center text-emerald-600 text-xs font-black uppercase tracking-widest">
                    <Check className="w-5 h-5"/> Acesso Imediato
                </div>
                <p className="text-slate-400 text-[10px] uppercase font-black">Cobrança mensal no cartão corporativo</p>
            </div>

            <button 
                onClick={onConfirm}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
                Ativar Minha Licença MaestrIA <ArrowRight className="w-5 h-5"/>
            </button>
            
            <button onClick={onCancel} className="mt-6 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">Voltar</button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
