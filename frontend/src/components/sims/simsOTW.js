// Optics, Thermodynamics & Waves simulations.
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;
function circle(ctx, x, y, rad, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function line(ctx, x1, y1, x2, y2, color, w = 2) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

const refraction = {
  title: "Refraction & Snell's Law", topic: "optics", difficulty: "Intermediate",
  summary: "Bend a light ray across a boundary and find the critical angle for total internal reflection.",
  equation: "n_1\\sin\\theta_1 = n_2\\sin\\theta_2",
  params: [
    { key: "angle", label: "Angle of incidence", min: 0, max: 89, step: 1, default: 40, unit: "°" },
    { key: "n1", label: "Index n₁ (top)", min: 1, max: 2.5, step: 0.05, default: 1, unit: "" },
    { key: "n2", label: "Index n₂ (bottom)", min: 1, max: 2.5, step: 0.05, default: 1.5, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(37,99,235,.06)"; ctx.fillRect(0, cy, W, H - cy);
    line(ctx, 40, cy, W - 40, cy, "#334155", 2);
    line(ctx, cx, 50, cx, H - 50, "rgba(148,163,184,.7)", 1);
    const th1 = p.angle * RAD;
    line(ctx, cx - 150 * Math.sin(th1), cy - 150 * Math.cos(th1), cx, cy, "#f59e0b", 3);
    const sinth2 = (p.n1 * Math.sin(th1)) / p.n2;
    if (sinth2 <= 1) { const th2 = Math.asin(sinth2); line(ctx, cx, cy, cx + 150 * Math.sin(th2), cy + 150 * Math.cos(th2), "#2563eb", 3); }
    else { line(ctx, cx, cy, cx + 150 * Math.sin(th1), cy - 150 * Math.cos(th1), "#ef4444", 3);
      ctx.fillStyle = "#ef4444"; ctx.font = "700 14px Outfit"; ctx.textAlign = "center"; ctx.fillText("Total Internal Reflection", cx, 40); ctx.textAlign = "left"; }
  },
  graphPoint: (s, p) => { const st = (p.n1 * Math.sin(p.angle * RAD)) / p.n2; return { t: r2(s.t), th2: r2(st <= 1 ? Math.asin(st) / RAD : 90) }; },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "th2", label: "Refraction angle (°)", color: "#2563eb" }],
  stats: (s, p) => { const st = (p.n1 * Math.sin(p.angle * RAD)) / p.n2; const crit = p.n1 > p.n2 ? Math.asin(p.n2 / p.n1) / RAD : null; return [
    { label: "Refraction angle", value: st <= 1 ? r2(Math.asin(st) / RAD) : "TIR", unit: st <= 1 ? "°" : "" },
    { label: "Critical angle", value: crit ? r2(crit) : "n/a", unit: crit ? "°" : "" },
    { label: "n₁ / n₂", value: r2(p.n1 / p.n2), unit: "" }, { label: "Speed ratio", value: r2(p.n2 / p.n1), unit: "" }]; },
};

const lens = {
  title: "Thin Lens", topic: "optics", difficulty: "Intermediate",
  summary: "Move an object near a converging lens and locate the image with the lens equation.",
  equation: "\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}, \\quad m = \\frac{v}{u}",
  params: [
    { key: "focal", label: "Focal length", min: 2, max: 10, step: 0.5, default: 5, unit: "cm" },
    { key: "object", label: "Object distance", min: 3, max: 18, step: 0.5, default: 12, unit: "cm" },
    { key: "height", label: "Object height", min: 1, max: 5, step: 0.5, default: 3, unit: "cm" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, sc = 14;
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy + 90); ctx.stroke();
    circle(ctx, cx - p.focal * sc, cy, 4, "#64748b"); circle(ctx, cx + p.focal * sc, cy, 4, "#64748b");
    const ox = cx - p.object * sc;
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - p.height * sc); ctx.stroke();
    const v = 1 / (1 / p.focal - 1 / p.object); const ix = cx + v * sc; const m = -v / p.object; const ih = p.height * m * sc;
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - ih); ctx.stroke();
    // rays
    line(ctx, ox, cy - p.height * sc, cx, cy - p.height * sc, "rgba(245,158,11,.6)", 1.5);
    line(ctx, cx, cy - p.height * sc, ix, cy - ih, "rgba(16,185,129,.6)", 1.5);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v: r2(1 / (1 / p.focal - 1 / p.object)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Image distance (cm)", color: "#10b981" }],
  stats: (s, p) => { const v = 1 / (1 / p.focal - 1 / p.object); const m = -v / p.object; return [
    { label: "Image distance", value: r2(v), unit: "cm" }, { label: "Magnification", value: r2(m), unit: "×" },
    { label: "Nature", value: v > 0 ? "real, inverted" : "virtual, erect", unit: "" }, { label: "Image height", value: r2(p.height * Math.abs(m)), unit: "cm" }]; },
};

