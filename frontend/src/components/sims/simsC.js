// Modern Physics, Fluids, Engineering & Astrophysics simulations.
const r2 = (x) => Math.round(x * 100) / 100;
function circle(ctx, x, y, rad, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function arrow(ctx, x1, y1, x2, y2, color, w = 2.5) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
  ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}

/* -------- MODERN PHYSICS -------- */
const photoelectric = {
  title: "Photoelectric Effect", topic: "modern", difficulty: "Advanced",
  summary: "Shine light of varying frequency on a metal and eject electrons above the threshold.",
  equation: "KE_{max} = hf - \\phi",
  params: [
    { key: "freq", label: "Light frequency", min: 2, max: 15, step: 0.5, default: 8, unit: "×10¹⁴ Hz" },
    { key: "work", label: "Work function", min: 2, max: 8, step: 0.5, default: 4, unit: "eV" },
    { key: "intensity", label: "Intensity", min: 1, max: 8, step: 1, default: 4, unit: "" },
  ],
  init: () => ({ t: 0, e: [] }),
  step: (s, dt, p) => {
    s.t += dt; const ke = 4.14 * p.freq / 10 - p.work;
    if (ke > 0 && Math.random() < p.intensity * 0.06) s.e.push({ x: 250, y: 150 + Math.random() * 140, v: 60 + ke * 30 });
    s.e.forEach((el) => (el.x += el.v * dt)); s.e = s.e.filter((el) => el.x < 680);
  },
  draw: (ctx, s, p, W, H) => {
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(210, 120, 40, 200);
    const col = p.freq < 5 ? "#ef4444" : p.freq < 8 ? "#22c55e" : "#8b5cf6";
    for (let i = 0; i < 5; i++) arrow(ctx, 60, 140 + i * 40, 205, 140 + i * 40, col, 2);
    s.e.forEach((el) => circle(ctx, el.x, el.y, 5, "#2563eb"));
    const ke = 4.14 * p.freq / 10 - p.work;
    ctx.fillStyle = ke > 0 ? "#10b981" : "#ef4444"; ctx.font = "700 14px Outfit";
    ctx.fillText(ke > 0 ? "Electrons ejected" : "Below threshold — no emission", 300, 60);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), ke: r2(Math.max(0, 4.14 * p.freq / 10 - p.work)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "ke", label: "Max KE (eV)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Max KE", value: r2(Math.max(0, 4.14 * p.freq / 10 - p.work)), unit: "eV" },
    { label: "Threshold freq", value: r2(p.work / 0.414), unit: "×10¹⁴ Hz" },
    { label: "Stopping V", value: r2(Math.max(0, 4.14 * p.freq / 10 - p.work)), unit: "V" },
    { label: "Emitting", value: (4.14 * p.freq / 10 - p.work) > 0 ? "yes" : "no", unit: "" }],
};

const bohr = {
  title: "Bohr Hydrogen Atom", topic: "modern", difficulty: "Advanced",
  summary: "Explore quantised electron orbits and the energy of each level in hydrogen.",
  equation: "E_n = -\\frac{13.6}{n^2}\\,\\text{eV}, \\quad r_n \\propto n^2",
  params: [{ key: "n", label: "Energy level (n)", min: 1, max: 5, step: 1, default: 2, unit: "" }],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { s.th += (3 / (p.n * p.n)) * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    for (let k = 1; k <= 5; k++) { ctx.strokeStyle = k === p.n ? "#2563eb" : "rgba(148,163,184,.35)"; ctx.lineWidth = k === p.n ? 2 : 1; ctx.beginPath(); ctx.arc(cx, cy, k * k * 8 + 20, 0, Math.PI * 2); ctx.stroke(); }
    circle(ctx, cx, cy, 12, "#ef4444", "#7f1d1d");
    const R = p.n * p.n * 8 + 20; circle(ctx, cx + R * Math.cos(s.th), cy + R * Math.sin(s.th), 7, "#2563eb");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), E: r2(-13.6 / (p.n * p.n)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "E", label: "Energy (eV)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Energy Eₙ", value: r2(-13.6 / (p.n * p.n)), unit: "eV" }, { label: "Level n", value: p.n, unit: "" },
    { label: "Radius ∝ n²", value: p.n * p.n, unit: "a₀" }, { label: "Ground state", value: "-13.6 eV", unit: "" }],
};

