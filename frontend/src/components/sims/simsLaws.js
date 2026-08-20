// Distinct Laws-of-Motion simulations — one concept, one sim.
// SimEngine-compatible configs. Save as components/sims/simsLaws.js
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;

function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function arrow(ctx, x1, y1, x2, y2, color, w = 2.5) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
  ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}
function box(ctx, x, y, w, h, color, stroke) {
  ctx.fillStyle = color; ctx.fillRect(x - w / 2, y - h / 2, w, h);
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h); }
}

/* ============ 1. NEWTON'S FIRST LAW (Inertia) ============
   A puck on a near-frictionless surface: with zero net force it keeps
   moving at constant velocity forever (or stays at rest). Toggle a small
   amount of friction to show what breaks the law's idealised case. */
const newton1 = {
  title: "Newton's First Law", topic: "mechanics", difficulty: "Beginner",
  summary: "An object at rest stays at rest, and one in motion stays in motion at constant velocity, unless a net force acts on it.",
  equation: "\\Sigma \\vec{F} = 0 \\ \\Rightarrow \\ \\vec{v} = \\text{constant}",
  params: [
    { key: "v0", label: "Initial velocity", min: 0, max: 12, step: 1, default: 5, unit: "m/s" },
    { key: "friction", label: "Surface friction", min: 0, max: 0.15, step: 0.005, default: 0, unit: "" },
  ],
  init: (p) => ({ x: 0, v: p.v0, t: 0 }),
  step: (s, dt, p) => {
    const decel = p.friction * 9.8;
    if (s.v > 0) { s.v = Math.max(0, s.v - decel * dt); }
    s.x += s.v * dt; s.t += dt;
    if (s.t > 10) { s.x = 0; s.v = p.v0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2 + 30;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 26); ctx.lineTo(W - 40, trackY + 26); ctx.stroke();
    let px = 60 + (((s.x * 8) % (W - 120)) + (W - 120)) % (W - 120);
    box(ctx, px, trackY + 6, 40, 24, "#2563eb", "#1e40af");
    if (s.v > 0.05) arrow(ctx, px, trackY - 14, px + Math.min(60, s.v * 5), trackY - 14, "#f59e0b");
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText(p.friction === 0 ? "No net force — velocity stays constant" : "Small friction slowly removes momentum", 40, 40);
  },
  graphPoint: (s) => ({ t: r2(s.t), v: r2(s.v), x: r2(s.x) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v", label: "Velocity (m/s)", color: "#f59e0b" },
    { key: "x", label: "Position (m)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "Net force", value: r2(-p.friction * 9.8 * (s.v > 0 ? 1 : 0)), unit: "N/kg" },
    { label: "State", value: s.v > 0.05 ? "moving" : "at rest", unit: "" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 2. NEWTON'S THIRD LAW (Action-Reaction) ============
   Two skaters push off each other from rest. Equal and opposite forces
   act for the same time, so momentum is conserved and lighter skater
   flies off faster. */
const newton3 = {
  title: "Newton's Third Law", topic: "mechanics", difficulty: "Beginner",
  summary: "Two skaters push off each other — equal and opposite forces act on each, but the lighter one flies off faster.",
  equation: "\\vec{F}_{A\\,on\\,B} = -\\vec{F}_{B\\,on\\,A}",
  params: [
    { key: "m1", label: "Skater A mass", min: 20, max: 100, step: 5, default: 40, unit: "kg" },
    { key: "m2", label: "Skater B mass", min: 20, max: 100, step: 5, default: 70, unit: "kg" },
    { key: "force", label: "Push force", min: 50, max: 400, step: 10, default: 200, unit: "N" },
  ],
  init: () => ({ x1: -20, x2: 20, v1: 0, v2: 0, t: 0, pushed: false }),
  step: (s, dt, p) => {
    const pushTime = 0.4;
    if (s.t < pushTime) {
      const a1 = p.force / p.m1, a2 = p.force / p.m2;
      s.v1 -= a1 * dt; s.v2 += a2 * dt;
    }
    s.x1 += s.v1 * dt * 20; s.x2 += s.v2 * dt * 20;
    s.t += dt;
    if (s.t > 6) { s.x1 = -20; s.x2 = 20; s.v1 = 0; s.v2 = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, cx = W / 2;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, cy + 30); ctx.lineTo(W - 30, cy + 30); ctx.stroke();
    circle(ctx, cx + s.x1, cy, 14 + p.m1 / 8, "#2563eb", "#1e40af");
    circle(ctx, cx + s.x2, cy, 14 + p.m2 / 8, "#f59e0b", "#b45309");
    if (s.t < 0.4) { arrow(ctx, cx, cy - 40, cx - 40, cy - 40, "#ef4444"); arrow(ctx, cx, cy - 40, cx + 40, cy - 40, "#ef4444"); }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), p1: r2(-p.m1 * s.v1), p2: r2(p.m2 * s.v2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "p1", label: "Momentum of A (kg·m/s)", color: "#2563eb" },
    { key: "p2", label: "Momentum of B (kg·m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Skater A speed", value: r2(Math.abs(s.v1)), unit: "m/s" },
    { label: "Skater B speed", value: r2(Math.abs(s.v2)), unit: "m/s" },
    { label: "Force on each (equal)", value: p.force, unit: "N" },
    { label: "Momentum sum", value: r2(-p.m1 * s.v1 + p.m2 * s.v2 - (p.m2 * s.v2)), unit: "≈0" },
  ],
};

/* ============ 3. FORCE (resultant of multiple forces) ============
   Two adjustable force vectors act on a point mass; shows the resultant
   and how the object accelerates along it. */
const force = {
  title: "Force & Resultants", topic: "mechanics", difficulty: "Beginner",
  summary: "Combine two forces acting on an object and see the resultant force determine its acceleration.",
  equation: "\\vec{F}_{net} = \\vec{F}_1 + \\vec{F}_2 = m\\vec{a}",
  params: [
    { key: "f1", label: "Force 1 magnitude", min: 0, max: 40, step: 1, default: 20, unit: "N" },
    { key: "ang1", label: "Force 1 angle", min: 0, max: 360, step: 5, default: 0, unit: "°" },
    { key: "f2", label: "Force 2 magnitude", min: 0, max: 40, step: 1, default: 15, unit: "N" },
    { key: "ang2", label: "Force 2 angle", min: 0, max: 360, step: 5, default: 90, unit: "°" },
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
  ],
  init: () => ({ x: 0, y: 0, vx: 0, vy: 0, t: 0 }),
  step: (s, dt, p) => {
    const fx = p.f1 * Math.cos(p.ang1 * RAD) + p.f2 * Math.cos(p.ang2 * RAD);
    const fy = -(p.f1 * Math.sin(p.ang1 * RAD) + p.f2 * Math.sin(p.ang2 * RAD));
    s.vx += (fx / p.mass) * dt; s.vy += (fy / p.mass) * dt;
    s.x += s.vx * dt; s.y += s.vy * dt; s.t += dt;
    if (s.t > 4) { s.x = 0; s.y = 0; s.vx = 0; s.vy = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, sc = 3.4;
    const f1x = p.f1 * Math.cos(p.ang1 * RAD), f1y = -p.f1 * Math.sin(p.ang1 * RAD);
    const f2x = p.f2 * Math.cos(p.ang2 * RAD), f2y = -p.f2 * Math.sin(p.ang2 * RAD);
    circle(ctx, cx, cy, 16, "#2563eb", "#1e40af");
    arrow(ctx, cx, cy, cx + f1x * sc, cy + f1y * sc, "#f59e0b", 2.5);
    arrow(ctx, cx, cy, cx + f2x * sc, cy + f2y * sc, "#10b981", 2.5);
    arrow(ctx, cx, cy, cx + (f1x + f2x) * sc, cy + (f1y + f2y) * sc, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("net", cx + (f1x + f2x) * sc + 8, cy + (f1y + f2y) * sc);
  },
  graphPoint: (s, p) => {
    const fx = p.f1 * Math.cos(p.ang1 * RAD) + p.f2 * Math.cos(p.ang2 * RAD);
    const fy = p.f1 * Math.sin(p.ang1 * RAD) + p.f2 * Math.sin(p.ang2 * RAD);
    return { t: r2(s.t), Fnet: r2(Math.hypot(fx, fy)), a: r2(Math.hypot(fx, fy) / p.mass) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "Fnet", label: "Net force (N)", color: "#ef4444" },
    { key: "a", label: "Acceleration (m/s²)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const fx = p.f1 * Math.cos(p.ang1 * RAD) + p.f2 * Math.cos(p.ang2 * RAD);
    const fy = p.f1 * Math.sin(p.ang1 * RAD) + p.f2 * Math.sin(p.ang2 * RAD);
    return [
      { label: "Net force", value: r2(Math.hypot(fx, fy)), unit: "N" },
      { label: "Direction", value: r2(((Math.atan2(fy, fx) / RAD) + 360) % 360), unit: "°" },
      { label: "Acceleration", value: r2(Math.hypot(fx, fy) / p.mass), unit: "m/s²" },
      { label: "Mass", value: p.mass, unit: "kg" },
    ];
  },
};

/* ============ 4. MASS (inertia comparison) ============
   Same force applied to two different masses side by side — shows a=F/m
   directly by how far each block travels in the same time. */
const mass = {
  title: "Mass & Inertia", topic: "mechanics", difficulty: "Beginner",
  summary: "Push two different masses with the same force and see the lighter one accelerate faster — mass measures inertia.",
  equation: "a = \\frac{F}{m} \\quad (\\text{same } F,\\ \\text{different } m \\Rightarrow \\text{different } a)",
  params: [
    { key: "force", label: "Applied force (both)", min: 5, max: 50, step: 5, default: 20, unit: "N" },
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 2, unit: "kg" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 6, unit: "kg" },
  ],
  init: () => ({ x1: 0, x2: 0, v1: 0, v2: 0, t: 0 }),
  step: (s, dt, p) => {
    s.v1 += (p.force / p.m1) * dt; s.v2 += (p.force / p.m2) * dt;
    s.x1 += s.v1 * dt; s.x2 += s.v2 * dt; s.t += dt;
    if (s.t > 5) { s.x1 = 0; s.x2 = 0; s.v1 = 0; s.v2 = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const lane1 = H / 2 - 40, lane2 = H / 2 + 40;
    [lane1, lane2].forEach((y) => {
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, y + 20); ctx.lineTo(W - 40, y + 20); ctx.stroke();
    });
    let px1 = 60 + Math.min(W - 140, s.x1 * 8), px2 = 60 + Math.min(W - 140, s.x2 * 8);
    box(ctx, px1, lane1, 24 + p.m1 * 3, 24 + p.m1 * 3, "#2563eb", "#1e40af");
    box(ctx, px2, lane2, 24 + p.m2 * 3, 24 + p.m2 * 3, "#f59e0b", "#b45309");
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText(p.m1 + "kg", px1, lane1 - 24); ctx.fillText(p.m2 + "kg", px2, lane2 - 24);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v1: r2(s.v1), v2: r2(s.v2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v1", label: "Velocity of mass 1 (m/s)", color: "#2563eb" },
    { key: "v2", label: "Velocity of mass 2 (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Accel. of m₁", value: r2(p.force / p.m1), unit: "m/s²" },
    { label: "Accel. of m₂", value: r2(p.force / p.m2), unit: "m/s²" },
    { label: "v of m₁", value: r2(s.v1), unit: "m/s" },
    { label: "v of m₂", value: r2(s.v2), unit: "m/s" },
  ],
};

/* ============ 5. WEIGHT ============
   Same mass on a scale under adjustable gravity — shows weight = mg
   changes with gravity even though mass doesn't. */
const weight = {
  title: "Weight", topic: "mechanics", difficulty: "Beginner",
  summary: "The same mass weighs differently depending on gravity — weight is a force, mass is not.",
  equation: "W = mg",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 100, step: 1, default: 60, unit: "kg" },
    { key: "gravity", label: "Gravity", min: 0.5, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, topY = 60;
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 60, topY - 12, 120, 10);
    circle(ctx, cx, topY - 7, 4, "#334155");
    const W_ = p.mass * p.gravity;
    const stretch = Math.min(180, 30 + W_ / 12);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, topY + stretch); ctx.stroke();
    box(ctx, cx, topY + stretch + 24, 46, 46, "#2563eb", "#1e40af");
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText(r2(W_) + " N", cx, topY + stretch + 70);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), weight: r2(p.mass * p.gravity) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "weight", label: "Weight (N)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Mass (constant)", value: p.mass, unit: "kg" },
    { label: "Gravity", value: p.gravity, unit: "m/s²" },
    { label: "Weight", value: r2(p.mass * p.gravity), unit: "N" },
    { label: "Weight on Moon (g=1.6)", value: r2(p.mass * 1.6), unit: "N" },
  ],
};

/* ============ 6. FREE-BODY DIAGRAMS ============
   A block with every force drawn as its own arrow: weight, normal,
   applied, friction. Adjustable sliders update the diagram live. */
const freebody = {
  title: "Free-Body Diagrams", topic: "mechanics", difficulty: "Intermediate",
  summary: "Build a free-body diagram for a block on a surface — see weight, normal, applied force and friction all at once.",
  equation: "\\Sigma \\vec{F} = \\vec{N} + \\vec{W} + \\vec{F}_{app} + \\vec{f}",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "applied", label: "Applied force", min: 0, max: 40, step: 1, default: 15, unit: "N" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 0.6, step: 0.02, default: 0.2, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const Wt = p.mass * p.gravity, N = Wt, fmax = p.mu * N;
    const f = Math.min(p.applied, fmax);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 220, cy + 40); ctx.lineTo(cx + 220, cy + 40); ctx.stroke();
    box(ctx, cx, cy, 60, 60, "#e2e8f0", "#334155");
    arrow(ctx, cx, cy, cx, cy + 70, "#ef4444", 2.5);
    arrow(ctx, cx, cy, cx, cy - 70, "#2563eb", 2.5);
    arrow(ctx, cx, cy, cx + Math.min(90, p.applied * 2.2), cy, "#f59e0b", 2.5);
    if (f > 0.5) arrow(ctx, cx, cy, cx - Math.min(90, f * 2.2), cy, "#10b981", 2.5);
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'";
    ctx.fillText("W", cx + 8, cy + 76); ctx.fillText("N", cx + 8, cy - 74);
    ctx.fillText("F_app", cx + Math.min(90, p.applied * 2.2) + 6, cy - 4);
    if (f > 0.5) ctx.fillText("friction", cx - Math.min(90, f * 2.2) - 46, cy - 4);
  },
  graphPoint: (s, p) => {
    const N = p.mass * p.gravity, fmax = p.mu * N;
    return { t: r2(s.t), applied: p.applied, friction: r2(Math.min(p.applied, fmax)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "applied", label: "Applied force (N)", color: "#f59e0b" },
    { key: "friction", label: "Friction response (N)", color: "#10b981" },
  ],
  stats: (s, p) => {
    const N = p.mass * p.gravity, fmax = p.mu * N;
    return [
      { label: "Weight", value: r2(N), unit: "N" },
      { label: "Normal force", value: r2(N), unit: "N" },
      { label: "Max static friction", value: r2(fmax), unit: "N" },
      { label: "State", value: p.applied > fmax ? "sliding" : "static", unit: "" },
    ];
  },
};

/* ============ 7. NORMAL FORCE ============
   A block on a surface you can tilt — shows N = mg cosθ, separate from
   the full Inclined Plane sim which focuses on sliding/acceleration. */
const normalforce = {
  title: "Normal Force", topic: "mechanics", difficulty: "Beginner",
  summary: "Tilt the surface and watch the normal force shrink from mg to mg cosθ as the angle increases.",
  equation: "N = mg\\cos\\theta",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 5, unit: "kg" },
    { key: "angle", label: "Surface tilt", min: 0, max: 60, step: 1, default: 0, unit: "°" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const th = p.angle * RAD, cx = W / 2, cy = H / 2 + 40, len = 200;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-th);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len, 0); ctx.stroke();
    box(ctx, 0, -30, 50, 50, "#2563eb", "#1e40af");
    const N = p.mass * p.gravity * Math.cos(th);
    arrow(ctx, 0, -30, 0, -30 - N * 2.2, "#10b981", 2.5);
    ctx.restore();
    arrow(ctx, cx, cy - 30, cx, cy - 30 + p.mass * p.gravity * 2.2, "#ef4444", 2.5);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("N (green) shrinks as tilt increases", 20, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), N: r2(p.mass * p.gravity * Math.cos(p.angle * RAD)), W: r2(p.mass * p.gravity) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "N", label: "Normal force (N)", color: "#10b981" },
    { key: "W", label: "Weight (N)", color: "#ef4444" },
  ],
  stats: (s, p) => [
    { label: "Normal force", value: r2(p.mass * p.gravity * Math.cos(p.angle * RAD)), unit: "N" },
    { label: "Weight", value: r2(p.mass * p.gravity), unit: "N" },
    { label: "Angle", value: p.angle, unit: "°" },
    { label: "N/W ratio", value: r2(Math.cos(p.angle * RAD)), unit: "" },
  ],
};

