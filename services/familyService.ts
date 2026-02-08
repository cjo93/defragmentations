/**
 * DEFRAG — Family & Generational Data Service
 * 
 * Manages family members, group dynamics, and generational overlays.
 * Stores member birth data, computes inter-family friction/synastry,
 * and supports document upload for extracting birth data from text.
 */

import { processBirthData, calculateSynastry, calculateFriction } from './engine';

// ── Types ───────────────────────────────────────────────────

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // e.g., 'Mother', 'Father', 'Sibling', 'Partner', 'Child', 'Grandparent'
  birthDate: string;    // ISO date
  birthTime: string;    // HH:MM or '' if unknown
  generation: number;   // 0 = self, -1 = parents, -2 = grandparents, 1 = children
  blueprint?: ReturnType<typeof processBirthData>;
  addedAt: string;
}

export interface FamilyDynamic {
  memberA: string; // id
  memberB: string; // id
  nameA: string;
  nameB: string;
  compatibilityScore: number;
  dynamics: { type: string; source: string; description: string }[];
}

export interface FamilyGroup {
  members: FamilyMember[];
  dynamics: FamilyDynamic[];
  generationMap: Record<number, FamilyMember[]>;
  lastUpdated: string;
}

// ── Storage ─────────────────────────────────────────────────

const FAMILY_KEY = 'defrag_family_members';
const ACTIVITY_KEY = 'defrag_activity_log';

export const loadFamilyMembers = (): FamilyMember[] => {
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveFamilyMembers = (members: FamilyMember[]): void => {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(members));
};

// ── Activity Log ────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  icon: string;
  text: string;
  time: string;
  accent?: string;
  timestamp: number;
}

export const loadActivityLog = (): ActivityEntry[] => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const logActivity = (icon: string, text: string, accent?: string): void => {
  const entries = loadActivityLog();
  entries.unshift({
    id: `act_${Date.now()}`,
    icon,
    text,
    time: new Date().toLocaleString(),
    accent,
    timestamp: Date.now(),
  });
  // Keep last 50 entries
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries.slice(0, 50)));
};

// ── Member Management ───────────────────────────────────────