const decay = {
  title: "Radioactive Decay", topic: "modern", difficulty: "Intermediate",
  summary: "Watch a sample of nuclei decay exponentially and measure the half-life.",
  equation: "N = N_0 e^{-\\lambda t}, \\quad t_{1/2} = \\frac{\\ln 2}{\\lambda}",
  params: [
    { key: "half", label: "Half-life", min: 1, max: 8, step: 0.5, default: 3, unit: "s" },
    { key: "n0", label: "Initial nuclei", min: 50, max: 200, step: 10, default: 100, unit: "" },
  ],
  init: (p) => ({ t: 0, grid: new Array(200).fill(true) }),
  step: (s, dt, p) => {
    s.t += dt; const lam = Math.LN2 / p.half; const surv = Math.exp(-lam * s.t);
    const n = Math.round(p.n0); for (let i = 0; i < n; i++) s.grid[i] = (i / n) < surv;
    if (s.t > p.half * 6) s.t = 0;
  },
  draw: (ctx, s, p, W, H) => {
    const n = Math.round(p.n0), cols = 20, cell = 22, x0 = W / 2 - cols * cell / 2, y0 = 60;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols; circle(ctx, x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, 7, s.grid[i] ? "#2563eb" : "#e2e8f0"); }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), N: r2(p.n0 * Math.exp(-Math.LN2 / p.half * s.t)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "N", label: "Nuclei remaining", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Half-life", value: p.half, unit: "s" }, { label: "Decay const λ", value: r2(Math.LN2 / p.half), unit: "/s" },
    { label: "Remaining", value: r2(p.n0 * Math.exp(-Math.LN2 / p.half * s.t)), unit: "" }, { label: "Elapsed", value: r2(s.t), unit: "s" }],
};

const matterwave = {
  title: "de Broglie Matter Waves", topic: "modern", difficulty: "Advanced",
  summary: "Change a particle's momentum and see its quantum wavelength stretch or shrink.",
  equation: "\\lambda = \\frac{h}{mv} = \\frac{h}{p}",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 3, unit: "×10⁻³⁰ kg" },
    { key: "v", label: "Speed", min: 1, max: 10, step: 0.5, default: 4, unit: "×10⁶ m/s" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2; const lam = 200 / (p.mass * p.v); const k = (2 * Math.PI) / Math.max(10, lam * 40);
    ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = 40; x < W - 40; x += 2) { const y = cy - 50 * Math.sin(k * (x - 40) - s.t * 3) * Math.exp(-Math.pow((x - W / 2) / 220, 2)); x === 40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    circle(ctx, W / 2, cy, 8, "#2563eb");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), lam: r2(6.63 / (p.mass * p.v) * 100) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "lam", label: "Wavelength (relative)", color: "#8b5cf6" }],
  stats: (s, p) => [
    { label: "Wavelength", value: r2(6.63 / (p.mass * p.v) * 100), unit: "pm" }, { label: "Momentum", value: r2(p.mass * p.v), unit: "×10⁻²⁴" },
    { label: "Mass", value: p.mass, unit: "×10⁻³⁰ kg" }, { label: "Speed", value: p.v, unit: "×10⁶ m/s" }],
};

const relativity = {
  title: "Special Relativity", topic: "modern", difficulty: "Advanced",
  summary: "Speed a spaceship close to light and watch time dilate and length contract.",
  equation: "\\gamma = \\frac{1}{\\sqrt{1-v^2/c^2}}",
  params: [{ key: "beta", label: "Speed (v/c)", min: 0, max: 0.99, step: 0.01, default: 0.8, unit: "c" }],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, g = 1 / Math.sqrt(1 - p.beta * p.beta);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx - 100, cy - 20, 200 / g, 40);
    ctx.fillStyle = "#2563eb"; ctx.font = "600 12px 'Source Code Pro'"; ctx.fillText("rest length", cx - 100, cy - 40);
    ctx.strokeStyle = "rgba(148,163,184,.6)"; ctx.strokeRect(cx - 100, cy - 20, 200, 40);
    ctx.fillStyle = "#f59e0b"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center"; ctx.fillText("γ = " + r2(g), cx, cy + 70); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), g: r2(1 / Math.sqrt(1 - p.beta * p.beta)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "g", label: "Lorentz factor γ", color: "#f59e0b" }],
  stats: (s, p) => { const g = 1 / Math.sqrt(1 - p.beta * p.beta); return [
    { label: "Lorentz γ", value: r2(g), unit: "" }, { label: "Time (1s → )", value: r2(g), unit: "s" },
    { label: "Length (1m → )", value: r2(1 / g), unit: "m" }, { label: "Speed", value: p.beta, unit: "c" }]; },
};

