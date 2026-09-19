import React, { useState } from 'react';
import {
  X,
  Brain,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('preference');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddMemory({
      content: content.trim(),
      category,
      confidence: 100,
      source: 'تۆمارکراوی سەرۆک',
    });

    setContent('');
    setIsAdding(false);
  };

  const getCategoryBadge = (cat: MemoryItem['category']) => {
    switch (cat) {
      case 'language':
        return { label: 'زمان', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'preference':
        return { label: 'پەسەندکراو', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'project':
        return { label: 'پڕۆژە', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'instruction':
        return { label: 'ڕێنمایی', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      default:
        return { label: 'ڕاستی', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>بیرگەی پارێزراوی باسۆکا (Memory Engine)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed text-[11px]">
            لێرەدا ئەو زانیاری و پەسەندکردنانە کۆگاکراون کە باسۆکا لە میانەی گفتوگۆکاندا بۆ خزمەتی
            سەرۆک لەبیریدا دەیهێڵێتەوە. دەتوانیت هەر زانیارییەک بە ئارەزووی خۆت دەستکاری بکەیت یان
            بیسڕیتەوە.
          </div>

          {/* Add Memory Button or Form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>زیادکردنی زانیارییەکی نوێ بۆ بیرگە</span>
            </button>
          ) : (
            <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3">
              <div className="font-semibold text-cyan-300">تۆمارکردنی زانیاری نوێ</div>
              <div>
                <textarea
                  rows={2}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="بۆ نموونە: من پڕۆژەی ماڵپەڕ لەسەر Next.js ئەنجام دەدەم..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                >
                  <option value="preference">پەسەندکردن (Preference)</option>
                  <option value="language">زمان و دەربڕین</option>
                  <option value="project">پڕۆژە و کار</option>
                  <option value="instruction">ڕێنمایی بەردەوام</option>
                  <option value="fact">زانیاری تایبەت</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm"
                  >
                    پاشەکەوت
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Memories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>تۆمارەکانی ئێستا ({memories.length})</span>
              {memories.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>سڕینەوەی گشت بیرگە</span>
                </button>
              )}
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-6 text-slate-500">هیچ زانیارییەک لە بیرگەدا نییە</div>
            ) : (
              memories.map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] border font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          باوەڕپێکراوی: {item.confidence}%
                        </span>
                      </div>
                      <div className="text-slate-200 text-xs leading-relaxed">{item.content}</div>
                      <div className="text-[10px] text-slate-500">سەرچاوە: {item.source}</div>
                    </div>

                    <button
                      onClick={() => onDeleteMemory(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
