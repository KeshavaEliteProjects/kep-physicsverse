import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import * as Icons from "lucide-react";
import { ArrowLeft, Play, Bot, Sparkles } from "lucide-react";

function TopicIcon({ name, className }) {
  const key = (name || "atom").split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
  const Cmp = Icons[key] || Icons.Atom;
  return <Cmp className={className} />;
}

export default function TopicView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    api.get(`/curriculum/${topicId}`).then((r) => setTopic(r.data)).catch(() => setTopic(false));
  }, [topicId]);

  if (topic === false) return <div className="p-10 text-muted-foreground">Topic not found. <Link to="/app/universe" className="text-primary">Back</Link></div>;
  if (!topic) return <div className="p-10 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <button data-testid="topic-back-button" onClick={() => navigate("/app/universe")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> Physics Universe
      </button>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${topic.color}18`, color: topic.color }}>
          <TopicIcon name={topic.icon} className="w-7 h-7" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900">{topic.name}</h1>
          <p className="text-muted-foreground mt-1">{topic.tagline}</p>
          <div className="flex items-center gap-4 mt-3 text-xs font-mono-data">
            <span className="text-muted-foreground">{topic.concept_count} concepts · {topic.sections.length} sections</span>
            {topic.interactive_count > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-600"><Play className="w-3 h-3 fill-emerald-600" /> {topic.interactive_count} interactive</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8 mt-10">
        {topic.sections.map((sec, si) => (
          <div key={si} data-testid={`section-${si}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono-data font-semibold" style={{ backgroundColor: `${topic.color}18`, color: topic.color }}>
                {String.fromCharCode(65 + si)}
              </div>
              <h2 className="font-display font-semibold text-lg text-slate-900">{sec.title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {sec.concepts.map((c, ci) =>
                c.sim ? (
                  <Link key={ci} to={`/app/sim/${c.sim}`} data-testid={`concept-sim-${c.sim}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2.5 text-sm hover:border-emerald-400 hover:shadow-sm transition-all">
                    <span className="text-slate-800 font-medium">{c.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 flex-shrink-0">
                      <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Run
                    </span>
                  </Link>
                ) : (
                  <Link key={ci} to={`/app/tutor?q=${encodeURIComponent("Explain " + c.name + " in " + topic.name + " with key equations.")}`}
                    data-testid="concept-tutor"
                    className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm hover:border-primary/40 hover:shadow-sm transition-all">
                    <span className="text-slate-700">{c.name}</span>
                    <Bot className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-slate-50 p-6 mt-12 flex items-center gap-4">
        <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="font-display font-semibold text-slate-900">Learn any concept instantly</p>
          <p className="text-sm text-muted-foreground">Tap a concept to open the AI tutor, or a green one to run its live simulation.</p>
        </div>
      </div>
    </div>
  );
}
