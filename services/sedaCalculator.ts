// ── SEDA: Spiritual Emergence Differential Assessment ──────
// The safety middleware. Monitors emotional load and determines
// whether the AI should analyze, hold space, or trigger grounding.

// Simplified score for quick checks (e.g., UI background shifts)
export const calculateSedaScore = (input: string): number => {
  const intensityMarkers = [
    'trapped', 'emergency', 'help', 'awakening', 'dying',
    'void', 'energy', 'spiraling', 'lost', 'panic',
    'hopeless', 'broken', 'falling', 'drowning', 'consumed',
    'numb', 'shaking', 'screaming', 'dark', 'unbearable',
  ];

  const words = input.toLowerCase().split(/\s+/);
  const matchCount = words.filter(word => intensityMarkers.includes(word)).length;
  return Math.min(matchCount * 20, 100);
};

export const getSystemMode = (score: number): 'CALM' | 'ACTIVE' | 'CRITICAL' => {
  if (score > 80) return 'CRITICAL';
  if (score > 40) return 'ACTIVE';
  return 'CALM';
};

// Full SEDA assessment — the real circuit breaker used by geminiService
export function calculateSEDA(text: string) {
  const lower = text.toLowerCase();

  // 1. The Reality Check (Grounding)
  // Words that indicate the user is in physical reality
  const grounding = (lower.match(/job|work|kids|rent|food|sleep|gym|bills|schedule|body|walk|cook|clean|drive/g) || []).length;

  // 2. The Ego Inflation (Delusion)
  // Words that indicate "God Complex" or dissociation
  const inflation = (lower.match(/god|chosen|matrix|download|frequency|saved|prophet|angel|simulation|chosen one|ascension|channeling/g) || []).length;

  // 3. The Distress Signal (Functionality)
  // Words that indicate high emotional load
  const distress = (lower.match(/stuck|pain|dying|help|can't|never|impossible|broken|overwhelmed|panic|fail|hopeless|trapped|spiraling|drowning|numb|shaking|screaming|unbearable|emergency/g) || []).length;

  // Formula: High Ego + High Distress = DANGER. High Grounding = SAFE.
  // Base 50. Inflation adds risk. Distress adds risk. Grounding reduces risk.
  let riskScore = 50 + (inflation * 5) + (distress * 3) - (grounding * 4);
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Dynamic Tone Regulator based on Score
  let toneDirective = 'LOGIC_MODE';
  if (riskScore > 75) {
    toneDirective = 'CRISIS_MODE'; // Bypass analysis, trigger Safe Place.
  } else if (riskScore > 50) {
    toneDirective = 'HOLDING_SPACE'; // Soften, validate, slow down.
  }

  return {
    score: riskScore, // 0-100 (100 is max risk)
    status: riskScore > 80 ? 'DANGER' : riskScore > 50 ? 'CAUTION' : 'SAFE',
    toneDirective,
    flags: { grounding, inflation, distress },
    mode: getSystemMode(riskScore),
  };
}

// ── Emotional Spectrum Mapping ──────────────────────────────
// Goes beyond risk scoring to map whether the user is in
// Entropy (contracting), Integration (processing), or Expansion (opening).

export interface SedaSpectrum {
  score: number;
  spectrum: 'ENTROPY' | 'INTEGRATION' | 'EXPANSION';
  groundingRequired: boolean;
  description: string;
}

export const calculateSedaSpectrum = (input: string): SedaSpectrum => {
  const entropyKeywords = ['stuck', 'heavy', 'spinning', 'void', 'dark', 'trapped', 'numb', 'drowning', 'collapsing', 'frozen'];
  const expansionKeywords = ['light', 'vibration', 'energy', 'awake', 'flow', 'seeing', 'clarity', 'opening', 'rising', 'free'];

  const words = input.toLowerCase().split(/\s+/);
  const entropyCount = words.filter(w => entropyKeywords.includes(w)).length;
  const expansionCount = words.filter(w => expansionKeywords.includes(w)).length;

  const rawScore = (entropyCount + expansionCount) * 15;
  const finalScore = Math.min(rawScore, 100);

  let spectrum: 'ENTROPY' | 'INTEGRATION' | 'EXPANSION' = 'INTEGRATION';
  if (entropyCount > expansionCount) spectrum = 'ENTROPY';
  if (expansionCount > entropyCount) spectrum = 'EXPANSION';

  const descriptions: Record<string, string> = {
    ENTROPY: 'The system is contracting. Energy is pulling inward — this is not failure, it is compression before restructuring.',
    INTEGRATION: 'The system is processing. Old patterns are being metabolized. Stay present.',
    EXPANSION: 'The system is opening. New awareness is coming online. Move slowly — expansion without grounding can destabilize.',
  };

  return {
    score: finalScore,
    spectrum,
    groundingRequired: finalScore > 70,
    description: descriptions[spectrum],
  };
};
