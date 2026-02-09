/**
 * DEFRAG — Global Memory Service
 * 
 * The persistent shared brain. Maintains a single `global_memory` object per user
 * that every tab and thread reads from and writes to. No tab-specific memory.
 * 
 * Data flow:
 *   1. On app load → loadGlobalMemory() hydrates from localStorage
 *   2. Before every AI call → memoryToPromptBlock() serializes for system prompt
 *   3. After every AI response → parseMemoryUpdates() extracts [MEMORY_UPDATE:section] blocks
 *   4. Updates → applyMemoryUpdates() merges into global_memory and persists
 *   5. Upload → processUpload() extracts structured data from photos/docs
 */

import {
  GlobalMemory,
  UploadedAsset,
} from '../types';
import { loadBirthData } from './globalContext';
import { loadFamilyMembers } from './familyService';
import { loadEntries, analyzeEcho } from './echoEngine';
import { calculateSEDA, calculateSedaSpectrum } from './sedaCalculator';
import { processBirthData } from './engine';

// ── Storage ─────────────────────────────────────────────────

const MEMORY_KEY = 'defrag_global_memory';
const MEMORY_VERSION = 1;

// ── Default Memory ──────────────────────────────────────────

const createDefaultMemory = (): GlobalMemory => ({
  profile: {
    stressPatterns: [],
    giftActivations: [],
    selfArchitectureNotes: [],
  },
  relationships: [],
  patterns: [],
  stability: {
    score: 0,
    status: 'SAFE',
    spectrum: 'INTEGRATION',
    toneDirective: 'LOGIC_MODE',
    recentShifts: [],
    lastAssessed: new Date().toISOString(),
  },
  threads: [],
  uploads: [],
  lastUpdated: new Date().toISOString(),
  version: MEMORY_VERSION,
});

// ── Load / Save ─────────────────────────────────────────────

export const loadGlobalMemory = (): GlobalMemory => {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GlobalMemory;
      // Version check for future migrations
      if (parsed.version === MEMORY_VERSION) return parsed;
    }
  } catch {}
  return createDefaultMemory();
};

export const saveGlobalMemory = (memory: GlobalMemory): void => {
  memory.lastUpdated = new Date().toISOString();
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn('[GLOBAL MEMORY] Failed to persist:', e);
  }
};

// ── Hydrate from Existing Sources ───────────────────────────
// Pulls in existing data from blueprint, echo, family, SEDA
// into the global memory structure. Called on first load or refresh.

export const hydrateMemory = (): GlobalMemory => {
  const memory = loadGlobalMemory();
  
  // ── Profile: from birth data / blueprint ──────────────────
  const birthData = loadBirthData();
  if (birthData) {
    try {
      const blueprint = processBirthData(birthData.date, birthData.time);
      memory.profile.type = blueprint.type;
      memory.profile.strategy = blueprint.strategy;
      memory.profile.authority = blueprint.authority;
      memory.profile.gates = blueprint.personality.gates;
    } catch {}
  }

  // ── Relationships: from family service ────────────────────
  const familyMembers = loadFamilyMembers();
  for (const fm of familyMembers) {
    const existing = memory.relationships.find(r => r.name === fm.name && r.relationship === fm.relationship);
    if (!existing) {
      memory.relationships.push({
        id: fm.id,
        name: fm.name,
        relationship: fm.relationship,
        dynamics: [],
        structuralNotes: fm.blueprint
          ? `${fm.blueprint.type} — Strategy: ${fm.blueprint.strategy}, Authority: ${fm.blueprint.authority}`
          : undefined,
        lastMentioned: fm.addedAt,
      });
    }
  }

  // ── Patterns: from echo engine ────────────────────────────
  const entries = loadEntries();
  const userType = memory.profile.type || 'Generator';
  if (entries.length > 0) {
    const echo = analyzeEcho(entries, userType, 30);
    for (const loop of echo.loops) {
      const existing = memory.patterns.find(p => p.theme === loop.theme);
      if (existing) {
        existing.frequency = loop.frequency;
        existing.lastSeen = new Date().toISOString();
      } else {
        memory.patterns.push({
          id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          theme: loop.theme,
          frequency: loop.frequency,
          mechanism: loop.description,
          adjustment: loop.adjustment,
          occurrences: loop.matches.map(m => m.date),
          lastSeen: new Date().toISOString(),
        });
      }
    }
  }

  // ── Stability: from SEDA ──────────────────────────────────
  const recentText = entries.slice(-5).map(e => e.text).join(' ');
  if (recentText) {
    const seda = calculateSEDA(recentText);
    const spectrum = calculateSedaSpectrum(recentText);
    memory.stability = {
      score: seda.score,
      status: seda.status,
      spectrum: spectrum.spectrum,
      toneDirective: seda.toneDirective,
      recentShifts: memory.stability.recentShifts.slice(-5), // keep rolling
      lastAssessed: new Date().toISOString(),
    };
  }

  saveGlobalMemory(memory);
  return memory;
};

