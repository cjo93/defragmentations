// ── ECHO: Temporal Pattern Clustering ───────────────────────
// The temporal observer. Scans the user's journal entries
// over a 30-day window to identify recurring "Not-Self" themes
// and behavioral loops that repeat beneath conscious awareness.
//
// System Drag = frequency × intensity of recurring shadow patterns.
// When drag exceeds threshold, the Architect flags a "Recurring Loop"
// and suggests a mechanical adjustment based on the user's Type.

import { calculateSedaSpectrum, SedaSpectrum } from './sedaCalculator';

// ── Not-Self Themes by Type ─────────────────────────────────
// Each Human Design Type has a signature "Not-Self" emotion
// that indicates misalignment with their mechanical design.

export const NOT_SELF_THEMES: Record<string, {
  theme: string;
  markers: string[];
  description: string;
  adjustment: string;
}> = {
  'Projector': {
    theme: 'Bitterness',
    markers: ['bitter', 'unrecognized', 'invisible', 'overlooked', 'unappreciated', 'why bother', 'no one listens', 'taken for granted', 'not valued', 'ignored', 'used', 'exhausted from trying'],
    description: 'Bitterness arises when you initiate instead of waiting for recognition. Your architecture is designed to be invited — not to push.',
    adjustment: 'Stop initiating. Wait for the invitation. Your value is not diminished by patience — it is amplified by it.',
  },
  'Generator': {
    theme: 'Frustration',
    markers: ['frustrated', 'stuck', 'spinning', 'going nowhere', 'pointless', 'wasting time', 'wrong path', 'forced', 'drained', 'burned out', 'grinding', 'no satisfaction'],
    description: 'Frustration signals that you are saying "yes" to things your Sacral did not respond to. You are generating energy for the wrong structure.',
    adjustment: 'Check your Sacral response. If the body does not give a clear "uh-huh," it is a no. Stop powering systems that do not light you up.',
  },
  'Manifesting Generator': {
    theme: 'Frustration',
    markers: ['frustrated', 'stuck', 'spinning', 'scattered', 'too many things', 'can\'t focus', 'pulled apart', 'half-finished', 'overwhelmed', 'restless', 'bored', 'impatient'],
    description: 'Frustration in your design often comes from forcing a linear path. You are multi-track by nature — but you still need Sacral response before initiating.',
    adjustment: 'Honor your need to pivot. But check: are you responding or reacting? Pivoting from response is evolution. Pivoting from conditioning is chaos.',
  },
  'Manifestor': {
    theme: 'Anger',
    markers: ['angry', 'controlled', 'restricted', 'blocked', 'held back', 'permission', 'asking', 'rage', 'resistance', 'shut down', 'silenced', 'constrained'],
    description: 'Anger arises when your natural impulse to initiate is blocked or controlled by others. Your architecture is designed to move first — but must inform.',
    adjustment: 'Inform, do not ask permission. Your anger is not irrational — it is the friction of a motor being held in place. Tell people what you are about to do, then do it.',
  },
  'Reflector': {
    theme: 'Disappointment',
    markers: ['disappointed', 'lost', 'who am i', 'nothing feels right', 'disconnected', 'empty', 'absorbing', 'not myself', 'overwhelmed', 'chameleon', 'shapeless', 'unmoored'],
    description: 'Disappointment signals that you are identifying with energy that is not yours. As a Reflector, you sample everything but own nothing.',
    adjustment: 'Wait a full lunar cycle before major decisions. Your clarity comes from time and environment — not from speed. Ask: is this mine, or am I reflecting someone else\'s state?',
  },
};

// ── Journal Entry Interface ─────────────────────────────────
export interface EchoEntry {
  id: string;
  date: string;          // ISO date string
  text: string;          // The user's journal entry
  spectrum?: SedaSpectrum; // Computed at creation time
}

// ── Pattern Match ───────────────────────────────────────────
interface PatternMatch {
  entryId: string;
  date: string;
  matchedMarkers: string[];
  excerpt: string; // First 120 chars of entry
}

// ── Recurring Loop ──────────────────────────────────────────
export interface RecurringLoop {
  theme: string;           // e.g., "Bitterness", "Frustration"
  frequency: number;       // How many entries match (within 30-day window)
  intensity: number;       // Average marker density per matching entry
  systemDrag: number;      // 0-100: frequency × intensity, normalized
  matches: PatternMatch[];
  description: string;     // What this loop means
  adjustment: string;      // The mechanical suggestion
}

// ── Echo Report ─────────────────────────────────────────────
export interface EchoReport {
  totalEntries: number;
  windowDays: number;
  loops: RecurringLoop[];
  dominantLoop: RecurringLoop | null;
  overallDrag: number;     // 0-100
  status: 'CLEAR' | 'ACTIVE_LOOP' | 'CHRONIC_PATTERN';
  insight: string;
}

// ── Detect Patterns ─────────────────────────────────────────
// Scans entries against Not-Self markers for a given type.

