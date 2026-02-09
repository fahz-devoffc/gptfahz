
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { generateImageWithGemini } from '../services/geminiService';

interface ImageGeneratorProps {
  images: GeneratedImage[];
  onImageGenerated: (img: GeneratedImage) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ images, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const url = await generateImageWithGemini(prompt);
      onImageGenerated({
        url,
        prompt,
        timestamp: new Date()
      });
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Vision Creator</h2>
        <p className="text-slate-400">Transform your imagination into high-quality visuals with Vikey Vision.</p>
      </div>

      <div className="glass p-8 rounded-3xl border border-indigo-500/10 mb-8">
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create in detail..."
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-600"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">1024x1024</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">Ultra-HD</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="px-8 py-3 rounded-xl vikey-gradient text-white font-semibold disabled:opacity-50 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Generate Magic
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
        {images.map((img, idx) => (
          <div key={idx} className="group relative glass rounded-2xl overflow-hidden border border-slate-700/50 transition-all hover:border-indigo-500/50">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-xs line-clamp-2 mb-2">{img.prompt}</p>
              <div className="flex gap-2">
                 <button className="flex-1 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold text-white hover:bg-indigo-500 transition-colors">Download</button>
                 <button className="p-1.5 glass rounded-lg text-white hover:bg-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 </button>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-xl">Your creative gallery is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
