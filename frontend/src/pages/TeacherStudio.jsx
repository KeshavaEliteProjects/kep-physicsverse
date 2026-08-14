import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";
import { Presentation, Users, Target, FlaskConical, Orbit, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TeacherStudio() {
  const [data, setData] = useState(null);
  const [sims, setSims] = useState([]);
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    api.get("/analytics/class").then((r) => setData(r.data)).catch(() => setData(false));
    api.get("/simulations").then((r) => setSims(r.data)).catch(() => {});
    api.get("/experiments").then((r) => setExperiments(r.data)).catch(() => {});
  }, []);

  const diffData = (data?.by_difficulty || []).map((d) => ({
    difficulty: d.difficulty, accuracy: d.total ? Math.round((100 * d.correct) / d.total) : 0,
  }));

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <span className="text-sm text-primary font-mono-data flex items-center gap-1.5"><Presentation className="w-4 h-4" /> Teacher Studio</span>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Class control room</h1>
      <p className="text-muted-foreground mt-2">Monitor performance and assign interactive content to your class.</p>

      {data === false ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mt-8 text-amber-800">Teacher access required.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Stat icon={Users} label="Students" value={data?.students ?? "—"} />
            <Stat icon={Target} label="Avg accuracy" value={data ? `${data.avg_accuracy}%` : "—"} />
            <Stat icon={GraduationCap} label="Attempts" value={data?.total_attempts ?? "—"} />
            <Stat icon={FlaskConical} label="Lab reports" value={data?.lab_reports ?? "—"} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 mt-8">
            <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">Class accuracy by difficulty</h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diffData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="difficulty" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="accuracy" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!diffData.length && <p className="text-sm text-muted-foreground text-center py-8">No class attempts yet.</p>}
          </div>
        </>
      )}

      <h2 className="font-display font-semibold text-xl text-slate-900 mt-12 mb-4">Content library — assign to class</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sims.map((s) => (
          <Link key={s.id} to={`/app/sim/${s.id}`} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Orbit className="w-5 h-5 text-primary" /></div>
            <h3 className="font-display font-semibold text-slate-900">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Simulation · {s.difficulty}</p>
          </Link>
        ))}
        {experiments.map((e) => (
          <Link key={e.id} to="/app/lab" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3"><FlaskConical className="w-5 h-5 text-emerald-600" /></div>
            <h3 className="font-display font-semibold text-slate-900">{e.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Lab experiment</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3"><Icon className="w-4 h-4" /><span className="text-xs">{label}</span></div>
      <p className="font-display font-bold text-2xl text-slate-900">{value}</p>
    </div>
  );
}
