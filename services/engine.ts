
// MOCK ENGINE FOR PREVIEW
// In production, this imports 'astronomy-engine' for real calculations.

export const processBirthData = (date: string, time: string) => {
  // Simulate processing time
  console.log(`Processing Blueprint for ${date} at ${time}`);
  
  const centers = {
    head: false,
    ajna: true,
    throat: true,
    g: false, // Open G -> Identity issues
    heart: false,
    sacral: false,
    root: true,
    spleen: true,
    solar: false,
  };

  return {
    type: "Projector", // Mock data based on user summary
    strategy: "Wait for Invitation",
    authority: "Splenic",
    centers, // Keeping top level for compatibility
    personality: {
      gates: [1, 20, 57, 10, 34], // Mock gates
      centers,
    },
    // BOWEN DYNAMICS MOCK DATA
    // This is what populates the System Map
    relationalDynamics: [
      { name: "Mother", type: "FUSION" }, // Amber Triple Line
      { name: "Step-Father", type: "CONFLICT" }, // Red Zig-Zag
      { name: "Erik", type: "CONFLICT" }, // Red Zig-Zag
      { name: "Christopher", type: "HEALTHY" }, // Blue Solid
    ]
  };
};

export const calculateFriction = (p1: any, p2: any) => {
    return { score: 75, conflicts: 2, flow: 1, summary: "Mock Friction Analysis" };
};
