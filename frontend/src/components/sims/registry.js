import baseConfigs from "./configs";
import simsMech from "./simsMech";
import simsEM from "./simsEM";
import simsOTW from "./simsOTW";
import simsC from "./simsC";
import simsWEP from "./simsWEP";
import simsCircular from "./simsCircular";
import simsRotational from "./simsRotational";
import simsMagnetism from "./simsMagnetism";
import simsOptics from "./simsOptics";
import simsAstrophysics from "./simsAstrophysics";

// metadata for the original mechanics sims (which don't carry topic/difficulty fields)
const BASE_META = {
  projectile: { topic: "mechanics", difficulty: "Beginner", summary: "Launch a projectile under gravity, drag and wind." },
  pendulum: { topic: "mechanics", difficulty: "Beginner", summary: "Oscillations and time period of a simple pendulum." },
  spring: { topic: "mechanics", difficulty: "Intermediate", summary: "Simple harmonic motion of a mass on a spring." },
  collision: { topic: "mechanics", difficulty: "Intermediate", summary: "1D collisions and conservation of momentum & energy." },
  orbit: { topic: "mechanics", difficulty: "Advanced", summary: "Set a satellite's speed to orbit, escape or crash." },
  incline: { topic: "mechanics", difficulty: "Beginner", summary: "Friction, normal force and acceleration on a ramp." },
  pulley: { topic: "mechanics", difficulty: "Intermediate", summary: "Atwood machine: acceleration and string tension." },
  banked: { topic: "mechanics", difficulty: "Advanced", summary: "Safe speed range on a banked circular turn." },
  energyramp: { topic: "mechanics", difficulty: "Intermediate", summary: "KE ↔ PE energy conservation on a curved track." },
  conical: { topic: "mechanics", difficulty: "Advanced", summary: "A bob revolving in a horizontal circle." },
  verticalloop: { topic: "mechanics", difficulty: "Advanced", summary: "Critical speed to complete a vertical loop." },
};

const allConfigs = { ...baseConfigs, ...simsMech, ...simsEM, ...simsOTW, ...simsC, ...simsWEP, ...simsCircular, ...simsRotational, ...simsMagnetism, ...simsOptics, ...simsAstrophysics };

export const SIM_INDEX = Object.entries(allConfigs).map(([id, c]) => ({
  id,
  title: c.title || id,
  topic: c.topic || BASE_META[id]?.topic || "mechanics",
  difficulty: c.difficulty || BASE_META[id]?.difficulty || "Beginner",
  summary: c.summary || BASE_META[id]?.summary || "",
  equation: c.equation || "",
}));

export function getSim(id) { return allConfigs[id]; }
export function getSimMeta(id) { return SIM_INDEX.find((s) => s.id === id); }

export default allConfigs;
