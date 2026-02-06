
export enum View {
  DASHBOARD = 'DASHBOARD',
  LIVE_VOICE = 'LIVE_VOICE',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_LAB = 'VIDEO_LAB',
  CHATBOT = 'CHATBOT',
  TRANSCRIBER = 'TRANSCRIBER',
  SPEECH_LAB = 'SPEECH_LAB',
  INTELLIGENCE = 'INTELLIGENCE',
  SAFE_PLACE = 'SAFE_PLACE'
}

export type UserProfile = 'PILLAR_USER';

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
}