// ── Memory → System Prompt Injection ────────────────────────
// Serializes the full global_memory into a structured block
// for the AI system prompt. This is the "singular intelligence" —
// the AI always knows everything about the user.

export const memoryToPromptBlock = (memory: GlobalMemory): string => {
  const sections: string[] = [];

  // ── Profile ───────────────────────────────────────────────
  if (memory.profile.type) {
    const profileLines = [
      `Type: ${memory.profile.type}`,
      `Strategy: ${memory.profile.strategy}`,
      `Authority: ${memory.profile.authority}`,
      memory.profile.gates?.length ? `Active Gates: ${memory.profile.gates.join(', ')}` : '',
    ].filter(Boolean);

    if (memory.profile.stressPatterns.length > 0) {
      profileLines.push(`Known Stress Patterns: ${memory.profile.stressPatterns.join('; ')}`);
    }
    if (memory.profile.giftActivations.length > 0) {
      profileLines.push(`Gift Activations: ${memory.profile.giftActivations.join('; ')}`);
    }
    if (memory.profile.selfArchitectureNotes.length > 0) {
      profileLines.push(`Architecture Notes: ${memory.profile.selfArchitectureNotes.slice(-5).join(' | ')}`);
    }

    sections.push(`[PROFILE — Self-Architecture]\n${profileLines.join('\n')}`);
  }

  // ── Relationships ─────────────────────────────────────────
  if (memory.relationships.length > 0) {
    const relLines = memory.relationships.map(r => {
      const parts = [`${r.name} (${r.relationship})`];
      if (r.dynamics.length > 0) parts.push(`Dynamics: ${r.dynamics.join(', ')}`);
      if (r.structuralNotes) parts.push(`Design: ${r.structuralNotes}`);
      return `- ${parts.join(' — ')}`;
    });
    sections.push(`[RELATIONSHIPS — Relational Map]\n${relLines.join('\n')}`);
  }

  // ── Patterns ──────────────────────────────────────────────
  if (memory.patterns.length > 0) {
    const patLines = memory.patterns
      .slice(0, 5) // Top 5 patterns
      .map(p => `- ${p.theme} (${p.frequency}x): ${p.mechanism.slice(0, 120)}`);
    sections.push(`[PATTERNS — Recurring Loops]\n${patLines.join('\n')}`);
  }

  // ── Stability ─────────────────────────────────────────────
  sections.push(`[STABILITY — Current State]
Score: ${memory.stability.score}/100
Status: ${memory.stability.status}
Spectrum: ${memory.stability.spectrum}
Tone: ${memory.stability.toneDirective}${
    memory.stability.recentShifts.length > 0
      ? `\nRecent Shifts: ${memory.stability.recentShifts.slice(-3).join('; ')}`
      : ''
  }`);

  // ── Active Threads ────────────────────────────────────────
  if (memory.threads.length > 0) {
    const threadLines = memory.threads
      .slice(-5) // Most recent 5
      .map(t => `- "${t.name}": ${t.summary}${t.observations.length > 0 ? ` [${t.observations.slice(-2).join('; ')}]` : ''}`);
    sections.push(`[THREADS — Active Situations]\n${threadLines.join('\n')}`);
  }

  // ── Recent Uploads ────────────────────────────────────────
  const recentUploads = memory.uploads.filter(u => u.extractedInsights && u.extractedInsights.length > 0).slice(-3);
  if (recentUploads.length > 0) {
    const uploadLines = recentUploads.map(u =>
      `- ${u.filename} (${u.type}): ${u.extractedInsights!.join('; ')}`
    );
    sections.push(`[UPLOADS — Extracted Insights]\n${uploadLines.join('\n')}`);
  }

  return sections.length > 0
    ? `\n[DEFRAG GLOBAL MEMORY — Persistent Shared State]\n${sections.join('\n\n')}\n`
    : '';
};

