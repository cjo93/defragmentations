
export interface GeneKeyFrequency {
  shadow: string;
  gift: string;
  siddhi: string;
  victimState: string; // The "Trap"
}

// A partial map of the 64 keys (Expanded for core archetypes)
export const GENE_KEYS: Record<number, GeneKeyFrequency> = {
  1: { shadow: "Entropy", gift: "Freshness", siddhi: "Beauty", victimState: "Numbness" },
  2: { shadow: "Dislocation", gift: "Orientation", siddhi: "Unity", victimState: "Lost" },
  3: { shadow: "Chaos", gift: "Innovation", siddhi: "Innocence", victimState: "Overwhelmed" },
  4: { shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness", victimState: "Righteousness" },
  5: { shadow: "Impatience", gift: "Patience", siddhi: "Timelessness", victimState: "Rushing" },
  6: { shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace", victimState: "Defensiveness" },
  7: { shadow: "Division", gift: "Guidance", siddhi: "Virtue", victimState: "Dictatorship" },
  8: { shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness", victimState: "Hollowness" },
  9: { shadow: "Inertia", gift: "Determination", siddhi: "Invincibility", victimState: "Distraction" },
  10: { shadow: "Self-Obsession", gift: "Naturalness", siddhi: "Being", victimState: "Narcissism" },
  11: { shadow: "Obscurity", gift: "Idealism", siddhi: "Light", victimState: "Delusion" },
  12: { shadow: "Vanity", gift: "Discrimination", siddhi: "Purity", victimState: "Malice" },
  13: { shadow: "Discord", gift: "Discernment", siddhi: "Empathy", victimState: "Pessimism" },
  14: { shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness", victimState: "Enslavement" },
  15: { shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence", victimState: "Emptiness" },
  16: { shadow: "Indifference", gift: "Versatility", siddhi: "Mastery", victimState: "Laziness" },
  17: { shadow: "Opinion", gift: "Farsightedness", siddhi: "Omniscience", victimState: "Dogma" },
  18: { shadow: "Judgment", gift: "Integrity", siddhi: "Perfection", victimState: "Inferiority" },
  19: { shadow: "Co-Dependence", gift: "Sensitivity", siddhi: "Sacrifice", victimState: "Isolation" },
  20: { shadow: "Superficiality", gift: "Self Assurance", siddhi: "Presence", victimState: "Absent" },
  21: { shadow: "Control", gift: "Authority", siddhi: "Valour", victimState: "Subjugation" },
  22: { shadow: "Dishonour", gift: "Graciousness", siddhi: "Grace", victimState: "Victimhood" },
  23: { shadow: "Complexity", gift: "Simplicity", siddhi: "Quintessence", victimState: "Fragmentation" },
  24: { shadow: "Addiction", gift: "Invention", siddhi: "Silence", victimState: "Anxiety" },
  25: { shadow: "Constriction", gift: "Acceptance", siddhi: "Universal Love", victimState: "Ignorance" },
  26: { shadow: "Pride", gift: "Artfulness", siddhi: "Invisibility", victimState: "Manipulation" },
  27: { shadow: "Selfishness", gift: "Altruism", siddhi: "Selflessness", victimState: "Self-Sacrifice" },
  28: { shadow: "Purposelessness", gift: "Totality", siddhi: "Immortality", victimState: "Fear of Death" },
  29: { shadow: "Half-Heartedness", gift: "Commitment", siddhi: "Devotion", victimState: "Over-Commitment" },
  30: { shadow: "Desire", gift: "Lightness", siddhi: "Rapture", victimState: "Seriousness" },
  31: { shadow: "Arrogance", gift: "Leadership", siddhi: "Humility", victimState: "Deference" },
  32: { shadow: "Failure", gift: "Preservation", siddhi: "Veneration", victimState: "Alarmism" },
  33: { shadow: "Forgetting", gift: "Mindfulness", siddhi: "Revelation", victimState: "Vengeance" },
  34: { shadow: "Force", gift: "Strength", siddhi: "Majesty", victimState: "Bullying" },
  35: { shadow: "Hunger", gift: "Adventure", siddhi: "Boundlessness", victimState: "Boredom" },
  36: { shadow: "Turbulence", gift: "Humanity", siddhi: "Compassion", victimState: "Crisis" },
  37: { shadow: "Weakness", gift: "Equality", siddhi: "Tenderness", victimState: "Sentimentality" },
  38: { shadow: "Struggle", gift: "Perseverance", siddhi: "Honour", victimState: "Battle" },
  39: { shadow: "Provocation", gift: "Dynamism", siddhi: "Liberation", victimState: "Violence" },
  40: { shadow: "Exhaustion", gift: "Resolve", siddhi: "Divine Will", victimState: "Burnout" },
  41: { shadow: "Fantasy", gift: "Anticipation", siddhi: "Emanation", victimState: "Dreaming" },
  42: { shadow: "Expectation", gift: "Detachment", siddhi: "Celebration", victimState: "Disappointment" },
  43: { shadow: "Deafness", gift: "Insight", siddhi: "Epiphany", victimState: "Noise" },
  44: { shadow: "Interference", gift: "Teamwork", siddhi: "Synarchy", victimState: "Distrust" },
  45: { shadow: "Dominance", gift: "Synergy", siddhi: "Communion", victimState: "Poverty" },
  46: { shadow: "Seriousness", gift: "Delight", siddhi: "Ecstasy", victimState: "Frivolity" },
  47: { shadow: "Oppression", gift: "Transmutation", siddhi: "Transfiguration", victimState: "Hopelessness" },
  48: { shadow: "Inadequacy", gift: "Resourcefulness", siddhi: "Wisdom", victimState: "Uncertainty" },
  49: { shadow: "Reaction", gift: "Revolution", siddhi: "Rebirth", victimState: "Rejection" },
  50: { shadow: "Corruption", gift: "Equilibrium", siddhi: "Harmony", victimState: "Irresponsibility" },
  51: { shadow: "Agitation", gift: "Initiative", siddhi: "Awakening", victimState: "Shock" },
  52: { shadow: "Stress", gift: "Restraint", siddhi: "Stillness", victimState: "Pressure" },
  53: { shadow: "Immaturity", gift: "Expansion", siddhi: "Superabundance", victimState: "Stagnation" },
  54: { shadow: "Greed", gift: "Aspiration", siddhi: "Ascension", victimState: "Ambition" },
  55: { shadow: "Victimization", gift: "Freedom", siddhi: "Freedom", victimState: "Complaining" },
  56: { shadow: "Distraction", gift: "Enrichment", siddhi: "Intoxication", victimState: "Wandering" },
  57: { shadow: "Unease", gift: "Intuition", siddhi: "Clarity", victimState: "Hesitation" },
  58: { shadow: "Dissatisfaction", gift: "Vitality", siddhi: "Bliss", victimState: "Interference" },
  59: { shadow: "Dishonesty", gift: "Intimacy", siddhi: "Transparency", victimState: "Exclusion" },
  60: { shadow: "Limitation", gift: "Realism", siddhi: "Justice", victimState: "Structure" },
  61: { shadow: "Psychosis", gift: "Inspiration", siddhi: "Sanctity", victimState: "Thinking" },
  62: { shadow: "Intellect", gift: "Precision", siddhi: "Impeccability", victimState: "Obsessive Detail" },
  63: { shadow: "Doubt", gift: "Inquiry", siddhi: "Truth", victimState: "Suspicion" },
  64: { shadow: "Confusion", gift: "Imagination", siddhi: "Illumination", victimState: "Analysis Paralysis" }
};

export const getFrequency = (gate: number) => {
  return GENE_KEYS[gate] || { shadow: "Unknown", gift: "Unknown", siddhi: "Unknown", victimState: "Unknown" };
};