/* -------- FLUIDS -------- */
const buoyancy = {
  title: "Buoyancy & Floating", topic: "fluids", difficulty: "Intermediate",
  summary: "Drop objects of different density into a fluid and see what floats or sinks.",
  equation: "F_B = \\rho_{fluid} V g, \\quad \\text{float if } \\rho_{obj} < \\rho_{fluid}",
  params: [
    { key: "objDensity", label: "Object density", min: 0.2, max: 3, step: 0.1, default: 0.6, unit: "g/cm³" },
    { key: "fluidDensity", label: "Fluid density", min: 0.5, max: 2, step: 0.1, default: 1, unit: "g/cm³" },
    { key: "size", label: "Object size", min: 30, max: 80, step: 5, default: 55, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const surf = 140; ctx.fillStyle = "rgba(6,182,212,.18)"; ctx.fillRect(60, surf, W - 120, H - surf - 40);
    ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, surf); ctx.lineTo(W - 60, surf); ctx.stroke();
    const frac = Math.min(1, p.objDensity / p.fluidDensity); const sz = p.size;
    const topY = surf - sz * (1 - frac); const bob = Math.sin(s.t * 2) * (frac < 1 ? 4 : 0);
    ctx.fillStyle = p.objDensity < p.fluidDensity ? "#f59e0b" : "#64748b";
    ctx.fillRect(W / 2 - sz / 2, topY + bob, sz, sz); ctx.strokeStyle = "#334155"; ctx.strokeRect(W / 2 - sz / 2, topY + bob, sz, sz);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), frac: r2(Math.min(1, p.objDensity / p.fluidDensity) * 100) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "frac", label: "Submerged (%)", color: "#0891b2" }],
  stats: (s, p) => [
    { label: "Result", value: p.objDensity < p.fluidDensity ? "floats" : "sinks", unit: "" },
    { label: "Submerged", value: r2(Math.min(1, p.objDensity / p.fluidDensity) * 100), unit: "%" },
    { label: "Object ρ", value: p.objDensity, unit: "g/cm³" }, { label: "Fluid ρ", value: p.fluidDensity, unit: "g/cm³" }],
};

