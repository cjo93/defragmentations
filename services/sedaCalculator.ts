
export function calculateSEDA(text: string) {
  const lower = text.toLowerCase();
  
  // 1. The Reality Check (Grounding)
  // Words that indicate the user is in physical reality
  const grounding = (lower.match(/job|work|kids|rent|food|sleep|gym/g) || []).length;
  
  // 2. The Ego Inflation (Delusion)
  // Words that indicate "God Complex" or dissociation
  const inflation = (lower.match(/god|chosen|matrix|download|frequency|saved|prophet|angel/g) || []).length;
  
  // 3. The Distress Signal (Functionality)
  // Words that indicate system failure
  const distress = (lower.match(/stuck|pain|dying|help|can't|never|impossible|broken/g) || []).length;

  // Formula: High Ego + High Distress = DANGER. High Grounding = SAFE.
  // Base 50. Inflation adds risk. Distress adds risk. Grounding reduces risk.
  let riskScore = 50 + (inflation * 5) + (distress * 3) - (grounding * 4);
  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    score: riskScore, // 0-100 (100 is max risk)
    status: riskScore > 80 ? 'DANGER' : riskScore > 50 ? 'CAUTION' : 'SAFE',
    flags: { grounding, inflation, distress }
  };
}
