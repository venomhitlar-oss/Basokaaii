import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  FileText,
  FileDown,
  CornerDownLeft,
  Globe,
  ExternalLink,
  MapPin,
  Compass,
  Sliders,
  Wand2,
  Eye,
} from 'lucide-react';
import { Message } from '../types';
import { tts } from '../lib/audio';
import { generateKurdishPdf, extractDocumentTitle, isPdfRelatedText } from '../lib/pdfGenerator';

interface ChatMessageItemProps {
  message: Message;
  isLast: boolean;
  onRetry?: () => void;
  onFeedback?: (rating: 'positive' | 'negative') => void;
  onBranch?: () => void;
  onEditImage?: (imageUrl: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLast,
  onRetry,
  onFeedback,
  onBranch,
  onEditImage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakToggle = () => {
    if (isPlaying) {
      tts.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      tts.speak(message.content).finally(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateKurdishPdf({ content: message.content });
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 1200);
    }
  };

  const hasDocumentFormat = !isUser && !message.isStreaming && (
    isPdfRelatedText(message.content) ||
    message.content.includes('# ') ||
    message.content.includes('## ')
  );

  // Helper to render simple structured markdown, code blocks & visual badges
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by code blocks ```...```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim() || 'code';
        const codeBody = lines.slice(1).join('\n') || lines[0];

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950/90 text-left"
            dir="ltr"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>{language}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeBody);
                }}
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                title="کۆپیکردنی کۆد"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-xs md:text-sm text-emerald-300 font-mono overflow-x-auto selection:bg-cyan-900/60 leading-relaxed">
              <code>{codeBody}</code>
            </pre>
          </div>
        );
      }

      // Paragraph formatting: bold, lists, and linebreaks
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-2 leading-relaxed">
          {lines.map((line, lIndex) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lIndex} className="h-2" />;
            }

            // Heading 1
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={lIndex} className="text-xl font-bold text-cyan-300 mt-4 mb-2">
                  {trimmed.slice(2)}
                </h1>
              );
            }
            // Heading 2
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={lIndex} className="text-lg font-bold text-cyan-200 mt-3 mb-1.5">
                  {trimmed.slice(3)}
                </h2>
              );
            }
            // Heading 3
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={lIndex} className="text-base font-semibold text-slate-200 mt-2 mb-1">
                  {trimmed.slice(4)}
                </h3>
              );
            }

            // Bullet list
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lIndex} className="flex items-start gap-2 pr-2">
                  <span className="text-cyan-400 text-sm mt-1">•</span>
                  <span className="flex-1 text-slate-200">{formatInline(trimmed.slice(2))}</span>
                </div>
              );
            }

            // Blockquote
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={lIndex}
                  className="border-r-4 border-cyan-500/80 pr-3 py-1 my-2 text-slate-300 italic bg-slate-900/40 rounded-l"
                >
                  {formatInline(trimmed.slice(2))}
                </blockquote>
              );
            }

            return (
              <p key={lIndex} className="text-slate-100">
                {formatInline(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for bold, inline code, and dual-confidence vision badges
  const formatInline = (text: string) => {
    // Replace visual certainty markers with styled badges
    if (text.includes('[دڵنیا / Visible]')) {
      const segs = text.split('[دڵنیا / Visible]');
      return segs.map((s, i) => (
        <React.Fragment key={i}>
          {formatInlineSimple(s)}
          {i < segs.length - 1 && (
            <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-medium">
              <Eye className="w-2.5 h-2.5" />
              <span>دڵنیا (Visible)</span>
            </span>
          )}
        </React.Fragment>
      ));
    }

    if (text.includes('[پێشبینیکراو / Inferred]')) {
      const segs = text.split('[پێشبینیکراو / Inferred]');
      return segs.map((s, i) => (
        <React.Fragment key={i}>
          {formatInlineSimple(s)}
          {i < segs.length - 1 && (
            <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700/60 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              <span>پێشبینیکراو (Inferred)</span>
            </span>
          )}
        </React.Fragment>
      ));
    }

    return formatInlineSimple(text);
  };

  const formatInlineSimple = (text: string) => {
    // Bold: **word**
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-bold text-cyan-200">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      // Inline code: `code`
      const codeParts = bPart.split(/(`[^`]+`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`')) {
          return (
            <code
              key={cIdx}
              dir="ltr"
              className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs"
            >
              {cPart.slice(1, -1)}
            </code>
          );
        }
        return cPart;
      });
    });
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`group relative flex flex-col w-full my-3 transition-opacity ${
        isUser ? 'items-start' : 'items-start'
      }`}
    >
      {/* Sender Header / Badge */}
      <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
        {isUser ? (
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
              س
            </div>
            <span>سەرۆک</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-[10px] text-white shadow-sm shadow-cyan-500/30">
              ب
            </div>
            <span className="font-semibold text-cyan-300">basoka ai</span>
            {message.modelNameBadge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-mono">
                {message.modelNameBadge}
              </span>
            )}
            {message.webSearchUsed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950/80 text-blue-300 border border-blue-800/60 flex items-center gap-1 font-medium">
                <Globe className="w-2.5 h-2.5 text-blue-400" />
                گەڕانی وێب چالاک بوو
              </span>
            )}
            {message.isFallback && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/70 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                سەرکەوت لە ڕێگەی مۆدێلی یەدەگ
              </span>
            )}
          </div>
        )}
        <span className="text-[10px] text-slate-500">
          {new Date(message.timestamp).toLocaleTimeString('ckb', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Main Message Bubble */}
      <div
        className={`relative w-full rounded-2xl p-4 text-sm md:text-base leading-relaxed ${
          isUser
            ? 'bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-tr-sm shadow-sm'
            : 'bg-slate-900/60 border border-slate-800 text-slate-100 rounded-tl-sm backdrop-blur-sm shadow-sm'
        }`}
      >
        {/* Attachments (if user uploaded files) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700/60 text-xs text-slate-300"
              >
                {att.mimeType?.startsWith('image/') && att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover rounded border border-slate-700"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-cyan-400" />
                )}
                <div>
                  <div className="font-medium max-w-[160px] truncate">{att.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {(att.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Location Discovery Card (if message has locationData) */}
        {message.locationData && (
          <div className="my-3 p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>شوێنی دیاریکراو لەسەر نەخشە:</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400" dir="ltr">
                {message.locationData.lat.toFixed(5)}, {message.locationData.lng.toFixed(5)}
              </span>
            </div>
            <div className="text-sm text-slate-200 font-medium">
              {message.locationData.address}
            </div>

            {/* Mini Map View */}
            <div className="rounded-lg overflow-hidden border border-slate-800 aspect-[16/8] relative">
              <iframe
                title="Mini Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${message.locationData.lng - 0.008}%2C${message.locationData.lat - 0.008}%2C${message.locationData.lng + 0.008}%2C${message.locationData.lat + 0.008}&amp;layer=mapnik&amp;marker=${message.locationData.lat}%2C${message.locationData.lng}`}
                className="w-full h-full"
              />
            </div>

            {/* Nearby places inside location data */}
            {message.locationData.nearbyPlaces && message.locationData.nearbyPlaces.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">نزیکترین شوێنەکان:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {message.locationData.nearbyPlaces.slice(0, 4).map((p) => (
                    <a
                      key={p.id}
                      href={p.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs flex items-center justify-between"
                    >
                      <span className="truncate text-slate-300">{p.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0 pr-1">
                        {p.distanceKm} km
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Generated Image (with Edit action and Prompt Interpretation) */}
        {message.generatedImageUrl && (
          <div className="my-3 overflow-hidden rounded-xl border border-cyan-500/30 shadow-lg space-y-2">
            <div className="relative group/img bg-slate-950 flex items-center justify-center">
              <img
                src={message.generatedImageUrl}
                alt={message.generatedImagePrompt || 'Generated visual'}
                referrerPolicy="no-referrer"
                className="w-full max-h-[480px] object-contain"
              />
              {/* Quick Image Edit button */}
              {onEditImage && (
                <button
                  onClick={() => onEditImage(message.generatedImageUrl!)}
                  className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-semibold border border-slate-700/80 shadow-md backdrop-blur-sm flex items-center gap-1.5 transition-all"
                  title="دەستکاریکردنی ئەم وێنەیە"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>دەستکاریکردنی وێنە (Edit)</span>
                </button>
              )}
            </div>

            {/* Prompt Interpreter Breakdown (if present) */}
            {message.promptInterpretation && (
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs space-y-2">
                <button
                  onClick={() => setShowPromptDetails(!showPromptDetails)}
                  className="w-full flex items-center justify-between text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                    <Sliders className="w-3 h-3" />
                    شیکاریی پڕۆمپت و ڕووناکی (Prompt Breakdown)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {showPromptDetails ? 'داخستن' : 'پیشاندان'}
                  </span>
                </button>
                {showPromptDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
                    {message.promptInterpretation.subject && (
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">تەن:</span>
                        <span className="text-slate-300 truncate block">{message.promptInterpretation.subject}</span>
                      </div>
                    )}
                    {message.promptInterpretation.lighting && (
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">ڕووناکی:</span>
                        <span className="text-slate-300 truncate block">{message.promptInterpretation.lighting}</span>
                      </div>
                    )}
                    {message.promptInterpretation.camera && (
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">کامێرا:</span>
                        <span className="text-slate-300 truncate block">{message.promptInterpretation.camera}</span>
                      </div>
                    )}
                    {message.promptInterpretation.materials && (
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">کەرەستەکان:</span>
                        <span className="text-slate-300 truncate block">{message.promptInterpretation.materials}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Text Content */}
        {renderFormattedContent(message.content)}

        {/* PDF Document Ready Banner */}
        {hasDocumentFormat && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {extractDocumentTitle(message.content, 'بەڵگەنامەی ئامادەکراو')}
                </div>
                <div className="text-[11px] text-slate-400">
                  فایلی فەرمیی PDF • ئامادەیە بۆ داگرتنی ڕاستەوخۆ و چاپکردن
                </div>
              </div>
            </div>
            <button
              id={`btn-doc-pdf-${message.id}`}
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="داگرتن و پاشەکەوتکردنی فایلی PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'ئامادەکردنی PDF...' : 'داگرتنی فایلی PDF'}</span>
            </button>
          </div>
        )}

        {/* Streaming Indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-1.5 mt-2 text-cyan-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-300" />
            <span className="text-slate-400 text-[11px] pr-1">باسۆکا بیر دەکاتەوە...</span>
          </div>
        )}

        {/* Real Grounding Citations / Web Sources Cards */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>سەرچاوەکانی وێب (Google Search Grounding):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.citations.map((c) => (
                <a
                  key={c.id}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-right flex flex-col justify-between group/cite"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-blue-300 font-medium">
                    <span className="truncate">{c.source || c.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-slate-500 group-hover/cite:text-blue-400" />
                  </div>
                  {c.snippet && (
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {c.snippet}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        {!message.isStreaming && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {/* Voice Read Aloud Button */}
              <button
                id={`btn-speech-${message.id}`}
                onClick={handleSpeakToggle}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  isPlaying
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={isPlaying ? 'ڕاگرتنی دەنگ' : 'خوێندنەوە بە دەنگ'}
              >
                {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[11px] hidden sm:inline">
                  {isPlaying ? 'دەخوێنێتەوە...' : 'گوێگرتن'}
                </span>
              </button>

              {/* Copy Button */}
              <button
                id={`btn-copy-${message.id}`}
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-1"
                title="کۆپیکردنی دەق"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] hidden sm:inline">{copied ? 'کۆپیکرا' : 'کۆپی'}</span>
              </button>

              {/* PDF Download Button for Assistant */}
              {!isUser && (
                <button
                  id={`btn-pdf-${message.id}`}
                  onClick={handleDownloadPdf}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  title="داگرتن بە فایلی PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">PDF</span>
                </button>
              )}

              {/* Regenerate button for assistant message if isLast */}
              {!isUser && isLast && onRetry && (
                <button
                  id={`btn-retry-${message.id}`}
                  onClick={onRetry}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  title="دووبارە وەڵامدانەوە"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">دووبارە</span>
                </button>
              )}

              {/* Branch Conversation button */}
              {onBranch && (
                <button
                  id={`btn-branch-${message.id}`}
                  onClick={onBranch}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-1"
                  title="لقی نوێ لەم خاڵەوە"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">لق</span>
                </button>
              )}
            </div>

            {/* Thumbs up / down feedback */}
            {!isUser && onFeedback && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onFeedback('positive')}
                  className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                    message.feedback?.rating === 'positive' ? 'text-emerald-400' : 'hover:text-slate-200'
                  }`}
                  title="وەڵامی باشە"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback('negative')}
                  className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                    message.feedback?.rating === 'negative' ? 'text-rose-400' : 'hover:text-slate-200'
                  }`}
                  title="پێویستی بە باشترکردنە"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
