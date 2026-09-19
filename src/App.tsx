import React, { useState, useEffect, useRef } from 'react';
import {
  Message,
  Conversation,
  Project,
  MemoryItem,
  FileItem,
  Workflow,
  Attachment,
  OwnerSettings,
} from './types';
import { storage, DEFAULT_SETTINGS } from './lib/storage';
import { autoRouteModel } from './lib/models';
import { normalizeKurdishText } from './lib/kurdish';
import { tts } from './lib/audio';
import { Watermark } from './components/Watermark';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInputBar } from './components/ChatInputBar';
import { ConversationDrawer } from './components/ConversationDrawer';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { ProjectsModal } from './components/ProjectsModal';
import { MemoryModal } from './components/MemoryModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { ModelCompareModal } from './components/ModelCompareModal';
import { WorkflowsModal } from './components/WorkflowsModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { Sparkles, Terminal } from 'lucide-react';

export default function App() {
  // 1. Persistent State Initialization
  const [settings, setSettings] = useState<OwnerSettings>(() => storage.getSettings());
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations()
  );
  const [activeConvId, setActiveConvId] = useState<string | null>(() =>
    storage.getActiveConversationId()
  );
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(undefined);
  const [memories, setMemories] = useState<MemoryItem[]>(() => storage.getMemories());
  const [files, setFiles] = useState<FileItem[]>(() => storage.getFiles());
  const [workflows, setWorkflows] = useState<Workflow[]>(() => storage.getWorkflows());

  // 2. Active Session State
  const [selectedModel, setSelectedModel] = useState<string>(settings.preferredModel);
  const [autoMode, setAutoMode] = useState<boolean>(settings.autoRouterEnabled);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 3. Modal Toggles
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // 4. Keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5. Initialize or Ensure an Active Conversation with Owner Greeting
  useEffect(() => {
    let currentConvs = storage.getConversations();

    if (currentConvs.length === 0) {
      // First session: create primary conversation with the owner greeting
      const greetingText = `${settings.ownerGreeting}\nمن سیستەمی ژیری دەستکردی کەسی تۆم (Basoka AI). لە هەموو بوارەکانی بەرنامەسازی، نووسین، بەڕێوەبردنی پڕۆژە و شیکاریدا بە زمانی کوردیی سۆرانی لە خزمەتتدام. ئەمڕۆ چۆن یارمەتیت بدەم؟`;
      const initialConv: Conversation = {
        id: 'conv-' + Date.now(),
        title: 'گفتوگۆی سەرەتا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-init-' + Date.now(),
            role: 'assistant',
            content: greetingText,
            timestamp: new Date().toISOString(),
            modelNameBadge: 'basoka core',
          },
        ],
      };
      currentConvs = [initialConv];
      setConversations(currentConvs);
      storage.saveConversations(currentConvs);
      setActiveConvId(initialConv.id);
      storage.setActiveConversationId(initialConv.id);

      // Auto Read Aloud greeting if enabled
      if (settings.autoReadAloud) {
        tts.speak(greetingText);
      }
    } else if (!activeConvId || !currentConvs.some((c) => c.id === activeConvId)) {
      setActiveConvId(currentConvs[0].id);
      storage.setActiveConversationId(currentConvs[0].id);
    }
  }, []);

  // 6. Current active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Handle New Conversation
  const handleNewConversation = () => {
    const greetingText = `${settings.ownerGreeting}\nچۆن دەتوانم لەم گفتوگۆیەدا یارمەتیت بدەم سەرۆک؟`;
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'گفتوگۆی نوێ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId,
      messages: [
        {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: greetingText,
          timestamp: new Date().toISOString(),
          modelNameBadge: 'basoka ai',
        },
      ],
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    storage.saveConversations(updated);
    setActiveConvId(newConv.id);
    storage.setActiveConversationId(newConv.id);

    if (settings.autoReadAloud) {
      tts.speak(greetingText);
    }
  };

  // Handle Delete Conversation
  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    storage.saveConversations(remaining);
    if (activeConvId === id) {
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
        storage.setActiveConversationId(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  // Handle Export Single Conversation
  const handleExportConversation = (conv: Conversation) => {
    const json = JSON.stringify(conv, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${conv.title || 'export'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Send Message & Streaming response
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!activeConversation) return;

    // Normalize user text
    const normalizedUserText = normalizeKurdishText(text);

    // Create user message
    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: normalizedUserText,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Auto Model Routing Decision
    let targetModel = selectedModel;
    let modelBadge = selectedModel;
    let isImageTask = false;

    if (autoMode) {
      const decision = autoRouteModel(
        normalizedUserText,
        attachments.some((a) => a.type === 'image'),
        attachments.some((a) => a.type === 'audio')
      );
      targetModel = decision.selectedModel;
      modelBadge = decision.modelName;
      isImageTask = decision.isImageTask;
    }

    // Placeholder assistant message for streaming
    const assistantMsgId = 'asst-' + Date.now();
    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      modelUsed: targetModel,
      modelNameBadge: modelBadge,
    };

    // Update conversation with user message and streaming placeholder
    const updatedMessages = [...activeConversation.messages, userMessage, assistantPlaceholder];
    const updatedConv: Conversation = {
      ...activeConversation,
      title:
        activeConversation.messages.length <= 1
          ? normalizedUserText.slice(0, 30) || 'گفتوگۆ'
          : activeConversation.title,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    const newConvs = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
    setConversations(newConvs);
    storage.saveConversations(newConvs);

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if this is an image generation task
    if (isImageTask) {
      try {
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: normalizedUserText }),
          signal: controller.signal,
        });
        const data = await res.json();

        let finalContent = 'فەرموو سەرۆک، وێنەکە بە سەرکەوتوویی ئامادە کرا.';
        let imageUrl: string | undefined = undefined;

        if (data.imageUrl) {
          imageUrl = data.imageUrl;
          if (data.description) {
            finalContent = data.description;
          }
        } else if (data.description) {
          finalContent = data.description;
        } else if (data.error) {
          finalContent = `ببورە سەرۆک، کێشەیەک ڕوویدا: ${data.error}`;
        }

        finalizeAssistantMessage(
          updatedConv.id,
          assistantMsgId,
          finalContent,
          imageUrl,
          data.isQuotaFallback ? 'basoka creative' : 'gemini image studio',
          data.isQuotaFallback
        );
      } catch (err: any) {
        finalizeAssistantMessage(
          updatedConv.id,
          assistantMsgId,
          `ببورە سەرۆک، نەتوانرا پەیوەندی بە بزوێنەری وێنە ببەسترێت: ${err?.message || 'هەڵەی نەزانراو'}`
        );
      }
      return;
    }

    // Normal Text / Multimodal Chat Streaming
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(0, -1), // send history up to the user message
          model: targetModel,
          projectInstructions: activeProject?.instructions || '',
          memories: memories.map((m) => ({ content: m.content })),
          kurdishQuality: settings.kurdishQualityLayer,
        }),
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error('پەیوەندی لەگەڵ سێرڤەر بەردەست نییە');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let isFallback = false;
      let usedModelName = modelBadge;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.fallbackNotice) {
                accumulatedContent += data.fallbackNotice;
                isFallback = true;
              }

              if (data.text) {
                accumulatedContent += data.text;
                updateStreamingMessage(
                  updatedConv.id,
                  assistantMsgId,
                  accumulatedContent,
                  false,
                  usedModelName,
                  isFallback
                );
              }

              if (data.error) {
                accumulatedContent += `\n[هەڵە: ${data.error}]`;
                updateStreamingMessage(
                  updatedConv.id,
                  assistantMsgId,
                  accumulatedContent,
                  false,
                  usedModelName,
                  isFallback
                );
              }

              if (data.done) {
                // Done event
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Finalize the message
      finalizeAssistantMessage(
        updatedConv.id,
        assistantMsgId,
        accumulatedContent,
        undefined,
        usedModelName,
        isFallback
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        finalizeAssistantMessage(
          updatedConv.id,
          assistantMsgId,
          `ببورە سەرۆک، پەیوەندی نائاسایی بوو: ${err?.message || 'هەڵەی نەزانراو'}`
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Helper to update streaming assistant message
  const updateStreamingMessage = (
    convId: string,
    msgId: string,
    content: string,
    isFinal: boolean,
    modelName?: string,
    isFallback?: boolean
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            return {
              ...m,
              content,
              isStreaming: !isFinal,
              modelNameBadge: modelName || m.modelNameBadge,
              isFallback: isFallback ?? m.isFallback,
            };
          }),
        };
      })
    );
  };

  // Helper to finalize assistant message and auto read aloud
  const finalizeAssistantMessage = (
    convId: string,
    msgId: string,
    finalContent: string,
    imageUrl?: string,
    modelName?: string,
    isFallback?: boolean
  ) => {
    setIsStreaming(false);
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            return {
              ...m,
              content: finalContent,
              isStreaming: false,
              generatedImageUrl: imageUrl,
              modelNameBadge: modelName || m.modelNameBadge,
              isFallback: isFallback ?? m.isFallback,
            };
          }),
        };
      });
      storage.saveConversations(updated);
      return updated;
    });

    // Auto Read Aloud (Mandated in instruction #26)
    if (settings.autoReadAloud && finalContent.trim()) {
      tts.speak(finalContent);
    }
  };

  // Stop Generation
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Retry last assistant message
  const handleRetryLastMessage = () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const msgs = activeConversation.messages;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments || []);
    }
  };

  // Branch conversation from a specific message
  const handleBranchConversation = (msgId: string) => {
    if (!activeConversation) return;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    const branchedMessages = activeConversation.messages.slice(0, msgIndex + 1);
    const newConv: Conversation = {
      id: 'conv-branch-' + Date.now(),
      title: `لق لە: ${activeConversation.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId,
      messages: branchedMessages,
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    storage.saveConversations(updated);
    setActiveConvId(newConv.id);
    storage.setActiveConversationId(newConv.id);
  };

  // Handle Feedback
  const handleFeedback = (msgId: string, rating: 'positive' | 'negative') => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== activeConvId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId) return m;
            return {
              ...m,
              feedback: {
                rating,
                timestamp: new Date().toISOString(),
              },
            };
          }),
        };
      });
      storage.saveConversations(updated);
      return updated;
    });
  };

  // Quick Tool execution from command palette or suggestions
  const handleQuickTool = async (toolName: string) => {
    if (toolName === 'calculator') {
      handleSendMessage('تکایە ئەم هاوکێشەیە شیکار بکە: (125 * 45) + 380', []);
    } else if (toolName === 'kurdish_refine') {
      handleSendMessage('تکایە ئەم دەقە لە ڕووی ڕێزمانی و پیتە کوردییەکانەوە بپشکنە و باشی بکە.', []);
    }
  };

  // Run Workflow
  const handleRunWorkflow = (wf: Workflow) => {
    handleSendMessage(`[جێبەجێکردنی کارپێکردنی خۆکاری: ${wf.name}]\nتکایە هەنگاوەکانی ئەم پڕۆسەیە لەسەر داواکارییەکە جێبەجێ بکە.`, []);
  };

  // Ask about file from knowledge base
  const handleAskAboutFile = (file: FileItem) => {
    handleSendMessage(`تکایە ئەم فایلەم بۆ شی بکەرەوە بە کوردی و پوختە سەرەکییەکانی دیاری بکە:\n[فایل: ${file.name}]\n${file.contentSnippet || ''}`, []);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between font-sans antialiased overflow-x-hidden" dir="rtl">
      {/* Subtle Animated Watermark */}
      <Watermark enabled={settings.watermarkEnabled} opacity={settings.watermarkOpacity} />

      {/* Header */}
      <ChatHeader
        onToggleDrawer={() => setIsDrawerOpen(true)}
        onNewChat={handleNewConversation}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenKnowledgeBase={() => setIsFilesOpen(true)}
        onOpenModelCompare={() => setIsCompareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        hasActiveProject={Boolean(activeProjectId)}
        activeProjectName={activeProject?.name}
      />

      {/* Main Chat Flow */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 py-4 flex flex-col justify-between">
        {/* Messages List Container */}
        <div className="flex-1 w-full space-y-4 pb-4">
          {activeConversation?.messages.map((msg, index) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isLast={index === activeConversation.messages.length - 1}
              onRetry={handleRetryLastMessage}
              onFeedback={(rating) => handleFeedback(msg.id, rating)}
              onBranch={() => handleBranchConversation(msg.id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips when conversation is fresh */}
        {activeConversation?.messages.length <= 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {[
              'سەرۆک، بەرنامەیەکی بەسوودم بۆ دروست بکە',
              'کۆدێکی تاقیکردنەوە بە TypeScript بنووسە',
              'وێنەیەکی داهێنەرانە بۆ من بکێشە',
              'کورتەیەک لەسەر تەکنەلۆژیای ژیری دەستکرد',
            ].map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(suggestion, [])}
                className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Fixed or Sticky Input Bar */}
        <ChatInputBar
          onSend={handleSendMessage}
          onStop={handleStopStream}
          isStreaming={isStreaming}
          selectedModel={selectedModel}
          onSelectModel={(m) => {
            setSelectedModel(m);
            setAutoMode(false);
          }}
          autoMode={autoMode}
          onToggleAutoMode={() => setAutoMode(!autoMode)}
          projectName={activeProject?.name}
        />
      </main>

      {/* Modals and Drawers (Progressive Disclosure) */}
      <ConversationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        conversations={conversations}
        activeId={activeConvId}
        onSelectConversation={(id) => {
          setActiveConvId(id);
          storage.setActiveConversationId(id);
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onExportConversation={handleExportConversation}
      />

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onNewChat={handleNewConversation}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenKnowledgeBase={() => setIsFilesOpen(true)}
        onOpenModelCompare={() => setIsCompareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenWorkflows={() => setIsWorkflowsOpen(true)}
        onSelectModel={(m) => {
          setSelectedModel(m);
          setAutoMode(false);
        }}
        onQuickTool={handleQuickTool}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          storage.saveSettings(newSettings);
        }}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onCreateProject={(newP) => {
          const created: Project = {
            id: 'proj-' + Date.now(),
            ...newP,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [...projects, created];
          setProjects(updated);
          storage.saveProjects(updated);
        }}
        onDeleteProject={(id) => {
          const filtered = projects.filter((p) => p.id !== id);
          setProjects(filtered);
          storage.saveProjects(filtered);
          if (activeProjectId === id) setActiveProjectId(undefined);
        }}
      />

      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onAddMemory={(mem) => {
          const item: MemoryItem = {
            id: 'mem-' + Date.now(),
            ...mem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [item, ...memories];
          setMemories(updated);
          storage.saveMemories(updated);
        }}
        onDeleteMemory={(id) => {
          const filtered = memories.filter((m) => m.id !== id);
          setMemories(filtered);
          storage.saveMemories(filtered);
        }}
        onClearAll={() => {
          setMemories([]);
          storage.saveMemories([]);
        }}
      />

      <KnowledgeBaseModal
        isOpen={isFilesOpen}
        onClose={() => setIsFilesOpen(false)}
        files={files}
        onUploadFiles={(newFiles) => {
          const updated = [...newFiles, ...files];
          setFiles(updated);
          storage.saveFiles(updated);
        }}
        onDeleteFile={(id) => {
          const filtered = files.filter((f) => f.id !== id);
          setFiles(filtered);
          storage.saveFiles(filtered);
        }}
        onAskAboutFile={handleAskAboutFile}
      />

      <ModelCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <WorkflowsModal
        isOpen={isWorkflowsOpen}
        onClose={() => setIsWorkflowsOpen(false)}
        workflows={workflows}
        onRunWorkflow={handleRunWorkflow}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}
