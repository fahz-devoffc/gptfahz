import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData, encodePCM } from '../services/geminiService';

interface CallInterfaceProps {
  onClose: () => void;
  userAvatar: string;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ onClose, userAvatar }) => {
  const [status, setStatus] = useState<'selecting' | 'calling' | 'active'>('selecting');
  const [voice, setVoice] = useState<'Charon' | 'Kore'>('Charon');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startCall = async () => {
    setStatus('calling');
    // Correctly using process.env.API_KEY without fallback
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputContext = new AudioContext({ sampleRate: 16000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            const source = inputContext.createMediaStreamSource(stream);
            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64 = encodePCM(inputData);
              // Sending media only after sessionPromise resolves
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputContext.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsAiSpeaking(true);
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onerror: (e) => {
            console.debug('Live API Error:', e);
          },
          onclose: (e) => {
            console.debug('Live API Session Closed:', e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice === 'Charon' ? 'Charon' : 'Kore' } } },
          systemInstruction: "Kamu sedang berbicara via telepon dengan pengguna. Namamu FahzGPT. Jadilah asisten suara yang responsif dan ringkas."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  if (status === 'selecting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Pilih Suara FahzGPT</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setVoice('Charon')}
              className={`p-4 rounded-2xl border transition-all ${voice === 'Charon' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800'}`}
            >
              <div className="text-3xl mb-2">👨‍💼</div>
              <div className="font-bold text-white">Adam</div>
              <div className="text-xs text-slate-400">Suara Laki-laki</div>
            </button>
            <button 
              onClick={() => setVoice('Kore')}
              className={`p-4 rounded-2xl border transition-all ${voice === 'Kore' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800'}`}
            >
              <div className="text-3xl mb-2">👩‍💼</div>
              <div className="font-bold text-white">Kore</div>
              <div className="text-xs text-slate-400">Suara Perempuan</div>
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 px-6 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700">Batal</button>
            <button onClick={startCall} className="flex-1 py-3 px-6 rounded-xl vikey-gradient text-white font-semibold shadow-lg shadow-indigo-500/20">Mulai Telepon</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0d0d] text-white">
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-white transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-12">
        <div className="relative">
          <div className={`w-40 h-40 rounded-full vikey-gradient flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-300 ${isAiSpeaking ? 'scale-110 shadow-indigo-500/50' : 'scale-100 shadow-transparent'}`}>
            <span className="text-6xl font-black italic">F</span>
            {isAiSpeaking && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full border-4 border-white/30 rounded-full animate-ping"></div>
               </div>
            )}
          </div>
          <p className="mt-8 text-2xl font-bold tracking-tight text-center">FahzGPT</p>
          <p className="text-slate-500 text-center mt-2">{status === 'calling' ? 'Menghubungkan...' : 'Sedang Berbicara'}</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </div>
          <button onClick={onClose} className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl shadow-red-900/40 transition-all hover:scale-105">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          </button>
          <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 opacity-60">
            <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;