
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, AppMode, ChatAttachment } from '../types';
import CodeBlock from './CodeBlock';

interface ChatViewProps {
  session: ChatSession;
  onSendMessage: (text: string, attachment?: ChatAttachment) => void;
  isThinking: boolean;
  onOpenCall: () => void;
  mode: AppMode;
  onToggleSidebar: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ session, onSendMessage, isThinking, onOpenCall, mode, onToggleSidebar }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [session.messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;
    if (isThinking) return;
    onSendMessage(input, attachment || undefined);
    setInput('');
    setAttachment(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');

    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachment({
        type: isImage ? 'image' : 'file',
        name: file.name,
        data: result,
        mimeType: file.type
      });
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const renderContent = (text: string) => {
    const parts = text.split(/```/);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const lines = part.split('\n');
        const lang = lines[0].trim() || 'txt';
        const code = lines.slice(1).join('\n').trim();
        return <CodeBlock key={i} code={code} language={lang} />;
      }
      return <p key={i} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#212121]">
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#212121]">
        <div className="flex items-center gap-2">
           <button onClick={onToggleSidebar} className="p-2 -ml-2 text-slate-400 md:hidden hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
           <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="text-white font-bold text-xs md:text-sm tracking-tight">{mode}</span>
              <span className="hidden md:inline text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold">FAHZ-FLASH</span>
           </div>
        </div>
        <button 
          onClick={onOpenCall}
          className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
          title="Voice Call"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 max-w-3xl mx-auto w-full">
        {session.messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl vikey-gradient flex items-center justify-center text-3xl font-black italic shadow-2xl mb-6">F</div>
              <h1 className="text-2xl font-bold text-white mb-2">How can I help you?</h1>
              <p className="text-slate-500 text-sm italic">FahzGPT bertenaga Gemini 3 Flash Preview</p>
           </div>
        )}
        
        {session.messages.map((m) => (
          <div key={m.id} className="flex gap-4">
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${m.role === 'user' ? 'bg-slate-700 text-white' : 'vikey-gradient text-white italic'}`}>
              {m.role === 'user' ? 'U' : 'F'}
            </div>
            <div className="flex-1 text-slate-200 text-sm leading-7 pt-1 min-w-0">
              <p className="font-bold text-xs text-slate-500 uppercase mb-1">{m.role === 'user' ? 'You' : 'FahzGPT'}</p>
              
              {m.attachment && (
                <div className="mb-4">
                  {m.attachment.type === 'image' ? (
                    <img src={m.attachment.data} alt="Attached" className="max-w-full max-h-64 rounded-xl border border-white/10" />
                  ) : (
                    <div className="inline-flex items-center gap-2 p-3 bg-slate-800 rounded-xl border border-white/5">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      <span className="text-xs font-medium truncate max-w-[200px]">{m.attachment.name}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="break-words">
                {renderContent(m.text)}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-2 bg-white/5 rounded w-3/4"></div>
              <div className="h-2 bg-white/5 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
        <div className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 p-2 bg-[#2f2f2f] rounded-xl flex items-center gap-3 border border-indigo-500/30">
               {attachment.type === 'image' ? (
                 <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={attachment.data} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
               )}
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{attachment.name}</p>
                  <p className="text-[10px] text-slate-500">Ready to upload</p>
               </div>
               <button onClick={() => setAttachment(null)} className="p-1 hover:text-white text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative group flex items-end gap-2">
            <div className="flex-1 relative flex items-center">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Upload file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message FahzGPT..."
                className="w-full bg-[#2f2f2f] text-white rounded-2xl py-3 pl-12 pr-12 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all border border-transparent resize-none h-14"
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !attachment) || isThinking}
                className="absolute right-3 p-1.5 rounded-lg bg-white text-black disabled:opacity-30 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/*,.txt,.js,.py,.html,.css,.json" 
            />
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-3">
            FahzGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
