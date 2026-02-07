
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData, calculateFriction } from './engine';
import { calculateSEDA } from './sedaCalculator';
import { getFrequency } from './frequencies';

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

export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// THE DEFRAG PERSONA: Wise Guide (Plain English)
export const getSystemInstruction = (user: string) => {
  return `${DEFRAG_MANIFEST.SYSTEM_PROMPTS.CORE_IDENTITY}

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

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getGeminiInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = getGeminiInstance();
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const ai = getGeminiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = getGeminiInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
          { text: "Transcribe this audio exactly. Return only the text." }
        ]
      }
    ]
  });
  return response.text;
};

export const generateVideoFromImage = async (prompt: string, base64Image: string, aspectRatio: "16:9" | "9:16") => {
  const ai = getGeminiInstance();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: { imageBytes: base64Image.split(',')[1] || base64Image, mimeType: 'image/png' },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  return URL.createObjectURL(await res.blob());
};

// --- DEFRAG ENGINE INTEGRATION ---

interface DefragRequest {
  userText: string;
  userBirthData?: { date: string; time: string }; // User A
  partnerBirthData?: { date: string; time: string }; // User B (Optional)
}

export async function runDefragAnalysis(request: DefragRequest) {
  const ai = getGeminiInstance();

  // 1. HARDWARE LAYER: Calculate Charts
  let systemContext = "";
  let frictionAnalysis = null;
  let userGates: number[] = [];
  let partnerGates: number[] = [];

  if (request.userBirthData) {
    const userChart = processBirthData(request.userBirthData.date, request.userBirthData.time);
    userGates = userChart.personality.gates;
    
    systemContext += `\n[USER DESIGN DATA]\ncenters_defined: ${JSON.stringify(userChart.personality.centers)}`;
    
    // FRAMEWORK AWARENESS - Scan for Shadows
    const activeShadows: string[] = [];
    systemContext += "\n[USER HARDWARE SPECS]:\n";
    userGates.forEach(gate => {
       const f = getFrequency(gate);
       systemContext += `- Gate ${gate}: Shadow(${f.shadow}) -> Gift(${f.gift})\n`;
    });
    const detected = scanForShadows(request.userText, userGates);
    detected.forEach(d => activeShadows.push(`${d.shadow} (Gate ${d.gate})`));
    
    if (activeShadows.length > 0) {
      systemContext += `\n[DETECTED SHADOW ACTIVATION]\nThe user is speaking from these Shadows: ${activeShadows.join(', ')}\n`;
    }

    if (request.partnerBirthData) {
      const partnerChart = processBirthData(request.partnerBirthData.date, request.partnerBirthData.time);
      partnerGates = partnerChart.personality.gates;
      // 2. PHYSICS LAYER: Calculate Friction
      frictionAnalysis = calculateFriction(userChart.personality, partnerChart.personality);
      systemContext += `\n[PARTNER DESIGN DATA]\ncenters_defined: ${JSON.stringify(partnerChart.personality.centers)}`;
      systemContext += `\n[RELATIONAL PHYSICS]\nScore: ${frictionAnalysis.score}\nConflicts: ${frictionAnalysis.conflicts}\nFlow: ${frictionAnalysis.flow}`;
      
      systemContext += `
      [RELATIONAL DYNAMICS - CROSS-CHECK]
      User Gates: [${userGates.join(', ')}]
      Partner Gates: [${partnerGates.join(', ')}]
      
      1. **ELECTROMAGNETIC HOOKS:**
         If User has Gate X and Partner has Gate Y (and they form a Channel), check if the User's text is about "Attraction" or "Repulsion."
         
      2. **DOMINANCE (THE TRIGGER):**
         If Partner has a full Channel that the User has NONE of, this is a conditioning point.
         *Example:* "Your partner has the Channel of Judgment (18-58). You might feel criticized, but mechanically, they are just trying to correct the pattern, not you."
         
      3. **INVERSION FOR GROUPS:**
         If the group dynamic is "Critical," guide the user to see it as "Correction" (the Gift of Gate 18).
         Help the user **depersonalize** the behavior.
      `;
    }
  }

  // 3. DIAGNOSTIC LAYER: SEDA Assessment & Tone Regulation
  const seda = calculateSEDA(request.userText);
  systemContext += `\n[SEDA ASSESSMENT]\nRisk Score: ${seda.score}\nFlags: ${JSON.stringify(seda.flags)}`;

  // Select the Tone based on SEDA
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
    
    1. **Validate the Shadow:** Acknowledge the heaviness (e.g., "It makes sense you feel [Shadow] right now.")
    2. **Identify the Mechanic:** Explain *why* this gate produces this shadow (e.g., "Gate 63 is designed to doubt so it can find the truth, but right now it's just spinning.")
    3. **Pivot to Gift:** Offer a simple micro-action to unlock the Gift frequency. (e.g., "To move from Doubt to Inquiry, ask a question you *can* answer.")
    
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

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: safePrompt,
  });

  return response.text;
}
