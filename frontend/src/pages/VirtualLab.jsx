import { useEffect, useState } from "react";
import api from "../lib/api";
import configs from "../components/sims/configs";
import SimEngine from "../components/sims/SimEngine";
import Mathdown from "../components/Mathdown";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { InlineMath } from "react-katex";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart } from "recharts";
import { FlaskConical, ArrowLeft, Plus, Trash2, Check, Bot, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Objective", "Setup & Run", "Record Data", "Analysis", "AI Viva", "Report"];

export default function VirtualLab() {
  const [experiments, setExperiments] = useState([]);
  const [exp, setExp] = useState(null);
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState([]);
  const [observation, setObservation] = useState("");
  const [result, setResult] = useState("");
  const [viva, setViva] = useState("");
  const [vivaLoading, setVivaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/experiments").then((r) => setExperiments(r.data)).catch(() => {}); }, []);

  const startExp = (e) => {
    setExp(e);
    setStep(0);
    setRows([Object.fromEntries(e.record_columns.map((c) => [c, ""]))]);
    setObservation(""); setResult(""); setViva("");
  };

  const addRow = () => setRows((r) => [...r, Object.fromEntries(exp.record_columns.map((c) => [c, ""]))]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const editCell = (i, col, v) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [col]: v } : row)));

  const runViva = async () => {
    setVivaLoading(true);
    try {
      const { data } = await api.post(`/lab/viva/${exp.id}`);
      setViva(data.viva);
    } catch { toast.error("Could not start viva."); }
    setVivaLoading(false);
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      await api.post("/lab/reports", { experiment_id: exp.id, readings: rows, observation, result });
      toast.success("Lab report saved!");
      setExp(null);
    } catch { toast.error("Failed to save report."); }
    setSaving(false);
  };

  // chart data: numeric first two columns
  const cols = exp?.record_columns || [];
  const chartData = rows
    .map((r) => ({ x: parseFloat(r[cols[0]]), y: parseFloat(r[cols[cols.length - 1]]) }))
    .filter((d) => !isNaN(d.x) && !isNaN(d.y));

  if (!exp) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <span className="text-sm text-emerald-600 font-mono-data flex items-center gap-1.5"><FlaskConical className="w-4 h-4" /> Virtual Laboratory</span>
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-slate-900 mt-1">Perform a real experiment</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">No videos. Collect data, plot graphs, face an AI viva and generate a lab report.</p>
        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          {experiments.map((e) => (
            <button key={e.id} data-testid={`experiment-${e.id}`} onClick={() => startExp(e)}
              className="text-left rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">{e.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{e.objective}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <button data-testid="lab-back-button" onClick={() => setExp(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> All experiments
      </button>
      <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900">{exp.title}</h1>

      {/* stepper */}
      <div className="flex items-center gap-1 mt-6 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <button data-testid={`lab-step-${i}`} onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === step ? "bg-primary text-white" : i < step ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted-foreground"
              }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i < step ? <Check className="w-3 h-3" /> : i + 1}</span>
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Objective</h3>
              <p className="text-slate-700 leading-relaxed">{exp.objective}</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Theory</h3>
              <p className="text-slate-700"><InlineMath math={exp.theory.replace(/\$/g, "")} /></p>
              <div className="mt-3"><Mathdown text={exp.theory} /></div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {exp.equipment.map((eq) => (
                  <span key={eq} className="text-sm bg-slate-100 rounded-full px-3 py-1 text-slate-700">{eq}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-muted-foreground mb-6">Run the simulated apparatus. Change variables and observe, then move on to record your readings.</p>
            {configs[exp.sim] && <SimEngine config={configs[exp.sim]} />}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Record your observations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {cols.map((c) => <th key={c} className="text-left py-2 px-3 font-medium text-muted-foreground font-mono-data text-xs">{c}</th>)}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-border">
                      {cols.map((c) => (
                        <td key={c} className="py-1.5 px-2">
                          <Input data-testid={`cell-${i}-${c}`} value={row[c]} onChange={(e) => editCell(i, c, e.target.value)}
                            className="h-9 font-mono-data" placeholder="0" />
                        </td>
                      ))}
                      <td>
                        <button data-testid={`del-row-${i}`} onClick={() => delRow(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button data-testid="add-row-button" variant="outline" onClick={addRow} className="rounded-full gap-2 mt-4">
              <Plus className="w-4 h-4" /> Add reading
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Graph: {cols[cols.length - 1]} vs {cols[0]}</h3>
              <div className="rounded-xl border border-border p-4" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" dataKey="x" name={cols[0]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis type="number" dataKey="y" name={cols[cols.length - 1]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    <Scatter data={chartData} fill="#2563eb" line={{ stroke: "#2563eb" }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {!chartData.length && <p className="text-sm text-muted-foreground mt-2">Enter numeric readings in the previous step to plot the graph.</p>}
            </div>
            <div>
              <label className="font-display font-semibold text-lg block mb-2">Observation</label>
              <Textarea data-testid="observation-input" value={observation} onChange={(e) => setObservation(e.target.value)}
                placeholder="e.g. The graph is a straight line, confirming the relationship…" rows={3} />
            </div>
            <div>
              <label className="font-display font-semibold text-lg block mb-2">Result</label>
              <Textarea data-testid="result-input" value={result} onChange={(e) => setResult(e.target.value)}
                placeholder="e.g. The measured value of g is 9.8 m/s²…" rows={2} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">AI Viva</h3>
            <p className="text-muted-foreground mb-5">The examiner will quiz you on this experiment. Answer them out loud to test yourself.</p>
            {!viva && (
              <Button data-testid="start-viva-button" onClick={runViva} disabled={vivaLoading} className="rounded-full gap-2">
                {vivaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                {vivaLoading ? "Preparing…" : "Start viva"}
              </Button>
            )}
            {viva && (
              <div className="rounded-xl border border-border bg-slate-50 p-5">
                <Mathdown text={viva} />
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Lab Report</h3>
            <div className="rounded-xl border border-border p-6 space-y-4 bg-slate-50/60">
              <Field label="Aim" value={exp.objective} />
              <Field label="Readings" value={`${rows.filter((r) => Object.values(r).some((v) => v !== "")).length} recorded`} />
              <Field label="Observation" value={observation || "—"} />
              <Field label="Result" value={result || "—"} />
            </div>
            <Button data-testid="save-report-button" onClick={saveReport} disabled={saving} className="rounded-full gap-2 mt-6">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save lab report
            </Button>
          </div>
        )}
      </div>

      {/* nav */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" className="rounded-full" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < STEPS.length - 1 && (
          <Button data-testid="lab-next-button" className="rounded-full" onClick={() => setStep((s) => s + 1)}>Next step</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-mono-data text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-slate-800 mt-1">{value}</p>
    </div>
  );
}
