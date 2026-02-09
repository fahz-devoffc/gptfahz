
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, ChatMessage, ChatSession, AppMode, User, GeneratedImage, ChatAttachment } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageGenerator from './components/ImageGenerator';
import CallInterface from './components/CallInterface';
import { chatWithGeminiStream } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.CHAT);
  const [mode, setMode] = useState<AppMode>(AppMode.DEFAULT);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('fahz_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedSessions = localStorage.getItem('fahz_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Revive dates
        const revived = parsed.map((s: any) => ({
          ...s,
          lastModified: new Date(s.lastModified),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(revived);
        if (revived.length > 0) setActiveSessionId(revived[0].id);
      } catch (e) {
        console.error("Failed to revive sessions", e);
      }
    }

    const savedImages = localStorage.getItem('fahz_images');
    if (savedImages) {
      const parsed = JSON.parse(savedImages);
      setImages(parsed.map((img: any) => ({ ...img, timestamp: new Date(img.timestamp) })));
    }
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('fahz_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('fahz_images', JSON.stringify(images));
    }
  }, [images]);

  const handleLogin = (isGoogle: boolean = false) => {
    const newUser = {
      id: '123',
      name: isGoogle ? 'Google User' : 'Fahz Guest',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahz',
      email: 'user@example.com'
    };
    setUser(newUser);
    localStorage.setItem('fahz_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fahz_user');
    localStorage.removeItem('fahz_sessions');
    localStorage.removeItem('fahz_images');
    setSessions([]);
    setImages([]);
    setActiveSessionId(null);
  };

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastModified: new Date(),
      mode: mode
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentView(ViewType.CHAT);
    setIsSidebarOpen(false);
  }, [mode]);

  useEffect(() => {
    if (user && sessions.length === 0) createNewSession();
  }, [user, sessions.length, createNewSession]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSendMessage = async (text: string, attachment?: ChatAttachment) => {
    if (!activeSessionId) return;
    
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text, 
      timestamp: new Date(),
      attachment
    };
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          lastModified: new Date(),
          title: s.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : s.title
        };
      }
      return s;
    }));

    setIsThinking(true);
    let fullResponse = "";
    
    try {
      const stream = await chatWithGeminiStream(text, attachment, activeSession?.messages || [], mode);
      
      const modelMsgId = (Date.now() + 1).toString();
      const initialModelMsg: ChatMessage = { id: modelMsgId, role: 'model', text: "", timestamp: new Date() };
      
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, initialModelMsg] } : s));

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === modelMsgId ? { ...m, text: fullResponse } : m)
            };
          }
          return s;
        }));
      }
    } catch (err) {
      console.error(err);
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, { id: Date.now().toString(), role: 'model', text: "Maaf, terjadi kesalahan saat menghubungi server.", timestamp: new Date() }]
          };
        }
        return s;
      }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleUpdateUser = (name: string) => {
     if (!user) return;
     const updated = { ...user, name };
     setUser(updated);
     localStorage.setItem('fahz_user', JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] p-6 text-white text-center">
        <div className="w-24 h-24 rounded-3xl vikey-gradient flex items-center justify-center text-5xl font-black italic shadow-2xl mb-12 animate-pulse">F</div>
        <h1 className="text-4xl font-bold mb-4 tracking-tighter">Welcome to FahzGPT</h1>
        <p className="text-slate-500 mb-12 max-w-sm">The intelligent workspace by Fahz-Team OFFC. Experience the power of Gemini 3 Flash.</p>
        <div className="space-y-4 w-full max-w-xs">
          <button onClick={() => handleLogin(true)} className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Sign in with Google
          </button>
          <button onClick={() => handleLogin(false)} className="w-full bg-[#1a1a1a] border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-[#222] transition-all">Sign in with Email</button>
        </div>
        <p className="mt-8 text-xs text-slate-600">By continuing, you agree to our Terms of Service.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-slate-200 overflow-hidden font-['Inter'] relative">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
        onNewChat={createNewSession}
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onRenameSession={(id, title) => setSessions(prev => prev.map(s => s.id === id ? {...s, title} : s))}
        currentMode={mode}
        onModeChange={setMode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {currentView === ViewType.CHAT && (
          <ChatView 
            session={activeSession || {id: '', title: '', messages: [], lastModified: new Date(), mode: mode}}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onOpenCall={() => setShowCall(true)}
            mode={mode}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        )}

        {currentView === ViewType.VISION && (
           <div className="flex flex-col h-full">
             <header className="h-14 flex items-center px-4 border-b border-white/5 md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
             </header>
             <div className="flex-1 overflow-y-auto">
               <ImageGenerator 
                 images={images} 
                 onImageGenerated={(img) => setImages(prev => [img, ...prev])} 
               />
             </div>
           </div>
        )}

        {currentView === ViewType.SETTINGS && (
          <div className="flex flex-col h-full">
            <header className="h-14 flex items-center px-4 border-b border-white/5 md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
             </header>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto p-6 md:p-12 w-full">
                <h2 className="text-3xl font-bold mb-8">Settings</h2>
                <div className="space-y-8">
                  <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-white/5">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={(e) => handleUpdateUser(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6">
                    <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-indigo-500" alt="Avatar" />
                    <div className="text-center md:text-left">
                      <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">Change Avatar</button>
                      <p className="text-xs text-slate-500 mt-2">Recommended: 256x256px PNG or JPG</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full md:w-auto text-red-500 font-bold px-6 py-3 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors">Sign Out</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === ViewType.DEVELOPER && (
          <div className="flex flex-col h-full">
             <header className="h-14 flex items-center px-4 border-b border-white/5 md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
             </header>
             <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6 md:p-12 w-full text-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 text-indigo-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Developer Hub</h2>
                  <p className="text-slate-500 mb-12 italic">Handcrafted with passion by Fahz-Team OFFC</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <a href="https://wa.me/6288238830402" target="_blank" rel="noopener noreferrer" className="p-8 bg-[#1a1a1a] rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 font-bold text-xl">WA</div>
                        <p className="font-bold text-white">+62 8823 8830 402</p>
                        <p className="text-xs text-slate-500 mt-1">Chat on WhatsApp</p>
                      </a>
                      <a href="mailto:eltzjb@gmail.com" className="p-8 bg-[#1a1a1a] rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 font-bold text-xl">@</div>
                        <p className="font-bold text-white">eltzjb@gmail.com</p>
                        <p className="text-xs text-slate-500 mt-1">Send us an Email</p>
                      </a>
                  </div>
                </div>
             </div>
          </div>
        )}

        {currentView === ViewType.TEMPLATES && (
           <div className="flex flex-col h-full">
              <header className="h-14 flex items-center px-4 border-b border-white/5 md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
             </header>
             <div className="flex-1 overflow-y-auto">
               <div className="p-6 md:p-12 max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 italic">Template Code FahzGPT</h2>
                  <div className="grid gap-6">
                    <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                        <p className="font-bold text-indigo-400 mb-2">System Initializer</p>
                        <pre className="text-xs font-mono bg-black p-4 rounded-xl text-slate-400 overflow-x-auto">
                          {`const ai = new FahzGPT({ model: 'fahz-flash' });\nai.setIdentity('Fahz-Team OFFC');\nai.start();`}
                        </pre>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                        <p className="font-bold text-purple-400 mb-2">Live Voice Bridge</p>
                        <pre className="text-xs font-mono bg-black p-4 rounded-xl text-slate-400 overflow-x-auto">
                          {`await navigator.mediaDevices.getUserMedia({ audio: true });\n// Connecting to Fahz-Voice-API...`}
                        </pre>
                    </div>
                  </div>
               </div>
             </div>
           </div>
        )}
      </main>

      {showCall && <CallInterface onClose={() => setShowCall(false)} userAvatar={user.avatar} />}
    </div>
  );
};

export default App;
