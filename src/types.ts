export type Role = 'user' | 'assistant' | 'system';

export interface Citation {
  id: string;
  source: string;
  snippet: string;
  url?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // 'image', 'document', 'audio', 'code', 'data'
  size: number;
  mimeType: string;
  dataUrl?: string; // base64
  extractedText?: string;
}

export interface KurdishCorrection {
  original: string;
  improved: string;
  reason: string;
}

export interface MessageFeedback {
  rating: 'positive' | 'negative';
  comment?: string;
  timestamp: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  modelUsed?: string;
  modelNameBadge?: string;
  isStreaming?: boolean;
  error?: string;
  isFallback?: boolean;
  fallbackReason?: string;
  attachments?: Attachment[];
  citations?: Citation[];
  generatedImageUrl?: string;
  feedback?: MessageFeedback;
  kurdishQualityChecked?: boolean;
  kurdishCorrections?: KurdishCorrection[];
  decisionTrace?: string[];
  refinementStep?: 'draft' | 'checked' | 'improved' | 'final';
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  projectId?: string;
  modelPreference?: string;
  autoModeEnabled?: boolean;
  pinned?: boolean;
  summary?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'custom';
  descriptionKurdish: string;
  contextWindow: string;
  speed: 'خێرا' | 'زۆر خێرا' | 'مامناوەند';
  tier: 'خۆڕایی' | 'پێشکەوتوو';
  capabilities: {
    text: boolean;
    vision: boolean;
    imageGen: boolean;
    audio: boolean;
    coding: boolean;
    reasoning: boolean;
    rag: boolean;
  };
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  fileIds: string[];
  memoryScope?: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'project' | 'instruction' | 'language';
  content: string;
  confidence: number; // 0 - 100%
  source: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'image' | 'code' | 'other';
  uploadedAt: string;
  contentSnippet?: string;
  fullText?: string;
  chunksCount?: number;
  tags: string[];
  summary?: string;
}

export interface WorkflowNode {
  id: string;
  title: string;
  type: 'prompt' | 'condition' | 'tool' | 'approval' | 'summary' | 'notification';
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  createdAt: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'draft';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'security' | 'model' | 'tool' | 'auth' | 'backup' | 'storage';
  details: string;
  level: 'info' | 'warn' | 'error';
}

export interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
  modelsAvailable: number;
  hasApiKey: boolean;
}

export interface OwnerSettings {
  ownerGreeting: string; // Default: "سڵاو چۆنی سەرۆک؟"
  autoReadAloud: boolean; // Default: true as requested in instruction #26
  watermarkEnabled: boolean; // Default: true
  watermarkOpacity: number; // 0.02 - 0.15
  autoRouterEnabled: boolean; // Default: true
  preferredModel: string;
  speechRate: number; // 0.8 - 1.5
  speechVoice: string; // 'ar-IQ', 'ku', 'fa-IR', 'auto'
  responseStyle: 'هاوسەنگ' | 'کورت و پوخت' | 'ورد و زانستی' | 'هاوڕێیانە';
  kurdishQualityLayer: boolean; // Default: true
  approvalGateEnabled: boolean; // Default: true for sensitive actions
}
