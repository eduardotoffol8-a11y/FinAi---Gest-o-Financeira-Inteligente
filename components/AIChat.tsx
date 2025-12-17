
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Check, FileText, Brain } from 'lucide-react';
import { sendMessageToGemini, analyzeReceipt } from '../services/geminiService';
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
      text: 'Olá! Sou o FinAI, seu parceiro de gestão. Como posso te ajudar a melhorar seus números hoje?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; url: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
        setInputValue(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachments: attachedImage
        ? [{ type: 'image', url: attachedImage.url, base64: attachedImage.base64 }]
        : undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);
    const currentImage = attachedImage;
    setAttachedImage(null);

    try {
      if (currentImage) {
         const analyzingId = 'analyzing-' + Date.now();
         setMessages(prev => [...prev, {
             id: analyzingId,
             role: 'model',
             text: 'FinAI está analisando seu documento...',
             timestamp: new Date()
         }]);

         const jsonStr = await analyzeReceipt(currentImage.base64.split(',')[1], currentImage.type);
         setMessages(prev => prev.filter(m => m.id !== analyzingId));

         try {
             const data = JSON.parse(jsonStr);
             if (data.amount) {
                 const draftTx: Omit<Transaction, 'id'> = {
                     amount: data.amount,
                     category: data.category || 'Geral',
                     date: data.date || new Date().toISOString().split('T')[0],
                     description: data.description || 'Lançamento FinAI',
                     status: 'pending',
                     type: data.type || 'expense',
                     attachmentUrl: currentImage.url,
                     supplier: data.supplier,
                     source: 'ai'
                 };
                 
                 setMessages((prev) => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    text: 'Análise concluída. Tudo certo com este lançamento?',
                    timestamp: new Date(),
                    isDraft: true,
                    draftData: draftTx
                 }]);
                 setIsLoading(false);
                 return;
             }
         } catch (e) {}
      }

      const responseText = await sendMessageToGemini(newUserMsg.text, []);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Tive um pequeno tropeço técnico. Pode repetir?',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDraft = (msgId: string, draftData: Omit<Transaction, 'id'>) => {
      onAddTransaction(draftData);
      setMessages(prev => prev.map(msg => {
          if (msg.id === msgId) {
              return { ...msg, isDraft: false, text: `Lançamento confirmado! R$ ${draftData.amount} adicionado ao fluxo.` };
          }
          return msg;
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-[200] flex flex-col font-sans">
      <div className="h-24 flex items-center justify-between px-8 bg-slate-950 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
             <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl leading-tight tracking-tight italic">FinAI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ativo • Consultor Virtual</p>
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
            <div className={`max-w-[85%] rounded-[1.5rem] p-6 shadow-sm relative text-sm font-medium leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-xl'
              }`}>
              {msg.attachments?.[0] && (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-100">
                  <img src={msg.attachments[0].url} className="w-full h-auto max-h-48 object-cover" alt="anexo"/>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.isDraft && msg.draftData && (
                  <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <div className="space-y-3 mb-5">
                          <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                              <span>Valor</span>
                              <span className="text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(msg.draftData.amount)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black uppercase text-slate-400 tracking-widest">
                              <span>Data</span>
                              <span className="text-slate-900">{msg.draftData.date}</span>
                          </div>
                      </div>
                      <button onClick={() => handleConfirmDraft(msg.id, msg.draftData!)} className="w-full bg-indigo-600 text-white text-xs font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition">APROVAR AGORA</button>
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
            placeholder="Mande uma mensagem para o FinAI..."
            className="flex-1 bg-transparent focus:outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400"
          />
          <button onClick={handleSendMessage} disabled={isLoading} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
