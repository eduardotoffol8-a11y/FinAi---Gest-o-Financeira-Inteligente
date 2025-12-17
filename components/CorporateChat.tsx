
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Shield, Star, Hash, Search, ArrowLeft, Share2, MoreVertical, Paperclip, Mic, Edit2, Trash, X, FileText, Check, Download, SwitchCamera, MessageSquare } from 'lucide-react';
import { TeamMember, CorporateMessage, Transaction, Contact } from '../types';
import { translations } from '../translations';

interface CorporateChatProps {
  currentUser: TeamMember;
  team: TeamMember[];
  messages: CorporateMessage[];
  onSendMessage: (receiverId: string, text: string, options?: Partial<CorporateMessage>) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSwitchIdentity?: (user: TeamMember) => void;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

const CorporateChat: React.FC<CorporateChatProps> = ({ currentUser, team, messages, onSendMessage, onEditMessage, onDeleteMessage, onSwitchIdentity, language }) => {
  const t = translations[language];
  const [selectedRecipient, setSelectedRecipient] = useState<TeamMember | 'all' | null>(null);
  const [msgText, setMsgText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isIdentitySelectorOpen, setIsIdentitySelectorOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRecipient]);

  const activeMessages = messages.filter(m => {
    if (selectedRecipient === 'all') return m.receiverId === 'all';
    if (!selectedRecipient) return false;
    return (m.senderId === currentUser.id && m.receiverId === selectedRecipient.id) ||
           (m.senderId === selectedRecipient.id && m.receiverId === currentUser.id);
  });