const pressuredepth = {
  title: "Pressure vs Depth", topic: "fluids", difficulty: "Beginner",
  summary: "Lower a gauge into a fluid and see hydrostatic pressure grow with depth.",
  equation: "P = P_0 + \\rho g h",
  params: [
    { key: "depth", label: "Depth", min: 0, max: 10, step: 0.5, default: 5, unit: "m" },
    { key: "density", label: "Fluid density", min: 0.5, max: 14, step: 0.5, default: 1, unit: "×10³ kg/m³" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const surf = 80; ctx.fillStyle = "rgba(6,182,212,.18)"; ctx.fillRect(80, surf, W - 160, H - surf - 40);
    ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2; ctx.strokeRect(80, surf, W - 160, H - surf - 40);
    const y = surf + (p.depth / 10) * (H - surf - 60); circle(ctx, W / 2, y, 9, "#f59e0b", "#b45309");
    ctx.strokeStyle = "rgba(245,158,11,.4)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(W - 80, y); ctx.stroke(); ctx.setLineDash([]);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), P: r2(101 + p.density * 9.8 * p.depth) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "P", label: "Pressure (kPa)", color: "#0891b2" }],
  stats: (s, p) => [
    { label: "Total pressure", value: r2(101 + p.density * 9.8 * p.depth), unit: "kPa" },
    { label: "Gauge pressure", value: r2(p.density * 9.8 * p.depth), unit: "kPa" },
    { label: "Depth", value: p.depth, unit: "m" }, { label: "Atmospheric", value: "101 kPa", unit: "" }],
};

const bernoulli = {
  title: "Bernoulli & Venturi", topic: "fluids", difficulty: "Advanced",
  summary: "Push fluid through a narrowing pipe — speed rises and pressure drops.",
  equation: "A_1v_1 = A_2v_2, \\quad P + \\tfrac12\\rho v^2 = \\text{const}",
  params: [
    { key: "inV", label: "Inlet speed", min: 1, max: 8, step: 0.5, default: 3, unit: "m/s" },
    { key: "ratio", label: "Wide : narrow ratio", min: 1.5, max: 5, step: 0.5, default: 3, unit: "" },
  ],
  init: () => ({ t: 0, dots: Array.from({ length: 30 }, () => ({ x: 60 + Math.random() * 620, y: 0 })) }),
  step: (s, dt, p) => {
    s.t += dt; s.dots.forEach((d) => { const narrow = d.x > 280 && d.x < 480; d.x += (narrow ? p.inV * p.ratio : p.inV) * 20 * dt; if (d.x > 680) d.x = 60; });
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2; ctx.fillStyle = "rgba(6,182,212,.12)"; ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, cy - 60); ctx.lineTo(280, cy - 60); ctx.lineTo(480, cy - 22); ctx.lineTo(680, cy - 22);
    ctx.lineTo(680, cy + 22); ctx.lineTo(480, cy + 22); ctx.lineTo(280, cy + 60); ctx.lineTo(60, cy + 60); ctx.closePath(); ctx.fill(); ctx.stroke();
    s.dots.forEach((d) => { const narrow = d.x > 280 && d.x < 480; const half = narrow ? 20 : 55; circle(ctx, d.x, cy + (Math.random() - 0.5) * half, 3, "#0891b2"); });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), vNarrow: r2(p.inV * p.ratio) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vNarrow", label: "Speed in throat (m/s)", color: "#0891b2" }],
  stats: (s, p) => [
    { label: "Inlet speed", value: p.inV, unit: "m/s" }, { label: "Throat speed", value: r2(p.inV * p.ratio), unit: "m/s" },
    { label: "Pressure drop ∝", value: r2(0.5 * (Math.pow(p.inV * p.ratio, 2) - p.inV * p.inV)), unit: "" }, { label: "Area ratio", value: p.ratio, unit: "" }],
};

const hydraulic = {
  title: "Hydraulic Lift", topic: "fluids", difficulty: "Intermediate",
  summary: "Press a small piston and lift a heavy load using Pascal's principle.",
  equation: "\\frac{F_1}{A_1} = \\frac{F_2}{A_2}",
  params: [
    { key: "force", label: "Input force", min: 10, max: 200, step: 10, default: 50, unit: "N" },
    { key: "ratio", label: "Area ratio (A₂/A₁)", min: 2, max: 20, step: 1, default: 8, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const base = H - 70; ctx.fillStyle = "rgba(6,182,212,.2)"; ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2;
    ctx.fillRect(120, base - 30, 120, 30); ctx.fillRect(120, base - 30, 30, -60);
    ctx.fillRect(420, base - 30, 180, 30); ctx.fillRect(420, base - 30, 180, -40);
    const lift = Math.min(60, s.t % 4 * 15);
    ctx.fillStyle = "#334155"; ctx.fillRect(126, base - 90, 18, 30);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(430, base - 70 - lift, 160, 40);
    arrow(ctx, 135, base - 100, 135, base - 130, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'"; ctx.fillText(p.force + "N", 145, base - 110);
    ctx.fillText(r2(p.force * p.ratio) + "N", 490, base - 80 - lift);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), out: r2(p.force * p.ratio) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "out", label: "Output force (N)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Output force", value: r2(p.force * p.ratio), unit: "N" }, { label: "Input force", value: p.force, unit: "N" },
    { label: "Mechanical adv.", value: p.ratio, unit: "×" }, { label: "Pressure equal", value: "yes", unit: "" }],
};

/* -------- ENGINEERING -------- */
const lever = {
  title: "Lever & Mechanical Advantage", topic: "engineering", difficulty: "Beginner",
  summary: "Balance a load with a small effort by changing the lever arm lengths.",
  equation: "F_e \\cdot d_e = F_l \\cdot d_l, \\quad MA = \\frac{d_e}{d_l}",
  params: [
    { key: "load", label: "Load", min: 10, max: 200, step: 10, default: 100, unit: "N" },
    { key: "loadArm", label: "Load arm", min: 0.5, max: 4, step: 0.5, default: 1, unit: "m" },
    { key: "effortArm", label: "Effort arm", min: 0.5, max: 6, step: 0.5, default: 4, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const fx = W / 2, fy = H / 2 + 20, sc = 40;
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(fx - p.effortArm * sc, fy); ctx.lineTo(fx + p.loadArm * sc, fy); ctx.stroke();
    ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.moveTo(fx, fy + 4); ctx.lineTo(fx - 16, fy + 40); ctx.lineTo(fx + 16, fy + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2563eb"; ctx.fillRect(fx + p.loadArm * sc - 16, fy - 40, 32, 36);
    arrow(ctx, fx - p.effortArm * sc, fy - 10, fx - p.effortArm * sc, fy - 50, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText(r2(p.load * p.loadArm / p.effortArm) + "N", fx - p.effortArm * sc - 10, fy - 56);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), effort: r2(p.load * p.loadArm / p.effortArm) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "effort", label: "Effort needed (N)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Effort needed", value: r2(p.load * p.loadArm / p.effortArm), unit: "N" }, { label: "Mechanical adv.", value: r2(p.effortArm / p.loadArm), unit: "×" },
    { label: "Load", value: p.load, unit: "N" }, { label: "Balanced", value: "yes", unit: "" }],
};

const gears = {
  title: "Gear Train", topic: "engineering", difficulty: "Intermediate",
  summary: "Mesh two gears and see how the tooth ratio trades speed for torque.",
  equation: "\\frac{\\omega_1}{\\omega_2} = \\frac{N_2}{N_1}",
  params: [
    { key: "t1", label: "Driver teeth", min: 8, max: 40, step: 2, default: 12, unit: "" },
    { key: "t2", label: "Driven teeth", min: 8, max: 40, step: 2, default: 24, unit: "" },
    { key: "rpm", label: "Input speed", min: 0.5, max: 4, step: 0.25, default: 2, unit: "" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { s.th += p.rpm * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, r1 = p.t1 * 2.4, r2v = p.t2 * 2.4, cx1 = W / 2 - r2v - 6, cx2 = W / 2 + r1 + 6;
    const gear = (cx, r, teeth, ang, col) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); circle(ctx, 0, 0, r, col, "#334155");
      for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2; ctx.fillStyle = "#334155"; ctx.fillRect(r - 2 + Math.cos(a) * 0, -3, 8, 6); ctx.rotate((Math.PI * 2) / teeth); }
      ctx.restore(); circle(ctx, cx, cy, 5, "#334155"); };
    gear(cx1, r1, p.t1, s.th, "#dbeafe");
    gear(cx2, r2v, p.t2, -s.th * (p.t1 / p.t2), "#fef3c7");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), out: r2(p.rpm * p.t1 / p.t2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "out", label: "Output speed", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Gear ratio", value: r2(p.t2 / p.t1), unit: ":1" }, { label: "Output speed", value: r2(p.rpm * p.t1 / p.t2), unit: "" },
    { label: "Torque gain", value: r2(p.t2 / p.t1), unit: "×" }, { label: "Direction", value: "reversed", unit: "" }],
};

const bridge = {
  title: "Beam & Load", topic: "engineering", difficulty: "Intermediate",
  summary: "Place a load on a supported beam and compute the reaction at each support.",
  equation: "R_1 + R_2 = W, \\quad R_1 = W\\frac{b}{L}",
  params: [
    { key: "load", label: "Load", min: 100, max: 1000, step: 50, default: 500, unit: "N" },
    { key: "pos", label: "Load position", min: 0.1, max: 0.9, step: 0.05, default: 0.5, unit: "×L" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const x0 = 100, L = W - 200, y = H / 2; const sag = 20 * Math.sin(Math.PI * p.pos);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(x0 + p.pos * L, y + sag, x0 + L, y); ctx.stroke();
    ctx.fillStyle = "#334155"; [x0, x0 + L].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 12, y + 30); ctx.lineTo(x + 12, y + 30); ctx.closePath(); ctx.fill(); });
    const lx = x0 + p.pos * L; arrow(ctx, lx, y - 50, lx, y - 6, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText(p.load + "N", lx + 6, y - 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), R1: r2(p.load * (1 - p.pos)), R2: r2(p.load * p.pos) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "R1", label: "Left reaction (N)", color: "#2563eb" }, { key: "R2", label: "Right reaction (N)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Left support R₁", value: r2(p.load * (1 - p.pos)), unit: "N" }, { label: "Right support R₂", value: r2(p.load * p.pos), unit: "N" },
    { label: "Total load", value: p.load, unit: "N" }, { label: "Load position", value: p.pos, unit: "×L" }],
};

