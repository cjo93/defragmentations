
import { Body, SunPosition, EclipticLongitude, MakeTime } from 'astronomy-engine';

// ── Zodiac Mapping ──────────────────────────────────────────
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const getZodiacSign = (longitude: number) => ZODIAC_SIGNS[Math.floor(longitude / 30) % 12];

// ── Gate Mapping (Ecliptic Longitude → Human Design Gate 1-64) ──
// Each gate spans ~5.625° of the ecliptic (360° / 64 gates).
// This is a simplified linear mapping; full HD uses the Rave Mandala wheel.
const longitudeToGate = (longitude: number): number => {
  // HD gates start at Gate 41 at 58°15' Scorpio (~228.25°)
  // Simplified: linear mapping for MVP, rotated to approximate HD sequence
  const offset = (longitude + 131.75) % 360; // shift so 0 aligns with Gate 41
  return Math.floor(offset / 5.625) + 1;
};

// ── Human Design Type Inference ─────────────────────────────
// Simplified: based on defined centers pattern.
// Real HD uses channel connections between gates.
const inferType = (definedCenters: Record<string, boolean>): string => {
  const { sacral, throat, heart, solar } = definedCenters;
  if (sacral && throat) return 'Manifesting Generator';
  if (sacral) return 'Generator';
  if (throat && (heart || solar)) return 'Manifestor';
  if (!sacral) return 'Projector';
  return 'Reflector';
};

const inferStrategy = (type: string): string => {
  switch (type) {
    case 'Generator':
    case 'Manifesting Generator': return 'Wait to Respond';
    case 'Projector': return 'Wait for Invitation';
    case 'Manifestor': return 'Inform, Then Act';
    case 'Reflector': return 'Wait a Full Lunar Cycle';
    default: return 'Wait to Respond';
  }
};

const inferAuthority = (definedCenters: Record<string, boolean>): string => {
  if (definedCenters.solar) return 'Emotional (Solar Plexus)';
  if (definedCenters.sacral) return 'Sacral';
  if (definedCenters.spleen) return 'Splenic';
  if (definedCenters.heart) return 'Ego / Heart';
  if (definedCenters.g) return 'Self-Projected';
  if (definedCenters.ajna) return 'Mental (Outer Authority)';
  return 'Lunar';
};

// ── The Real Calculator ─────────────────────────────────────
export const processBirthData = (dateStr: string, timeStr: string) => {
  const date = new Date(`${dateStr}T${timeStr || '12:00'}:00`);
  const astroTime = MakeTime(date);

  // Calculate real ecliptic longitudes
  const sunLon = SunPosition(astroTime).elon;
  const moonLon = EclipticLongitude(Body.Moon, astroTime);
  const marsLon = EclipticLongitude(Body.Mars, astroTime);
  const venusLon = EclipticLongitude(Body.Venus, astroTime);
  const mercuryLon = EclipticLongitude(Body.Mercury, astroTime);
  const jupiterLon = EclipticLongitude(Body.Jupiter, astroTime);
  const saturnLon = EclipticLongitude(Body.Saturn, astroTime);

  // Derive gates from planetary positions
  const gates = [
    longitudeToGate(sunLon),
    longitudeToGate(moonLon),
    longitudeToGate(marsLon),
    longitudeToGate(venusLon),
    longitudeToGate(mercuryLon),
    longitudeToGate(jupiterLon),
    longitudeToGate(saturnLon),
  ];
  // Deduplicate
  const uniqueGates = [...new Set(gates)];

  // Simplified center definition based on gate ranges
  // In real HD, specific gate pairs form channels that define centers
  const centers: Record<string, boolean> = {
    head: uniqueGates.some(g => [61, 63, 64].includes(g)),
    ajna: uniqueGates.some(g => [47, 24, 4, 17, 43, 11].includes(g)),
    throat: uniqueGates.some(g => [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16].includes(g)),
    g: uniqueGates.some(g => [1, 13, 25, 46, 2, 15, 10, 7].includes(g)),
    heart: uniqueGates.some(g => [21, 26, 51, 40].includes(g)),
    sacral: uniqueGates.some(g => [5, 14, 29, 59, 9, 3, 42, 27, 34].includes(g)),
    spleen: uniqueGates.some(g => [48, 57, 44, 50, 32, 28, 18].includes(g)),
    solar: uniqueGates.some(g => [6, 37, 22, 36, 30, 55, 49].includes(g)),
    root: uniqueGates.some(g => [53, 60, 52, 19, 39, 41, 58, 38, 54].includes(g)),
  };

  const type = inferType(centers);
  const strategy = inferStrategy(type);
  const authority = inferAuthority(centers);

  return {
    meta: {
      birthDate: dateStr,
      birthTime: timeStr,
      generatedAt: new Date().toISOString(),
    },
    astrology: {
      sun:     { sign: getZodiacSign(sunLon),     degree: sunLon.toFixed(2) },
      moon:    { sign: getZodiacSign(moonLon),    degree: moonLon.toFixed(2) },
      mars:    { sign: getZodiacSign(marsLon),    degree: marsLon.toFixed(2) },
      venus:   { sign: getZodiacSign(venusLon),   degree: venusLon.toFixed(2) },
      mercury: { sign: getZodiacSign(mercuryLon), degree: mercuryLon.toFixed(2) },
      jupiter: { sign: getZodiacSign(jupiterLon), degree: jupiterLon.toFixed(2) },
      saturn:  { sign: getZodiacSign(saturnLon),  degree: saturnLon.toFixed(2) },
    },
    type,
    strategy,
    authority,
    centers,
    personality: {
      gates: uniqueGates,
      centers,
    },
    // Relational dynamics — populated separately via Orbit view
    // Keeping default structure for Dashboard/SystemMap compatibility
    relationalDynamics: [
      { name: "Self", type: "HEALTHY" },
    ],
  };
};

