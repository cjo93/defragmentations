
export enum View {
  DASHBOARD = 'DASHBOARD',
  MANUAL = 'MANUAL',
  ORBIT = 'ORBIT',
  LIVE_VOICE = 'LIVE_VOICE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_LAB = 'VIDEO_LAB',
  CHATBOT = 'CHATBOT',
  TRANSCRIBER = 'TRANSCRIBER',
  SPEECH_LAB = 'SPEECH_LAB',
  INTELLIGENCE = 'INTELLIGENCE',
  SAFE_PLACE = 'SAFE_PLACE',
  SIGNAL = 'SIGNAL',
  ECHO = 'ECHO'
}

export type UserProfile = 'PILLAR_USER';

// Canvas types for inline feature rendering in chat
export type CanvasType = 'BLUEPRINT' | 'BREATHING' | 'ORBIT' | 'PATTERN' | 'EXPLAIN';

export interface CanvasBlock {
  type: CanvasType;
  title?: string;
  data?: Record<string, any>;
}

// Update GroundingChunk properties to be optional to align with @google/genai SDK response types
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  grounding?: GroundingChunk[];
  isThinking?: boolean;
  canvas?: CanvasBlock;
  /** Attached upload metadata (photos, docs) */
  attachment?: UploadedAsset;
}

// ── Global Memory System ────────────────────────────────────
// A single persistent object shared across every tab and thread.
// Tabs are views/modes over one shared state — never separate memory per tab.

export interface UploadedAsset {
  id: string;
  type: 'image' | 'document';
  filename: string;
  /** Base64 data URI or extracted text content */
  content: string;
  /** Structured insights extracted by AI */
  extractedInsights?: string[];
  /** Which memory sections were updated from this upload */
  memorySections?: (keyof GlobalMemory)[];
  uploadedAt: string;
}

export interface MemoryThread {
  id: string;
  name: string;
  /** What this situation is about */
  summary: string;
  /** Related memory sections */
  relatedSections: (keyof GlobalMemory)[];
  /** Key observations from the AI across conversations */
  observations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipEntry {
  id: string;
  name: string;
  relationship: string;
  /** Key dynamics observed by AI (e.g., "tension carrier", "projection target") */
  dynamics: string[];
  /** Structural notes from blueprint comparison if available */
  structuralNotes?: string;
  lastMentioned: string;
}

export interface PatternEntry {
  id: string;
  theme: string;
  /** How many times this pattern has surfaced */
  frequency: number;
  /** AI's structural description of why this pattern runs */
  mechanism: string;
  /** Suggested adjustment */
  adjustment: string;
  /** Entries/dates where this pattern was detected */
  occurrences: string[];
  lastSeen: string;
}

export interface StabilitySnapshot {
  score: number;
  status: string;
  spectrum: 'ENTROPY' | 'INTEGRATION' | 'EXPANSION';
  toneDirective: string;
  /** Rolling context: what changed stability recently */
  recentShifts: string[];
  lastAssessed: string;
}

export interface ProfileMemory {
  type?: string;
  strategy?: string;
  authority?: string;
  gates?: number[];
  /** AI-observed stress patterns specific to this user */
  stressPatterns: string[];
  /** AI-observed strengths / gift activations */
  giftActivations: string[];
  /** Freeform notes the AI accumulates about who this person is */
  selfArchitectureNotes: string[];
}

export interface GlobalMemory {
  profile: ProfileMemory;
  relationships: RelationshipEntry[];
  patterns: PatternEntry[];
  stability: StabilitySnapshot;
  threads: MemoryThread[];
  uploads: UploadedAsset[];
  /** ISO timestamp of last memory write */
  lastUpdated: string;
  /** Schema version for future migrations */
  version: number;
}

/** Sections the AI can write back to after each response */
export type MemoryUpdateSection = keyof Omit<GlobalMemory, 'lastUpdated' | 'version'>;