// ── Parse AI Memory Updates ─────────────────────────────────
// The AI can write back to global_memory using special tags:
//
//   [MEMORY_UPDATE:profile]
//   stress_pattern: Shuts down under criticism
//   gift_activation: Leadership emerges in small groups
//   note: User tends to over-explain when anxious
//   [/MEMORY_UPDATE]
//
//   [MEMORY_UPDATE:relationships]
//   name: Sarah | dynamic: tension carrier | note: Projects authority issues
//   [/MEMORY_UPDATE]
//
//   [MEMORY_UPDATE:patterns]
//   theme: Withdrawal after conflict | mechanism: Projector bitterness loop
//   [/MEMORY_UPDATE]
//
//   [MEMORY_UPDATE:threads]
//   name: Work transition | summary: Considering leaving current role
//   observation: Fear of initiating is blocking the decision
//   [/MEMORY_UPDATE]
//
//   [MEMORY_UPDATE:stability]
//   shift: Score improved after grounding conversation
//   [/MEMORY_UPDATE]

export interface MemoryUpdate {
  section: string;
  data: Record<string, string>;
}

export const parseMemoryUpdates = (text: string): { cleanText: string; updates: MemoryUpdate[] } => {
  const updates: MemoryUpdate[] = [];
  let cleanText = text;

  const pattern = /\[MEMORY_UPDATE:(\w+)\]\s*([\s\S]*?)\s*\[\/MEMORY_UPDATE\]/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, section, body] = match;
    const data: Record<string, string> = {};

    // Parse key: value pairs from the body
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim().toLowerCase().replace(/\s+/g, '_');
        const value = line.slice(colonIdx + 1).trim();
        if (key && value) data[key] = value;
      }
    }

    if (Object.keys(data).length > 0) {
      updates.push({ section, data });
    }

    cleanText = cleanText.replace(fullMatch, '').trim();
  }

  return { cleanText, updates };
};

// ── Apply Memory Updates ────────────────────────────────────
// Takes parsed updates and merges them into the global memory.

