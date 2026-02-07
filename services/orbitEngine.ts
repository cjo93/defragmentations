// ── ORBIT ENGINE: Relational Physics ────────────────────────
// Calculates the Friction Coefficient between two human blueprints
// using angular distance (aspects) between planetary positions.
//
// In the DEFRAG system, relational tension isn't "bad energy" —
// it's Vector Collision. Two architectures occupying the same
// emotional space at incompatible angles.

import { processBirthData } from './engine';

// ── Aspect Detection ────────────────────────────────────────
// Hard aspects (high friction): Square (90°), Opposition (180°)
// Soft aspects (natural flow): Trine (120°), Sextile (60°)
// Conjunction (0°): Amplification — can be either

interface Aspect {
  name: string;
  angle: number;
  orb: number; // degrees of tolerance
  nature: 'hard' | 'soft' | 'neutral';
  weight: number; // friction contribution (0-1)
}

const ASPECTS: Aspect[] = [
  { name: 'Conjunction', angle: 0, orb: 8, nature: 'neutral', weight: 0.3 },
  { name: 'Sextile', angle: 60, orb: 5, nature: 'soft', weight: -0.15 },
  { name: 'Square', angle: 90, orb: 6, nature: 'hard', weight: 0.5 },
  { name: 'Trine', angle: 120, orb: 6, nature: 'soft', weight: -0.25 },
  { name: 'Opposition', angle: 180, orb: 8, nature: 'hard', weight: 0.6 },
];

// Normalize angular distance to 0-180 range
const angularDistance = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

// Detect which aspect (if any) is formed between two positions
const detectAspect = (degA: number, degB: number): (Aspect & { exact: number }) | null => {
  const dist = angularDistance(degA, degB);
  for (const aspect of ASPECTS) {
    if (Math.abs(dist - aspect.angle) <= aspect.orb) {
      return { ...aspect, exact: dist };
    }
  }
  return null;
};

// ── Relational Friction Calculator ──────────────────────────
// Uses the Harmonic Mean of planetary angular distances.
// Squares and Oppositions spike the friction score.

export interface FrictionResult {
  score: number; // 0-100 (100 = maximum friction)
  type: 'STRUCTURAL_FRICTION' | 'MIXED_GEOMETRY' | 'RESONANT_FLOW';
  description: string;
  aspects: {
    pair: string;
    aspect: string;
    nature: 'hard' | 'soft' | 'neutral';
    distance: string;
  }[];
}

