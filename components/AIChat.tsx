
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Check, FileText, Brain, ListChecks, Sparkles } from 'lucide-react';
import { sendMessageToGemini, analyzeDocument, extractFromText } from '../services/geminiService';
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
      text: 'MaestrIA Cloud Ativa. Pronto para analisar seus documentos e dar insights estratégicos.',
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

  const processBatch = (items: any[]) => {
      const savedData = localStorage.getItem('maestria_v11_enterprise_stable');
      const categories = savedData ? JSON.parse(savedData).categories : [];

      items.forEach(item => {
          const draft: Omit<Transaction, 'id'> = {
              date: item.date || new Date().toISOString().split('T')[0],
              description: item.description || 'Scan Neural Cloud',
              category: item.category || (categories[0] || 'Operacional'),
              amount: Math.abs(Number(item.amount)) || 0,
              type: item.amount < 0 || item.type === 'expense' ? 'expense' : 'income',
              status: 'pending',
              source: 'ai',
              supplier: item.supplier || '',
              paymentMethod: item.paymentMethod || '',
              costCenter: item.costCenter || ''
          };
          
          setMessages(prev => [...prev, {
              id: `draft-${Date.now()}-${Math.random()}`,
              role: 'model',
              text: `Analizado: ${draft.description} - R$ ${draft.amount}`,
              timestamp: new Date(),
              isDraft: true,
              draftData: draft
          }]);
      });
  };

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
    const currentText = inputValue;
    setAttachedImage(null);

    try {
      const savedData = localStorage.getItem('maestria_v11_enterprise_stable');
      const categories = savedData ? JSON.parse(savedData).categories : [];

      if (currentImage) {
         const jsonStr = await analyzeDocument(currentImage.base64.split(',')[1], currentImage.type, 'transaction', categories);
         const items = JSON.parse(jsonStr);
         if (Array.isArray(items)) {
             processBatch(items);
             setIsLoading(false);
             return;
         } else if (items.description) {
             processBatch([items]);
             setIsLoading(false);
             return;
         }
      } else if (currentText.length > 50) {
          const jsonStr = await extractFromText(currentText, categories);
          const items = JSON.parse(jsonStr);
          if (Array.isArray(items)) {
              processBatch(items);
              setIsLoading(false);
              return;
          }
      }

      const responseText = await sendMessageToGemini(newUserMsg.text);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', text: 'Desculpe, tive um problema de conexão com o MaestrIA Cloud.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-[200] flex flex-col border-l border-slate-100">
      <div className="h-24 flex items-center justify-between px-8 bg-slate-950 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-brand rounded-xl">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl italic tracking-tight uppercase">MaestrIA AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Cloud Ativa
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
                  <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 border-l-4 border-l-brand">
                      <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                              <span>Valor</span>
                              <span className="text-slate-900">R$ {msg.draftData.amount}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                              <span>Categoria</span>
                              <span className="text-brand italic">{msg.draftData.category}</span>
                          </div>
                      </div>
                      <button onClick={() => { 
                        if (msg.draftData) {
                          onAddTransaction(msg.draftData); 
                          setMessages(p => p.map(m => m.id === msg.id ? {...m, isDraft: false, text: `✓ Lançamento [${msg.draftData?.description}] efetivado.`} : m));
                        }
                      }} className="w-full bg-slate-950 text-white text-[10px] font-black py-3 rounded-xl shadow-lg hover:bg-brand transition-all uppercase">Confirmar Registro</button>
                  </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-4 items-center bg-slate-100 p-4 rounded-2xl">
          <button onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt: any) => {
                          setAttachedImage({
                              base64: evt.target.result,
                              url: URL.createObjectURL(file),
                              type: file.type
                          });
                      };
                      reader.readAsDataURL(file);
                  }
              };
              input.click();
          }} className="p-2.5 text-slate-400 hover:text-brand transition-colors"><Paperclip className="w-5 h-5"/></button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Analise documentos ou peça ajuda..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 font-bold"
          />
          <button onClick={handleSendMessage} disabled={isLoading} className="p-2.5 bg-slate-950 text-white rounded-xl shadow-lg hover:bg-brand transition-all">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        {attachedImage && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black text-brand uppercase">Imagem anexada para análise</span>
                <button onClick={() => setAttachedImage(null)}><X className="w-4 h-4 text-rose-500"/></button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
