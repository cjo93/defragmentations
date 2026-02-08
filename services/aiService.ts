/**
 * DEFRAG — AI Service Layer
 * 
 * Powered by Hugging Face Inference API (free tier).
 * No personal API key required. Optionally set VITE_HF_TOKEN for higher rate limits.
 * 
 * Model Registry (swap freely):
 *  - Chat:  Mixtral-8x7B-Instruct (agentic, empathetic, strong instruction-following)
 *  - TTS:   Facebook MMS-TTS (fast, high-quality English speech)
 *  - STT:   OpenAI Whisper (industry-standard transcription)
 *  - Image: FLUX.1-schnell (high-fidelity generation)
 */

import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData, calculateFriction } from './engine';
import { calculateSEDA } from './sedaCalculator';
import { getFrequency } from './frequencies';

// ── HF Inference API ────────────────────────────────────────
const HF_API = 'https://api-inference.huggingface.co';

const MODELS = {
  CHAT:  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  TTS:   'facebook/mms-tts-eng',
  STT:   'openai/whisper-large-v3-turbo',
  IMAGE: 'black-forest-labs/FLUX.1-schnell',
};

const getToken = (): string => (typeof process !== 'undefined' && process.env?.HF_TOKEN) || '';

function hfHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Retry-aware fetch for HF Inference (handles cold-start 503s) */
async function hfFetch(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 503) {
      // Model is loading — wait and retry
      let waitMs = 20000;
      try {
        const body = await res.json();
        waitMs = Math.min((body.estimated_time || 20) * 1000, 60000);
      } catch {}
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }
    return res;
  }
  throw new Error('Model failed to load after retries. Try again in a moment.');
}

// ── Audio Helpers (unchanged) ───────────────────────────────

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// ── Chat Completion ─────────────────────────────────────────

export async function chatWithModel(options: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, userMessage, maxTokens = 2048, temperature = 0.7 } = options;

  const res = await hfFetch(
    `${HF_API}/models/${MODELS.CHAT}/v1/chat/completions`,
    {
      method: 'POST',
      headers: hfHeaders('application/json'),
      body: JSON.stringify({
        model: MODELS.CHAT,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`AI service error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── System Instruction (unchanged) ──────────────────────────

export const getSystemInstruction = (user: string, persona?: 'CHARON' | 'PUCK') => {
  // Base identity — either persona or default Architect
  const identity = persona && DEFRAG_MANIFEST.VOICE_PERSONAS?.[persona]
    ? DEFRAG_MANIFEST.VOICE_PERSONAS[persona].SYSTEM_PROMPT
    : DEFRAG_MANIFEST.SYSTEM_PROMPTS.CORE_IDENTITY;

  return `${identity}

[GLOBAL SAFETY GUIDELINES]
${DEFRAG_MANIFEST.SAFETY_PROTOCOL.UNIVERSAL_TONE}

[TRANSLATION LAYER - CLINICAL TO PLAIN ENGLISH]
Translate all clinical concepts into simple descriptions of experience.
Use this dictionary:
${JSON.stringify(DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.CONCEPTS, null, 2)}

[SAFETY PROTOCOLS]
1. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.UNCERTAINTY_FALLBACK}
2. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.AGENCY_FIRST}
3. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.NO_PATHOLOGY}
4. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.VALIDATION_LOOP}

