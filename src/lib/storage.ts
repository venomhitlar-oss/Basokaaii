import {
  Conversation,
  Project,
  MemoryItem,
  FileItem,
  Workflow,
  AuditLog,
  OwnerSettings,
} from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'basoka_conversations',
  ACTIVE_CONVERSATION: 'basoka_active_conv',
  PROJECTS: 'basoka_projects',
  ACTIVE_PROJECT: 'basoka_active_project',
  MEMORIES: 'basoka_memories',
  FILES: 'basoka_files',
  WORKFLOWS: 'basoka_workflows',
  AUDIT_LOGS: 'basoka_audit_logs',
  SETTINGS: 'basoka_owner_settings',
  FIRST_RUN: 'basoka_has_opened_before',
};

export const DEFAULT_SETTINGS: OwnerSettings = {
  ownerGreeting: 'سڵاو چۆنی سەرۆک؟', // Mandated owner greeting
  autoReadAloud: true, // Mandated in requirement #26
  watermarkEnabled: true,
  watermarkOpacity: 0.05,
  autoRouterEnabled: true,
  preferredModel: 'gemini-3.8-flash',
  speechRate: 1.0,
  speechVoice: 'auto',
  responseStyle: 'هاوسەنگ',
  kurdishQualityLayer: true,
  approvalGateEnabled: true,
};

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'language',
    content: 'سەرۆک زمانی کوردی سۆرانی پەسەند دەکات بە نووسینی پوخت و ڕێزمانی دروست.',
    confidence: 100,
    source: 'ڕێکخستنی بنەڕەتی سەرۆک',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'preference',
    content: 'سیستەمی باسۆکا ڕاستەوخۆ دەچێتە سەر کڕۆکی داواکارییەکان بەبێ زیادەبێژی.',
    confidence: 95,
    source: 'یاسای کارگێڕی باسۆکا',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const storage = {
  // Settings
  getSettings(): OwnerSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: OwnerSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  // First Run check for greeting
  isFirstSession(): boolean {
    const seen = sessionStorage.getItem('basoka_session_seen');
    if (!seen) {
      sessionStorage.setItem('basoka_session_seen', 'true');
      return true;
    }
    return false;
  },

  // Conversations
  getConversations(): Conversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveConversations(conversations: Conversation[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  },

  getActiveConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  },

  setActiveConversationId(id: string | null) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  },

  // Projects
  getProjects(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'proj-default',
        name: 'پڕۆژەی بنەڕەتی',
        description: 'فەزای کاری گشتی سەرۆک',
        instructions: 'وەڵامەکان بە زمانی کوردی سۆرانی پاک و پوخت بن.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#06b6d4',
        fileIds: [],
      },
    ];
  },

  saveProjects(projects: Project[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  },

  // Memories
  getMemories(): MemoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MEMORIES;
  },

  saveMemories(memories: MemoryItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error(e);
    }
  },

  // Files
  getFiles(): FileItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FILES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveFiles(files: FileItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch (e) {
      console.error(e);
    }
  },

  // Workflows
  getWorkflows(): Workflow[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'wf-1',
        name: 'کورتەی بەڵگەنامە و پشکنینی کوردی',
        description: 'کورتکردنەوەی فایل و پاکتاوکردنی ڕێزمانی بە شێوەی خۆکار',
        createdAt: new Date().toISOString(),
        status: 'active',
        nodes: [
          { id: 'n1', title: 'خوێندنەوەی بەڵگەنامە', type: 'tool', config: { tool: 'doc_reader' } },
          { id: 'n2', title: 'کورتکردنەوە بە ژیری دەستکرد', type: 'prompt', config: { model: 'gemini-3.8-flash' } },
          { id: 'n3', title: 'پشکنینی کوالێتی کوردی', type: 'approval', config: { gate: true } },
        ],
      },
    ];
  },

  saveWorkflows(workflows: Workflow[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.error(e);
    }
  },

  // Audit logs
  getAuditLogs(): AuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
      const logs = this.getAuditLogs();
      const newEntry: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        ...entry,
      };
      logs.unshift(newEntry);
      // Keep last 100 entries
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
  },

  // Universal Backup & Export
  exportAllData(): string {
    const backup = {
      brand: 'basoka ai',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      conversations: this.getConversations(),
      projects: this.getProjects(),
      memories: this.getMemories(),
      files: this.getFiles(),
      workflows: this.getWorkflows(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Universal Restore & Import
  restoreAllData(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.brand || data.brand !== 'basoka ai') {
        return { success: false, message: 'فایلی هاوردەکراو فایلی پشتڕاستکراوی باسۆکا ئەی ئای نییە.' };
      }
      if (data.settings) this.saveSettings(data.settings);
      if (data.conversations) this.saveConversations(data.conversations);
      if (data.projects) this.saveProjects(data.projects);
      if (data.memories) this.saveMemories(data.memories);
      if (data.files) this.saveFiles(data.files);
      if (data.workflows) this.saveWorkflows(data.workflows);
      if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));

      this.addAuditLog({
        action: 'restore_backup',
        category: 'backup',
        details: 'داتای سیستەم بە سەرکەوتوویی لە فایلی پارێزراو گەڕێندرایەوە',
        level: 'info',
      });

      return { success: true, message: 'داتاکان بە سەرکەوتوویی گەڕێندرانەوە.' };
    } catch (e: any) {
      return { success: false, message: `هەڵە لە خوێندنەوەی فایل: ${e.message}` };
    }
  },
};
