import React, { useState } from 'react';
import {
  Wand2,
  X,
  Layers,
  Sparkles,
  Download,
  Share2,
  Loader2,
  Check,
  Sun,
  Palette,
  Eraser,
  PlusCircle,
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onEditedImage: (newImageUrl: string, instruction: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onEditedImage,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedResultUrl, setEditedResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'گۆڕینی پاشبنەما بۆ سروشت', prompt: 'پاشبنەمای وێنەکە بگۆڕە بۆ دیمەنی کێو و دارستانی چڕ بە ڕووناکی گۆڵدن هاوەر', icon: Layers },
    { label: 'سڕینەوەی تەنە ناپێویستەکان', prompt: 'تەنە ناپێویست و نەخوازراوەکانی دەوروبەر بسڕەوە و تەنیا بابەتە سەرەکییەکە بهێڵەرەوە', icon: Eraser },
    { label: 'ڕێکخستنی ڕووناکی و کێشی ڕەنگ', prompt: 'ڕووناکی وێنەکە بکە بە سینەمایی، ڕەنگەکان گەرمتر و دەوڵەمەندتر بکە بە تیشکی خۆر', icon: Sun },
    { label: 'گۆڕینی ستایل بۆ تابلۆی شێوەکاری', prompt: 'شێوازی تەواوی وێنەکە بگۆڕە بۆ تابلۆیەکی ڕۆنی شێوەکاریی کلاسیک بە فڵچەی هونەری', icon: Palette },
    { label: 'زیادکردنی کەشوهەوای باراناوی', prompt: 'کەشوهەوای وێنەکە بگۆڕە بۆ شەقامێکی باراناوی بە ڕەنگدانەوەی چرای نیۆن لەسەر زەوی', icon: PlusCircle },
  ];

  const handleApplyEdit = async (customText?: string) => {
    const textToUse = customText || instruction.trim();
    if (!textToUse) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          instruction: textToUse,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setEditedResultUrl(data.imageUrl);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg('هەڵە لە دەستکاریکردنی وێنە: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareToChat = () => {
    if (editedResultUrl) {
      onEditedImage(editedResultUrl, instruction || 'دەستکاریکردنی وێنە');
      onClose();
    }
  };

  const handleDownload = () => {
    if (!editedResultUrl) return;
    const a = document.createElement('a');
    a.href = editedResultUrl;
    a.download = `basoka-edited-image-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">دەستکاریکردنی وێنە (Image Editing AI)</h3>
              <p className="text-xs text-slate-400">زیادکردن یان سڕینەوەی تەن، گۆڕینی پاشبنەما، و چاکسازی ڕووناکی و ستایل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Images Comparison View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original Image */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">وێنەی بنەڕەتی:</span>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Edited Image Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-cyan-400">ئەنجامی دەستکاریکراو:</span>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square flex items-center justify-center relative">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-cyan-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs">جێبەجێکردنی دەستکارییەکان...</span>
                  </div>
                ) : editedResultUrl ? (
                  <img
                    src={editedResultUrl}
                    alt="Edited result"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain animate-fade-in"
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-slate-500">
                    ڕێنمایی دەستکاریکردن لە خوارەوە بنووسە یان یەکێک لە فرمانی خێراکان هەڵبژێرە
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">کردارە خێراکان بۆ دەستکاری:</span>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInstruction(action.prompt);
                      handleApplyEdit(action.prompt);
                    }}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              ڕێنمایی تایبەتی خۆت بنووسە:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="وەک: باران زیاد بکە، یان ڕەنگی کراسەکەی بگۆڕە بۆ سوور..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleApplyEdit()}
                disabled={isProcessing || !instruction.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>جێبەجێکردن</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {errorMsg}
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
          {editedResultUrl && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>داگرتن</span>
              </button>
              <button
                onClick={handleShareToChat}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ناردنی وێنەی نوێ بۆ چات</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