// ── Friction Calculator ─────────────────────────────────────
export const calculateFriction = (p1: any, p2: any) => {
  // Compare defined centers — opposing definitions create conditioning
  const centersA = p1.centers || {};
  const centersB = p2.centers || {};
  let conflicts = 0;
  let flow = 0;

  Object.keys(centersA).forEach(center => {
    if (centersA[center] && !centersB[center]) conflicts++;
    if (centersA[center] && centersB[center]) flow++;
  });

  const score = Math.round((flow / Math.max(flow + conflicts, 1)) * 100);
  return { score, conflicts, flow, summary: `${flow} aligned, ${conflicts} conditioning points` };
};

// ── Synastry Calculator ─────────────────────────────────────
export const calculateSynastry = (personA: any, personB: any) => {
  const friction = calculateFriction(personA.personality || personA, personB.personality || personB);
  const dynamics: { type: string; source: string; description: string }[] = [];

  const centersA = personA.personality?.centers || personA.centers || {};
  const centersB = personB.personality?.centers || personB.centers || {};

  // Detect conditioning dynamics
  if (centersA.solar && !centersB.solar) {
    dynamics.push({
      type: 'FUSION',
      source: 'Emotional Center',
      description: 'You radiate emotional energy they absorb. They may feel your moods more intensely than you do.',
    });
  }
  if (!centersA.sacral && centersB.sacral) {
    dynamics.push({
      type: 'CONFLICT',
      source: 'Sacral Energy',
      description: 'Their sustained energy can push you past your natural limits. Rest is not laziness — it is your design.',
    });
  }
  if (centersA.throat && centersB.throat) {
    dynamics.push({
      type: 'HEALTHY',
      source: 'Communication',
      description: 'Both voices are defined. Communication flows when you take turns, not when you compete.',
    });
  }

  if (dynamics.length === 0) {
    dynamics.push({
      type: 'HEALTHY',
      source: 'General',
      description: 'No major conditioning points detected. Friction is likely situational, not structural.',
    });
  }

  return { compatibilityScore: friction.score, dynamics };
};

// ── Alchemical Inversion: Shadow → Gift ─────────────────────
// The frequency inversion algorithm. Maps psychological tension
// (shadow) to structural strength (gift) using an alignment
// coefficient based on the user's Human Design Type.
//
// S = Shadow resistance value (0-1, higher = more friction)
// A = Alignment coefficient per type
// G = Gift resonance (inverted + amplified)
export const calculateInversion = (shadowValue: number, userType: string): number => {
  const alignmentMap: Record<string, number> = {
    'Projector': 1.25,
    'Generator': 1.0,
    'Manifesting Generator': 1.05,
    'Manifestor': 1.1,
    'Reflector': 1.5,
  };

  const A = alignmentMap[userType] || 1.0;
  // Clamp shadow to avoid division by zero
  const clampedShadow = Math.max(shadowValue, 0.01);
  // The Alchemical Inversion: inverse proportion amplified by alignment
  const resonance = (1 / clampedShadow) * A;
  return parseFloat(resonance.toFixed(4));
};

// ── Transit Engine: Real-Time Weather ───────────────────────
// Calculates current sky positions and overlays them on a natal
// chart. Detects transit-to-natal aspects to provide real-time
// "psychic weather" — which frequencies are being activated NOW.

export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  transitGate: number;
  natalGate: number;
  description: string;
}

export interface TransitReport {
  timestamp: string;
  currentSky: Record<string, { sign: string; degree: string; gate: number }>;
  aspects: TransitAspect[];
  activatedGates: number[];
  weatherSummary: string;
}

const ASPECT_CONFIG: { name: string; angle: number; orb: number; weight: number }[] = [
  { name: 'Conjunction', angle: 0,   orb: 8, weight: 1.0 },
  { name: 'Opposition',  angle: 180, orb: 7, weight: 0.9 },
  { name: 'Square',      angle: 90,  orb: 6, weight: 0.8 },
  { name: 'Trine',       angle: 120, orb: 6, weight: 0.6 },
  { name: 'Sextile',     angle: 60,  orb: 4, weight: 0.4 },
];

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mars: 'Mars', venus: 'Venus',
  mercury: 'Mercury', jupiter: 'Jupiter', saturn: 'Saturn',
};

