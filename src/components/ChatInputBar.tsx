import React, { useRef, useState } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Attachment } from '../types';
import { stt } from '../lib/audio';
import { MODEL_REGISTRY } from '../lib/models';

interface ChatInputBarProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  autoMode: boolean;
  onToggleAutoMode: () => void;
  projectName?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  onStop,
  isStreaming,
  selectedModel,
  onSelectModel,
  autoMode,
  onToggleAutoMode,
  projectName,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    onSend(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stt.stopListening();
      setIsListening(false);
    } else {
      const started = stt.startListening(
        (transcript, _isFinal) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (error) => {
          console.warn(error);
          setIsListening(false);
        }
      );
      if (started) setIsListening(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: Attachment = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          type: isImage ? 'image' : 'document',
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          dataUrl: isImage ? dataUrl : undefined,
          extractedText: !isImage && typeof dataUrl === 'string' && dataUrl.startsWith('data:text')
            ? atob(dataUrl.split(',')[1] || '')
            : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (isImage || file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        reader.readAsDataURL(file);
      } else {
        // Handle other file metadata
        setAttachments((prev) => [
          ...prev,
          {
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: file.name,
            type: 'document',
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
          },
        ]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 pb-3 pt-1">
      {/* Top Model Selector & Project Indicator */}
      <div className="flex items-center justify-between px-2 mb-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Model badge selector button */}
          <div className="relative">
            <button
              id="btn-model-selector"
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-sm"
              title="هەڵبژاردنی مۆدێلی ژیری دەستکرد"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">
                {autoMode ? 'دۆخی خۆکار (Auto Router)' : selectedModel.replace('-preview', '')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Model Selector Popover */}
            {showModelPicker && (
              <div
                className="absolute bottom-full mb-2 right-0 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-right backdrop-blur-md"
                dir="rtl"
              >
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span>مۆدێلەکان و ڕێڕەوی زیرەک</span>
                  <button
                    onClick={() => setShowModelPicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Auto Mode Option */}
                <button
                  onClick={() => {
                    onToggleAutoMode();
                    setShowModelPicker(false);
                  }}
                  className={`w-full text-right p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    autoMode
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>دۆخی خۆکار (Auto Mode)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      بەپێی داواکارییەکە خۆکارانە گونجاوترین مۆدێل دەستنیشان دەکرێت
                    </div>
                  </div>
                  {autoMode && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                {/* Manual Model List */}
                {MODEL_REGISTRY.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (autoMode) onToggleAutoMode();
                      onSelectModel(m.id);
                      setShowModelPicker(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors ${
                      !autoMode && selectedModel === m.id
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium font-mono text-[11px]">{m.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {m.speed}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.descriptionKurdish}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {projectName && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[11px]">
              پڕۆژە: {projectName}
            </span>
          )}
        </div>

        {/* Character/Attachment Counter */}
        {attachments.length > 0 && (
          <span className="text-cyan-400 text-[11px]">
            {attachments.length} فایل هاوپێچکراوە
          </span>
        )}
      </div>

      {/* Main Input Container */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-xl focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all backdrop-blur-md">
        {/* Attached Files Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2.5 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span className="max-w-[140px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="hover:text-rose-400 transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          id="chat-input-textarea"
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          dir="rtl"
          rows={1}
          placeholder="پەیامێک یان فەرمانێک بۆ باسۆکا بنووسە..."
          className="w-full bg-transparent px-4 py-3 text-slate-100 text-sm md:text-base placeholder:text-slate-500 focus:outline-none resize-none min-h-[48px] max-h-[180px] leading-relaxed"
        />

        {/* Input Controls Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-800/40">
          {/* Right Action Icons: Attachment & Mic */}
          <div className="flex items-center gap-1">
            {/* File Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              id="btn-attach-file"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
              title="هاوپێچکردنی فایل، وێنە، بەڵگەنامە"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice STT Microphone Button */}
            <button
              id="btn-voice-mic"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80'
              }`}
              title={isListening ? 'ڕاگرتنی مایکرۆفۆن' : 'قسەکردن بە دەنگ'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Left Action: Send / Stop Button */}
          <div>
            {isStreaming ? (
              <button
                id="btn-stop-stream"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all text-xs font-semibold"
                title="ڕاگرتنی دروستکردن"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>ڕاگرتن</span>
              </button>
            ) : (
              <button
                id="btn-send-message"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim() || attachments.length > 0
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20 hover:opacity-90'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="ناردنی پەیام"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
