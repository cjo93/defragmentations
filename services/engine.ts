
const SOLAR_ARC_DEGREES = 88.0;

// Simulation of the 9 Centers of Human Design
const CENTERS_LIST = [
  "Head", "Ajna", "Throat", "G", "Heart", "Sacral", "Root", "Spleen", "SolarPlexus"
];

function getDesignDate(birthDate: Date): Date {
  const d = new Date(birthDate);
  d.setDate(d.getDate() - 88); 
  return d;
}

// Deterministic Pseudo-Random Generator for consistent results per date
function pseudoRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate deterministic active gates (1-64) and centers based on date
// In a real app, this would use an astronomical ephemeris
const calculatePlanets = (date: Date) => {
    const seed = date.getTime();
    const gates: Record<string, boolean> = {};
    const centers: Record<string, boolean> = {};

    // Activate random gates
    for (let i = 1; i <= 64; i++) {
        if (pseudoRandom(seed + i) > 0.7) { // 30% chance of gate activation
            gates[i.toString()] = true;
        }
    }

    // Activate random centers
    CENTERS_LIST.forEach((center, index) => {
        if (pseudoRandom(seed + index + 100) > 0.5) {
            centers[center] = true;
        }
    });

    return {
        timestamp: date.toISOString(),
        gates,
        centers,
        sun: { position: pseudoRandom(seed) * 360, house: Math.floor(pseudoRandom(seed + 200) * 12) + 1 },
    };
};

export function processBirthData(dateString: string, timeString: string) {
  const birthDate = new Date(`${dateString}T${timeString}`);
  const designDate = getDesignDate(birthDate);

  return {
    personality: calculatePlanets(birthDate),
    design: calculatePlanets(designDate)
  };
}

// The "Physics" Engine (Roadmap Step 2)
export function calculateFriction(personA: any, personB: any) {
    if (!personA || !personB) return { conflicts: 0, flow: 0, score: 0 };

    // 1. Conflict: How many active gates in A block the flow of B?
    // Using Centers as a proxy for "Conflict" in this MVP logic per instructions
    // (Shared Defined Centers = Friction/Collision)
    const conflicts = Object.keys(personA.centers || {}).filter(
        center => personA.centers[center] && personB.centers && personB.centers[center]
    ).length;

    // 2. Flow: How many open gates in A are bridged by B?
    const flow = Object.keys(personA.gates || {}).filter(
        gate => !personA.gates[gate] && personB.gates && personB.gates[gate]
    ).length;

    // Score calculation
    let score = 100 - (conflicts * 10) + (flow * 5);
    score = Math.max(0, Math.min(100, score));

    return { 
        conflicts, 
        flow, 
        score,
        summary: score > 70 
          ? "Low friction detected. High mechanical efficiency." 
          : "High friction detected. Separate operative environments recommended."
    };
}