const prism = {
  title: "Prism Dispersion", topic: "optics", difficulty: "Intermediate",
  summary: "Send white light through a prism and watch it split into a spectrum of colours.",
  equation: "\\delta = (n-1)A",
  params: [
    { key: "apex", label: "Apex angle", min: 30, max: 70, step: 1, default: 60, unit: "°" },
    { key: "n", label: "Refractive index", min: 1.3, max: 1.8, step: 0.02, default: 1.5, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(37,99,235,.1)"; ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 70); ctx.lineTo(cx - 60, cy + 60); ctx.lineTo(cx + 60, cy + 60); ctx.closePath(); ctx.fill(); ctx.stroke();
    line(ctx, 60, cy - 10, cx - 30, cy + 5, "#e5e7eb", 3);
    const cols = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
    cols.forEach((c, i) => { const dev = (p.n - 1) * p.apex * RAD + i * 0.03; line(ctx, cx + 20, cy + 30, cx + 220, cy + 30 + Math.sin(dev) * (60 + i * 14), c, 2.5); });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), d: r2((p.n - 1) * p.apex) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "d", label: "Deviation (°)", color: "#8b5cf6" }],
  stats: (s, p) => [
    { label: "Mean deviation", value: r2((p.n - 1) * p.apex), unit: "°" }, { label: "Apex angle", value: p.apex, unit: "°" },
    { label: "Index", value: p.n, unit: "" }, { label: "Colours", value: "red→violet", unit: "" }],
};


