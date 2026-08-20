// Distinct Current-Electricity simulations — one concept, one sim.
// Save as components/sims/simsCurrent.js
const r2 = (x) => Math.round(x * 100) / 100;
const W_WRAP = 600;

function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/* ============ 1. ELECTRIC CURRENT ============
   Charges flowing through a wire loop — animation speed scales with the
   current, and the charge-so-far readout builds up as I = Q/t. */
const electriccurrent = {
  title: "Electric Current", topic: "electricity", difficulty: "Beginner",
  summary: "Charges flow around a circuit — the current tells you how much charge passes a point every second.",
  equation: "I = \\frac{Q}{t}",
  params: [
    { key: "current", label: "Current", min: 0.5, max: 10, step: 0.5, default: 3, unit: "A" },
  ],
  init: () => ({ phase: 0, t: 0, q: 0 }),
  step: (s, dt, p) => { s.phase += p.current * 0.6 * dt; s.q += p.current * dt; s.t += dt; if (s.t > 8) { s.q = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const x0 = 80, x1 = W - 80, y0 = 80, y1 = H - 80;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const perim = 2 * ((x1 - x0) + (y1 - y0));
    for (let i = 0; i < 8; i++) {
      const d = ((s.phase * 40 + i * (perim / 8)) % perim + perim) % perim;
      let x, y;
      const w = x1 - x0, h = y1 - y0;
      if (d < w) { x = x0 + d; y = y0; }
      else if (d < w + h) { x = x1; y = y0 + (d - w); }
      else if (d < 2 * w + h) { x = x1 - (d - w - h); y = y1; }
      else { x = x0; y = y1 - (d - 2 * w - h); }
      circle(ctx, x, y, 6, "#f59e0b");
    }
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit";
    ctx.fillText("Q so far = " + r2(s.q) + " C", 30, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), Q: r2(s.q), I: p.current }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "Q", label: "Charge passed (C)", color: "#f59e0b" },
    { key: "I", label: "Current (A)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Current", value: p.current, unit: "A" },
    { label: "Charge so far", value: r2(s.q), unit: "C" },
    { label: "Charge per second", value: p.current, unit: "C/s" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 2. DRIFT VELOCITY ============
   Electrons crawl through a conductor at a tiny drift speed even though
   current "starts" almost instantly — I = nAv_d q. */
const driftvelocity = {
  title: "Drift Velocity", topic: "electricity", difficulty: "Intermediate",
  summary: "Electrons actually drift through a wire incredibly slowly — see just how small that speed is compared to the current.",
  equation: "v_d = \\frac{I}{nAq}",
  params: [
    { key: "current", label: "Current", min: 0.5, max: 10, step: 0.5, default: 3, unit: "A" },
    { key: "area", label: "Wire cross-section", min: 0.5, max: 5, step: 0.5, default: 2, unit: "mm²" },
    { key: "n", label: "Electron density", min: 4, max: 12, step: 0.5, default: 8.5, unit: "×10²⁸/m³" },
  ],
  init: () => ({ x: 0, t: 0 }),
  step: (s, dt, p) => {
    const q = 1.6e-19, A = p.area * 1e-6, n = p.n * 1e28;
    const vd = p.current / (n * A * q);
    s.x += vd * 4e5 * dt; // exaggerated for visibility
    s.t += dt;
    if (s.x > W_WRAP) s.x = 0;
  },
  draw: (ctx, s, p, W, H) => {
    const y = H / 2;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke(); ctx.lineCap = "butt";
    for (let i = 0; i < 10; i++) {
      const ex = 80 + ((s.x + i * 60) % (W - 140));
      circle(ctx, ex, y, 5, "#f59e0b");
    }
    const q = 1.6e-19, A = p.area * 1e-6, n = p.n * 1e28;
    const vd = p.current / (n * A * q);
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit";
    ctx.fillText("v_d ≈ " + (vd * 1000).toFixed(3) + " mm/s (exaggerated above)", 40, 40);
  },
  graphPoint: (s, p) => {
    const q = 1.6e-19, A = p.area * 1e-6, n = p.n * 1e28;
    return { t: r2(s.t), vd: (p.current / (n * A * q)) * 1000 };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vd", label: "Drift velocity (mm/s)", color: "#f59e0b" }],
  stats: (s, p) => {
    const q = 1.6e-19, A = p.area * 1e-6, n = p.n * 1e28;
    const vd = p.current / (n * A * q);
    return [
      { label: "Drift velocity", value: (vd * 1000).toFixed(4), unit: "mm/s" },
      { label: "Current", value: p.current, unit: "A" },
      { label: "Cross-section", value: p.area, unit: "mm²" },
      { label: "Electron density", value: p.n, unit: "×10²⁸/m³" },
    ];
  },
};

/* ============ 3. RESISTANCE ============
   A rheostat (variable resistor) in a fixed-voltage circuit — thicker
   wire = less resistance = more current, visualised directly. */
const resistance = {
  title: "Resistance", topic: "electricity", difficulty: "Beginner",
  summary: "Slide a rheostat and watch current respond — resistance is what opposes the flow of charge.",
  equation: "R = \\frac{V}{I}",
  params: [
    { key: "voltage", label: "Voltage (fixed)", min: 1, max: 24, step: 1, default: 12, unit: "V" },
    { key: "resistance", label: "Resistance", min: 1, max: 50, step: 1, default: 10, unit: "Ω" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, x0 = 80, x1 = W - 80;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
    const thickness = Math.max(3, 26 - p.resistance * 0.4);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.moveTo(x0 + 100, cy); ctx.lineTo(x1 - 100, cy); ctx.stroke();
    const I = p.voltage / p.resistance;
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit";
    ctx.fillText("I = " + r2(I) + " A  (thicker wire = less R)", 40, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), R: p.resistance, I: r2(p.voltage / p.resistance) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "R", label: "Resistance (Ω)", color: "#ef4444" },
    { key: "I", label: "Current (A)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Resistance", value: p.resistance, unit: "Ω" },
    { label: "Voltage", value: p.voltage, unit: "V" },
    { label: "Current", value: r2(p.voltage / p.resistance), unit: "A" },
  ],
};

/* ============ 4. RESISTIVITY ============
   R = ρL/A — stretch a wire longer or thinner and see resistance change
   from the material property, not just a slider labelled "R". */
const resistivity = {
  title: "Resistivity", topic: "electricity", difficulty: "Intermediate",
  summary: "Resistance depends on the material (resistivity), the wire's length, and how thick it is.",
  equation: "R = \\frac{\\rho L}{A}",
  params: [
    { key: "rho", label: "Resistivity (×10⁻⁸ Ω·m)", min: 1, max: 100, step: 1, default: 17, unit: "" },
    { key: "length", label: "Wire length", min: 0.5, max: 5, step: 0.5, default: 2, unit: "m" },
    { key: "area", label: "Cross-section", min: 0.2, max: 3, step: 0.1, default: 1, unit: "mm²" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, x0 = 100, len = Math.min(W - 200, p.length * 100);
    const thickness = Math.max(4, p.area * 12);
    ctx.strokeStyle = "#f59e0b"; ctx.lineCap = "round"; ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + len, cy); ctx.stroke(); ctx.lineCap = "butt";
    const R = (p.rho * 1e-8 * p.length) / (p.area * 1e-6);
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit";
    ctx.fillText("R = " + r2(R) + " Ω", 40, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), R: r2((p.rho * 1e-8 * p.length) / (p.area * 1e-6)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "R", label: "Resistance (Ω)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Resistance", value: r2((p.rho * 1e-8 * p.length) / (p.area * 1e-6)), unit: "Ω" },
    { label: "Resistivity", value: p.rho, unit: "×10⁻⁸ Ω·m" },
    { label: "Length", value: p.length, unit: "m" },
    { label: "Cross-section", value: p.area, unit: "mm²" },
  ],
};

/* ============ 5. ELECTRICAL POWER ============
   A bulb whose brightness scales with power dissipated — P = VI = I²R
   = V²/R, shown as a glow intensity plus a power bar. */
const electricalpower = {
  title: "Electrical Power", topic: "electricity", difficulty: "Beginner",
  summary: "Change voltage and resistance and watch the bulb brighten — power is how fast electrical energy converts to heat and light.",
  equation: "P = VI = I^2R = \\frac{V^2}{R}",
  params: [
    { key: "voltage", label: "Voltage", min: 1, max: 24, step: 1, default: 12, unit: "V" },
    { key: "resistance", label: "Resistance", min: 1, max: 50, step: 1, default: 8, unit: "Ω" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const P = (p.voltage * p.voltage) / p.resistance;
    const glow = Math.min(1, P / 60);
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 70);
    grad.addColorStop(0, `rgba(245,158,11,${glow})`); grad.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.fill();
    circle(ctx, cx, cy, 26, `rgba(245,158,11,${0.4 + glow * 0.6})`, "#b45309");
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText("P = " + r2(P) + " W", cx, cy + 90);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), P: r2((p.voltage * p.voltage) / p.resistance) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "P", label: "Power (W)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Power", value: r2((p.voltage * p.voltage) / p.resistance), unit: "W" },
    { label: "Current", value: r2(p.voltage / p.resistance), unit: "A" },
    { label: "Voltage", value: p.voltage, unit: "V" },
    { label: "Resistance", value: p.resistance, unit: "Ω" },
  ],
};

/* ============ 6. HEATING EFFECT (Joule heating) ============
   A resistive wire heats up over time as current flows — colour shifts
   from cool to glowing red as accumulated heat rises: H = I²Rt. */
const heatingeffect = {
  title: "Heating Effect of Current", topic: "electricity", difficulty: "Intermediate",
  summary: "Run a current through a resistor and watch it heat up over time — the accumulated heat is H = I²Rt.",
  equation: "H = I^2Rt",
  params: [
    { key: "current", label: "Current", min: 0.5, max: 8, step: 0.5, default: 3, unit: "A" },
    { key: "resistance", label: "Resistance", min: 1, max: 30, step: 1, default: 10, unit: "Ω" },
  ],
  init: () => ({ t: 0, heat: 0 }),
  step: (s, dt, p) => { s.heat += p.current * p.current * p.resistance * dt; s.t += dt; if (s.t > 10) { s.heat = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const heatFrac = Math.min(1, s.heat / 400);
    const r = Math.round(51 + heatFrac * (239 - 51));
    const g = Math.round(65 + heatFrac * (68 - 65));
    const b = Math.round(85 + heatFrac * (68 - 85));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(cx - 90, cy - 14, 180, 28);
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText("Heat generated: " + r2(s.heat) + " J", cx, cy + 60);
    ctx.textAlign = "left";
  },
  graphPoint: (s) => ({ t: r2(s.t), heat: r2(s.heat) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "heat", label: "Heat generated (J)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Heat so far", value: r2(s.heat), unit: "J" },
    { label: "Heating rate", value: r2(p.current * p.current * p.resistance), unit: "W" },
    { label: "Current", value: p.current, unit: "A" },
    { label: "Resistance", value: p.resistance, unit: "Ω" },
  ],
};

const simsCurrent = { electriccurrent, driftvelocity, resistance, resistivity, electricalpower, heatingeffect };
export default simsCurrent;