// Distinct capacitor simulations — one concept, one sim.
// Save as components/sims/simsCapacitors.js
const r2 = (x) => Math.round(x * 100) / 100;

function plate(ctx, x, y1, y2, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
}

/* ============ 1. CAPACITORS IN SERIES & PARALLEL ============
   Two capacitors wired either in series or parallel — shows how the
   equivalent capacitance combines differently in each case, and how
   charge builds up on the combination once connected to a battery. */
const capacitorcircuit = {
  title: "Capacitors in Series & Parallel", topic: "electricity", difficulty: "Intermediate",
  summary: "Wire two capacitors in series or parallel and see how the equivalent capacitance — and the charge it holds — differs.",
  equation: "\\text{Series: } \\frac{1}{C_{eq}} = \\frac{1}{C_1}+\\frac{1}{C_2\\phantom{.}} \\qquad \\text{Parallel: } C_{eq}=C_1+C_2",
  params: [
    { key: "c1", label: "C₁", min: 1, max: 20, step: 1, default: 6, unit: "μF" },
    { key: "c2", label: "C₂", min: 1, max: 20, step: 1, default: 4, unit: "μF" },
    { key: "voltage", label: "Battery voltage", min: 1, max: 20, step: 1, default: 10, unit: "V" },
    { key: "mode", label: "Wiring (0=series, 1=parallel)", min: 0, max: 1, step: 1, default: 1, unit: "" },
  ],
  init: () => ({ q: 0, t: 0 }),
  step: (s, dt, p) => {
    const Ceq = p.mode === 0 ? (p.c1 * p.c2) / (p.c1 + p.c2) : p.c1 + p.c2;
    const qmax = Ceq * p.voltage;
    const tau = 0.6;
    s.q += ((qmax - s.q) / tau) * dt;
    s.t += dt;
    if (s.t > 4) { s.q = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit"; ctx.textAlign = "center";
    if (p.mode === 0) {
      plate(ctx, cx - 90, cy - 30, cy + 30, "#ef4444"); plate(ctx, cx - 70, cy - 30, cy + 30, "#2563eb");
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 70, cy); ctx.lineTo(cx - 20, cy); ctx.stroke();
      plate(ctx, cx - 20, cy - 30, cy + 30, "#ef4444"); plate(ctx, cx, cy - 30, cy + 30, "#2563eb");
      ctx.fillText("C₁", cx - 80, cy - 44); ctx.fillText("C₂", cx - 10, cy - 44);
    } else {
      plate(ctx, cx - 40, cy - 60, cy - 10, "#ef4444"); plate(ctx, cx - 10, cy - 60, cy - 10, "#2563eb");
      plate(ctx, cx - 40, cy + 10, cy + 60, "#ef4444"); plate(ctx, cx - 10, cy + 10, cy + 60, "#2563eb");
      ctx.fillText("C₁", cx - 30, cy - 74); ctx.fillText("C₂", cx - 30, cy + 74);
    }
    ctx.textAlign = "left";
    const Ceq = p.mode === 0 ? (p.c1 * p.c2) / (p.c1 + p.c2) : p.c1 + p.c2;
    ctx.fillStyle = "#334155"; ctx.font = "600 13px 'Source Code Pro'";
    ctx.fillText("C_eq = " + r2(Ceq) + " μF", 30, 30);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), q: r2(s.q) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "q", label: "Charge on combination (μC)", color: "#2563eb" }],
  stats: (s, p) => {
    const Ceq = p.mode === 0 ? (p.c1 * p.c2) / (p.c1 + p.c2) : p.c1 + p.c2;
    return [
      { label: "Equivalent capacitance", value: r2(Ceq), unit: "μF" },
      { label: "Max charge", value: r2(Ceq * p.voltage), unit: "μC" },
      { label: "Current charge", value: r2(s.q), unit: "μC" },
      { label: "Wiring", value: p.mode === 0 ? "series" : "parallel", unit: "" },
    ];
  },
};

/* ============ 2. ENERGY STORED IN A CAPACITOR ============
   Charge a capacitor up to a target voltage and watch the stored energy
   grow — quadratically, not linearly, with voltage. */
const energycapacitor = {
  title: "Energy Stored in a Capacitor", topic: "electricity", difficulty: "Intermediate",
  summary: "Charge a capacitor up and watch the stored energy grow with the square of the voltage, not linearly.",
  equation: "U = \\tfrac{1}{2}CV^2 = \\frac{Q^2}{2C}",
  params: [
    { key: "capacitance", label: "Capacitance", min: 1, max: 50, step: 1, default: 20, unit: "μF" },
    { key: "voltage", label: "Target voltage", min: 1, max: 20, step: 1, default: 10, unit: "V" },
  ],
  init: () => ({ v: 0, t: 0 }),
  step: (s, dt, p) => {
    const tau = 0.8;
    s.v += ((p.voltage - s.v) / tau) * dt;
    s.t += dt;
    if (s.t > 4) { s.v = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2 + 20;
    plate(ctx, cx - 20, cy - 60, cy + 60, "#ef4444"); plate(ctx, cx + 20, cy - 60, cy + 60, "#2563eb");
    ctx.strokeStyle = "rgba(37,99,235,.5)"; ctx.lineWidth = 1.5;
    const nLines = 5;
    for (let i = 0; i < nLines; i++) {
      const y = cy - 45 + i * 22;
      ctx.beginPath(); ctx.moveTo(cx - 15, y); ctx.lineTo(cx + 15, y); ctx.stroke();
    }
    // energy bar
    const U = 0.5 * p.capacitance * 1e-6 * s.v * s.v;
    const Umax = 0.5 * p.capacitance * 1e-6 * p.voltage * p.voltage;
    const bx = 60, by = 40, bw = 26, bh = 160;
    ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(bx, by, bw, bh);
    const h = Umax > 0 ? Math.min(bh, (U / Umax) * bh) : 0;
    ctx.fillStyle = "#f59e0b"; ctx.fillRect(bx, by + bh - h, bw, h);
    ctx.fillStyle = "#334155"; ctx.font = "600 10px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText("U", bx + bw / 2, by + bh + 16);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), U: r2(0.5 * p.capacitance * 1e-6 * s.v * s.v * 1e6), V: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "U", label: "Stored energy (μJ)", color: "#f59e0b" },
    { key: "V", label: "Voltage (V)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Current voltage", value: r2(s.v), unit: "V" },
    { label: "Current energy", value: r2(0.5 * p.capacitance * 1e-6 * s.v * s.v * 1e6), unit: "μJ" },
    { label: "Max energy at target V", value: r2(0.5 * p.capacitance * 1e-6 * p.voltage * p.voltage * 1e6), unit: "μJ" },
    { label: "Charge at target V", value: r2(p.capacitance * p.voltage), unit: "μC" },
  ],
};

const simsCapacitors = { capacitorcircuit, energycapacitor };
export default simsCapacitors;