/* ---------------- THERMODYNAMICS ---------------- */
const gasbox = {
  title: "Kinetic Theory of Gases", topic: "thermodynamics", difficulty: "Intermediate",
  summary: "Heat a box of gas particles and watch speed, pressure and temperature rise together.",
  equation: "PV = nRT, \\quad \\tfrac{1}{2}m\\overline{v^2} = \\tfrac{3}{2}kT",
  params: [
    { key: "temp", label: "Temperature", min: 100, max: 800, step: 10, default: 300, unit: "K" },
    { key: "count", label: "Particles", min: 10, max: 60, step: 5, default: 30, unit: "" },
  ],
  init: (p) => { const n = Math.round(p.count); const parts = []; const sp = Math.sqrt(p.temp) * 0.9;
    for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI * 2; parts.push({ x: 80 + Math.random() * 560, y: 60 + Math.random() * 300, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
    return { parts, t: 0, hits: 0 }; },
  step: (s, dt, p) => {
    const n = Math.round(p.count); const target = Math.sqrt(p.temp) * 0.9;
    for (let i = 0; i < n; i++) { const pt = s.parts[i]; const sp = Math.hypot(pt.vx, pt.vy) || 1; pt.vx *= target / sp; pt.vy *= target / sp;
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      if (pt.x < 70 || pt.x > 650) { pt.vx *= -1; pt.x = Math.max(70, Math.min(650, pt.x)); s.hits++; }
      if (pt.y < 50 || pt.y > 370) { pt.vy *= -1; pt.y = Math.max(50, Math.min(370, pt.y)); s.hits++; } }
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.strokeRect(70, 50, 580, 320);
    const n = Math.round(p.count); const hot = Math.min(1, p.temp / 700);
    const col = `rgb(${Math.round(80 + hot * 175)},${Math.round(120 - hot * 60)},${Math.round(235 - hot * 175)})`;
    for (let i = 0; i < n; i++) circle(ctx, s.parts[i].x, s.parts[i].y, 5, col);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v: r2(Math.sqrt(3 * 8.314 * p.temp / 0.028)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "RMS speed (m/s)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Temperature", value: p.temp, unit: "K" }, { label: "RMS speed", value: r2(Math.sqrt(3 * 8.314 * p.temp / 0.028)), unit: "m/s" },
    { label: "Avg KE", value: r2(1.5 * 1.38e-23 * p.temp * 1e21), unit: "×10⁻²¹ J" }, { label: "Pressure ∝", value: "nT/V", unit: "" }],
};

const pvdiagram = {
  title: "PV Diagram & Gas Laws", topic: "thermodynamics", difficulty: "Advanced",
  summary: "Compress and expand a gas isothermally and trace its path on a pressure-volume diagram.",
  equation: "P_1V_1 = P_2V_2 \\;(\\text{isothermal})",
  params: [
    { key: "nT", label: "Amount × Temp (nRT)", min: 2, max: 12, step: 0.5, default: 6, unit: "" },
  ],
  init: () => ({ t: 0, V: 3 }),
  step: (s, dt) => { s.t += dt; s.V = 3 + 2 * Math.sin(s.t * 0.8); },
  draw: (ctx, s, p, W, H) => {
    const ox = 90, oy = H - 60, sx = 80, sy = 40;
    line(ctx, ox, oy, ox + 480, oy, "#94a3b8", 2); line(ctx, ox, oy, ox, 40, "#94a3b8", 2);
    ctx.fillStyle = "#64748b"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText("V →", ox + 460, oy + 20); ctx.fillText("P", ox - 20, 50);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2; ctx.beginPath();
    for (let V = 1; V <= 6; V += 0.1) { const P = p.nT / V; const px = ox + V * sx, py = oy - P * sy; V === 1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke();
    const P = p.nT / s.V; circle(ctx, ox + s.V * sx, oy - P * sy, 7, "#f59e0b", "#b45309");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), P: r2(p.nT / s.V), V: r2(s.V) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "P", label: "Pressure", color: "#f59e0b" }, { key: "V", label: "Volume", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Volume", value: r2(s.V), unit: "" }, { label: "Pressure", value: r2(p.nT / s.V), unit: "" },
    { label: "PV product", value: r2(p.nT), unit: "" }, { label: "Process", value: "isothermal", unit: "" }],
};

const heatconduction = {
  title: "Heat Conduction", topic: "thermodynamics", difficulty: "Intermediate",
  summary: "Heat one end of a rod and watch temperature diffuse along it over time.",
  equation: "\\frac{Q}{t} = kA\\frac{\\Delta T}{L}",
  params: [
    { key: "hot", label: "Hot end temp", min: 100, max: 500, step: 10, default: 400, unit: "°C" },
    { key: "k", label: "Conductivity", min: 0.2, max: 3, step: 0.1, default: 1.5, unit: "" },
  ],
  init: () => ({ temps: new Array(40).fill(20), t: 0 }),
  step: (s, dt, p) => {
    s.temps[0] = p.hot; const nt = [...s.temps];
    for (let i = 1; i < 39; i++) nt[i] = s.temps[i] + p.k * (s.temps[i - 1] + s.temps[i + 1] - 2 * s.temps[i]) * dt * 3;
    s.temps = nt; s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const x0 = 60, w = (W - 120) / 40, y = H / 2 - 30;
    s.temps.forEach((T, i) => { const f = Math.min(1, (T - 20) / (p.hot - 20)); ctx.fillStyle = `rgb(${Math.round(60 + f * 195)},${Math.round(90 - f * 30)},${Math.round(200 - f * 170)})`; ctx.fillRect(x0 + i * w, y, w + 1, 60); });
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.strokeRect(x0, y, w * 40, 60);
  },
  graphPoint: (s) => ({ t: r2(s.t), mid: r2(s.temps[20]), end: r2(s.temps[38]) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "mid", label: "Mid temp (°C)", color: "#f59e0b" }, { key: "end", label: "Far end (°C)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Hot end", value: p.hot, unit: "°C" }, { label: "Middle", value: r2(s.temps[20]), unit: "°C" },
    { label: "Far end", value: r2(s.temps[38]), unit: "°C" }, { label: "Conductivity", value: p.k, unit: "" }],
};

const carnot = {
  title: "Carnot Engine", topic: "thermodynamics", difficulty: "Advanced",
  summary: "Set hot and cold reservoir temperatures and find the maximum possible efficiency.",
  equation: "\\eta = 1 - \\frac{T_C}{T_H}",
  params: [
    { key: "th", label: "Hot reservoir", min: 350, max: 900, step: 10, default: 600, unit: "K" },
    { key: "tc", label: "Cold reservoir", min: 200, max: 400, step: 10, default: 300, unit: "K" },
  ],
  init: () => ({ t: 0, stage: 0 }),
  step: (s, dt) => { s.t += dt; s.stage = (s.t * 0.5) % 4; },
  draw: (ctx, s, p, W, H) => {
    const ox = 100, oy = H - 60, sx = 70, sy = 26;
    line(ctx, ox, oy, ox + 460, oy, "#94a3b8", 2); line(ctx, ox, oy, ox, 40, "#94a3b8", 2);
    const pts = [[2, 8], [4, 5], [5, 2.6], [2.4, 4.4]];
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath();
    pts.forEach((pt, i) => { const px = ox + pt[0] * sx, py = oy - pt[1] * sy * 4; i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }); ctx.closePath(); ctx.stroke();
    const seg = Math.floor(s.stage); const f = s.stage - seg; const a = pts[seg], b = pts[(seg + 1) % 4];
    circle(ctx, ox + (a[0] + (b[0] - a[0]) * f) * sx, oy - (a[1] + (b[1] - a[1]) * f) * sy * 4, 7, "#f59e0b", "#b45309");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), eff: r2((1 - p.tc / p.th) * 100) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "eff", label: "Efficiency (%)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Efficiency", value: r2((1 - p.tc / p.th) * 100), unit: "%" }, { label: "Hot T", value: p.th, unit: "K" },
    { label: "Cold T", value: p.tc, unit: "K" }, { label: "Type", value: "reversible", unit: "" }],
};

