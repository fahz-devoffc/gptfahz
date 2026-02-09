
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fahz-code-${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPreviewable = ['html', 'css', 'javascript', 'svg'].includes(language.toLowerCase());

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase">{language}</span>
        <div className="flex gap-2">
          {isPreviewable && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition-colors"
              title="Preview Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            title="Download Code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>
        </div>
      </div>
      
      {showPreview ? (
        <div className="bg-white p-4 min-h-[200px]">
           <iframe 
             title="Preview" 
             srcDoc={language === 'html' ? code : `<html><body><script>${code}</script></body></html>`}
             className="w-full h-full border-none min-h-[200px]"
           />
        </div>
      ) : (
        <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 custom-scrollbar">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