/* ============ 8. TENSION ============
   A mass hanging from a string inside an accelerating "elevator" —
   apparent tension changes with acceleration: T = m(g + a). */
const tension = {
  title: "Tension", topic: "mechanics", difficulty: "Beginner",
  summary: "A mass hangs from a string in an accelerating lift — tension isn't always just the weight.",
  equation: "T = m(g + a)",
  params: [
    { key: "mass", label: "Hanging mass", min: 1, max: 20, step: 0.5, default: 8, unit: "kg" },
    { key: "accel", label: "Lift acceleration (+up/-down)", min: -6, max: 6, step: 0.5, default: 0, unit: "m/s²" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, ceilY = 50;
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 70, ceilY - 10, 140, 8);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, ceilY); ctx.lineTo(cx, ceilY + 140); ctx.stroke();
    circle(ctx, cx, ceilY + 160, 26, "#2563eb", "#1e40af");
    const T = p.mass * (p.gravity + p.accel);
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText("T = " + r2(T) + " N", cx, ceilY + 210);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), T: r2(p.mass * (p.gravity + p.accel)), W: r2(p.mass * p.gravity) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "T", label: "Tension (N)", color: "#2563eb" },
    { key: "W", label: "Weight at rest (N)", color: "#94a3b8" },
  ],
  stats: (s, p) => [
    { label: "Tension", value: r2(p.mass * (p.gravity + p.accel)), unit: "N" },
    { label: "Weight (static)", value: r2(p.mass * p.gravity), unit: "N" },
    { label: "Lift state", value: p.accel > 0 ? "accelerating up" : p.accel < 0 ? "accelerating down" : "at rest / constant v", unit: "" },
  ],
};

