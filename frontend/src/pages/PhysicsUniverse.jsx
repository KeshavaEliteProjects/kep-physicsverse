import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { SIM_INDEX } from "../components/sims/registry";
import { InlineMath } from "react-katex";
import * as Icons from "lucide-react";
import { Sparkles, ArrowRight, Play } from "lucide-react";

function TopicIcon({ name, className }) {
  const key = name.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
  const Cmp = Icons[key] || Icons.Atom;
  return <Cmp className={className} />;
}

export default function PhysicsUniverse() {
  const [topics, setTopics] = useState([]);
  const sims = SIM_INDEX.filter((s) => s.topic === "mechanics");

  useEffect(() => {
    api.get("/topics").then((r) => setTopics(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <span className="text-sm text-primary font-mono-data flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Physics Universe</span>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">The whole of physics</h1>
      <p className="text-muted-foreground mt-2 max-w-xl">Choose any topic to browse its full syllabus. Concepts marked with a play badge open a live interactive simulation.</p>

      {/* topic tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {topics.map((t) => (
          <Link key={t.id} to={`/app/topic/${t.id}`} data-testid={`topic-${t.id}`}
            className="group rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.07]" style={{ background: t.color }} />
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${t.color}18`, color: t.color }}>
              <TopicIcon name={t.icon} className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center justify-between">
              {t.name}
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{t.tagline}</p>
            <div className="flex items-center gap-3 mt-4 text-[11px] font-mono-data">
              <span className="text-muted-foreground">{t.concept_count} concepts</span>
              {t.interactive_count > 0 && (
                <span className="inline-flex items-center gap-1 text-emerald-600"><Play className="w-3 h-3 fill-emerald-600" /> {t.interactive_count} interactive</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* quick launch sims */}
      <h2 className="font-display font-semibold text-2xl text-slate-900 mt-12 mb-1">Jump into a simulation</h2>
      <p className="text-muted-foreground mb-6">All {sims.length} live Mechanics simulations.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sims.map((s) => (
          <Link key={s.id} to={`/app/sim/${s.id}`} data-testid={`sim-card-${s.id}`}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="h-24 blueprint flex items-center justify-center border-b border-border">
              <span className="text-primary text-lg font-mono-data"><InlineMath math={s.equation} /></span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-mono-data text-muted-foreground">{s.difficulty}</span>
              <h3 className="font-display font-semibold text-slate-900 flex items-center justify-between">
                {s.title}
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
