// Distinct circuit-topology simulations — one concept, one sim.
// Save as components/sims/simsCircuits.js
const r2 = (x) => Math.round(x * 100) / 100;

function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function resistorBox(ctx, x, y, w, h, label) {
  ctx.fillStyle = "#dbeafe"; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  ctx.fillStyle = "#1e3a8a"; ctx.font = "600 12px 'Source Code Pro'"; ctx.textAlign = "center";
  ctx.fillText(label, x, y + 4); ctx.textAlign = "left";
}

/* ============ 1. SERIES CIRCUIT ============
   Three resistors in a single loop — same current everywhere, voltage
   splits proportionally across each resistor. */
const seriescircuit = {
  title: "Series Circuit", topic: "electricity", difficulty: "Beginner",
  summary: "Three resistors in one loop — the same current flows through every one, but the voltage splits between them.",
  equation: "R_{total} = R_1+R_2+R_3, \\quad I \\text{ same everywhere}",
  params: [
    { key: "r1", label: "R₁", min: 1, max: 20, step: 1, default: 4, unit: "Ω" },
    { key: "r2", label: "R₂", min: 1, max: 20, step: 1, default: 6, unit: "Ω" },
    { key: "r3", label: "R₃", min: 1, max: 20, step: 1, default: 8, unit: "Ω" },
    { key: "voltage", label: "Battery voltage", min: 1, max: 24, step: 1, default: 12, unit: "V" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const y = H / 2, x0 = 60, x1 = W - 60;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    resistorBox(ctx, x0 + (x1 - x0) * 0.28, y, 70, 32, p.r1 + "Ω");
    resistorBox(ctx, x0 + (x1 - x0) * 0.5, y, 70, 32, p.r2 + "Ω");
    resistorBox(ctx, x0 + (x1 - x0) * 0.72, y, 70, 32, p.r3 + "Ω");
    const Rt = p.r1 + p.r2 + p.r3, I = p.voltage / Rt;
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit";
    ctx.fillText("I = " + r2(I) + " A (same through all three)", 40, 40);
  },
  graphPoint: (s, p) => {
    const Rt = p.r1 + p.r2 + p.r3, I = p.voltage / Rt;
    return { t: r2(s.t), V1: r2(I * p.r1), V2: r2(I * p.r2), V3: r2(I * p.r3) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "V1", label: "Voltage across R₁", color: "#2563eb" },
    { key: "V2", label: "Voltage across R₂", color: "#f59e0b" },
    { key: "V3", label: "Voltage across R₃", color: "#10b981" },
  ],
  stats: (s, p) => {
    const Rt = p.r1 + p.r2 + p.r3, I = p.voltage / Rt;
    return [
      { label: "Total resistance", value: Rt, unit: "Ω" },
      { label: "Current (same everywhere)", value: r2(I), unit: "A" },
      { label: "V across R₁,R₂,R₃", value: `${r2(I * p.r1)}, ${r2(I * p.r2)}, ${r2(I * p.r3)}`, unit: "V" },
    ];
  },
};

/* ============ 2. PARALLEL CIRCUIT ============
   Three resistors as separate branches — same voltage across each,
   current splits between branches. */
const parallelcircuit = {
  title: "Parallel Circuit", topic: "electricity", difficulty: "Beginner",
  summary: "Three resistor branches between the same two rails — each sees the full voltage, but current divides between them.",
  equation: "\\frac{1}{R_{total}} = \\frac{1}{R_1}+\\frac{1}{R_2}+\\frac{1}{R_3}, \\quad V \\text{ same across each}",
  params: [
    { key: "r1", label: "R₁", min: 1, max: 20, step: 1, default: 6, unit: "Ω" },
    { key: "r2", label: "R₂", min: 1, max: 20, step: 1, default: 10, unit: "Ω" },
    { key: "r3", label: "R₃", min: 1, max: 20, step: 1, default: 15, unit: "Ω" },
    { key: "voltage", label: "Battery voltage", min: 1, max: 24, step: 1, default: 12, unit: "V" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const x0 = 80, x1 = W - 80, top = 60, bot = H - 60;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x1, top); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, bot); ctx.lineTo(x1, bot); ctx.stroke();
    [0.3, 0.5, 0.7].forEach((f, i) => {
      const x = x0 + (x1 - x0) * f;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
      const r = [p.r1, p.r2, p.r3][i];
      resistorBox(ctx, x, (top + bot) / 2, 28, 60, r + "Ω");
    });
    const Rt = 1 / (1 / p.r1 + 1 / p.r2 + 1 / p.r3);
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit";
    ctx.fillText("R_total = " + r2(Rt) + " Ω", 40, 30);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), I1: r2(p.voltage / p.r1), I2: r2(p.voltage / p.r2), I3: r2(p.voltage / p.r3) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "I1", label: "Current in R₁", color: "#2563eb" },
    { key: "I2", label: "Current in R₂", color: "#f59e0b" },
    { key: "I3", label: "Current in R₃", color: "#10b981" },
  ],
  stats: (s, p) => {
    const Rt = 1 / (1 / p.r1 + 1 / p.r2 + 1 / p.r3);
    const Itot = p.voltage / p.r1 + p.voltage / p.r2 + p.voltage / p.r3;
    return [
      { label: "Total resistance", value: r2(Rt), unit: "Ω" },
      { label: "Total current", value: r2(Itot), unit: "A" },
      { label: "I in R₁,R₂,R₃", value: `${r2(p.voltage / p.r1)}, ${r2(p.voltage / p.r2)}, ${r2(p.voltage / p.r3)}`, unit: "A" },
    ];
  },
};