export const calculateRelationalFriction = (chartA: any, chartB: any): FrictionResult => {
  const astroA = chartA.astrology;
  const astroB = chartB.astrology;

  if (!astroA || !astroB) {
    return {
      score: 0,
      type: 'MIXED_GEOMETRY',
      description: 'Insufficient data to calculate relational geometry.',
      aspects: [],
    };
  }

  // Key cross-chart comparisons (Person A → Person B)
  const pairs: { label: string; degA: number; degB: number; importance: number }[] = [
    // Identity axis: Sun-Sun
    { label: 'Sun ↔ Sun', degA: parseFloat(astroA.sun.degree), degB: parseFloat(astroB.sun.degree), importance: 1.0 },
    // Drive axis: Mars-Mars
    { label: 'Mars ↔ Mars', degA: parseFloat(astroA.mars.degree), degB: parseFloat(astroB.mars.degree), importance: 1.0 },
    // Cross-drive: Sun A ↔ Mars B (identity vs. drive collision)
    { label: 'Your Sun ↔ Their Mars', degA: parseFloat(astroA.sun.degree), degB: parseFloat(astroB.mars.degree), importance: 0.9 },
    // Cross-drive: Mars A ↔ Sun B
    { label: 'Your Mars ↔ Their Sun', degA: parseFloat(astroA.mars.degree), degB: parseFloat(astroB.sun.degree), importance: 0.9 },
    // Emotional axis: Moon-Moon
    { label: 'Moon ↔ Moon', degA: parseFloat(astroA.moon.degree), degB: parseFloat(astroB.moon.degree), importance: 0.8 },
    // Venus cross: Venus A ↔ Mars B (attraction/desire tension)
    { label: 'Your Venus ↔ Their Mars', degA: parseFloat(astroA.venus.degree), degB: parseFloat(astroB.mars.degree), importance: 0.7 },
  ];

  const detectedAspects: FrictionResult['aspects'] = [];
  let frictionSum = 0;
  let weightSum = 0;

  pairs.forEach(({ label, degA, degB, importance }) => {
    const aspect = detectAspect(degA, degB);
    if (aspect) {
      detectedAspects.push({
        pair: label,
        aspect: aspect.name,
        nature: aspect.nature,
        distance: `${aspect.exact.toFixed(1)}°`,
      });
      frictionSum += aspect.weight * importance;
      weightSum += importance;
    }
  });

  // Normalize to 0-100
  const rawScore = weightSum > 0 ? (frictionSum / weightSum) * 100 : 30;
  // Clamp and shift: baseline friction of ~30, max 100
  const score = Math.round(Math.max(0, Math.min(100, 50 + rawScore)));

  let type: FrictionResult['type'];
  let description: string;

  if (score > 65) {
    type = 'STRUCTURAL_FRICTION';
    description = 'High mechanical resistance between these architectures. The geometry creates natural tension — conscious space-holding and clear communication are essential.';
  } else if (score > 40) {
    type = 'MIXED_GEOMETRY';
    description = 'A blend of friction and flow. Some axes align naturally while others create productive tension. Awareness of the pressure points makes this navigable.';
  } else {
    type = 'RESONANT_FLOW';
    description = 'Low resistance between these designs. The planetary geometry suggests natural alignment of identity and drive. Friction here is likely situational, not structural.';
  }

  return { score, type, description, aspects: detectedAspects };
};

// ── Full Orbit Report ───────────────────────────────────────
// Combines friction analysis with center-based synastry from engine.ts

export const generateOrbitReport = (
  personA: { date: string; time: string; name?: string },
  personB: { date: string; time: string; name?: string },
) => {
  const chartA = processBirthData(personA.date, personA.time);
  const chartB = processBirthData(personB.date, personB.time);

  const friction = calculateRelationalFriction(chartA, chartB);

  // Center-based conditioning analysis
  const centersA = chartA.centers;
  const centersB = chartB.centers;
  const conditioning: { center: string; direction: string; insight: string }[] = [];

  const centerNames: Record<string, string> = {
    sacral: 'Sacral (Life Force)',
    solar: 'Solar Plexus (Emotions)',
    throat: 'Throat (Expression)',
    heart: 'Heart (Willpower)',
    g: 'G Center (Identity)',
    spleen: 'Spleen (Instinct)',
    ajna: 'Ajna (Thinking)',
    head: 'Head (Inspiration)',
    root: 'Root (Pressure)',
  };

  Object.keys(centersA).forEach(center => {
    const nameA = personA.name || 'Person A';
    const nameB = personB.name || 'Person B';
    const label = centerNames[center] || center;

    if (centersA[center] && !centersB[center]) {
      conditioning.push({
        center: label,
        direction: `${nameA} → ${nameB}`,
        insight: `${nameA} has this center defined. ${nameB} absorbs and amplifies this energy — it may feel overwhelming or addictive.`,
      });
    } else if (!centersA[center] && centersB[center]) {
      conditioning.push({
        center: label,
        direction: `${nameB} → ${nameA}`,
        insight: `${nameB} has this center defined. ${nameA} absorbs and amplifies this energy — creating either inspiration or pressure.`,
      });
    }
  });

  return {
    personA: { name: personA.name || 'You', type: chartA.type, strategy: chartA.strategy, authority: chartA.authority },
    personB: { name: personB.name || 'Them', type: chartB.type, strategy: chartB.strategy, authority: chartB.authority },
    friction,
    conditioning,
    summary: `${friction.type === 'STRUCTURAL_FRICTION' ? 'High' : friction.type === 'MIXED_GEOMETRY' ? 'Moderate' : 'Low'} structural friction. ${friction.aspects.length} planetary aspects detected, ${conditioning.length} conditioning channels active.`,
  };
};
