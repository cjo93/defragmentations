// ── SIGNAL: The Entropy Pre-Filter ──────────────────────────
// The most proactive part of the DEFRAG intelligence.
// Scans incoming "signals" (texts, emails, messages) and
// calculates the Entropy Density before the user even reads them.
//
// This allows the user to prepare their architecture for impact
// rather than being blindsided by high-entropy communication.

// ── Linguistic Markers ──────────────────────────────────────
// Weighted by emotional payload density.

const ENTROPY_MARKERS: Record<string, number> = {
  // Direct conflict signals
  'always': 3, 'never': 3, 'fault': 4, 'blame': 4, 'wrong': 3,
  'stupid': 5, 'hate': 5, 'pathetic': 5, 'useless': 5, 'disgusting': 5,
  // Passive-aggressive markers
  'fine': 2, 'whatever': 3, 'forget it': 4, 'nothing': 2, 'okay then': 3,
  // Pressure / demand markers
  'need to talk': 3, 'we need': 2, 'right now': 3, 'immediately': 3,
  'how could you': 4, 'disappointed': 3, 'expected more': 3,
  // Guilt induction
  'after everything': 4, 'sacrificed': 4, 'all i do': 3, 'ungrateful': 5,
  // Withdrawal / stonewalling
  'done': 2, 'over this': 3, 'leaving': 3, 'can\'t anymore': 4,
  // Escalation
  'screaming': 4, 'furious': 4, 'unbelievable': 3, 'last straw': 4,
};

const INTEGRATION_MARKERS: Record<string, number> = {
  // Processing signals
  'thinking about': 2, 'been reflecting': 3, 'realize': 3, 'understand': 2,
  'sorry': 2, 'apologize': 3, 'my part': 3, 'working on': 2,
  'appreciate': 2, 'grateful': 2, 'hear you': 3, 'both': 2,
  // Repair attempts
  'can we talk': 2, 'want to understand': 3, 'help me see': 3,
  'my perspective': 2, 'your perspective': 3,
};

const EXPANSION_MARKERS: Record<string, number> = {
  // Connection signals
  'love': 2, 'proud': 2, 'beautiful': 2, 'inspired': 3,
  'together': 2, 'grow': 2, 'support': 2, 'trust': 3,
  'safe': 2, 'home': 2, 'peace': 3, 'grateful': 3,
  'excited': 2, 'looking forward': 3, 'thank you': 2,
};

// ── Signal Analysis Result ──────────────────────────────────
export interface SignalAnalysis {
  entropy: number;           // 0-100 (density of conflict markers)
  integration: number;       // 0-100 (density of processing markers)
  expansion: number;         // 0-100 (density of connection markers)
  spectrum: 'ENTROPY' | 'INTEGRATION' | 'EXPANSION';
  density: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flag: string;              // One-line summary for the user
  body: string;              // Structural insight
  preparation: string;       // How to prepare the architecture
  markerCount: number;       // Total markers detected
  topMarkers: string[];      // Most impactful words found
}

// ── Helper: scan text against a marker dictionary ───────────
const scanMarkers = (text: string, markers: Record<string, number>): { score: number; found: string[] } => {
  const lower = text.toLowerCase();
  let score = 0;
  const found: string[] = [];

  for (const [phrase, weight] of Object.entries(markers)) {
    // Count occurrences (phrases can be multi-word)
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    if (matches) {
      score += matches.length * weight;
      found.push(phrase);
    }
  }

  return { score, found };
};

