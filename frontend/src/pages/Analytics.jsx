import { useEffect, useState } from "react";
import api from "../lib/api";
import { BarChart3, Target, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/analytics/me").then((r) => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <div className="p-10 text-muted-foreground">Loading analytics…</div>;

  const mastery = data.mastery.length ? data.mastery : [{ topic: "no data", mastery: 0, attempts: 0 }];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <span className="text-sm text-primary font-mono-data flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> AI Analytics</span>
      <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Your learning insights</h1>
      <p className="text-muted-foreground mt-2">Concept mastery, accuracy and predicted exam readiness.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat icon={Target} label="Accuracy" value={`${data.accuracy}%`} sub={`${data.correct}/${data.total_attempts} correct`} />
        <Stat icon={TrendingUp} label="Attempts" value={data.total_attempts} sub="questions solved" />
        <Stat icon={Award} label="Lab reports" value={data.lab_reports} sub="submitted" />
        <Stat icon={BarChart3} label="Topics touched" value={data.mastery.length} sub="in Mechanics" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* readiness radial */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 mb-2">Exam readiness</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "readiness", value: data.exam_readiness, fill: "#2563eb" }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center -mt-32 mb-16 font-display font-bold text-4xl text-slate-900">{data.exam_readiness}%</p>
          <p className="text-center text-sm text-muted-foreground">Predicted Mechanics readiness</p>
        </div>

        {/* mastery bars */}
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">Concept mastery by topic</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mastery} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11, fontFamily: "Source Code Pro" }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="mastery" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!data.mastery.length && <p className="text-sm text-muted-foreground text-center -mt-32 mb-24">Solve practice questions to build your mastery map.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3"><Icon className="w-4 h-4" /><span className="text-xs">{label}</span></div>
      <p className="font-display font-bold text-2xl text-slate-900">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
