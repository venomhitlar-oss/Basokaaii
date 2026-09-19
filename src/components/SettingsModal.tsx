import React, { useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  Sparkles,
  Shield,
  Eye,
  RotateCcw,
  Check,
} from 'lucide-react';
import { OwnerSettings } from '../types';
import { DEFAULT_SETTINGS } from '../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OwnerSettings;
  onSave: (settings: OwnerSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<OwnerSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>ڕێکخستنەکانی سیستەمی باسۆکا (تایبەت بە سەرۆک)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Owner Greeting */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 block">
              دەستەواژەی سڵاوی سەرەتا بۆ سەرۆک
            </label>
            <input
              type="text"
              value={formData.ownerGreeting}
              onChange={(e) => setFormData({ ...formData, ownerGreeting: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500">
              ئەم پەیامە لە یەکەم کردنەوەی دانیشتنی نوێ لەلایەن باسۆکاوە ئاراستەت دەکرێت.
            </span>
          </div>

          {/* Auto Read Aloud (Mandated in prompt #26) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>خوێندنەوەی دەنگیی خۆکار (Auto Read Aloud)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                پاش تەواوبوونی نووسینی وەڵام، باسۆکا بە دەنگ دەقەکە بۆ سەرۆک دەخوێنێتەوە.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoReadAloud}
                onChange={(e) => setFormData({ ...formData, autoReadAloud: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Animated Watermark Toggle & Opacity */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>نیشانەی ئاوی ئەنیمەیشندار (Watermark)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  نیشاندانی وشەی (basoka ai) بە شێوەیەکی هێمن و شاردراوە لە پاشبنەمادا.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.watermarkEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, watermarkEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            {formData.watermarkEnabled && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">ڕادەی ڕووناکی (Opacity):</span>
                <input
                  type="range"
                  min="0.02"
                  max="0.15"
                  step="0.01"
                  value={formData.watermarkOpacity}
                  onChange={(e) =>
                    setFormData({ ...formData, watermarkOpacity: parseFloat(e.target.value) })
                  }
                  className="w-32 accent-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Kurdish Quality Layer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>تەبەقەی پاراستنی کواڵیتی زمانی کوردی</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ڕاستکردنەوەی خۆکاری پیتەکان (ی، ک، ێ، ۆ) و پێداچوونەوەی ڕێزمانی سۆرانی.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.kurdishQualityLayer}
                onChange={(e) =>
                  setFormData({ ...formData, kurdishQualityLayer: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Approval Gate for sensitive actions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>دەروازەی ڕەزامەندی سەرۆک (Approval Gate)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                داواکردنی ڕەزامەندی پێش سڕینەوە، دەرکردنی فایل یان کردارە هەستیارەکان.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.approvalGateEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, approvalGateEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Response Style */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 block">شێوازی وەڵامدانەوەی باسۆکا</label>
            <div className="grid grid-cols-2 gap-2">
              {(['هاوسەنگ', 'کورت و پوخت', 'ورد و زانستی', 'هاوڕێیانە'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData({ ...formData, responseStyle: style })}
                  className={`p-2 rounded-xl text-xs border transition-all text-center ${
                    formData.responseStyle === style
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>گەڕاندنەوە بۆ بنەڕەت</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              پاشگەزبوونەوە
            </button>
            <button
              id="btn-save-settings"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedNotice ? 'پاشەکەوتکرا!' : 'پاشەکەوتکردن'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