  const handleSend = () => {
    if (editingMessageId) {
      onEditMessage(editingMessageId, msgText);
      setEditingMessageId(null);
      setMsgText('');
      return;
    }
    if (!msgText.trim() || !selectedRecipient) return;
    const rid = selectedRecipient === 'all' ? 'all' : selectedRecipient.id;
    onSendMessage(rid, msgText);
    setMsgText('');
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        if (selectedRecipient) {
          onSendMessage(selectedRecipient === 'all' ? 'all' : selectedRecipient.id, "Mensagem de Voz", { audioUrl: url });
        }
        setRecordingDuration(0);
      };
      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } catch (err) { alert("Microfone indisponível."); }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Avatar = ({ user, className = "w-10 h-10" }: { user: any, className?: string }) => (
    <div className={`${className} bg-slate-900 rounded-xl flex items-center justify-center text-white font-black uppercase italic overflow-hidden shadow-sm`}>
      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} /> : user.name?.charAt(0) || '?'}
    </div>
  );

  return (
    <div className="flex h-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in">
      <aside className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${selectedRecipient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 italic tracking-tight">{t.chat}</h3>
            <button onClick={() => setIsIdentitySelectorOpen(!isIdentitySelectorOpen)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
               <SwitchCamera className="w-4 h-4"/>
            </button>
          </div>
          {isIdentitySelectorOpen && (
            <div className="mb-4 p-3 bg-indigo-600 rounded-2xl animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2">
                    {team.map(m => (
                        <button key={m.id} onClick={() => { onSwitchIdentity?.(m); setIsIdentitySelectorOpen(false); }} className={`py-2 px-2 rounded-xl text-[9px] font-black uppercase transition-all ${currentUser.id === m.id ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white hover:bg-indigo-400'}`}>{m.name.split(' ')[0]}</button>
                    ))}
                </div>
            </div>
          )}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={t.search} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none shadow-inner" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <button onClick={() => setSelectedRecipient('all')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${selectedRecipient === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'hover:bg-slate-50'}`}>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white"><Hash className="w-5 h-5"/></div>
            <div className="text-left"><p className="font-black text-xs uppercase tracking-widest">Broadcast Geral</p></div>
          </button>
          {team.filter(m => m.id !== currentUser.id).map(member => (
            <button key={member.id} onClick={() => setSelectedRecipient(member)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${selectedRecipient !== 'all' && selectedRecipient?.id === member.id ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-50'}`}>
              <div className="relative"><Avatar user={member} /><div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div></div>
              <div className="text-left"><p className="font-bold text-xs uppercase tracking-tight">{member.name}</p></div>
            </button>
          ))}
        </div>
      </aside>
      <main className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedRecipient ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!selectedRecipient ? (
          <div className="text-center p-12 max-w-sm"><div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl border border-slate-50"><MessageSquare className="w-12 h-12"/></div><h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase mb-2">Connect Real</h4><p className="text-slate-400 text-xs font-bold leading-relaxed">Selecione um contato para iniciar a sincronia.</p></div>
        ) : (
          <>
            <header className="bg-white p-6 border-b border-slate-50 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4"><button onClick={() => setSelectedRecipient(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button><Avatar user={selectedRecipient === 'all' ? { name: 'Empresa' } : selectedRecipient} /><div><h4 className="font-black text-sm text-slate-900 uppercase tracking-tighter">{selectedRecipient === 'all' ? 'Broadcast' : selectedRecipient.name}</h4><span className="text-[10px] text-slate-400 font-black uppercase">Criptografado</span></div></div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20">
              {activeMessages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2`}>
                    <div className="flex items-center gap-3 max-w-[85%] group">
                      {isMine && <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingMessageId(msg.id); setMsgText(msg.text); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5"/></button><button onClick={() => onDeleteMessage(msg.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash className="w-3.5 h-3.5"/></button></div>}
                      <div className={`p-5 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed ${isMine ? 'bg-slate-950 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                        {msg.sharedItem && <div className={`mb-3 p-4 rounded-2xl border flex items-center gap-4 ${isMine ? 'bg-white/10' : 'bg-slate-50'}`}><div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white"><Share2 className="w-6 h-6"/></div><div><p className="text-[9px] font-black uppercase opacity-60">{msg.sharedItem.type}</p><p className="font-black text-xs uppercase italic">{msg.sharedItem.data.description || msg.sharedItem.data.name}</p></div></div>}
                        {msg.audioUrl && <div className="mb-2"><audio controls src={msg.audioUrl} className="max-w-full scale-90 origin-left" /></div>}
                        <div className="whitespace-pre-wrap">{msg.isDeleted ? <span className="italic opacity-50">Deletado</span> : msg.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
            <footer className="p-8 bg-white border-t border-slate-50 shadow-sm">
              <div className="flex gap-4 items-center">
                <div className={`flex-1 flex gap-3 p-4 rounded-[2rem] border transition-all duration-300 ${isRecording ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100 focus-within:bg-white focus-within:border-indigo-200'}`}>
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-indigo-600"><Paperclip className="w-5 h-5"/></button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && selectedRecipient) {
                      const url = URL.createObjectURL(file);
                      onSendMessage(selectedRecipient === 'all' ? 'all' : selectedRecipient.id, `Anexo: ${file.name}`, { fileAttachment: { name: file.name, url, type: file.type } });
                    }
                  }} />
                  {isRecording ? <div className="flex-1 flex items-center justify-between px-4"><span className="text-xs font-black text-rose-600 uppercase">Gravando: {formatDuration(recordingDuration)}</span><button onClick={handleStopRecording} className="text-[10px] font-black uppercase bg-rose-500 text-white px-4 py-2 rounded-full">Parar</button></div> : <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Mensagem segura..." className="flex-1 bg-transparent outline-none text-sm text-slate-900 font-bold" />}
                  {!isRecording && !msgText.trim() && <button onClick={handleStartRecording} className="p-2.5 text-slate-400 hover:text-rose-500"><Mic className="w-5 h-5"/></button>}
                </div>
                <button onClick={handleSend} disabled={!msgText.trim() && !editingMessageId} className="p-5 bg-slate-950 text-white rounded-3xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center transform active:scale-90">{editingMessageId ? <Check className="w-6 h-6"/> : <Send className="w-6 h-6"/>}</button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default CorporateChat;
