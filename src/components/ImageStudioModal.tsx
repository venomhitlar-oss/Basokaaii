import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Maximize2,
  Download,
  Share2,
  X,
  Check,
  Loader2,
  Wand2,
  Layers,
  Camera,
  Sun,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { ImagePromptInterpretation } from '../types';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string, prompt: string, promptInfo?: ImagePromptInterpretation) => void;
  initialPrompt?: string;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
  initialPrompt = '',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [style, setStyle] = useState<string>('photorealistic');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [interpretation, setInterpretation] = useState<ImagePromptInterpretation | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedDesc, setGeneratedDesc] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const styleOptions = [
    { id: 'photorealistic', label: 'فۆتۆڕیالیزمی سینەمایی', desc: 'کامێرای 8K، ڕووناکی سروشتی' },
    { id: '3d_render', label: 'ڕێندەری سێ ڕەهەندی (3D)', desc: 'ماتێریاڵی پاک، ئۆکتان ڕێندەر' },
    { id: 'concept_art', label: 'کۆنسێپت ئاڕت و فەنتازیا', desc: 'دیزاینی داهێنەرانە، کەشوهەوای تایبەت' },
    { id: 'oil_painting', label: 'تابلۆی شێوەکاری ڕۆنی', desc: 'تێکسچەری فڵچە و هونەری کلاسیک' },
    { id: 'anime_illustration', label: 'ئەنیمێ و ئیلستریشن', desc: 'هێڵکاریی ورد، ڕەنگی زیندوو' },
    { id: 'product_photo', label: 'فۆتۆگرافی بەرهەم و ستۆدیۆ', desc: 'باکگراوندی پاک، ڕووناکی ستۆدیۆ' },
  ];

  const aspectRatios = [
    { id: '1:1', label: 'چوارگۆشە (1:1)' },
    { id: '16:9', label: 'دیمەنی پان (16:9)' },
    { id: '9:16', label: 'ستۆری مۆبایل (9:16)' },
    { id: '4:3', label: 'ستاندارد (4:3)' },
    { id: '3:4', label: 'پۆرترێت (3:4)' },
  ];

  // Optimize prompt with 12-factor visual interpreter
  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/image/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (data.interpretation) {
        setInterpretation(data.interpretation);
      }
    } catch (e: any) {
      setErrorMsg('هەڵە لە شیکردنەوەی پڕۆمپت: ' + e.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Generate image
  const handleGenerate = async () => {
    const finalPrompt = interpretation?.finalOptimizedPrompt || prompt.trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          style,
        }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedDesc(data.description || 'وێنەکە بە سەرکەوتوویی دروستکرا');
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg('هەڵە لە دروستکردنی وێنە: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToChat = () => {
    if (generatedImageUrl) {
      onImageGenerated(
        generatedImageUrl,
        prompt || 'وێنەی دروستکراو',
        interpretation || undefined
      );
      onClose();
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `basoka-ai-art-${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (!generatedImageUrl) return;
    navigator.clipboard.writeText(generatedImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>ستۆدیۆی داهێنانی وێنەی باسۆکا (Image Studio)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Premium Quality
                </span>
              </h3>
              <p className="text-xs text-slate-400">شیکاریی فرەڕەهەندی پڕۆمپت، ڕووناکی و کەرەستەکان بۆ بەرزترین کوالێتی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Prompt Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                پێناسەی وێنەکە بە کوردی یان ئینگلیزی (Prompt):
              </span>
              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !prompt.trim()}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 disabled:opacity-50 transition-all"
              >
                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span>دەوڵەمەندکردنی پڕۆمپت (12-Factor AI)</span>
              </button>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="وەک: شێرێک لەسەر لوتکەی کێوێکی بەفراوی لە کاتی خۆرئاوابوون، بە ڕووناکی زێڕین و تەپوتۆزی سینەمایی..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors resize-none"
            />
          </div>

          {/* 12-Factor Prompt Interpretation Card (if available) */}
          {interpretation && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  شیکاریی تەکنیکی فرەڕەهەند (Image Prompt Interpreter):
                </span>
                <span className="text-[10px] text-slate-400">کوالێتی بەرزکراوە</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {interpretation.subject && (
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">تەنی سەرەکی:</span>
                    <span className="text-slate-200 font-medium truncate block">{interpretation.subject}</span>
                  </div>
                )}
                {interpretation.lighting && (
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                      <Sun className="w-2.5 h-2.5 text-amber-400" /> ڕووناکی:
                    </span>
                    <span className="text-slate-200 font-medium truncate block">{interpretation.lighting}</span>
                  </div>
                )}
                {interpretation.camera && (
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5 text-cyan-400" /> کامێرا:
                    </span>
                    <span className="text-slate-200 font-medium truncate block">{interpretation.camera}</span>
                  </div>
                )}
                {interpretation.materials && (
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-purple-400" /> کەرەستەکان:
                    </span>
                    <span className="text-slate-200 font-medium truncate block">{interpretation.materials}</span>
                  </div>
                )}
              </div>
              {interpretation.finalOptimizedPrompt && (
                <div className="text-[11px] p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-left" dir="ltr">
                  <div className="text-[10px] text-cyan-400 font-sans text-right mb-1" dir="rtl">
                    پڕۆمپتی هاوسەنگکراوی کۆتایی (Synthesized English Prompt):
                  </div>
                  {interpretation.finalOptimizedPrompt}
                </div>
              )}
            </div>
          )}

          {/* Style & Aspect Ratio Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                شێوازی هونەری (Style Preset):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      style === s.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-semibold text-xs">{s.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                قەبارە و ڕێژەی وێنە (Aspect Ratio):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id as any)}
                    className={`px-3 py-2 rounded-xl border text-right transition-all flex items-center justify-between text-xs ${
                      aspectRatio === r.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] opacity-70" dir="ltr">{r.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedImageUrl && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  وێنەکە بە سەرکەوتوویی ئامادە کرا:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
                    title="کۆپیکردنی بەستەری وێنە"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                    <span className="text-[10px]">{copied ? 'کۆپیکرا' : 'بەستەر'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
                    title="داگرتنی وێنە"
                  >
                    <Download className="w-3 h-3" />
                    <span className="text-[10px]">داگرتن</span>
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 max-h-[440px] flex items-center justify-center bg-black/40">
                <img
                  src={generatedImageUrl}
                  alt={prompt}
                  referrerPolicy="no-referrer"
                  className="max-h-[440px] w-full object-contain rounded-xl"
                />
              </div>
              {generatedDesc && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  {generatedDesc}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            داخستن
          </button>
          <div className="flex items-center gap-2.5">
            {generatedImageUrl && (
              <button
                onClick={handleShareToChat}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>ناردن بۆ ناو چات</span>
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>دروستکردنی وێنە (Rendering)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>دروستکردنی وێنە</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
