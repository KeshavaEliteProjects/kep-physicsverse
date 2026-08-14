import { useState } from "react";
import allConfigs, { SIM_INDEX } from "../components/sims/registry";
import SimEngine from "../components/sims/SimEngine";
import { LineChart } from "lucide-react";

const TOPIC_LABELS = {
  mechanics: "Mechanics", electricity: "Electricity", magnetism: "Magnetism", optics: "Optics",
  thermodynamics: "Thermodynamics", waves: "Waves", modern: "Modern", fluids: "Fluids",
  engineering: "Engineering", astrophysics: "Astrophysics",
};
const ORDER = Object.keys(TOPIC_LABELS);

export default function GraphStudio() {
  const [sim, setSim] = useState("projectile");
  const grouped = ORDER.map((t) => ({ topic: t, sims: SIM_INDEX.filter((s) => s.topic === t) })).filter((g) => g.sims.length);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <span className="text-sm text-primary font-mono-data flex items-center gap-1.5"><LineChart className="w-4 h-4" /> Graph Studio</span>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Plot physics in real time</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">Run any of the {SIM_INDEX.length} simulations and watch its graphs draw live. Switch the plotted quantity and export data as CSV.</p>

      <div className="my-8 space-y-4">
        {grouped.map((g) => (
          <div key={g.topic}>
            <p className="text-[11px] font-mono-data text-muted-foreground uppercase tracking-wide mb-2">{TOPIC_LABELS[g.topic]}</p>
            <div className="flex flex-wrap gap-2">
              {g.sims.map((o) => (
                <button key={o.id} data-testid={`graph-sim-${o.id}`} onClick={() => setSim(o.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    sim === o.id ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  }`}>{o.title}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SimEngine key={sim} config={allConfigs[sim]} />
    </div>
  );
}