/* ---------------- WAVES ---------------- */
const wavestring = {
  title: "Wave on a String", topic: "waves", difficulty: "Beginner",
  summary: "Adjust amplitude, frequency and wavelength and watch a travelling transverse wave.",
  equation: "v = f\\lambda",
  params: [
    { key: "amp", label: "Amplitude", min: 10, max: 60, step: 5, default: 40, unit: "cm" },
    { key: "freq", label: "Frequency", min: 0.3, max: 3, step: 0.1, default: 1, unit: "Hz" },
    { key: "wavelength", label: "Wavelength", min: 60, max: 300, step: 10, default: 160, unit: "cm" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, k = (2 * Math.PI) / p.wavelength, w = 2 * Math.PI * p.freq;
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 40; x < W - 40; x += 3) { const y = cy - p.amp * Math.sin(k * (x - 40) - w * s.t); x === 40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    circle(ctx, 40, cy - p.amp * Math.sin(-w * s.t), 6, "#f59e0b");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), y: r2(-p.amp * Math.sin(-2 * Math.PI * p.freq * s.t) / 10) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Displacement at x=0", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Wave speed", value: r2(p.freq * p.wavelength / 100), unit: "m/s" }, { label: "Frequency", value: p.freq, unit: "Hz" },
    { label: "Wavelength", value: r2(p.wavelength / 100), unit: "m" }, { label: "Period", value: r2(1 / p.freq), unit: "s" }],
};