// ── The Main Scanner ────────────────────────────────────────
export const analyzeSignal = (text: string): SignalAnalysis => {
  if (!text || text.trim().length === 0) {
    return {
      entropy: 0, integration: 0, expansion: 0,
      spectrum: 'INTEGRATION',
      density: 'LOW',
      flag: 'No signal to analyze.',
      body: 'Paste or type a message to scan its emotional architecture.',
      preparation: '',
      markerCount: 0,
      topMarkers: [],
    };
  }

  const entropyResult = scanMarkers(text, ENTROPY_MARKERS);
  const integrationResult = scanMarkers(text, INTEGRATION_MARKERS);
  const expansionResult = scanMarkers(text, EXPANSION_MARKERS);

  // Word count normalization — longer messages get scaled down
  const wordCount = text.split(/\s+/).length;
  const normalizer = Math.max(wordCount / 10, 1); // per-10-words density

  const entropy = Math.min(100, Math.round((entropyResult.score / normalizer) * 8));
  const integration = Math.min(100, Math.round((integrationResult.score / normalizer) * 8));
  const expansion = Math.min(100, Math.round((expansionResult.score / normalizer) * 8));

  // Determine dominant spectrum
  let spectrum: SignalAnalysis['spectrum'] = 'INTEGRATION';
  if (entropy > integration && entropy > expansion) spectrum = 'ENTROPY';
  if (expansion > integration && expansion > entropy) spectrum = 'EXPANSION';

  // Entropy density classification
  let density: SignalAnalysis['density'] = 'LOW';
  if (entropy >= 70) density = 'CRITICAL';
  else if (entropy >= 45) density = 'HIGH';
  else if (entropy >= 20) density = 'MODERATE';

  // Top markers (sorted by impact)
  const allFound = [...entropyResult.found, ...integrationResult.found, ...expansionResult.found];
  const topMarkers = [...new Set(allFound)].slice(0, 5);

  // Generate human-readable output
  const { flag, body, preparation } = generateInsight(spectrum, density, entropy, integration, expansion);

  return {
    entropy,
    integration,
    expansion,
    spectrum,
    density,
    flag,
    body,
    preparation,
    markerCount: allFound.length,
    topMarkers,
  };
};

// ── Insight Generator ───────────────────────────────────────
function generateInsight(
  spectrum: SignalAnalysis['spectrum'],
  density: SignalAnalysis['density'],
  entropy: number,
  integration: number,
  expansion: number,
): { flag: string; body: string; preparation: string } {
  if (spectrum === 'ENTROPY') {
    if (density === 'CRITICAL') {
      return {
        flag: '⚠ High entropy detected. Prepare before reading.',
        body: 'This message carries significant structural load. The language patterns suggest active conflict, blame, or pressure. Reading this without preparation may trigger a reactive response.',
        preparation: 'Ground first. Take three breaths. Remind yourself: this is their architecture expressing friction, not a verdict on your worth. Respond from your authority, not your conditioning.',
      };
    }
    if (density === 'HIGH') {
      return {
        flag: 'Elevated entropy. The signal is warm.',
        body: 'Conflict markers are present but not overwhelming. The sender may be processing frustration or making demands. There is space for a measured response.',
        preparation: 'Read slowly. Notice where your body tightens — that is conditioning, not truth. Wait before responding. If your authority is Emotional, sleep on it.',
      };
    }
    return {
      flag: 'Mild entropy. Slight tension in the signal.',
      body: 'Some friction markers detected, but the overall load is manageable. This may be passive tension rather than active conflict.',
      preparation: 'Read normally but stay aware. If you notice irritation rising, pause and check: is this the message, or something it triggered from before?',
    };
  }

  if (spectrum === 'EXPANSION') {
    return {
      flag: 'Expansion signal. The message carries warmth.',
      body: 'Connection and appreciation markers dominate. This signal is structurally supportive — it is safe to receive openly.',
      preparation: 'Let it land. Many people deflect positive signals because their architecture is conditioned for friction. Practice receiving.',
    };
  }

  // Integration
  return {
    flag: integration > 30 ? 'Integration in progress. They are processing.' : 'Neutral signal. Low emotional charge.',
    body: integration > 30
      ? 'The sender is actively working through something — repair attempts, reflection, or shared processing. This is a constructive signal.'
      : 'The message has minimal emotional markers. It may be logistical or surface-level communication.',
    preparation: integration > 30
      ? 'Match their openness. If they are offering repair, receive it without deflecting. This is the architecture of reconnection.'
      : 'No special preparation needed. Respond at your natural pace.',
  };
}

// ── Quick Entropy Check ─────────────────────────────────────
// Lightweight version: returns just the entropy score and flag color.
export const quickEntropyScan = (text: string): { score: number; level: 'safe' | 'warm' | 'hot' | 'critical' } => {
  const { entropy } = analyzeSignal(text);
  let level: 'safe' | 'warm' | 'hot' | 'critical' = 'safe';
  if (entropy >= 70) level = 'critical';
  else if (entropy >= 45) level = 'hot';
  else if (entropy >= 20) level = 'warm';
  return { score: entropy, level };
};
