import React, { useState } from 'react';
import {
  X,
  Columns3,
  Send,
  Sparkles,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface ModelCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelCompareModal: React.FC<ModelCompareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [modelAOutput, setModelAOutput] = useState('');
  const [modelBOutput, setModelBOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeA, setTimeA] = useState<number | null>(null);
  const [timeB, setTimeB] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setModelAOutput('');
    setModelBOutput('');
    setTimeA(null);
    setTimeB(null);

    const startA = Date.now();
    // Run Model A (Gemini 3.8 Flash)
    const runModelA = async () => {
      try {
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'gemini-3.8-flash',
          }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.text) {
                    setModelAOutput((prev) => prev + data.text);
                  }
                } catch (e) {}
              }
            }
          }
        }
        setTimeA(Date.now() - startA);
      } catch (err: any) {
        setModelAOutput(`هەڵە لە مۆدێلی A: ${err?.message}`);
      }
    };

    const startB = Date.now();
    // Run Model B (Gemini 3.1 Pro)
    const runModelB = async () => {
      try {
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'gemini-3.1-pro-preview',
          }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.text) {
                    setModelBOutput((prev) => prev + data.text);
                  }
                } catch (e) {}
              }
            }
          }
        }
        setTimeB(Date.now() - startB);
      } catch (err: any) {
        setModelBOutput(`هەڵە لە مۆدێلی B: ${err?.message}`);
      }
    };

    await Promise.all([runModelA(), runModelB()]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Columns3 className="w-4 h-4 text-cyan-400" />
            <span>بەراوردی ڕاستەوخۆی مۆدێلەکان (Model Comparison Lab)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input prompt */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            placeholder="پرسیارێک بنووسە بۆ بەراوردکردنی وەڵامی هەردوو مۆدێلەکە بە هاوکات..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <button
            disabled={!prompt.trim() || isLoading}
            onClick={handleCompare}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>{isLoading ? 'شیکاری دەکرێت...' : 'بەراوردکردن'}</span>
          </button>
        </div>

        {/* Comparison Windows */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-800 overflow-y-auto p-4 gap-4">
          {/* Model A */}
          <div className="flex flex-col rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-cyan-300 text-xs font-mono">Gemini 3.8 Flash</span>
              </div>
              {timeA && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                  {timeA}ms
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {modelAOutput || (
                <span className="text-slate-600 italic">وەڵامی مۆدێلی یەکەم لێرە دەردەکەوێت...</span>
              )}
            </div>
          </div>

          {/* Model B */}
          <div className="flex flex-col rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-purple-300 text-xs font-mono">Gemini 3.1 Pro</span>
              </div>
              {timeB && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                  {timeB}ms
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {modelBOutput || (
                <span className="text-slate-600 italic">وەڵامی مۆدێلی دووەم لێرە دەردەکەوێت...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
