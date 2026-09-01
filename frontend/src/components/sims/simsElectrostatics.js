// Distinct Electrostatics simulations — one concept, one sim.
// Save as components/sims/simsElectrostatics.js
const r2 = (x) => Math.round(x * 100) / 100;
const K = 8.99e9; // Coulomb's constant, charges given in microcoulombs (×1e-6 C)
const EPS0 = 8.854e-12;

function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function arrow(ctx, x1, y1, x2, y2, color, w = 2) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), h = 6;
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
  ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}
function chargeDot(ctx, x, y, q) {
  circle(ctx, x, y, 18, q >= 0 ? "#ef4444" : "#2563eb", q >= 0 ? "#b91c1c" : "#1e40af");
  ctx.fillStyle = "#fff"; ctx.font = "700 16px Outfit"; ctx.textAlign = "center";
  ctx.fillText(q >= 0 ? "+" : "−", x, y + 6);
  ctx.textAlign = "left";
}

/* ============ 1. ELECTRIC CHARGE ============
   A single point charge — flip its sign and magnitude, watch the field
   vectors around it flip direction and scale. */
const charge = {
  title: "Electric Charge", topic: "electricity", difficulty: "Beginner",
  summary: "A single point charge creates a field around it — flip the sign and watch every field arrow reverse.",
  equation: "\\vec{E} = \\frac{kq}{r^2}\\hat{r}",
  params: [
    { key: "q", label: "Charge", min: -10, max: 10, step: 1, default: 5, unit: "μC" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * 2 * Math.PI;
      const x1 = cx + 30 * Math.cos(ang), y1 = cy + 30 * Math.sin(ang);
      const x2 = cx + 90 * Math.cos(ang), y2 = cy + 90 * Math.sin(ang);
      if (p.q >= 0) arrow(ctx, x1, y1, x2, y2, "rgba(37,99,235,.55)");
      else arrow(ctx, x2, y2, x1, y1, "rgba(37,99,235,.55)");
    }
    chargeDot(ctx, cx, cy, p.q);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), E: r2((K * Math.abs(p.q) * 1e-6) / (1 * 1)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "E", label: "Field at r=1m (V/m)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Charge", value: p.q, unit: "μC" },
    { label: "Sign", value: p.q >= 0 ? "positive" : "negative", unit: "" },
    { label: "Field at 1m", value: r2((K * Math.abs(p.q) * 1e-6)), unit: "V/m" },
    { label: "Field direction", value: p.q >= 0 ? "outward" : "inward", unit: "" },
  ],
};

/* ============ 2. ELECTRIC FIELD (probe at variable distance) ============
   A fixed source charge with a movable test point — shows how field
   magnitude falls off with r, distinct from the charge-sign demo above. */
