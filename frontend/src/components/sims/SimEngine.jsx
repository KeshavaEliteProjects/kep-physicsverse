import { useEffect, useRef, useState, useCallback } from "react";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { BlockMath } from "react-katex";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const W = 760, H = 440;

export default function SimEngine({ config }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const paramsRef = useRef({});
  const rafRef = useRef(null);
  const dataRef = useRef([]);
  const lastPush = useRef(0);

  const [params, setParams] = useState(() => {
    const o = {};
    config.params.forEach((p) => (o[p.key] = p.default));
    return o;
  });
  const [running, setRunning] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [stats, setStats] = useState([]);
  const [activeSeries, setActiveSeries] = useState(config.series[0].key);

  paramsRef.current = params;

  const drawGrid = (ctx) => {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(37,99,235,0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  };

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    drawGrid(ctx);
    if (stateRef.current) config.draw(ctx, stateRef.current, paramsRef.current, W, H);
  }, [config]);

  const reset = useCallback(() => {
    setRunning(false);
    stateRef.current = config.init({ ...paramsRef.current });
    dataRef.current = [];
    setGraphData([]);
    setStats(config.stats(stateRef.current, paramsRef.current));
    draw();
  }, [config, draw]);

  // reset when the simulation config changes (route change)
  useEffect(() => {
    setParams(() => {
      const o = {};
      config.params.forEach((p) => (o[p.key] = p.default));
      return o;
    });
    setActiveSeries(config.series[0].key);
  }, [config]);

  // (re)initialise whenever params change while not running
  useEffect(() => {
    if (!running) {
      stateRef.current = config.init({ ...params });
      dataRef.current = [];
      setGraphData([]);
      setStats(config.stats(stateRef.current, params));
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, config]);

  // animation loop
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const loop = (now) => {
      let dt = (now - last) / 1000;
      last = now;
      dt = Math.min(dt, 0.033);
      const sub = 6;
      for (let i = 0; i < sub; i++) config.step(stateRef.current, dt / sub, paramsRef.current);
      draw();
      if (now - lastPush.current > 45) {
        lastPush.current = now;
        const gp = config.graphPoint(stateRef.current, paramsRef.current);
        if (gp) {
          dataRef.current.push(gp);
          if (dataRef.current.length > 400) dataRef.current.shift();
          setGraphData([...dataRef.current]);
        }
        setStats(config.stats(stateRef.current, paramsRef.current));
      }
      if (config.done && config.done(stateRef.current, paramsRef.current)) {
        setStats(config.stats(stateRef.current, paramsRef.current));
        setRunning(false);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, config, draw]);

  const setParam = (key, val) => setParams((p) => ({ ...p, [key]: val }));

  const exportCSV = () => {
    if (!dataRef.current.length) return;
    const keys = Object.keys(dataRef.current[0]);
    const rows = [keys.join(",")].concat(dataRef.current.map((r) => keys.map((k) => r[k]).join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, "_")}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeMeta = config.series.find((s) => s.key === activeSeries);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Canvas + graph */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                data-testid="sim-play-button"
                onClick={() => setRunning((r) => !r)}
                className="rounded-full gap-2 bg-primary hover:bg-blue-600 text-white"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? "Pause" : "Run"}
              </Button>
              <Button data-testid="sim-reset-button" variant="outline" onClick={reset} className="rounded-full gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>
            <div className="text-xs font-mono-data text-muted-foreground">{config.title}</div>
          </div>
          <canvas
            data-testid="sim-canvas"
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full block"
            style={{ aspectRatio: `${W}/${H}` }}
          />
        </div>

        {/* Live graph */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {config.series.map((s) => (
                <button
                  key={s.key}
                  data-testid={`graph-series-${s.key}`}
                  onClick={() => setActiveSeries(s.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeSeries === s.key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button data-testid="graph-export-button" variant="outline" size="sm" onClick={exportCSV} className="rounded-full gap-2">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 6, right: 12, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={config.xKey} tick={{ fontSize: 11, fontFamily: "Source Code Pro" }} stroke="#94a3b8"
                  label={{ value: config.xLabel, position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Source Code Pro" }} stroke="#94a3b8" width={48} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, fontFamily: "Source Code Pro" }} />
                <Line type="monotone" dataKey={activeSeries} stroke={activeMeta?.color || "#2563eb"} strokeWidth={2.4} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono-data">{activeMeta?.label} vs {config.xLabel}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display font-semibold text-base mb-1">Governing equation</h3>
          <div className="rounded-lg bg-slate-50 border border-border px-3 py-4 overflow-x-auto">
            <BlockMath math={config.equation} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display font-semibold text-base mb-4">Controls</h3>
          <div className="space-y-5">
            {config.params.map((p) => (
              <div key={p.key} data-testid={`control-${p.key}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">{p.label}</label>
                  <span className="text-sm font-mono-data font-semibold text-primary">
                    {params[p.key]}
                    <span className="text-muted-foreground ml-0.5">{p.unit}</span>
                  </span>
                </div>
                <Slider
                  data-testid={`slider-${p.key}`}
                  value={[params[p.key]]}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  onValueChange={(v) => setParam(p.key, v[0])}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-display font-semibold text-base mb-4">Live measurements</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={i} data-testid={`stat-${i}`} className="rounded-lg bg-slate-50 border border-border px-3 py-3">
                <p className="text-[11px] text-muted-foreground mb-0.5">{s.label}</p>
                <p className="text-lg font-mono-data font-semibold text-slate-900 leading-tight">
                  {s.value}
                  <span className="text-xs text-muted-foreground ml-1">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