const rocket = {
  title: "Rocket Launch", topic: "engineering", difficulty: "Advanced",
  summary: "Balance thrust against weight and drag to launch a rocket into the sky.",
  equation: "a = \\frac{T - mg - D}{m}",
  params: [
    { key: "thrust", label: "Thrust", min: 100, max: 600, step: 20, default: 300, unit: "N" },
    { key: "mass", label: "Mass", min: 10, max: 40, step: 2, default: 20, unit: "kg" },
    { key: "drag", label: "Drag", min: 0, max: 0.5, step: 0.05, default: 0.1, unit: "" },
  ],
  init: () => ({ y: 0, v: 0, t: 0 }),
  step: (s, dt, p) => { const a = (p.thrust - p.mass * 9.8 - p.drag * s.v * s.v) / p.mass; s.v += a * dt; s.y += s.v * dt; s.t += dt; if (s.y < 0) { s.y = 0; s.v = 0; } if (s.y > 400) { s.y = 0; s.v = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const base = H - 50; const ry = base - Math.min(s.y, 400);
    const cx = W / 2; ctx.fillStyle = "#2563eb"; ctx.fillRect(cx - 12, ry - 40, 24, 40);
    ctx.beginPath(); ctx.moveTo(cx - 12, ry - 40); ctx.lineTo(cx, ry - 64); ctx.lineTo(cx + 12, ry - 40); ctx.closePath(); ctx.fill();
    if (s.v > 0) { ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.moveTo(cx - 8, ry); ctx.lineTo(cx, ry + 24 + Math.random() * 10); ctx.lineTo(cx + 8, ry); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, base); ctx.lineTo(W - 40, base); ctx.stroke();
  },
  graphPoint: (s) => ({ t: r2(s.t), y: r2(s.y), v: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Altitude (m)", color: "#2563eb" }, { key: "v", label: "Velocity (m/s)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Net force", value: r2(p.thrust - p.mass * 9.8), unit: "N" }, { label: "Weight", value: r2(p.mass * 9.8), unit: "N" },
    { label: "Altitude", value: r2(s.y), unit: "m" }, { label: "Velocity", value: r2(s.v), unit: "m/s" }],
};

const renewable = {
  title: "Wind Turbine Power", topic: "engineering", difficulty: "Intermediate",
  summary: "Change wind speed and blade size to maximise a turbine's power output.",
  equation: "P = \\tfrac{1}{2}\\rho A v^3 C_p",
  params: [
    { key: "wind", label: "Wind speed", min: 2, max: 20, step: 1, default: 10, unit: "m/s" },
    { key: "radius", label: "Blade radius", min: 5, max: 40, step: 1, default: 20, unit: "m" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { s.th += p.wind * 0.08 * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2 - 20, len = 20 + p.radius * 2.2;
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx - 5, cy, 10, H / 2 - 30);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.th);
    for (let i = 0; i < 3; i++) { ctx.rotate((Math.PI * 2) / 3); ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, -len); ctx.lineTo(8, -len); ctx.closePath(); ctx.fill(); }
    ctx.restore(); circle(ctx, cx, cy, 8, "#334155");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), P: r2(0.5 * 1.225 * Math.PI * p.radius * p.radius * Math.pow(p.wind, 3) * 0.4 / 1000) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "P", label: "Power (kW)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Power output", value: r2(0.5 * 1.225 * Math.PI * p.radius * p.radius * Math.pow(p.wind, 3) * 0.4 / 1000), unit: "kW" },
    { label: "Swept area", value: r2(Math.PI * p.radius * p.radius), unit: "m²" },
    { label: "Wind speed", value: p.wind, unit: "m/s" }, { label: "P ∝ v³", value: "cubic", unit: "" }],
};

