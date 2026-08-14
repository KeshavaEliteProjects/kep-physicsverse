import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Orbit, FlaskConical, Bot, GraduationCap, ArrowRight, Target, Award, BookOpen } from "lucide-react";

const QUICK = [
  { id: "projectile", title: "Projectile Motion", tag: "Kinematics" },
  { id: "pendulum", title: "Simple Pendulum", tag: "Oscillations" },
  { id: "orbit", title: "Gravity & Orbits", tag: "Gravitation" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/analytics/me").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { to: "/app/universe", icon: Orbit, title: "Physics Universe", desc: "Explore interactive Mechanics simulations", color: "bg-blue-50 text-blue-600" },
    { to: "/app/lab", icon: FlaskConical, title: "Virtual Lab", desc: "Perform experiments & get a lab report", color: "bg-emerald-50 text-emerald-600" },
    { to: "/app/tutor", icon: Bot, title: "AI Tutor", desc: "Ask anything, derive step by step", color: "bg-amber-50 text-amber-600" },
    { to: "/app/practice", icon: GraduationCap, title: "JEE/NEET Practice", desc: "Adaptive problems with solutions", color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <p className="text-sm text-muted-foreground font-mono-data">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Hi {user?.name?.split(" ")[0]} 👋</h1>
      <p className="text-muted-foreground mt-2">Ready to experiment? Here's where you left off.</p>

      {/* stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat icon={Target} label="Accuracy" value={stats ? `${stats.accuracy}%` : "—"} sub={`${stats?.total_attempts || 0} attempts`} />
        <Stat icon={Award} label="Exam readiness" value={stats ? `${stats.exam_readiness}%` : "—"} sub="Mechanics" />
        <Stat icon={FlaskConical} label="Lab reports" value={stats?.lab_reports ?? "—"} sub="completed" />
        <Stat icon={BookOpen} label="Notes" value={stats?.notes ?? "—"} sub="saved" />
      </div>

      {/* modules */}
      <h2 className="font-display font-semibold text-xl text-slate-900 mt-10 mb-4">Jump back in</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} data-testid={`dash-card-${c.title.toLowerCase().replace(/[^a-z]/g, "-")}`}
            className="group rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg text-slate-900">{c.title}</h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* quick sims */}
      <h2 className="font-display font-semibold text-xl text-slate-900 mt-10 mb-4">Popular simulations</h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {QUICK.map((q) => (
          <Link key={q.id} to={`/app/sim/${q.id}`} data-testid={`quick-sim-${q.id}`}
            className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="h-28 blueprint flex items-center justify-center">
              <Orbit className="w-9 h-9 text-primary/60" />
            </div>
            <div className="p-4">
              <span className="text-[11px] font-mono-data text-muted-foreground">{q.tag}</span>
              <h3 className="font-display font-semibold text-slate-900">{q.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-display font-bold text-2xl text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