/* ============ 3. KIRCHHOFF'S LAWS (junction rule) ============
   Two currents flow into a junction, one flows out — I1 + I2 = I3 no
   matter what the individual values are, illustrating KCL directly. */
const kirchhoff = {
  title: "Kirchhoff's Laws", topic: "electricity", difficulty: "Advanced",
  summary: "At any junction, current in always equals current out — set two branch currents and watch the third balance automatically.",
  equation: "\\Sigma I_{in} = \\Sigma I_{out} \\ (\\text{KCL}), \\qquad \\Sigma V = 0 \\text{ around a loop (KVL)}",
  params: [
    { key: "i1", label: "Current I₁ (into junction)", min: 0, max: 10, step: 0.5, default: 4, unit: "A" },
    { key: "i2", label: "Current I₂ (into junction)", min: 0, max: 10, step: 0.5, default: 3, unit: "A" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    circle(ctx, cx, cy, 8, "#334155");
    const draw2 = (angle, label, val, into) => {
      const x1 = cx + Math.cos(angle) * 130, y1 = cy + Math.sin(angle) * 130;
      const x2 = cx + Math.cos(angle) * 14, y2 = cy + Math.sin(angle) * 14;
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5;
      if (into) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x1, y1); ctx.stroke(); }
      ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
      ctx.fillText(label + " = " + val + "A", x1 - 20, y1 + (into ? -10 : 20));
    };
    draw2(Math.PI, "I₁", p.i1, true);
    draw2(Math.PI / 3, "I₂", p.i2, true);
    draw2(-Math.PI / 2, "I₃", r2(p.i1 + p.i2), false);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), Iin: r2(p.i1 + p.i2), Iout: r2(p.i1 + p.i2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "Iin", label: "Total current in (A)", color: "#2563eb" },
    { key: "Iout", label: "Current out I₃ (A)", color: "#10b981" },
  ],
  stats: (s, p) => [
    { label: "I₁ + I₂ (in)", value: r2(p.i1 + p.i2), unit: "A" },
    { label: "I₃ (out)", value: r2(p.i1 + p.i2), unit: "A" },
    { label: "Balanced?", value: "always (KCL)", unit: "" },
  ],
};

/* ============ 4. WHEATSTONE BRIDGE ============
   Four resistors in a diamond with a galvanometer across the middle —
   balance R1/R2 = R3/R4 to zero the galvanometer deflection. */
