// ── TRIANGULATION ENGINE: "THE RELIEF VALVE" ───────────────
// In Bowen Family Systems, a two-person system under high
// structural load is inherently unstable. To manage the friction,
// the system will unconsciously recruit a third party — a child,
// a parent, a friend, even a project — to stabilize the tension.
//
// This engine detects when Person C is mathematically acting as
// the "relief valve" for the conflict between Person A and B.
// It looks for THE INTERCEPTOR: the person whose geometry
// bridges the most difficult aspect in the original pair.

import { processBirthData } from './engine';

// ── Aspect Geometry (mirrored from orbitEngine) ─────────────
interface Aspect {
  name: string;
  angle: number;
  orb: number;
  nature: 'hard' | 'soft' | 'neutral';
  weight: number;
}

const ASPECTS: Aspect[] = [
  { name: 'Conjunction', angle: 0, orb: 8, nature: 'neutral', weight: 0.3 },
  { name: 'Sextile', angle: 60, orb: 5, nature: 'soft', weight: -0.15 },
  { name: 'Square', angle: 90, orb: 6, nature: 'hard', weight: 0.5 },
  { name: 'Trine', angle: 120, orb: 6, nature: 'soft', weight: -0.25 },
  { name: 'Opposition', angle: 180, orb: 8, nature: 'hard', weight: 0.6 },
];

const angularDistance = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const detectAspect = (degA: number, degB: number): (Aspect & { exact: number }) | null => {
  const dist = angularDistance(degA, degB);
  for (const asp of ASPECTS) {
    if (Math.abs(dist - asp.angle) <= asp.orb) {
      return { ...asp, exact: dist };
    }
  }
  return null;
};

// ── Resonance Calculator ────────────────────────────────────
// Instead of Math.random, this calculates real resonance using
// soft aspects (Trines, Sextiles, Conjunctions) between two charts.
// Checks 5 planetary pairs: Sun, Moon, Mars, Venus, Mercury.
// Each soft aspect adds resonance; hard aspects subtract.

const calculateResonance = (chartP: any, chartQ: any): number => {
  const astroP = chartP.astrology;
  const astroQ = chartQ.astrology;
  if (!astroP || !astroQ) return 0;

  const planets = ['sun', 'moon', 'mars', 'venus', 'mercury'] as const;
  let resonanceScore = 50; // baseline

  for (const planet of planets) {
    const degP = parseFloat(astroP[planet]?.degree || '0');
    const degQ = parseFloat(astroQ[planet]?.degree || '0');
    const aspect = detectAspect(degP, degQ);

    if (aspect) {
      if (aspect.nature === 'soft') {
        // Trines/Sextiles = smoothing energy
        resonanceScore += aspect.name === 'Trine' ? 12 : 8;
      } else if (aspect.nature === 'hard') {
        // Squares/Oppositions = more friction, less smoothing
        resonanceScore -= aspect.name === 'Opposition' ? 8 : 5;
      } else {
        // Conjunctions = amplification (mild resonance)
        resonanceScore += 5;
      }
    }
  }

  // Cross-axis bonus: C's Moon softening A/B's Mars (emotional soothing of conflict)
  const moonP = parseFloat(astroP.moon?.degree || '0');
  const marsQ = parseFloat(astroQ.mars?.degree || '0');
  const crossAspect = detectAspect(moonP, marsQ);
  if (crossAspect && crossAspect.nature === 'soft') {
    resonanceScore += 10; // strong smoothing signal
  }

  return Math.max(0, Math.min(100, resonanceScore));
};

// ── Conflict Axis Detection ─────────────────────────────────
// Finds the hardest aspect between Person A and B's Mars placements.
// Mars-Mars = the conflict axis. If it's Square or Opposition,
// the system is under high structural load.

interface ConflictAxis {
  aspectName: string;
  distance: number;
  nature: 'hard' | 'soft' | 'neutral';
  description: string;
}

const findConflictAxis = (chartA: any, chartB: any): ConflictAxis | null => {
  const astroA = chartA.astrology;
  const astroB = chartB.astrology;
  if (!astroA || !astroB) return null;

  const marsA = parseFloat(astroA.mars?.degree || '0');
  const marsB = parseFloat(astroB.mars?.degree || '0');
  const aspect = detectAspect(marsA, marsB);

  if (!aspect) return null;

  return {
    aspectName: aspect.name,
    distance: aspect.exact,
    nature: aspect.nature,
    description: aspect.nature === 'hard'
      ? `Mars ${aspect.name} (${aspect.exact.toFixed(1)}°) — the conflict axis is pressurized. The system will seek a third body to discharge.`
      : `Mars ${aspect.name} (${aspect.exact.toFixed(1)}°) — the conflict axis has natural flow. Triangulation is less likely.`,
  };
};

// ── Triangulation Result ────────────────────────────────────
export interface TriangulationResult {
  detected: boolean;
  type: 'STABILIZER' | 'SCAPEGOAT' | 'NONE';
  role: string;
  resonanceWithA: number;
  resonanceWithB: number;
  conflictAxis: ConflictAxis | null;
  impact: string;
  risk: string;
  recommendation: string;
}