const aspectDescription = (transit: string, natal: string, aspect: string): string => {
  if (aspect === 'Conjunction') return `Transit ${transit} activates your natal ${natal} directly. This frequency is live — pay attention to what surfaces.`;
  if (aspect === 'Opposition') return `Transit ${transit} opposes your natal ${natal}. Structural tension is high. This is a mirror, not a wall.`;
  if (aspect === 'Square') return `Transit ${transit} squares your natal ${natal}. Friction is mechanical — a pressure point designed to produce movement.`;
  if (aspect === 'Trine') return `Transit ${transit} trines your natal ${natal}. Flow channel open. Alignment is effortless here — use it.`;
  return `Transit ${transit} sextiles your natal ${natal}. Subtle activation. Opportunity exists if you lean into it.`;
};

export const calculateTransits = (natalChart: ReturnType<typeof processBirthData>): TransitReport => {
  const now = new Date();
  const astroNow = MakeTime(now);

  // Current sky positions
  const currentPositions = {
    sun:     SunPosition(astroNow).elon,
    moon:    EclipticLongitude(Body.Moon, astroNow),
    mars:    EclipticLongitude(Body.Mars, astroNow),
    venus:   EclipticLongitude(Body.Venus, astroNow),
    mercury: EclipticLongitude(Body.Mercury, astroNow),
    jupiter: EclipticLongitude(Body.Jupiter, astroNow),
    saturn:  EclipticLongitude(Body.Saturn, astroNow),
  };

  const currentSky: TransitReport['currentSky'] = {};
  for (const [planet, lon] of Object.entries(currentPositions)) {
    currentSky[planet] = {
      sign: getZodiacSign(lon),
      degree: lon.toFixed(2),
      gate: longitudeToGate(lon),
    };
  }

  // Detect transit-to-natal aspects
  const aspects: TransitAspect[] = [];
  const natalPositions: Record<string, number> = {};
  for (const [planet, data] of Object.entries(natalChart.astrology)) {
    natalPositions[planet] = parseFloat((data as any).degree);
  }

  for (const [tPlanet, tLon] of Object.entries(currentPositions)) {
    for (const [nPlanet, nLon] of Object.entries(natalPositions)) {
      for (const cfg of ASPECT_CONFIG) {
        let diff = Math.abs(tLon - nLon);
        if (diff > 180) diff = 360 - diff;
        const orb = Math.abs(diff - cfg.angle);
        if (orb <= cfg.orb) {
          aspects.push({
            transitPlanet: PLANET_NAMES[tPlanet] || tPlanet,
            natalPlanet: PLANET_NAMES[nPlanet] || nPlanet,
            aspect: cfg.name,
            orb: parseFloat(orb.toFixed(2)),
            transitGate: longitudeToGate(tLon),
            natalGate: longitudeToGate(nLon),
            description: aspectDescription(PLANET_NAMES[tPlanet], PLANET_NAMES[nPlanet], cfg.name),
          });
        }
      }
    }
  }

  // Sort by tightest orb (most impactful first)
  aspects.sort((a, b) => a.orb - b.orb);

  // Activated gates are transit gates that aspect natal planets
  const activatedGates = [...new Set(aspects.map(a => a.transitGate))];

  // Generate weather summary
  const conjunctions = aspects.filter(a => a.aspect === 'Conjunction');
  const squares = aspects.filter(a => a.aspect === 'Square');
  const oppositions = aspects.filter(a => a.aspect === 'Opposition');

  let weatherSummary = '';
  if (conjunctions.length >= 3) {
    weatherSummary = 'HIGH ACTIVATION — Multiple transit conjunctions to your natal chart. Core frequencies are being stimulated directly. Proceed with awareness.';
  } else if (squares.length >= 3 || oppositions.length >= 2) {
    weatherSummary = 'STRUCTURAL FRICTION — The current sky creates pressure against your natal architecture. This is productive tension. Don\'t avoid it — work with it.';
  } else if (aspects.length > 5) {
    weatherSummary = 'ACTIVE WEATHER — Multiple transit aspects are engaging your system. Pay attention to which gates are being activated — they\'re showing you where growth is happening.';
  } else if (aspects.length === 0) {
    weatherSummary = 'QUIET SKY — Minimal transit activation. A good window for integration and rest. Let the system recalibrate.';
  } else {
    weatherSummary = 'MODERATE ACTIVITY — A few transit aspects are active. Normal operating conditions. Stay aligned with your strategy and authority.';
  }

  return {
    timestamp: now.toISOString(),
    currentSky,
    aspects,
    activatedGates,
    weatherSummary,
  };
};