const wheatstonebridge = {
  title: "Wheatstone Bridge", topic: "electricity", difficulty: "Advanced",
  summary: "Balance the four arms of the bridge so the galvanometer reads zero — that's when R₁/R₂ = R₃/R₄.",
  equation: "\\text{Balanced when } \\frac{R_1}{R_2} = \\frac{R_3}{R_4}",
  params: [
    { key: "r1", label: "R₁", min: 1, max: 50, step: 1, default: 10, unit: "Ω" },
    { key: "r2", label: "R₂", min: 1, max: 50, step: 1, default: 20, unit: "Ω" },
    { key: "r3", label: "R₃", min: 1, max: 50, step: 1, default: 15, unit: "Ω" },
    { key: "r4", label: "R₄ (unknown, adjust to balance)", min: 1, max: 50, step: 1, default: 25, unit: "Ω" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, dx = 160, dy = 90;
    const top = { x: cx, y: cy - dy }, bot = { x: cx, y: cy + dy }, left = { x: cx - dx, y: cy }, right = { x: cx + dx, y: cy };
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    [[left, top], [top, right], [left, bot], [bot, right], [top, bot]].forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    resistorBox(ctx, (left.x + top.x) / 2, (left.y + top.y) / 2 - 10, 50, 22, p.r1 + "Ω");
    resistorBox(ctx, (top.x + right.x) / 2, (top.y + right.y) / 2 - 10, 50, 22, p.r2 + "Ω");
    resistorBox(ctx, (left.x + bot.x) / 2, (left.y + bot.y) / 2 + 10, 50, 22, p.r3 + "Ω");
    resistorBox(ctx, (bot.x + right.x) / 2, (bot.y + right.y) / 2 + 10, 50, 22, p.r4 + "Ω");
    const imbalance = p.r1 * p.r4 - p.r2 * p.r3;
    circle(ctx, cx, cy, 20, Math.abs(imbalance) < 5 ? "#10b981" : "#f59e0b", "#334155");
    ctx.fillStyle = "#fff"; ctx.font = "700 11px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText("G", cx, cy + 4); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), imbalance: r2(p.r1 * p.r4 - p.r2 * p.r3) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "imbalance", label: "Bridge imbalance (R₁R₄ − R₂R₃)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "R₁/R₂", value: r2(p.r1 / p.r2), unit: "" },
    { label: "R₃/R₄", value: r2(p.r3 / p.r4), unit: "" },
    { label: "Balanced?", value: Math.abs(p.r1 / p.r2 - p.r3 / p.r4) < 0.05 ? "YES" : "no", unit: "" },
    { label: "Galvanometer", value: Math.abs(p.r1 * p.r4 - p.r2 * p.r3) < 5 ? "no deflection" : "deflects", unit: "" },
  ],
};

/* ============ 5. METER BRIDGE ============
   A practical slide-wire version of Wheatstone's bridge — slide the
   jockey along a 100cm wire to find the null point and compute the
   unknown resistance from the two lengths. */
const meterbridge = {
  title: "Meter Bridge", topic: "electricity", difficulty: "Advanced",
  summary: "Slide the jockey along a 100cm wire to find the balance point — the unknown resistance follows from the two lengths.",
  equation: "R_x = R_{known}\\cdot\\frac{l_1}{100-l_1}",
  params: [
    { key: "rknown", label: "Known resistance", min: 1, max: 50, step: 1, default: 10, unit: "Ω" },
    { key: "jockey", label: "Jockey position", min: 5, max: 95, step: 1, default: 40, unit: "cm" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const x0 = 80, x1 = W - 80, y = H / 2 + 30;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    const jx = x0 + (p.jockey / 100) * (x1 - x0);
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(jx, y - 50); ctx.lineTo(jx, y + 10); ctx.stroke();
    circle(ctx, jx, y - 55, 6, "#ef4444");
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText(p.jockey + "cm", jx, y + 30);
    ctx.fillText((100 - p.jockey) + "cm", (jx + x1) / 2, y + 30);
    ctx.textAlign = "left";
    resistorBox(ctx, x0 - 20, y - 80, 60, 26, p.rknown + "Ω known");
    const Rx = p.rknown * p.jockey / (100 - p.jockey);
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit";
    ctx.fillText("R_x = " + r2(Rx) + " Ω", 40, 30);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), Rx: r2((p.rknown * p.jockey) / (100 - p.jockey)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "Rx", label: "Computed unknown resistance (Ω)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Unknown resistance", value: r2((p.rknown * p.jockey) / (100 - p.jockey)), unit: "Ω" },
    { label: "l₁ (to jockey)", value: p.jockey, unit: "cm" },
    { label: "l₂ (remaining)", value: 100 - p.jockey, unit: "cm" },
    { label: "Known resistance", value: p.rknown, unit: "Ω" },
  ],
};

const simsCircuits = { seriescircuit, parallelcircuit, kirchhoff, wheatstonebridge, meterbridge };
export default simsCircuits;