const standingwave = {
  title: "Standing Waves", topic: "waves", difficulty: "Intermediate",
  summary: "Pick a harmonic and see nodes and antinodes form on a fixed string.",
  equation: "L = \\frac{n\\lambda}{2}, \\quad f_n = \\frac{nv}{2L}",
  params: [
    { key: "n", label: "Harmonic (n)", min: 1, max: 6, step: 1, default: 3, unit: "" },
    { key: "amp", label: "Amplitude", min: 10, max: 60, step: 5, default: 40, unit: "cm" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, x0 = 60, L = W - 120; const env = Math.sin(s.t * 4);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= L; x += 3) { const y = cy - p.amp * Math.sin((p.n * Math.PI * x) / L) * env; x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y); } ctx.stroke();
    for (let i = 0; i <= p.n; i++) circle(ctx, x0 + (i * L) / p.n, cy, 5, "#ef4444");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), y: r2(p.amp * Math.sin(s.t * 4) / 10) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Antinode displacement", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Harmonic", value: p.n, unit: "" }, { label: "Nodes", value: p.n + 1, unit: "" },
    { label: "Antinodes", value: p.n, unit: "" }, { label: "Freq ∝ n", value: p.n + "f₁", unit: "" }],
};

const beats = {
  title: "Beats", topic: "waves", difficulty: "Intermediate",
  summary: "Superpose two close frequencies and hear the beat pattern rise and fall.",
  equation: "f_{beat} = |f_1 - f_2|",
  params: [
    { key: "f1", label: "Frequency 1", min: 2, max: 10, step: 0.1, default: 5, unit: "Hz" },
    { key: "f2", label: "Frequency 2", min: 2, max: 10, step: 0.1, default: 5.6, unit: "Hz" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2; ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = 40; x < W - 40; x += 2) { const tt = s.t + (x - 40) * 0.004; const y = cy - 50 * (Math.sin(2 * Math.PI * p.f1 * tt) + Math.sin(2 * Math.PI * p.f2 * tt)); x === 40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), y: r2(Math.sin(2 * Math.PI * p.f1 * s.t) + Math.sin(2 * Math.PI * p.f2 * s.t)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Combined amplitude", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Beat frequency", value: r2(Math.abs(p.f1 - p.f2)), unit: "Hz" }, { label: "f₁", value: p.f1, unit: "Hz" },
    { label: "f₂", value: p.f2, unit: "Hz" }, { label: "Beat period", value: r2(1 / Math.max(0.01, Math.abs(p.f1 - p.f2))), unit: "s" }],
};

const doppler = {
  title: "Doppler Effect", topic: "waves", difficulty: "Advanced",
  summary: "Move a sound source and watch wavefronts bunch up ahead and stretch behind.",
  equation: "f' = f\\frac{v}{v \\mp v_s}",
  params: [
    { key: "sourceV", label: "Source speed", min: 0, max: 0.8, step: 0.05, default: 0.4, unit: "×v" },
    { key: "freq", label: "Source frequency", min: 1, max: 5, step: 0.5, default: 3, unit: "Hz" },
  ],
  init: () => ({ t: 0, waves: [] }),
  step: (s, dt, p) => { s.t += dt; if (Math.floor(s.t * p.freq) > s.waves.length && s.waves.length < 40) s.waves.push({ x: (s.t % 6) * p.sourceV * 120, born: s.t }); if (s.t > 6) { s.t = 0; s.waves = []; } },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2; const srcX = 100 + (s.t % 6) * p.sourceV * 120;
    ctx.strokeStyle = "rgba(37,99,235,.5)"; ctx.lineWidth = 1.5;
    s.waves.forEach((w) => { const r = (s.t - w.born) * 120; ctx.beginPath(); ctx.arc(100 + w.x, cy, r, 0, Math.PI * 2); ctx.stroke(); });
    circle(ctx, srcX, cy, 9, "#ef4444", "#7f1d1d");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), fFront: r2(p.freq / (1 - p.sourceV)), fBack: r2(p.freq / (1 + p.sourceV)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "fFront", label: "Freq ahead (Hz)", color: "#ef4444" }, { key: "fBack", label: "Freq behind (Hz)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Freq ahead", value: r2(p.freq / (1 - p.sourceV)), unit: "Hz" }, { label: "Freq behind", value: r2(p.freq / (1 + p.sourceV)), unit: "Hz" },
    { label: "Source speed", value: p.sourceV, unit: "×v" }, { label: "Emitted", value: p.freq, unit: "Hz" }],
};

const simsOTW = { refraction, lens, prism, gasbox, pvdiagram, heatconduction, carnot, wavestring, standingwave, beats, doppler };
export default simsOTW;