/* ============ 9. FRICTION (static vs kinetic) ============
   Ramp up an applied force and watch the block resist via static
   friction until it exceeds max static friction, then slide under
   (lower) kinetic friction. */
const friction = {
  title: "Static vs Kinetic Friction", topic: "mechanics", difficulty: "Beginner",
  summary: "Push harder and harder — the block won't move until you beat static friction, then kinetic friction takes over.",
  equation: "f_s \\le \\mu_s N, \\quad f_k = \\mu_k N",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "applied", label: "Applied force", min: 0, max: 60, step: 1, default: 10, unit: "N" },
    { key: "muS", label: "Static μ", min: 0.05, max: 0.8, step: 0.02, default: 0.4, unit: "" },
    { key: "muK", label: "Kinetic μ", min: 0.02, max: 0.6, step: 0.02, default: 0.25, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ x: 0, v: 0, t: 0, sliding: false }),
  step: (s, dt, p) => {
    const N = p.mass * p.gravity;
    const fsMax = p.muS * N, fk = p.muK * N;
    if (!s.sliding) {
      if (p.applied > fsMax) s.sliding = true;
      else { s.v = 0; }
    }
    if (s.sliding) {
      const net = p.applied - fk;
      const a = net / p.mass;
      s.v += a * dt; if (s.v < 0) { s.v = 0; s.sliding = false; }
      s.x += s.v * dt;
    }
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2 + 30;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 26); ctx.lineTo(W - 40, trackY + 26); ctx.stroke();
    let px = 80 + ((s.x * 12) % (W - 160));
    box(ctx, px, trackY, 40, 28, s.sliding ? "#f59e0b" : "#2563eb", "#1e40af");
    arrow(ctx, px + 22, trackY, px + 22 + Math.min(60, p.applied * 1.4), trackY, "#ef4444", 2.5);
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit";
    ctx.fillText(s.sliding ? "SLIDING (kinetic friction)" : "STATIC (not moving)", 40, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), applied: p.applied, v: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "applied", label: "Applied force (N)", color: "#ef4444" },
    { key: "v", label: "Velocity (m/s)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const N = p.mass * p.gravity;
    return [
      { label: "Max static friction", value: r2(p.muS * N), unit: "N" },
      { label: "Kinetic friction", value: r2(p.muK * N), unit: "N" },
      { label: "State", value: s.sliding ? "sliding" : "static", unit: "" },
      { label: "Velocity", value: r2(s.v), unit: "m/s" },
    ];
  },
};

