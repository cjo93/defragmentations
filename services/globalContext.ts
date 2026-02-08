/**
 * DEFRAG — Global Context Service
 * 
 * The "Singular Intelligence" layer. Aggregates state from all engines
 * (Echo, Triangulation, SEDA, Transits, Blueprint) into a unified
 * context object that the Forge (chat) injects into every AI call.
 * 
 * This ensures DEFRAG remembers the user's current life situation
 * across all surfaces — Lab, Forge, Archive — as one continuous observer.
 */

import { loadEntries, analyzeEcho, EchoReport } from './echoEngine';
import { calculateSEDA } from './sedaCalculator';
import { calculateTransits, TransitReport } from './engine';
import { processBirthData } from './engine';

// ── Types ───────────────────────────────────────────────────

export interface GlobalContext {
  /** User's natal chart if birth data is available */
  blueprint: ReturnType<typeof processBirthData> | null;
  /** Echo analysis from the Archive — recurring loops, dominant pattern */
  echo: EchoReport | null;
  /** Current SEDA stability reading */
  seda: { score: number; status: string; toneDirective: string } | null;
  /** Live transit weather */
  transits: TransitReport | null;
  /** Timestamp of last context refresh */
  lastRefresh: string;
}

// ── Storage Keys ────────────────────────────────────────────

const BIRTH_DATA_KEY = 'defrag_birth_data';
const _CONTEXT_KEY = 'defrag_global_context';

// ── Birth Data Persistence ──────────────────────────────────

export const saveBirthData = (date: string, time: string): void => {
  localStorage.setItem(BIRTH_DATA_KEY, JSON.stringify({ date, time }));
};

export const loadBirthData = (): { date: string; time: string } | null => {
  try {
    const raw = localStorage.getItem(BIRTH_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// ── Context Assembly ────────────────────────────────────────

/**
 * Builds the full GlobalContext by reading all local state.
 * Lightweight — runs synchronously from localStorage + computation.
 */
export const assembleGlobalContext = (): GlobalContext => {
  const birthData = loadBirthData();
  let blueprint: GlobalContext['blueprint'] = null;
  let transits: GlobalContext['transits'] = null;

  if (birthData) {
    blueprint = processBirthData(birthData.date, birthData.time);
    transits = calculateTransits(blueprint);
  }

  // Echo analysis
  const entries = loadEntries();
  const userType = blueprint?.type || 'Generator';
  const echo = entries.length > 0 ? analyzeEcho(entries, userType, 30) : null;

  // SEDA from recent echo entries (last 5)
  const recentText = entries.slice(-5).map(e => e.text).join(' ');
  const seda = recentText
    ? (() => { const s = calculateSEDA(recentText); return { score: s.score, status: s.status, toneDirective: s.toneDirective }; })()
    : { score: 0, status: 'SAFE', toneDirective: 'LOGIC_MODE' };

  return {
    blueprint,
    echo,
    seda,
    transits,
    lastRefresh: new Date().toISOString(),
  };
};

// ── Context → System Prompt Injection ───────────────────────

/**
 * Serializes the GlobalContext into a structured text block
 * that gets appended to the AI system prompt. This is what
 * makes DEFRAG a "singular intelligence" — it always knows
 * the user's current state.
 */
export const contextToPromptBlock = (ctx: GlobalContext): string => {
  const sections: string[] = [];

  // Blueprint summary
  if (ctx.blueprint) {
    sections.push(`[CURRENT BLUEPRINT]
Type: ${ctx.blueprint.type}
Strategy: ${ctx.blueprint.strategy}
Authority: ${ctx.blueprint.authority}
Active Gates: ${ctx.blueprint.personality.gates.join(', ')}`);
  }

  // Echo patterns
  if (ctx.echo && ctx.echo.loops.length > 0) {
    const loopSummary = ctx.echo.loops
      .slice(0, 3)
      .map(l => `- ${l.theme} (appeared ${l.frequency}x in last ${ctx.echo!.windowDays} days, drag: ${l.systemDrag}/100)`)
      .join('\n');
    sections.push(`[ECHO PATTERNS — Active Loops]
Status: ${ctx.echo.status}
Overall System Drag: ${ctx.echo.overallDrag}/100
${loopSummary}
${ctx.echo.dominantLoop ? `Dominant: "${ctx.echo.dominantLoop.theme}" — ${ctx.echo.dominantLoop.description}` : ''}`);
  }

  // SEDA state
  if (ctx.seda) {
    sections.push(`[SEDA STATE]
Stability Score: ${ctx.seda.score}/100
Status: ${ctx.seda.status}
Tone Directive: ${ctx.seda.toneDirective}
${ctx.seda.toneDirective === 'HOLDING_SPACE' ? '⚠ User is under structural load. Slow down. Validate first.' : ''}
${ctx.seda.toneDirective === 'CRISIS_MODE' ? '🛑 CRISIS DETECTED. Pause analysis. Ground the user.' : ''}`);
  }

  // Transit weather
  if (ctx.transits && ctx.transits.aspects.length > 0) {
    const topAspects = ctx.transits.aspects
      .slice(0, 5)
      .map(a => `- ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet} (orb ${a.orb}°)`)
      .join('\n');
    sections.push(`[CURRENT WEATHER — Transit Overlay]
${ctx.transits.weatherSummary}
Active Gates: ${ctx.transits.activatedGates.join(', ')}
Top Aspects:
${topAspects}`);
  }

  return sections.length > 0
    ? `\n[DEFRAG GLOBAL CONTEXT — Unified Memory]\n${sections.join('\n\n')}\n`
    : '';
};

// ── UI Command Detection ────────────────────────────────────

export type UICommand = 
  | { type: 'SHOW_TRANSITS' }
  | { type: 'SHOW_ECHO' }
  | { type: 'SHOW_SIGNAL'; text: string }
  | { type: 'SHOW_TRIANGULATION' }
  | { type: 'SHOW_SEDA' }
  | { type: 'NAVIGATE'; target: string };

/**
 * Parses AI response text for embedded UI commands.
 * Format: CMD:COMMAND_NAME or CMD:COMMAND_NAME:payload
 * 
 * The AI can embed these in its response to trigger UI changes
 * without the user leaving the Forge.
 */
export const parseUICommands = (text: string): { cleanText: string; commands: UICommand[] } => {
  const commands: UICommand[] = [];
  const cmdPattern = /CMD:(SHOW_TRANSITS|SHOW_ECHO|SHOW_SIGNAL|SHOW_TRIANGULATION|SHOW_SEDA|NAVIGATE)(?::([^\s]+))?/g;
  
  let cleanText = text;
  let match;
  
  while ((match = cmdPattern.exec(text)) !== null) {
    const [fullMatch, cmd, payload] = match;
    switch (cmd) {
      case 'SHOW_TRANSITS': commands.push({ type: 'SHOW_TRANSITS' }); break;
      case 'SHOW_ECHO': commands.push({ type: 'SHOW_ECHO' }); break;
      case 'SHOW_SIGNAL': commands.push({ type: 'SHOW_SIGNAL', text: payload || '' }); break;
      case 'SHOW_TRIANGULATION': commands.push({ type: 'SHOW_TRIANGULATION' }); break;
      case 'SHOW_SEDA': commands.push({ type: 'SHOW_SEDA' }); break;
      case 'NAVIGATE': commands.push({ type: 'NAVIGATE', target: payload || '' }); break;
    }
    cleanText = cleanText.replace(fullMatch, '').trim();
  }

  return { cleanText, commands };
};