/* -------- ASTROPHYSICS -------- */
const kepler = {
  title: "Kepler's Orbits", topic: "astrophysics", difficulty: "Advanced",
  summary: "Trace an elliptical orbit and watch a planet speed up near perihelion.",
  equation: "\\frac{dA}{dt} = \\text{const}, \\quad T^2 \\propto a^3",
  params: [
    { key: "ecc", label: "Eccentricity", min: 0, max: 0.8, step: 0.05, default: 0.5, unit: "" },
    { key: "a", label: "Semi-major axis", min: 80, max: 180, step: 10, default: 130, unit: "" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { const b = p.a * Math.sqrt(1 - p.ecc * p.ecc); const rr = (p.a * (1 - p.ecc * p.ecc)) / (1 + p.ecc * Math.cos(s.th)); s.th += (3000 / (rr * rr)) * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; const b = p.a * Math.sqrt(1 - p.ecc * p.ecc); const focus = p.a * p.ecc;
    ctx.strokeStyle = "rgba(99,102,241,.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, p.a, b, 0, 0, Math.PI * 2); ctx.stroke();
    const sunX = cx - focus; const grad = ctx.createRadialGradient(sunX, cy, 2, sunX, cy, 16); grad.addColorStop(0, "#fde047"); grad.addColorStop(1, "#f59e0b"); circle(ctx, sunX, cy, 14, grad);
    const rr = (p.a * (1 - p.ecc * p.ecc)) / (1 + p.ecc * Math.cos(s.th));
    circle(ctx, sunX + rr * Math.cos(s.th), cy + rr * Math.sin(s.th), 7, "#6366f1");
  },
  graphPoint: (s, p) => { const rr = (p.a * (1 - p.ecc * p.ecc)) / (1 + p.ecc * Math.cos(s.th)); return { t: r2(s.t), speed: r2(3000 / rr) }; },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "speed", label: "Orbital speed", color: "#6366f1" }],
  stats: (s, p) => [
    { label: "Eccentricity", value: p.ecc, unit: "" }, { label: "Perihelion", value: r2(p.a * (1 - p.ecc)), unit: "" },
    { label: "Aphelion", value: r2(p.a * (1 + p.ecc)), unit: "" }, { label: "T² ∝ a³", value: "Kepler 3", unit: "" }],
};

