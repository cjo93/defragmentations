
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
}