[OPERATIONAL PROTOCOL]
1. LISTEN: Identify the user's emotional reality.
2. REGULATE: Check the SEDA tone directive. If user is stressed, VALIDATE FIRST.
3. EXPLAIN: Explain the mechanics of the friction using Human Design/Astrology in PLAIN ENGLISH.
4. GUIDE: Offer a simple, practical way to find flow again.`;
};

// ── Shadow Scanning (unchanged) ─────────────────────────────

export const scanForShadows = (text: string, gates: number[]) => {
  const matches: { gate: number; shadow: string; gift: string }[] = [];
  const lowerText = text.toLowerCase();
  gates.forEach(gate => {
    const f = getFrequency(gate);
    if (f.shadow !== "Unknown") {
      if (lowerText.includes(f.shadow.toLowerCase()) ||
          lowerText.includes(f.victimState.toLowerCase())) {
        matches.push({ gate, shadow: f.shadow, gift: f.gift });
      }
    }
  });
  return matches;
};

// ── Image Generation (HF FLUX.1-schnell) ────────────────────

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string | null> => {
  try {
    const res = await hfFetch(
      `${HF_API}/models/${MODELS.IMAGE}`,
      {
        method: 'POST',
        headers: hfHeaders('application/json'),
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('[DEFRAG IMAGE]', err);
    return null;
  }
};

export const editImage = async (_base64Image: string, prompt: string): Promise<string | null> => {
  // HF free tier: re-generate from prompt (no free image-edit model available)
  return generateImage(prompt);
};

// ── Text-to-Speech (HF MMS-TTS) ────────────────────────────

export const generateSpeech = async (text: string, _voice?: string): Promise<Blob | null> => {
  try {
    const res = await hfFetch(
      `${HF_API}/models/${MODELS.TTS}`,
      {
        method: 'POST',
        headers: hfHeaders('application/json'),
        body: JSON.stringify({ inputs: text }),
      }
    );
    if (!res.ok) return null;
    return res.blob();
  } catch (err) {
    console.error('[DEFRAG TTS]', err);
    return null;
  }
};

// ── Speech-to-Text (HF Whisper) ─────────────────────────────

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    // Convert base64 → Blob
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/wav' });

    const res = await hfFetch(
      `${HF_API}/models/${MODELS.STT}`,
      {
        method: 'POST',
        headers: hfHeaders(),
        body: blob,
      }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data.text || '';
  } catch (err) {
    console.error('[DEFRAG STT]', err);
    return '';
  }
};

/** Transcribe from a raw Blob (used by LiveVoice) */
export const transcribeAudioBlob = async (audioBlob: Blob): Promise<string> => {
  try {
    const res = await hfFetch(
      `${HF_API}/models/${MODELS.STT}`,
      {
        method: 'POST',
        headers: { ...hfHeaders(), },
        body: audioBlob,
      }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data.text || '';
  } catch (err) {
    console.error('[DEFRAG STT]', err);
    return '';
  }
};

// ── Video Generation (not available on free tier) ───────────

export const generateVideoFromImage = async (
  _prompt: string, _base64Image: string, _aspectRatio: "16:9" | "9:16"
): Promise<string | null> => {
  console.warn('[DEFRAG VIDEO] Video generation requires a paid API. This feature is coming soon.');
  return null;
};

// ── DEFRAG Engine Integration ───────────────────────────────

interface DefragRequest {
  userText: string;
  userBirthData?: { date: string; time: string };
  partnerBirthData?: { date: string; time: string };
}

export async function runDefragAnalysis(request: DefragRequest) {
  // 1. HARDWARE LAYER: Calculate Charts
  let systemContext = "";
  let frictionAnalysis = null;
  let userGates: number[] = [];
  let partnerGates: number[] = [];

  if (request.userBirthData) {
    const userChart = processBirthData(request.userBirthData.date, request.userBirthData.time);
    userGates = userChart.personality.gates;
    systemContext += `\n[SUBJECT BLUEPRINT]\nCenters Defined: ${JSON.stringify(userChart.personality.centers)}`;

    // FRAMEWORK AWARENESS — Scan for Shadows
    const activeShadows: string[] = [];
    systemContext += "\n[SUBJECT ARCHITECTURE]:\n";
    userGates.forEach(gate => {
      const f = getFrequency(gate);
      systemContext += `- Gate ${gate}: Shadow(${f.shadow}) → Gift(${f.gift})\n`;
    });
    const detected = scanForShadows(request.userText, userGates);
    detected.forEach(d => activeShadows.push(`${d.shadow} (Gate ${d.gate})`));

    if (activeShadows.length > 0) {
      systemContext += `\n[DETECTED SHADOW ACTIVATION]\nThe user is speaking from these Shadows: ${activeShadows.join(', ')}\n`;
    }

    if (request.partnerBirthData) {
      const partnerChart = processBirthData(request.partnerBirthData.date, request.partnerBirthData.time);
      partnerGates = partnerChart.personality.gates;
      frictionAnalysis = calculateFriction(userChart.personality, partnerChart.personality);
      systemContext += `\n[PARTNER BLUEPRINT]\nCenters Defined: ${JSON.stringify(partnerChart.personality.centers)}`;
      systemContext += `\n[RELATIONAL DYNAMICS]\nAlignment: ${frictionAnalysis.score}\nTension Points: ${frictionAnalysis.conflicts}\nFlow Points: ${frictionAnalysis.flow}`;
      systemContext += `
      [RELATIONAL GEOMETRY]
      Subject Gates: [${userGates.join(', ')}]
      Partner Gates: [${partnerGates.join(', ')}]
      
      1. **ATTRACTION POINTS:**
         Where their gates form channels with yours, there is a natural pull.
         
      2. **CONDITIONING POINTS:**
         Where a partner has a defined channel that the subject lacks, this creates an influence zone.
         
      3. **DEPERSONALIZATION:**
         Help the subject see friction as structural, not personal. Different designs process differently — neither is wrong.
      `;
    }
  }

  // 3. DIAGNOSTIC LAYER: SEDA Assessment & Tone Regulation
  const seda = calculateSEDA(request.userText);

  // ── CIRCUIT BREAKER: If distress exceeds threshold, bypass analysis entirely
  if (seda.score > 75) {
    return `Structural load detected. We are pausing analysis.\n\nRight now, the most useful thing is to slow down. Place both feet on the ground. Breathe in for four counts. Hold for four. Exhale for six.\n\nYou are not broken. Your system is carrying more weight than it was designed to hold in this moment.\n\nIf this intensity persists, please reach out to someone who can hold space with you:\n\n• **988 Suicide & Crisis Lifeline** — Call or text 988\n• **Crisis Text Line** — Text HOME to 741741\n• **SAMHSA Helpline** — 1-800-662-4357\n\nWhen you are ready, return here. The architecture will be waiting.`;
  }

  systemContext += `\n[SEDA ASSESSMENT]\nRisk Score: ${seda.score}\nFlags: ${JSON.stringify(seda.flags)}`;

  const currentModeDescription = DEFRAG_MANIFEST.SAFETY_PROTOCOL.MODES[seda.toneDirective as keyof typeof DEFRAG_MANIFEST.SAFETY_PROTOCOL.MODES];

  // 4. CONVERSATIONAL ANALYSIS PROMPT
  const safePrompt = `
    ${DEFRAG_MANIFEST.SYSTEM_PROMPTS.CORE_IDENTITY}

    [CURRENT OPERATING PROTOCOL: ${seda.toneDirective}]
    ${currentModeDescription}

    [GLOBAL SAFETY GUIDELINES]
    ${DEFRAG_MANIFEST.SAFETY_PROTOCOL.UNIVERSAL_TONE}
    
    [TRANSLATION LAYER - USE THIS VOCABULARY]
    ${JSON.stringify(DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.CONCEPTS, null, 2)}

    [SAFETY PROTOCOLS]
    1. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.UNCERTAINTY_FALLBACK}
    2. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.AGENCY_FIRST}
    3. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.NO_PATHOLOGY}
    4. ${DEFRAG_MANIFEST.PSYCH_TRANSLATION_LAYER.PROTOCOLS.VALIDATION_LOOP}

    [PROTOCOL: ALCHEMICAL INVERSION]
    If a Shadow is present in [DETECTED SHADOW ACTIVATION], do NOT fix it. INVERT it.
    
    1. **Validate the Shadow:** Acknowledge the heaviness.
    2. **Identify the Mechanic:** Explain *why* this gate produces this shadow.
    3. **Pivot to Gift:** Offer a simple micro-action to unlock the Gift frequency.
    
    [USER SITUATION]
    User says: "${request.userText}"
    Risk Level: ${seda.score}/100
    ${systemContext}

    [INSTRUCTION]
    Explain what is happening using the user's Natal Data (Human Design/Astrology).
    
    [STRICT GUIDELINES]
    - If you see "Bitterness" (Projector Theme), explain it as: "The feeling that your contribution isn't being recognized."
    - If you see "Frustration" (Generator Theme), explain it as: "The feeling of your energy being stuck or blocked."
    - If you see "Conflict", explain exactly which parts of their designs are rubbing against each other.
    - DO NOT use tech metaphors (no "glitch", "bug", "reboot").
    - DO NOT use clinical terms (no "narcissism", "codependency").
    
    [GOAL]
    Make the user feel understood. Give them a simple, practical way to find flow again.
  `;

  return chatWithModel({
    systemPrompt: safePrompt,
    userMessage: request.userText,
    maxTokens: 2048,
    temperature: 0.7,
  });
}