const detectThemeInEntries = (
  entries: EchoEntry[],
  theme: string,
  markers: string[],
): { matches: PatternMatch[]; totalMarkerHits: number } => {
  const matches: PatternMatch[] = [];
  let totalMarkerHits = 0;

  for (const entry of entries) {
    const lower = entry.text.toLowerCase();
    const matchedMarkers: string[] = [];

    for (const marker of markers) {
      if (lower.includes(marker)) {
        matchedMarkers.push(marker);
      }
    }

    if (matchedMarkers.length > 0) {
      totalMarkerHits += matchedMarkers.length;
      matches.push({
        entryId: entry.id,
        date: entry.date,
        matchedMarkers,
        excerpt: entry.text.slice(0, 120) + (entry.text.length > 120 ? '…' : ''),
      });
    }
  }

  return { matches, totalMarkerHits };
};

// ── The Main Analysis Function ──────────────────────────────
export const analyzeEcho = (
  entries: EchoEntry[],
  userType: string,
  windowDays: number = 30,
): EchoReport => {
  // Filter entries to the time window
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const windowEntries = entries.filter(e => new Date(e.date) >= cutoff);

  if (windowEntries.length === 0) {
    return {
      totalEntries: 0,
      windowDays,
      loops: [],
      dominantLoop: null,
      overallDrag: 0,
      status: 'CLEAR',
      insight: 'No journal entries in the last ' + windowDays + ' days. Start logging to let the Architect observe your patterns over time.',
    };
  }

  const loops: RecurringLoop[] = [];

  // Check the user's primary Not-Self theme
  const primaryTheme = NOT_SELF_THEMES[userType];
  // Also check all other themes (cross-contamination detection)
  const allThemes = Object.entries(NOT_SELF_THEMES);

  for (const [type, config] of allThemes) {
    const { matches, totalMarkerHits } = detectThemeInEntries(windowEntries, config.theme, config.markers);

    if (matches.length >= 2) {
      // Frequency: what percentage of entries contain this theme?
      const frequency = matches.length / windowEntries.length;
      // Intensity: average marker hits per matching entry
      const intensity = totalMarkerHits / matches.length;
      // System Drag: combined metric, normalized to 0-100
      const systemDrag = Math.min(100, Math.round(frequency * intensity * 50));

      const isPrimary = type === userType;

      loops.push({
        theme: config.theme + (isPrimary ? '' : ` (from ${type} conditioning)`),
        frequency: matches.length,
        intensity: Math.round(intensity * 10) / 10,
        systemDrag,
        matches,
        description: isPrimary
          ? config.description
          : `You are expressing ${config.theme.toLowerCase()} patterns typically associated with the ${type} type. This may indicate environmental conditioning — absorbing someone else's Not-Self theme.`,
        adjustment: config.adjustment,
      });
    }
  }

  // Sort by system drag (highest first)
  loops.sort((a, b) => b.systemDrag - a.systemDrag);

  const dominantLoop = loops.length > 0 ? loops[0] : null;
  const overallDrag = dominantLoop
    ? Math.min(100, loops.reduce((sum, l) => sum + l.systemDrag, 0))
    : 0;

  let status: EchoReport['status'] = 'CLEAR';
  if (overallDrag > 60) status = 'CHRONIC_PATTERN';
  else if (overallDrag > 25) status = 'ACTIVE_LOOP';

  let insight: string;
  if (status === 'CLEAR') {
    insight = `${windowEntries.length} entries analyzed over ${windowDays} days. No recurring Not-Self loops detected. The architecture is running clean.`;
  } else if (status === 'ACTIVE_LOOP') {
    insight = `${windowEntries.length} entries analyzed. The Architect detects an active ${dominantLoop!.theme} loop appearing in ${dominantLoop!.frequency} entries. This is the system asking for a mechanical adjustment.`;
  } else {
    insight = `${windowEntries.length} entries analyzed. A chronic ${dominantLoop!.theme} pattern has been running for most of the observation window. This is deep structural friction — not a bad week. The adjustment below is not optional; it is architectural.`;
  }

  return {
    totalEntries: windowEntries.length,
    windowDays,
    loops,
    dominantLoop,
    overallDrag,
    status,
    insight,
  };
};

// ── Create Entry Helper ─────────────────────────────────────
// Tags each entry with its SEDA spectrum at creation time.

export const createEchoEntry = (text: string): EchoEntry => {
  const spectrum = calculateSedaSpectrum(text);
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    text,
    spectrum,
  };
};

// ── Local Storage Persistence ───────────────────────────────
const STORAGE_KEY = 'defrag_echo_entries';

export const loadEntries = (): EchoEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveEntries = (entries: EchoEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('[ECHO] Failed to persist entries:', e);
  }
};

export const addEntry = (text: string): EchoEntry[] => {
  const entries = loadEntries();
  const newEntry = createEchoEntry(text);
  const updated = [newEntry, ...entries];
  saveEntries(updated);
  return updated;
};

export const deleteEntry = (id: string): EchoEntry[] => {
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
  return entries;
};