const planetsystem = {
  title: "Solar System", topic: "astrophysics", difficulty: "Beginner",
  summary: "Watch inner planets orbit faster than outer ones, just like the real Solar System.",
  equation: "v \\propto \\frac{1}{\\sqrt{r}}",
  params: [{ key: "speed", label: "Time speed", min: 0.2, max: 3, step: 0.2, default: 1, unit: "×" }],
  init: () => ({ t: 0 }),
  step: (s, dt, p) => { s.t += dt * p.speed; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20); grad.addColorStop(0, "#fde047"); grad.addColorStop(1, "#f59e0b"); circle(ctx, cx, cy, 16, grad);
    const planets = [[45, "#94a3b8"], [75, "#f59e0b"], [105, "#3b82f6"], [140, "#ef4444"], [180, "#eab308"]];
    planets.forEach(([r, col], i) => { ctx.strokeStyle = "rgba(148,163,184,.25)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      const ang = s.t * (1.6 / Math.sqrt(r)) * 3; circle(ctx, cx + r * Math.cos(ang), cy + r * Math.sin(ang), 5 + (i === 2 ? 1 : 0), col); });
  },
  graphPoint: (s) => ({ t: r2(s.t), a: r2(s.t) }),
  xKey: "t", xLabel: "Time",
  series: [{ key: "a", label: "Elapsed time", color: "#6366f1" }],
  stats: (s, p) => [
    { label: "Inner planets", value: "faster", unit: "" }, { label: "Outer planets", value: "slower", unit: "" },
    { label: "Law", value: "Kepler + gravity", unit: "" }, { label: "Time speed", value: p.speed, unit: "×" }],
};

const gravitywell = {
  title: "Black Hole Gravity Well", topic: "astrophysics", difficulty: "Advanced",
  summary: "Orbit near a massive body and see the event horizon grow with its mass.",
  equation: "r_s = \\frac{2GM}{c^2}",
  params: [
    { key: "mass", label: "Mass", min: 2, max: 12, step: 0.5, default: 5, unit: "M☉" },
    { key: "speed", label: "Orbit speed", min: 2, max: 10, step: 0.5, default: 6, unit: "" },
    { key: "dist", label: "Start distance", min: 80, max: 200, step: 10, default: 130, unit: "" },
  ],
  init: (p) => ({ x: p.dist, y: 0, vx: 0, vy: p.speed, t: 0, trail: [], state: "orbiting" }),
  step: (s, dt, p) => {
    if (s.state !== "orbiting") return; const r = Math.hypot(s.x, s.y) || 1; const acc = (-2600 * p.mass) / (r * r);
    s.vx += (acc * s.x) / r * dt; s.vy += (acc * s.y) / r * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.t += dt;
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 1400) s.trail.shift();
    if (r < p.mass * 4 + 8) s.state = "swallowed"; if (r > 700) s.state = "escaped";
  },
  done: (s) => s.state !== "orbiting",
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; const rs = p.mass * 4 + 8;
    const g = ctx.createRadialGradient(cx, cy, rs, cx, cy, rs + 40); g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(99,102,241,0)"); ctx.fillStyle = g; circle(ctx, cx, cy, rs + 40, g);
    circle(ctx, cx, cy, rs, "#0b1020", "#6366f1");
    ctx.strokeStyle = "rgba(99,102,241,.5)"; ctx.lineWidth = 2; ctx.beginPath(); s.trail.forEach((t, i) => { const sx = cx + t.x, sy = cy + t.y; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }); ctx.stroke();
    circle(ctx, cx + s.x, cy + s.y, 6, "#f59e0b");
    if (s.state !== "orbiting") { ctx.fillStyle = s.state === "swallowed" ? "#ef4444" : "#10b981"; ctx.font = "700 16px Outfit"; ctx.textAlign = "center"; ctx.fillText(s.state === "swallowed" ? "Crossed the event horizon!" : "Escaped!", cx, 36); ctx.textAlign = "left"; }
  },
  graphPoint: (s) => ({ t: r2(s.t), dist: r2(Math.hypot(s.x, s.y)) }),
  xKey: "t", xLabel: "Time",
  series: [{ key: "dist", label: "Distance from BH", color: "#6366f1" }],
  stats: (s, p) => [
    { label: "Event horizon", value: r2(p.mass * 4 + 8), unit: "px" }, { label: "Mass", value: p.mass, unit: "M☉" },
    { label: "Distance", value: r2(Math.hypot(s.x, s.y)), unit: "" }, { label: "Status", value: s.state, unit: "" }],
};

