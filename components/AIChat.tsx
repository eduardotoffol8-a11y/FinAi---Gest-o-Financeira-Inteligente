
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Check, FileText, Brain } from 'lucide-react';
import { sendMessageToGemini, analyzeDocument } from '../services/geminiService';
import { ChatMessage, Transaction } from '../types';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  initialPrompt?: string | null;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, onAddTransaction, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou a MaestrIA, sua consultora neural de finanças. Em que posso auxiliá-lo hoje?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; url: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) setInputValue(initialPrompt);
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachments: attachedImage ? [{ type: 'image', url: attachedImage.url, base64: attachedImage.base64 }] : undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);
    const currentImage = attachedImage;
    setAttachedImage(null);

    try {
      if (currentImage) {
         // Tenta analisar com contexto de categorias (carregadas do storage se possível)
         const savedData = localStorage.getItem('maestria_v11_enterprise_stable');
         const categories = savedData ? JSON.parse(savedData).categories : [];
         
         const jsonStr = await analyzeDocument(currentImage.base64.split(',')[1], currentImage.type, 'transaction', categories);
         const data = JSON.parse(jsonStr);
         if (data.amount) {
            const draft: Omit<Transaction, 'id'> = {
                date: data.date || new Date().toISOString().split('T')[0],
                description: data.description || 'Scan IA Neural',
                category: data.category || (categories[0] || 'Operacional'),
                amount: Number(data.amount) || 0,
                type: data.type === 'income' ? 'income' : 'expense',
                status: 'pending',
                source: 'ai',
                supplier: data.supplier || '',
                paymentMethod: data.paymentMethod || '',
                costCenter: data.costCenter || ''
            };

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: `Identifiquei um registro de R$ ${draft.amount} para a categoria ${draft.category}. Deseja efetivar o lançamento?`,
                timestamp: new Date(),
                isDraft: true,
                draftData: draft
            }]);
            setIsLoading(false);
            return;
         }
      }

      const responseText = await sendMessageToGemini(newUserMsg.text, []);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', text: 'Chave MaestrIA pendente. Verifique suas configurações neurais.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-[200] flex flex-col">
      <div className="h-24 flex items-center justify-between px-8 bg-slate-950 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
             <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl italic tracking-tight">MaestrIA</h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Sistema Ativo
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[1.5rem] p-6 shadow-xl relative text-sm font-medium leading-relaxed ${
                msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.isDraft && msg.draftData && (
                  <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <div className="space-y-3 mb-5">
                          <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                              <span>Valor Detectado</span>
                              <span className="text-slate-900">R$ {msg.draftData.amount}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                              <span>Categoria</span>
                              <span className="text-indigo-600 italic">{msg.draftData.category}</span>
                          </div>
                      </div>
                      <button onClick={() => { 
                        if (msg.draftData) {
                          onAddTransaction(msg.draftData); 
                          setMessages(p => p.map(m => m.id === msg.id ? {...m, isDraft: false, text: 'Lançamento efetivado com sucesso no OS MaestrIA.'} : m));
                        }
                      }} className="w-full bg-indigo-600 text-white text-xs font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">EFETIVAR LANÇAMENTO</button>
                  </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-4 items-center bg-slate-100 p-4 rounded-2xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Comande sua Inteligência Financeira..."
            className="flex-1 bg-transparent focus:outline-none text-sm text-slate-900 font-bold"
          />
          <button onClick={handleSendMessage} disabled={isLoading} className="p-2.5 bg-slate-950 text-white rounded-xl shadow-lg">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
