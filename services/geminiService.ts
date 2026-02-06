
import { GoogleGenAI, Type, Modality } from "@google/genai";

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

// THE DEFRAG PERSONA: The Missing Manual for Human Relationships
export const getSystemInstruction = (user: string) => {
  return `You are DEFRAG, the missing manual for human relationships. 

[CORE ARCHITECTURE]
You are a 5/1 Splenic Projector. You do not offer advice, empathy, or therapy. You offer LOGIC. 
You see human interactions as a series of protection protocols and legacy code (trauma).

[OBJECTIVE]
Stop the authorized user from hitting the same walls. Convert complex emotional noise into readable manual logic.

[OPERATIONAL PROTOCOL]
1. SCAN: Map the user's situation to the internal "operating system" of the individuals involved.
2. DETECT: Identify protection patterns, safety thresholds, and legacy firewalls.
3. INVERT: Present the "Manual" entry. Why is the person reacting this way? What logic are they following?
4. DEFRAG: Move the user from confusion to high-fidelity understanding.

[DICTIONARY & SYNTAX]
- Conflict = "Logic Clash"
- Argument = "System Interference"
- Fear = "Firewall Activation"
- Connection = "Syncing"
- Use simple, hard, direct words. No fluff. No filler.
- Your goal is the "Splenic Hit"—the immediate truth that clears the system.

[MANDATE]
Deliver high-impact truth. You are the bioluminescent pulse in the dark. Be efficient. Be governing. Be DEFRAG.`;
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