const hubble = {
  title: "Expanding Universe", topic: "astrophysics", difficulty: "Intermediate",
  summary: "See distant galaxies recede faster — the signature of an expanding universe.",
  equation: "v = H_0 d",
  params: [{ key: "H0", label: "Hubble constant", min: 0.2, max: 2, step: 0.1, default: 1, unit: "" }],
  init: () => ({ t: 0, gal: Array.from({ length: 16 }, () => ({ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 140 })) }),
  step: (s, dt, p) => { s.t += dt; s.gal.forEach((g) => { g.x *= 1 + p.H0 * dt * 0.15; g.y *= 1 + p.H0 * dt * 0.15; }); if (Math.abs(s.gal[0].x) > 400) s.gal.forEach((g) => { g.x *= 0.3; g.y *= 0.3; }); },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, W, H);
    circle(ctx, cx, cy, 6, "#fde047");
    s.gal.forEach((g) => { const d = Math.hypot(g.x, g.y); const hue = Math.min(1, d / 300);
      ctx.fillStyle = `rgb(${Math.round(120 + hue * 135)},${Math.round(120 - hue * 60)},${Math.round(255 - hue * 100)})`; circle(ctx, cx + g.x, cy + g.y, 4); });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), scale: r2(Math.hypot(s.gal[0].x, s.gal[0].y)) }),
  xKey: "t", xLabel: "Time",
  series: [{ key: "scale", label: "Scale factor (relative)", color: "#6366f1" }],
  stats: (s, p) => [
    { label: "Hubble constant", value: p.H0, unit: "" }, { label: "Farther = ", value: "faster", unit: "" },
    { label: "Redshift", value: "increases", unit: "" }, { label: "Big Bang", value: "t = 0", unit: "" }],
};

const stars = {
  title: "Stellar Evolution", topic: "astrophysics", difficulty: "Advanced",
  summary: "Pick a star's mass and discover its colour, lifetime and ultimate fate.",
  equation: "t_{life} \\propto \\frac{M}{L} \\propto M^{-2.5}",
  params: [{ key: "mass", label: "Stellar mass", min: 0.5, max: 25, step: 0.5, default: 5, unit: "M☉" }],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, W, H);
    const R = 20 + Math.pow(p.mass, 0.6) * 8; const pulse = 1 + Math.sin(s.t * 3) * 0.04;
    const col = p.mass < 1 ? "#f97316" : p.mass < 3 ? "#fde047" : p.mass < 10 ? "#fff" : "#93c5fd";
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, R * pulse); g.addColorStop(0, "#fff"); g.addColorStop(1, col);
    circle(ctx, cx, cy, R * pulse, g);
    const fate = p.mass < 8 ? "White Dwarf" : p.mass < 20 ? "Neutron Star" : "Black Hole";
    ctx.fillStyle = "#e2e8f0"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center"; ctx.fillText("Fate: " + fate, cx, H - 40); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), life: r2(10 * Math.pow(p.mass, -2.5)) }),
  xKey: "t", xLabel: "Time",
  series: [{ key: "life", label: "Lifetime (relative)", color: "#6366f1" }],
  stats: (s, p) => [
    { label: "Mass", value: p.mass, unit: "M☉" }, { label: "Lifetime", value: r2(10 * Math.pow(p.mass, -2.5)), unit: "Gyr" },
    { label: "Fate", value: p.mass < 8 ? "white dwarf" : p.mass < 20 ? "neutron star" : "black hole", unit: "" },
    { label: "Colour", value: p.mass < 1 ? "orange" : p.mass < 10 ? "yellow-white" : "blue", unit: "" }],
};

const simsC = { photoelectric, bohr, decay, matterwave, relativity, buoyancy, pressuredepth, bernoulli, hydraulic, lever, gears, bridge, rocket, renewable, kepler, planetsystem, gravitywell, hubble, stars };
export default simsC;
