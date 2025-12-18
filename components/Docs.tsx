
import React from 'react';
import { Sparkles, Brain, FileSearch, ShieldCheck, Zap, Bot, Cpu, Globe, Database, FileText, PieChart, Users, Calendar, MessageSquare, Settings, CheckCircle2, CloudLightning } from 'lucide-react';

const Docs: React.FC = () => {
    const modules = [
        {
            icon: PieChart,
            title: "Painel de Comando (Dashboard)",
            desc: "Visualização central de KPI's financeiros. Monitora Lucro Líquido, Margem Operacional e Distribuição de Custos.",
            details: "Operação: Clique nos cards de 'Receita' ou 'Despesa' para navegar diretamente para a lista filtrada de transações."
        },
        {
            icon: FileText,
            title: "Razão & Lançamentos",
            desc: "O coração contábil do sistema. Gerencia o fluxo de caixa histórico e futuro.",
            details: "IA Sync: Utilize o botão 'Scan Universal' para processar fotos de notas fiscais ou PDFs de extratos bancários automaticamente."
        },
        {
            icon: Brain,
            title: "CFO Virtual IA",
            desc: "Motor de análise neural que gera Relatórios Executivos (DRE), Auditorias de Risco e Planos Estratégicos.",
            details: "Funcionalidade: A IA compara seus gastos com padrões de mercado e sugere onde otimizar o capital para maior liquidez."
        },
        {
            icon: Calendar,
            title: "Agenda de Compromissos",
            desc: "Sistema de previsão de fluxo. Permite o agendamento de contas a pagar e a receber com integração em nuvem.",
            details: "Sincronização: Integre com Google ou Outlook para que seus compromissos financeiros apareçam no seu calendário pessoal."
        },
        {
            icon: Users,
            title: "CRM de Parceiros",
            desc: "Base de dados de Clientes, Fornecedores e Sócios Híbridos com inteligência de classificação.",
            details: "Vantagem: O Scan de Parceiros identifica automaticamente o endereço sede, CNPJ e e-mail a partir de listas ou cartões de visita."
        },
        {
            icon: MessageSquare,
            title: "Corporate Chat",
            desc: "Canal de comunicação interno seguro para a diretoria e equipe financeira.",
            details: "Atalhos: Compartilhe transações ou perfis de clientes diretamente na conversa para decisões rápidas em tempo real."
        }
    ];

    const techStack = [
        {
            icon: FileSearch,
            title: "OCR Neural 3.0",
            desc: "Leitura instantânea de documentos com extração de 98% dos campos fiscais.",
            tags: ["VISÃO COMPUTACIONAL", "AI-OCR"]
        },
        {
            icon: ShieldCheck,
            title: "Auditoria Atômica",
            desc: "Detecção automática de faturas duplicadas ou inconsistências de valores no lançamento.",
            tags: ["COMPLIANCE", "AUDIT"]
        },
        {
            icon: CloudLightning,
            title: "Auto-Save Enterprise",
            desc: "Cada pixel alterado é salvo instantaneamente no cofre local, garantindo zero perda de dados.",
            tags: ["STABILITY", "VAULT"]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Manual de Operações MaestrIA OS</span>
                </div>
                <h1 className="text-6xl font-black text-slate-950 italic uppercase tracking-tighter mb-6">O Guia da <span className="text-indigo-600">Soberania Financeira</span></h1>
                <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                    Domine todas as funcionalidades da MaestrIA OS e transforme sua contabilidade em uma vantagem competitiva estratégica.
                </p>
            </div>

            <div className="space-y-12 mb-20">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter border-l-8 border-indigo-600 pl-6">Manual de Funcionalidades</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <mod.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter mb-2">{mod.title}</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4">{mod.desc}</p>
                            <div className="flex items-start gap-2 bg-indigo-50/50 p-4 rounded-xl">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5" />
                                <p className="text-[10px] text-indigo-900 font-bold italic leading-tight">{mod.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-950 rounded-[4rem] p-16 text-white overflow-hidden relative mb-20">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Cpu className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Dicas de Operação Master</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h4 className="font-black uppercase text-indigo-400 text-xs tracking-[0.2em]">Soberania de Backup</h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Vá em <span className="text-white">Configurações > Vault de Soberania</span> toda sexta-feira. Baixe o backup total (.json). Isso garante que, mesmo sem internet ou cache limpo, seu financeiro esteja seguro.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black uppercase text-emerald-400 text-xs tracking-[0.2em]">Identidade de Marca</h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Complete o Perfil Corporativo em Configurações. Nome, CNPJ e Endereço aparecerão automaticamente em todos os Relatórios PDF e Contratos, dando um ar profissional de multinacional.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {techStack.map((cap, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="p-4 bg-slate-50 text-slate-950 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <cap.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter mb-3">{cap.title}</h3>
                        <p className="text-slate-500 font-medium text-xs leading-relaxed mb-6">{cap.desc}</p>
                        <div className="flex gap-2">
                            {cap.tags.map(tag => (
                                <span key={tag} className="text-[8px] font-black text-slate-400 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Docs;