/* ============ 10. CONNECTED BODIES ============
   Two blocks connected by a string on a horizontal surface, pulled by
   an external force — common acceleration and the string tension
   between them, distinct from the vertical Atwood "pulley" sim. */
const connectedbodies = {
  title: "Connected Bodies", topic: "mechanics", difficulty: "Intermediate",
  summary: "Pull two blocks connected by a string across a surface — they share one acceleration, linked by tension.",
  equation: "a = \\frac{F - \\mu(m_1+m_2)g}{m_1+m_2}, \\quad T = m_2 a + \\mu m_2 g",
  params: [
    { key: "m1", label: "Front mass (m₁)", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "m2", label: "Back mass (m₂)", min: 1, max: 10, step: 0.5, default: 5, unit: "kg" },
    { key: "force", label: "Pulling force", min: 0, max: 80, step: 2, default: 40, unit: "N" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 0.4, step: 0.02, default: 0.1, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ x: 0, v: 0, t: 0 }),
  step: (s, dt, p) => {
    const totalM = p.m1 + p.m2;
    const fric = p.mu * totalM * p.gravity;
    const net = Math.max(0, p.force - fric);
    const a = net / totalM;
    s.v += a * dt; s.x += s.v * dt; s.t += dt;
    if (s.t > 6) { s.x = 0; s.v = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2 + 30;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 26); ctx.lineTo(W - 40, trackY + 26); ctx.stroke();
    let px = 90 + ((s.x * 12) % (W - 220));
    const w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    box(ctx, px, trackY, w1, w1, "#2563eb", "#1e40af");
    box(ctx, px - (w1 + w2) / 2 - 30, trackY, w2, w2, "#f59e0b", "#b45309");
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px - w1 / 2, trackY); ctx.lineTo(px - (w1 + w2) / 2 - 30 + w2 / 2, trackY); ctx.stroke();
    arrow(ctx, px + w1 / 2, trackY, px + w1 / 2 + Math.min(60, p.force * 1.2), trackY, "#ef4444", 2.5);
  },
  graphPoint: (s, p) => {
    const totalM = p.m1 + p.m2, fric = p.mu * totalM * p.gravity;
    const a = Math.max(0, (p.force - fric) / totalM);
    const T = p.m2 * a + p.mu * p.m2 * p.gravity;
    return { t: r2(s.t), v: r2(s.v), T: r2(T) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v", label: "Common velocity (m/s)", color: "#2563eb" },
    { key: "T", label: "String tension (N)", color: "#f59e0b" },
  ],
  stats: (s, p) => {
    const totalM = p.m1 + p.m2, fric = p.mu * totalM * p.gravity;
    const a = Math.max(0, (p.force - fric) / totalM);
    const T = p.m2 * a + p.mu * p.m2 * p.gravity;
    return [
      { label: "Common acceleration", value: r2(a), unit: "m/s²" },
      { label: "Tension in string", value: r2(T), unit: "N" },
      { label: "Total friction", value: r2(fric), unit: "N" },
      { label: "Velocity", value: r2(s.v), unit: "m/s" },
    ];
  },
};

const simsLaws = {
  newton1, newton3, force, mass, weight, freebody, normalforce, tension, friction, connectedbodies,
};
export default simsLaws;