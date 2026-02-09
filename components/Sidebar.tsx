
import React from 'react';
import { ViewType, ChatSession, AppMode, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, onViewChange, sessions, activeSessionId, 
  onSessionSelect, onNewChat, onDeleteSession, onRenameSession,
  currentMode, onModeChange, isOpen, onClose, onLogout, user
}) => {
  const menuItems = [
    { id: ViewType.VISION, label: 'Vision Creator', icon: '🎨' },
    { id: ViewType.TEMPLATES, label: 'Code Templates', icon: '📄' },
    { id: ViewType.SETTINGS, label: 'Settings', icon: '⚙️' },
    { id: ViewType.DEVELOPER, label: 'Developer', icon: '👨‍💻' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed md:static inset-y-0 left-0 w-72 md:w-64 bg-[#171717] flex flex-col border-r border-white/5 transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-3 flex items-center justify-between">
          <button 
            onClick={onNewChat}
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white font-medium text-sm group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs italic">F</div>
              New Chat
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          
          <button onClick={onClose} className="p-2 ml-2 md:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 py-2">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">History</p>
          {sessions.map(s => (
            <div 
              key={s.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${activeSessionId === s.id ? 'bg-[#212121] text-white' : 'text-slate-400 hover:bg-[#212121] hover:text-slate-200'}`}
              onClick={() => {
                onSessionSelect(s.id);
                onViewChange(ViewType.CHAT);
              }}
            >
              <span className="flex-1 truncate">{s.title}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newTitle = prompt('Rename chat:', s.title);
                    if (newTitle) onRenameSession(s.id, newTitle);
                  }}
                  className="p-1 hover:text-white"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this chat?')) onDeleteSession(s.id);
                  }}
                  className="p-1 hover:text-red-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="px-3 text-xs text-slate-600">No recent chats</p>}

          <div className="pt-6 pb-2">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Modes</p>
            {Object.values(AppMode).map(mode => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${currentMode === mode ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                • {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-3 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentView === item.id ? 'bg-[#212121] text-white' : 'text-slate-400 hover:bg-[#212121] hover:text-slate-200'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="px-3 py-2 flex items-center justify-between group">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full vikey-gradient flex items-center justify-center text-[10px] font-bold shrink-0">FAHZ</div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">Premium Account</p>
                  </div>
               </div>
               <button 
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Logout"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