const electricfield = {
  title: "Electric Field", topic: "electricity", difficulty: "Beginner",
  summary: "Move a test point away from a charge and watch the field strength fall off as 1/r².",
  equation: "E = \\frac{kq}{r^2}",
  params: [
    { key: "q", label: "Source charge", min: 1, max: 10, step: 1, default: 5, unit: "μC" },
    { key: "r", label: "Test point distance", min: 1, max: 8, step: 0.5, default: 3, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = 120, cy = H / 2, sc = 40;
    chargeDot(ctx, cx, cy, p.q);
    const px = cx + p.r * sc;
    circle(ctx, px, cy, 8, "#10b981", "#047857");
    const E = (K * p.q * 1e-6) / (p.r * p.r);
    arrow(ctx, px, cy, px + Math.min(80, E / 200), cy, "#10b981", 3);
    ctx.strokeStyle = "rgba(148,163,184,.5)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke(); ctx.setLineDash([]);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), E: r2((K * p.q * 1e-6) / (p.r * p.r)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "E", label: "Field strength (V/m)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Field strength", value: r2((K * p.q * 1e-6) / (p.r * p.r)), unit: "V/m" },
    { label: "Distance", value: p.r, unit: "m" },
    { label: "Source charge", value: p.q, unit: "μC" },
    { label: "Falls as", value: "1/r²", unit: "" },
  ],
};

/* ============ 3. ELECTRIC FIELD LINES ============
   Pick a charge configuration and see the qualitative field-line pattern
   — single charge, two like charges, or a dipole. */
const fieldlines = {
  title: "Electric Field Lines", topic: "electricity", difficulty: "Intermediate",
  summary: "Compare field-line patterns for a single charge, two like charges, and a dipole.",
  equation: "\\text{Field lines: start on +, end on -, never cross}",
  params: [
    { key: "config", label: "Configuration (0=single,1=like charges,2=dipole)", min: 0, max: 2, step: 1, default: 2, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    if (p.config === 0) {
      for (let a = 0; a < 16; a++) { const ang = (a / 16) * 2 * Math.PI; arrow(ctx, cx + 26 * Math.cos(ang), cy + 26 * Math.sin(ang), cx + 130 * Math.cos(ang), cy + 130 * Math.sin(ang), "rgba(37,99,235,.5)"); }
      chargeDot(ctx, cx, cy, 5);
    } else if (p.config === 1) {
      const x1 = cx - 90, x2 = cx + 90;
      for (let a = 0; a < 14; a++) { const ang = (a / 14) * 2 * Math.PI; arrow(ctx, x1 + 26 * Math.cos(ang), cy + 26 * Math.sin(ang), x1 + 110 * Math.cos(ang), cy + 110 * Math.sin(ang), "rgba(37,99,235,.4)"); }
      for (let a = 0; a < 14; a++) { const ang = (a / 14) * 2 * Math.PI; arrow(ctx, x2 + 26 * Math.cos(ang), cy + 26 * Math.sin(ang), x2 + 110 * Math.cos(ang), cy + 110 * Math.sin(ang), "rgba(37,99,235,.4)"); }
      chargeDot(ctx, x1, cy, 5); chargeDot(ctx, x2, cy, 5);
    } else {
      const x1 = cx - 90, x2 = cx + 90;
      for (let i = 0; i < 9; i++) {
        const t = (i / 8) * Math.PI - Math.PI / 2;
        const midY = cy + Math.sin(t) * 100;
        ctx.strokeStyle = "rgba(37,99,235,.5)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1 + 20, cy); ctx.quadraticCurveTo(cx, midY, x2 - 20, cy); ctx.stroke();
      }
      chargeDot(ctx, x1, cy, 5); chargeDot(ctx, x2, cy, -5);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), lines: p.config === 0 ? 16 : 14 }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "lines", label: "Field lines shown", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Configuration", value: ["Single charge", "Two like charges", "Dipole"][p.config] ?? "Dipole", unit: "" },
    { label: "Rule", value: "start +, end −", unit: "" },
  ],
};

/* ============ 4. ELECTRIC POTENTIAL ============
   Equipotential circles around a point charge — V = kq/r. */
const potential = {
  title: "Electric Potential", topic: "electricity", difficulty: "Intermediate",
  summary: "Equipotential circles around a charge — every point on a ring has the same potential, V = kq/r.",
  equation: "V = \\frac{kq}{r}",
  params: [
    { key: "q", label: "Charge", min: 1, max: 10, step: 1, default: 6, unit: "μC" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    [40, 80, 120, 160].forEach((rad) => {
      ctx.strokeStyle = "rgba(16,185,129,.5)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const V = (K * p.q * 1e-6) / (rad / 40);
      ctx.fillStyle = "#047857"; ctx.font = "600 10px 'Source Code Pro'";
      ctx.fillText(r2(V / 1e3) + "kV", cx + rad * 0.7, cy - rad * 0.7);
    });
    chargeDot(ctx, cx, cy, p.q);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), V1: r2((K * p.q * 1e-6) / 1), V2: r2((K * p.q * 1e-6) / 2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "V1", label: "V at r=1m", color: "#10b981" },
    { key: "V2", label: "V at r=2m", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "V at r=1m", value: r2((K * p.q * 1e-6) / 1), unit: "V" },
    { label: "V at r=2m", value: r2((K * p.q * 1e-6) / 2), unit: "V" },
    { label: "Charge", value: p.q, unit: "μC" },
  ],
};

/* ============ 5. POTENTIAL DIFFERENCE ============
   Two points A and B at different distances from a source charge — the
   work needed to move a test charge between them. */
const potentialdiff = {
  title: "Potential Difference", topic: "electricity", difficulty: "Intermediate",
  summary: "Move a test charge between two points near a source charge — the potential difference decides the work done.",
  equation: "W = q_0 (V_A - V_B)",
  params: [
    { key: "q", label: "Source charge", min: 1, max: 10, step: 1, default: 6, unit: "μC" },
    { key: "rA", label: "Distance to A", min: 1, max: 6, step: 0.5, default: 2, unit: "m" },
    { key: "rB", label: "Distance to B", min: 1, max: 6, step: 0.5, default: 5, unit: "m" },
    { key: "q0", label: "Test charge", min: 0.1, max: 5, step: 0.1, default: 1, unit: "μC" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = 100, cy = H / 2, sc = 30;
    chargeDot(ctx, cx, cy, p.q);
    const ax = cx + p.rA * sc, bx = cx + p.rB * sc;
    circle(ctx, ax, cy - 20, 9, "#10b981", "#047857");
    circle(ctx, bx, cy + 20, 9, "#f59e0b", "#b45309");
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("A", ax - 4, cy - 32); ctx.fillText("B", bx - 4, cy + 40);
  },
  graphPoint: (s, p) => {
    const VA = (K * p.q * 1e-6) / p.rA, VB = (K * p.q * 1e-6) / p.rB;
    return { t: r2(s.t), VA: r2(VA), VB: r2(VB), W: r2(p.q0 * 1e-6 * (VA - VB)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "VA", label: "V at A", color: "#10b981" },
    { key: "VB", label: "V at B", color: "#f59e0b" },
  ],
  stats: (s, p) => {
    const VA = (K * p.q * 1e-6) / p.rA, VB = (K * p.q * 1e-6) / p.rB;
    return [
      { label: "V at A", value: r2(VA), unit: "V" },
      { label: "V at B", value: r2(VB), unit: "V" },
      { label: "Potential difference", value: r2(VA - VB), unit: "V" },
      { label: "Work to move q₀", value: r2(p.q0 * 1e-6 * (VA - VB)), unit: "J" },
    ];
  },
};

/* ============ 6. ELECTRIC DIPOLE ============
   +q and -q separated by d, sitting in an external field — shows the
   dipole moment and the torque that rotates it toward alignment. */
const dipole = {
  title: "Electric Dipole", topic: "electricity", difficulty: "Intermediate",
  summary: "A pair of opposite charges forms a dipole — see it rotate to align with an external field.",
  equation: "\\vec{p} = q\\vec{d}, \\quad \\tau = pE\\sin\\theta",
  params: [
    { key: "q", label: "Charge magnitude", min: 1, max: 8, step: 0.5, default: 3, unit: "μC" },
    { key: "d", label: "Separation", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "m" },
    { key: "field", label: "External field", min: 0, max: 10, step: 0.5, default: 4, unit: "V/m ×10⁵" },
  ],
  init: () => ({ theta: Math.PI / 3, omega: 0, t: 0 }),
  step: (s, dt, p) => {
    const I = 1; // fictitious rotational inertia for animation purposes
    const torque = -(p.q * 1e-6 * p.d * p.field * 1e5) * Math.sin(s.theta) * 1e-5;
    s.omega += (torque / I) * dt - 0.3 * s.omega * dt;
    s.theta += s.omega * dt; s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, len = p.d * 50;
    arrow(ctx, 40, cy, 130, cy, "rgba(148,163,184,.7)", 2);
    ctx.fillStyle = "#64748b"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText("E field", 40, cy - 10);
    const x1 = cx - len / 2 * Math.cos(s.theta), y1 = cy - len / 2 * Math.sin(s.theta);
    const x2 = cx + len / 2 * Math.cos(s.theta), y2 = cy + len / 2 * Math.sin(s.theta);
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    chargeDot(ctx, x1, y1, -p.q); chargeDot(ctx, x2, y2, p.q);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), theta: r2(s.theta * 180 / Math.PI), torque: r2(p.q * 1e-6 * p.d * p.field * 1e5 * Math.sin(s.theta) * 1e5) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "theta", label: "Angle from field (°)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Dipole moment p", value: r2(p.q * 1e-6 * p.d * 1e6), unit: "μC·m" },
    { label: "Angle to field", value: r2((s.theta * 180 / Math.PI + 360) % 360), unit: "°" },
    { label: "Torque", value: r2(Math.abs(p.q * 1e-6 * p.d * p.field * 1e5 * Math.sin(s.theta))), unit: "N·m ×10⁻⁵" },
  ],
};

/* ============ 7. GAUSS'S LAW ============
   A point charge enclosed by a spherical Gaussian surface of adjustable
   radius — the enclosed flux stays constant no matter the radius. */
const gauss = {
  title: "Gauss's Law", topic: "electricity", difficulty: "Advanced",
  summary: "Grow or shrink a Gaussian sphere around a charge — the enclosed flux never changes as long as the charge stays inside.",
  equation: "\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0}",
  params: [
    { key: "q", label: "Enclosed charge", min: 1, max: 10, step: 1, default: 5, unit: "μC" },
    { key: "radius", label: "Gaussian surface radius", min: 30, max: 160, step: 5, default: 90, unit: "px" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "rgba(16,185,129,.6)"; ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, p.radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let a = 0; a < 16; a++) { const ang = (a / 16) * 2 * Math.PI; arrow(ctx, cx + 26 * Math.cos(ang), cy + 26 * Math.sin(ang), cx + (p.radius - 6) * Math.cos(ang), cy + (p.radius - 6) * Math.sin(ang), "rgba(37,99,235,.4)"); }
    chargeDot(ctx, cx, cy, p.q);
    ctx.fillStyle = "#047857"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("flux = Q/ε₀ (same at any radius)", 30, 30);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), radius: p.radius, flux: r2((p.q * 1e-6) / EPS0) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "flux", label: "Enclosed flux (N·m²/C)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Enclosed charge", value: p.q, unit: "μC" },
    { label: "Flux through surface", value: (p.q * 1e-6 / EPS0).toExponential(2), unit: "N·m²/C" },
    { label: "Surface radius", value: p.radius, unit: "px" },
    { label: "Flux depends on radius?", value: "no", unit: "" },
  ],
};

const simsElectrostatics = { charge, electricfield, fieldlines, potential, potentialdiff, dipole, gauss };
export default simsElectrostatics;