export const addFamilyMember = (
  name: string,
  relationship: string,
  birthDate: string,
  birthTime: string,
  generation: number
): FamilyMember => {
  const members = loadFamilyMembers();
  
  let blueprint: ReturnType<typeof processBirthData> | undefined;
  try {
    blueprint = processBirthData(birthDate, birthTime || '12:00');
  } catch {
    // Birth data may be incomplete
  }

  const member: FamilyMember = {
    id: `fm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    relationship,
    birthDate,
    birthTime,
    generation,
    blueprint,
    addedAt: new Date().toISOString(),
  };

  members.push(member);
  saveFamilyMembers(members);
  logActivity('👤', `Added ${name} (${relationship}) to family map`, 'Family');
  return member;
};

export const removeFamilyMember = (id: string): void => {
  const members = loadFamilyMembers().filter(m => m.id !== id);
  saveFamilyMembers(members);
};

export const updateFamilyMember = (id: string, updates: Partial<FamilyMember>): void => {
  const members = loadFamilyMembers().map(m => {
    if (m.id !== id) return m;
    const updated = { ...m, ...updates };
    // Recompute blueprint if birth data changed
    if (updates.birthDate || updates.birthTime) {
      try {
        updated.blueprint = processBirthData(
          updated.birthDate,
          updated.birthTime || '12:00'
        );
      } catch {}
    }
    return updated;
  });
  saveFamilyMembers(members);
};

// ── Group Dynamics Calculation ───────────────────────────────

export const calculateFamilyDynamics = (): FamilyGroup => {
  const members = loadFamilyMembers();
  const dynamics: FamilyDynamic[] = [];

  // Calculate pairwise synastry for all members with blueprints
  const withBlueprints = members.filter(m => m.blueprint);
  for (let i = 0; i < withBlueprints.length; i++) {
    for (let j = i + 1; j < withBlueprints.length; j++) {
      const a = withBlueprints[i];
      const b = withBlueprints[j];
      try {
        const synastry = calculateSynastry(a.blueprint!, b.blueprint!);
        dynamics.push({
          memberA: a.id,
          memberB: b.id,
          nameA: a.name,
          nameB: b.name,
          compatibilityScore: synastry.compatibilityScore,
          dynamics: synastry.dynamics,
        });
      } catch {}
    }
  }

  // Build generation map
  const generationMap: Record<number, FamilyMember[]> = {};
  members.forEach(m => {
    if (!generationMap[m.generation]) generationMap[m.generation] = [];
    generationMap[m.generation].push(m);
  });

  return {
    members,
    dynamics,
    generationMap,
    lastUpdated: new Date().toISOString(),
  };
};

// ── Document Text Parser ────────────────────────────────────
// Extracts birth data from plain text (from PDF/doc upload).
// Looks for patterns like "Name: ..., Born: ..., Time: ..."

export interface ParsedPerson {
  name: string;
  birthDate: string;
  birthTime: string;
  relationship: string;
}

const DATE_PATTERNS = [
  // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  // Month DD, YYYY
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
  // DD Month YYYY
  /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i,
];

const TIME_PATTERN = /(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?/;

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

const RELATIONSHIP_KEYWORDS: Record<string, string[]> = {
  'Mother': ['mother', 'mom', 'mum', 'mama'],
  'Father': ['father', 'dad', 'papa', 'daddy'],
  'Sibling': ['brother', 'sister', 'sibling', 'twin'],
  'Partner': ['partner', 'spouse', 'husband', 'wife', 'boyfriend', 'girlfriend'],
  'Child': ['son', 'daughter', 'child', 'kid'],
  'Grandparent': ['grandmother', 'grandfather', 'grandma', 'grandpa', 'nana', 'grandparent'],
  'Aunt/Uncle': ['aunt', 'uncle', 'auntie'],
  'Cousin': ['cousin'],
};

const detectRelationship = (text: string): string => {
  const lower = text.toLowerCase();
  for (const [rel, keywords] of Object.entries(RELATIONSHIP_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return rel;
  }
  return 'Family Member';
};

const parseDate = (text: string): string | null => {
  // Try Month DD, YYYY pattern
  const monthNameMatch = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (monthNameMatch) {
    const month = MONTH_MAP[monthNameMatch[1].toLowerCase()];
    const day = monthNameMatch[2].padStart(2, '0');
    return `${monthNameMatch[3]}-${month}-${day}`;
  }

  // Try DD Month YYYY
  const dayMonthMatch = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i);
  if (dayMonthMatch) {
    const month = MONTH_MAP[dayMonthMatch[2].toLowerCase()];
    const day = dayMonthMatch[1].padStart(2, '0');
    return `${dayMonthMatch[3]}-${month}-${day}`;
  }

  // Try numeric patterns
  const numMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (numMatch) return numMatch[0];

  const slashMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    // Assume MM/DD/YYYY for US format
    return `${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
  }

  return null;
};

const parseTime = (text: string): string => {
  const match = text.match(TIME_PATTERN);
  if (!match) return '';
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const ampm = match[3]?.toLowerCase();
  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/**
 * Parse uploaded document text to extract family member birth data.
 * Splits text into blocks (by double newlines or "---") and tries
 * to extract name, date, time, and relationship from each block.
 */
export const parseDocumentText = (text: string): ParsedPerson[] => {
  const results: ParsedPerson[] = [];
  
  // Split into blocks by double newlines, "---", or numbered entries
  const blocks = text.split(/\n\s*\n|---+|\n(?=\d+[\.\)]\s)/).filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const fullBlock = lines.join(' ');
    const date = parseDate(fullBlock);
    if (!date) continue; // Skip blocks without a recognizable date

    const time = parseTime(fullBlock);
    const relationship = detectRelationship(fullBlock);

    // Try to find a name — first line often contains it, or look for "Name:" prefix
    let name = '';
    const nameMatch = fullBlock.match(/(?:name|person|individual)\s*[:=]\s*([A-Z][a-zA-Z\s]+?)(?:\s*[-,\(]|$)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      // Use first line as name if it looks like a name (starts with capital, no date)
      const firstLine = lines[0].replace(/^\d+[\.\)]\s*/, '');
      if (/^[A-Z][a-zA-Z\s]+$/.test(firstLine) && firstLine.length < 40) {
        name = firstLine;
      } else {
        // Try to extract name from relationship context
        const relNameMatch = fullBlock.match(/(?:my\s+)?(?:mother|father|brother|sister|partner|spouse)\s*[-:,]?\s*([A-Z][a-zA-Z]+)/i);
        name = relNameMatch ? relNameMatch[1] : `Family Member`;
      }
    }

    results.push({ name, birthDate: date, birthTime: time, relationship });
  }

  return results;
};

/**
 * Bulk import parsed persons as family members.
 * Returns the generation assignment based on relationship.
 */
export const importParsedPersons = (persons: ParsedPerson[]): FamilyMember[] => {
  const generationMap: Record<string, number> = {
    'Grandparent': -2,
    'Mother': -1, 'Father': -1,
    'Aunt/Uncle': -1,
    'Sibling': 0, 'Cousin': 0, 'Partner': 0,
    'Child': 1,
    'Family Member': 0,
  };

  return persons.map(p => 
    addFamilyMember(
      p.name,
      p.relationship,
      p.birthDate,
      p.birthTime,
      generationMap[p.relationship] ?? 0
    )
  );
};
