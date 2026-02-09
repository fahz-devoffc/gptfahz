
import React from 'react';
import { ViewType } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
  messageCount: number;
  imageCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, messageCount, imageCount }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back to Vikey</h1>
        <p className="text-slate-400 text-lg">Your AI-powered command center is ready.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 rounded-3xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">AI Conversations</h3>
          <p className="text-slate-400 text-sm mb-4">Chat with the smartest model for any task.</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{messageCount}</span>
            <button onClick={() => onNavigate(ViewType.CHAT)} className="text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              Go to chat <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-purple-500/10 hover:border-purple-500/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Visual Studio</h3>
          <p className="text-slate-400 text-sm mb-4">Generate stunning images from text prompts.</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-white">{imageCount}</span>
            <button onClick={() => onNavigate(ViewType.VISION)} className="text-purple-400 font-semibold hover:underline flex items-center gap-1">
              Create vision <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Automation Beta</h3>
          <p className="text-slate-400 text-sm mb-4">Configure custom workflows for productivity.</p>
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Early Access</span>
            <button className="text-cyan-400 font-semibold hover:underline opacity-50 cursor-not-allowed">Coming soon</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-700/50">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {messageCount === 0 ? (
              <p className="text-slate-500 text-center py-10">No recent activity found.</p>
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <p className="text-slate-200 text-sm font-medium">Session Active</p>
                   <p className="text-slate-400 text-xs mt-1">You've exchanged {messageCount} messages with Vikey today.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-700/50">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Tips</h3>
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-indigo-400 text-xs font-bold uppercase mb-1">Prompt Tip</p>
                <p className="text-slate-300 text-sm italic">"Try telling Vikey to 'Act as a Senior React Engineer' for better coding advice."</p>
             </div>
             <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <p className="text-purple-400 text-xs font-bold uppercase mb-1">Vision Tip</p>
                <p className="text-slate-300 text-sm italic">"Use descriptive lighting keywords like 'Cinematic lighting' or 'Golden hour' for images."</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