export const applyMemoryUpdates = (memory: GlobalMemory, updates: MemoryUpdate[]): GlobalMemory => {
  for (const update of updates) {
    switch (update.section.toLowerCase()) {
      case 'profile': {
        if (update.data.stress_pattern) {
          const pattern = update.data.stress_pattern;
          if (!memory.profile.stressPatterns.includes(pattern)) {
            memory.profile.stressPatterns.push(pattern);
            // Cap at 10
            if (memory.profile.stressPatterns.length > 10) memory.profile.stressPatterns.shift();
          }
        }
        if (update.data.gift_activation) {
          const gift = update.data.gift_activation;
          if (!memory.profile.giftActivations.includes(gift)) {
            memory.profile.giftActivations.push(gift);
            if (memory.profile.giftActivations.length > 10) memory.profile.giftActivations.shift();
          }
        }
        if (update.data.note) {
          memory.profile.selfArchitectureNotes.push(update.data.note);
          if (memory.profile.selfArchitectureNotes.length > 20) memory.profile.selfArchitectureNotes.shift();
        }
        break;
      }

      case 'relationships': {
        const name = update.data.name;
        if (name) {
          let rel = memory.relationships.find(r => r.name.toLowerCase() === name.toLowerCase());
          if (!rel) {
            rel = {
              id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name,
              relationship: update.data.relationship || 'Unknown',
              dynamics: [],
              lastMentioned: new Date().toISOString(),
            };
            memory.relationships.push(rel);
          }
          if (update.data.dynamic) {
            const dyn = update.data.dynamic;
            if (!rel.dynamics.includes(dyn)) {
              rel.dynamics.push(dyn);
              if (rel.dynamics.length > 8) rel.dynamics.shift();
            }
          }
          if (update.data.note) {
            rel.structuralNotes = (rel.structuralNotes ? rel.structuralNotes + '; ' : '') + update.data.note;
          }
          rel.lastMentioned = new Date().toISOString();
        }
        break;
      }

      case 'patterns': {
        const theme = update.data.theme;
        if (theme) {
          let pat = memory.patterns.find(p => p.theme.toLowerCase() === theme.toLowerCase());
          if (!pat) {
            pat = {
              id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              theme,
              frequency: 1,
              mechanism: update.data.mechanism || '',
              adjustment: update.data.adjustment || '',
              occurrences: [new Date().toISOString()],
              lastSeen: new Date().toISOString(),
            };
            memory.patterns.push(pat);
          } else {
            pat.frequency += 1;
            pat.occurrences.push(new Date().toISOString());
            pat.lastSeen = new Date().toISOString();
            if (update.data.mechanism) pat.mechanism = update.data.mechanism;
            if (update.data.adjustment) pat.adjustment = update.data.adjustment;
          }
        }
        break;
      }

      case 'threads': {
        const name = update.data.name;
        if (name) {
          let thread = memory.threads.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (!thread) {
            thread = {
              id: `thr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name,
              summary: update.data.summary || '',
              relatedSections: [],
              observations: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            memory.threads.push(thread);
          }
          if (update.data.summary) thread.summary = update.data.summary;
          if (update.data.observation) {
            thread.observations.push(update.data.observation);
            if (thread.observations.length > 15) thread.observations.shift();
          }
          thread.updatedAt = new Date().toISOString();
          // Cap threads at 20
          if (memory.threads.length > 20) {
            memory.threads = memory.threads.slice(-20);
          }
        }
        break;
      }

      case 'stability': {
        if (update.data.shift) {
          memory.stability.recentShifts.push(update.data.shift);
          if (memory.stability.recentShifts.length > 10) memory.stability.recentShifts.shift();
        }
        break;
      }
    }
  }

  saveGlobalMemory(memory);
  return memory;
};

// ── Upload Processing ───────────────────────────────────────
// Reads file content and creates an UploadedAsset.
// For images: stores as base64 data URI (capped at 2MB).
// For documents: extracts text content.

export const processFileUpload = (file: File): Promise<UploadedAsset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');
    reader.onload = () => {
      const asset: UploadedAsset = {
        id: `upl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: isImage ? 'image' : 'document',
        filename: file.name,
        content: isImage
          ? (reader.result as string) // data URI
          : (reader.result as string), // text content
        extractedInsights: [],
        memorySections: [],
        uploadedAt: new Date().toISOString(),
      };

      resolve(asset);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (isImage) {
      // Read as data URL (base64)
      reader.readAsDataURL(file);
    } else {
      // Read as text
      reader.readAsText(file);
    }
  });
};

// ── Build Upload Context for AI ─────────────────────────────
// Creates a prompt block that asks the AI to analyze uploaded content.

export const buildUploadPrompt = (asset: UploadedAsset, userMessage: string): string => {
  if (asset.type === 'image') {
    return `${userMessage}

[UPLOADED IMAGE: ${asset.filename}]
The user has uploaded an image. Since you cannot see images directly, ask the user to describe what's in the image, or describe what they want you to understand from it. Then extract relevant insights for their global memory.`;
  }

  // Document — include the text content
  const contentPreview = asset.content.slice(0, 3000); // Cap at 3000 chars for prompt
  return `${userMessage}

[UPLOADED DOCUMENT: ${asset.filename}]
Content:
---
${contentPreview}
---

Analyze this document for information relevant to the user's self-architecture, relationships, patterns, or stability. Extract key insights and write them back using [MEMORY_UPDATE] blocks.`;
};

// ── Store Upload in Memory ──────────────────────────────────

export const addUploadToMemory = (memory: GlobalMemory, asset: UploadedAsset): GlobalMemory => {
  // Store only metadata + insights, not full content (to save localStorage space)
  const stored: UploadedAsset = {
    ...asset,
    content: asset.type === 'image' ? '[image]' : asset.content.slice(0, 500), // Trim for storage
  };

  memory.uploads.push(stored);
  // Cap at 50 uploads
  if (memory.uploads.length > 50) {
    memory.uploads = memory.uploads.slice(-50);
  }

  saveGlobalMemory(memory);
  return memory;
};
