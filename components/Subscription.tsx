
import React from 'react';
import { Check, Rocket, ShieldCheck, Zap, Brain, CreditCard, ArrowRight, MessageSquare, Star, Shield, Lock, Users } from 'lucide-react';

interface SubscriptionProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ onConfirm, onCancel }) => {
  const benefits = [
    { icon: Brain, title: "CFO Neural 24/7", desc: "Auditoria contínua para evitar fraudes e erros operacionais." },
    { icon: Zap, title: "Economia de 15h/semana", desc: "Automação total de lançamentos via Visão Computacional." },
    { icon: ShieldCheck, title: "Backup Militar", desc: "Dados criptografados com opção de exportação local total." },
    { icon: Users, title: "Sincronia de Equipe", desc: "Chat corporativo real com compartilhamento de ativos financeiros." }
  ];

  return (
    <div className="fixed inset-0 z-[250] bg-white flex flex-col overflow-y-auto">
      {/* Header de Vendas */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white"><Rocket className="w-6 h-6"/></div>
            <span className="font-black italic text-xl uppercase tracking-tighter">MaestrIA Enterprise</span>
         </div>
         <button onClick={onCancel} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900">Já sou cliente</button>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center pt-10">
          
          <div className="lg:col-span-7 space-y-10">
              <div>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">O Futuro da Gestão Financeira</span>
                <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-slate-950 leading-[0.9] mt-6">
                  Seu Financeiro <br/> <span className="text-indigo-600">No Piloto Automático.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium mt-8 leading-relaxed max-w-2xl">
                    Unimos Inteligência Artificial de última geração com ferramentas de auditoria profissional para empresas que não aceitam menos que a excelência.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {benefits.map((b, i) => (
                      <div key={i} className="flex gap-4">
                          <div className="p-3 bg-slate-50 rounded-2xl text-slate-900 h-fit"><b.icon className="w-6 h-6"/></div>
                          <div>
                              <h4 className="font-black text-slate-900 uppercase text-sm">{b.title}</h4>
                              <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{b.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="p-8 bg-indigo-50 rounded-[2.5rem] flex items-center gap-6 border border-indigo-100">
                  <div className="flex -space-x-4">
                      <img className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src="https://i.pravatar.cc/150?u=1" />
                      <img className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src="https://i.pravatar.cc/150?u=2" />
                      <img className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src="https://i.pravatar.cc/150?u=3" />
                  </div>
                  <p className="text-sm font-bold text-indigo-900 italic">"Economizamos R$ 12k em multas no primeiro mês com a auditoria da MaestrIA."</p>
              </div>
          </div>

          <div className="lg:col-span-5">
              <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full -mr-20 -mt-20 flex items-end justify-center pb-8 pr-8">
                      <Star className="w-8 h-8 text-white animate-pulse" />
                  </div>

                  <div className="text-center mb-10">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Oferta Exclusiva</h3>
                      <div className="flex items-center justify-center gap-2">
                          <span className="text-slate-400 line-through font-bold">R$ 498,55</span>
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">GRÁTIS HOJE</span>
                      </div>
                  </div>

                  <div className="space-y-6 mb-10">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Período de Experiência</p>
                              <p className="text-lg font-black text-slate-900">60 DIAS GRÁTIS</p>
                          </div>
                          <Check className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Investimento Pós-Teste</p>
                              <p className="text-lg font-black text-slate-900">R$ 498,55<span className="text-xs font-bold text-slate-400">/mês</span></p>
                          </div>
                          <CreditCard className="w-6 h-6 text-indigo-500" />
                      </div>
                  </div>

                  <button 
                      onClick={onConfirm}
                      className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs group"
                  >
                      Começar Teste de 60 Dias <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </button>

                  <div className="mt-8 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 opacity-30">
                          <Shield className="w-4 h-4"/>
                          <span className="text-[8px] font-black uppercase">AES-256 Encrypted</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-30">
                          <Lock className="w-4 h-4"/>
                          <span className="text-[8px] font-black uppercase">PCI-DSS Compliant</span>
                      </div>
                  </div>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Subscription;