// ── The Main Detection Function ─────────────────────────────
export const detectTriangulation = (
  pairFriction: number,
  personA: { date: string; time: string; name?: string },
  personB: { date: string; time: string; name?: string },
  personC: { date: string; time: string; name?: string },
): TriangulationResult => {
  const nameC = personC.name || 'Person C';

  // If pair friction is low, triangulation is structurally unlikely
  if (pairFriction < 40) {
    return {
      detected: false,
      type: 'NONE',
      role: nameC,
      resonanceWithA: 0,
      resonanceWithB: 0,
      conflictAxis: null,
      impact: 'The friction between the pair is low. Triangulation is unlikely to be active.',
      risk: 'Minimal. The two-body system is stable.',
      recommendation: 'No structural intervention needed. The geometry holds.',
    };
  }

  const chartA = processBirthData(personA.date, personA.time);
  const chartB = processBirthData(personB.date, personB.time);
  const chartC = processBirthData(personC.date, personC.time);

  // Calculate resonance: how "smoothly" C connects to each
  const resonanceCA = calculateResonance(chartC, chartA);
  const resonanceCB = calculateResonance(chartC, chartB);

  // Find the conflict axis between A and B
  const conflictAxis = findConflictAxis(chartA, chartB);

  // High resonance with BOTH = Stabilizer (carrying the load)
  // High resonance with ONE, low with other = Scapegoat (absorbing the discharge)
  const highThreshold = 60;
  const lowThreshold = 35;

  if (resonanceCA >= highThreshold && resonanceCB >= highThreshold) {
    return {
      detected: true,
      type: 'STABILIZER',
      role: nameC,
      resonanceWithA: resonanceCA,
      resonanceWithB: resonanceCB,
      conflictAxis,
      impact: `${nameC} is acting as the Relief Valve. Their geometry forms soft aspects to both parties, creating a bridge that absorbs the tension the pair cannot hold. The structural load is being redistributed through ${nameC}.`,
      risk: `${nameC} may experience emotional fatigue, over-responsibility, or a loss of self. In Bowen terms, this is "de-selfing" — the gradual erosion of their own architecture to maintain system stability.`,
      recommendation: `The pair must address their conflict axis directly. ${nameC} needs conscious boundaries — their role is not to hold the system together. The geometry allows it, but the cost is their own structural integrity.`,
    };
  }

  if (
    (resonanceCA >= highThreshold && resonanceCB < lowThreshold) ||
    (resonanceCB >= highThreshold && resonanceCA < lowThreshold)
  ) {
    const alignedWith = resonanceCA > resonanceCB
      ? (personA.name || 'Person A')
      : (personB.name || 'Person B');
    const opposedTo = resonanceCA > resonanceCB
      ? (personB.name || 'Person B')
      : (personA.name || 'Person A');

    return {
      detected: true,
      type: 'SCAPEGOAT',
      role: nameC,
      resonanceWithA: resonanceCA,
      resonanceWithB: resonanceCB,
      conflictAxis,
      impact: `${nameC} is geometrically aligned with ${alignedWith} but dissonant with ${opposedTo}. The system may unconsciously position ${nameC} as the "problem" to redirect tension away from the original pair.`,
      risk: `${nameC} absorbs blame or distance that belongs to the pair's unresolved friction. This is the scapegoat pattern — the third body becomes the container for the system's unprocessed load.`,
      recommendation: `Recognize that the tension ${nameC} carries originated between the pair. Reframe ${nameC}'s behavior as a response to systemic pressure, not a personal failing.`,
    };
  }

  // Moderate resonance — mild triangulation
  if (resonanceCA > 45 && resonanceCB > 45) {
    return {
      detected: true,
      type: 'STABILIZER',
      role: nameC,
      resonanceWithA: resonanceCA,
      resonanceWithB: resonanceCB,
      conflictAxis,
      impact: `${nameC} has moderate geometric resonance with both parties. Mild triangulation may be present — ${nameC} likely serves as a go-between or emotional translator when the pair is under load.`,
      risk: `The risk is gradual: ${nameC} may begin to lose clarity about which feelings are theirs and which belong to the pair.`,
      recommendation: `Awareness is the intervention. When the pair is in friction, check: is ${nameC} being pulled in to mediate? If so, the load needs to go back to the pair.`,
    };
  }

  return {
    detected: false,
    type: 'NONE',
    role: nameC,
    resonanceWithA: resonanceCA,
    resonanceWithB: resonanceCB,
    conflictAxis,
    impact: `${nameC} does not show strong geometric bridges to both parties. Triangulation through ${nameC} is unlikely to be the primary pattern.`,
    risk: 'Low. The geometry does not suggest ${nameC} is carrying the system\'s load.',
    recommendation: 'Look elsewhere in the family system. The relief valve may be a sibling, a project, or even an addiction.',
  };
};

// ── Full Triangulation Report ───────────────────────────────
// Wraps detection with chart summaries for all three people.

export interface TriangulationReport {
  personA: { name: string; type: string };
  personB: { name: string; type: string };
  personC: { name: string; type: string };
  pairFriction: number;
  triangulation: TriangulationResult;
}

export const generateTriangulationReport = (
  personA: { date: string; time: string; name?: string },
  personB: { date: string; time: string; name?: string },
  personC: { date: string; time: string; name?: string },
  pairFriction: number,
): TriangulationReport => {
  const chartA = processBirthData(personA.date, personA.time);
  const chartB = processBirthData(personB.date, personB.time);
  const chartC = processBirthData(personC.date, personC.time);

  const triangulation = detectTriangulation(pairFriction, personA, personB, personC);

  return {
    personA: { name: personA.name || 'Person A', type: chartA.type },
    personB: { name: personB.name || 'Person B', type: chartB.type },
    personC: { name: personC.name || 'Person C', type: chartC.type },
    pairFriction,
    triangulation,
  };
};
