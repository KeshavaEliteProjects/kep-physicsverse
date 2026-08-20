// Distinct Momentum & Collisions simulations — one concept, one sim.
// Save as components/sims/simsMomentum.js
const r2 = (x) => Math.round(x * 100) / 100;

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

/* ============ 1. LINEAR MOMENTUM ============ */
const linearmomentum = {
  title: "Linear Momentum", topic: "mechanics", difficulty: "Beginner",
  summary: "Change the mass and velocity of a moving object and watch its momentum vector scale with both.",
  equation: "\\vec{p} = m\\vec{v}",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 20, step: 1, default: 6, unit: "kg" },
    { key: "velocity", label: "Velocity", min: -12, max: 12, step: 1, default: 6, unit: "m/s" },
  ],
  init: () => ({ x: 0, t: 0 }),
  step: (s, dt, p) => { s.x += p.velocity * dt; s.t += dt; if (Math.abs(s.x) > 30) { s.x = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2, cx = W / 2;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 30); ctx.lineTo(W - 40, trackY + 30); ctx.stroke();
    const px = cx + ((s.x * 10) % (W - 160));
    box(ctx, px, trackY, 24 + p.mass * 2.5, 24 + p.mass * 2.5, "#2563eb", "#1e40af");
    arrow(ctx, px, trackY - 40, px + p.velocity * 6, trackY - 40, "#f59e0b", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("p = " + r2(p.mass * p.velocity) + " kg·m/s", 40, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), momentum: r2(p.mass * p.velocity), velocity: p.velocity }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "momentum", label: "Momentum (kg·m/s)", color: "#2563eb" },
    { key: "velocity", label: "Velocity (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Momentum", value: r2(p.mass * p.velocity), unit: "kg·m/s" },
    { label: "Mass", value: p.mass, unit: "kg" },
    { label: "Velocity", value: p.velocity, unit: "m/s" },
    { label: "Direction", value: p.velocity >= 0 ? "forward" : "backward", unit: "" },
  ],
};

/* ============ 2. IMPULSE ============ */
const impulse = {
  title: "Impulse", topic: "mechanics", difficulty: "Intermediate",
  summary: "A bat strikes a ball — impulse is the area under the force-time graph, and it equals the change in momentum.",
  equation: "J = F\\Delta t = \\Delta p",
  params: [
    { key: "force", label: "Strike force", min: 20, max: 300, step: 10, default: 150, unit: "N" },
    { key: "duration", label: "Contact time", min: 0.02, max: 0.3, step: 0.01, default: 0.08, unit: "s" },
    { key: "mass", label: "Ball mass", min: 0.1, max: 2, step: 0.1, default: 0.5, unit: "kg" },
  ],
  init: () => ({ x: 0, v: 0, t: 0 }),
  step: (s, dt, p) => {
    if (s.t < p.duration) { s.v += (p.force / p.mass) * dt; }
    s.x += s.v * dt; s.t += dt;
    if (s.t > 3) { s.x = 0; s.v = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2 + 40;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 20); ctx.lineTo(W - 40, trackY + 20); ctx.stroke();
    const px = 80 + Math.min(W - 160, s.x * 8);
    circle(ctx, px, trackY, 12, "#f59e0b", "#b45309");
    if (s.t < p.duration) box(ctx, px - 30, trackY, 16, 40, "#2563eb", "#1e40af");
    const bx0 = 40, by0 = 40, bw = 140, bh = 60;
    ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(bx0, by0, bw, bh);
    const rectW = Math.min(bw, (p.duration / 0.3) * bw);
    const rectH = Math.min(bh, (p.force / 300) * bh);
    ctx.fillStyle = "rgba(37,99,235,.35)"; ctx.fillRect(bx0, by0 + bh - rectH, rectW, rectH);
    ctx.fillStyle = "#334155"; ctx.font = "600 10px 'Source Code Pro'";
    ctx.fillText("F–t area = impulse", bx0, by0 - 6);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v: r2(s.v), F: s.t < p.duration ? p.force : 0 }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "F", label: "Force (N)", color: "#ef4444" },
    { key: "v", label: "Ball velocity (m/s)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Impulse", value: r2(p.force * p.duration), unit: "N·s" },
    { label: "Δv from impulse", value: r2((p.force * p.duration) / p.mass), unit: "m/s" },
    { label: "Current velocity", value: r2(s.v), unit: "m/s" },
    { label: "Contact time", value: p.duration, unit: "s" },
  ],
};

/* ============ 3. CONSERVATION OF MOMENTUM (explosion / recoil) ============ */
const momentumconservation = {
  title: "Conservation of Momentum", topic: "mechanics", difficulty: "Intermediate",
  summary: "Two blocks at rest push apart in an internal explosion — total momentum stays zero the whole time.",
  equation: "p_{before} = p_{after} \\quad (\\text{no external force})",
  params: [
    { key: "m1", label: "Block 1 mass", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "m2", label: "Block 2 mass", min: 1, max: 10, step: 0.5, default: 6, unit: "kg" },
    { key: "energy", label: "Explosion energy", min: 10, max: 200, step: 10, default: 90, unit: "J" },
  ],
  init: () => ({ x1: 0, x2: 0, v1: 0, v2: 0, t: 0, exploded: false }),
  step: (s, dt, p) => {
    if (!s.exploded) {
      s.exploded = true;
      const v2 = Math.sqrt((2 * p.energy * p.m1) / (p.m2 * (p.m1 + p.m2)));
      const v1 = (p.m2 * v2) / p.m1;
      s.v1 = -v1; s.v2 = v2;
    }
    s.x1 += s.v1 * dt; s.x2 += s.v2 * dt; s.t += dt;
    if (s.t > 4) { s.x1 = 0; s.x2 = 0; s.exploded = false; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, cx = W / 2;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, cy + 30); ctx.lineTo(W - 30, cy + 30); ctx.stroke();
    const w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    box(ctx, cx + s.x1 * 14, cy, w1, w1, "#2563eb", "#1e40af");
    box(ctx, cx + s.x2 * 14, cy, w2, w2, "#f59e0b", "#b45309");
    if (s.t < 0.15) { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill(); }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), p1: r2(p.m1 * s.v1), p2: r2(p.m2 * s.v2), total: r2(p.m1 * s.v1 + p.m2 * s.v2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "p1", label: "Momentum of block 1", color: "#2563eb" },
    { key: "p2", label: "Momentum of block 2", color: "#f59e0b" },
    { key: "total", label: "Total momentum", color: "#10b981" },
  ],
  stats: (s, p) => [
    { label: "Momentum 1", value: r2(p.m1 * s.v1), unit: "kg·m/s" },
    { label: "Momentum 2", value: r2(p.m2 * s.v2), unit: "kg·m/s" },
    { label: "Total momentum", value: r2(p.m1 * s.v1 + p.m2 * s.v2), unit: "≈0" },
    { label: "Speed ratio v1:v2", value: p.m1 > 0 ? r2(p.m2 / p.m1) : 0, unit: "" },
  ],
};

/* ============ 4. ELASTIC COLLISION (restitution fixed at 1) ============ */
const elasticcollision = {
  title: "Elastic Collision", topic: "mechanics", difficulty: "Intermediate",
  summary: "Two carts collide and bounce apart with kinetic energy fully conserved — the hallmark of an elastic collision.",
  equation: "m_1u_1+m_2u_2=m_1v_1+m_2v_2, \\quad KE_{before}=KE_{after}",
  params: [
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "u1", label: "Velocity 1", min: -6, max: 6, step: 0.5, default: 4, unit: "m/s" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 5, unit: "kg" },
    { key: "u2", label: "Velocity 2", min: -6, max: 6, step: 0.5, default: -1, unit: "m/s" },
  ],
  init: (p) => ({ x1: 220, x2: 540, v1: p.u1, v2: p.u2, t: 0 }),
  step: (s, dt, p) => {
    const SP = 46;
    s.x1 += s.v1 * SP * dt; s.x2 += s.v2 * SP * dt; s.t += dt;
    const w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    if (s.x1 - w1 / 2 < 70) { s.x1 = 70 + w1 / 2; s.v1 = Math.abs(s.v1); }
    if (s.x2 + w2 / 2 > 690) { s.x2 = 690 - w2 / 2; s.v2 = -Math.abs(s.v2); }
    const gap = s.x2 - s.x1 - (w1 + w2) / 2;
    if (gap < 0 && s.v1 - s.v2 > 0) {
      const { m1, m2 } = p, u1 = s.v1, u2 = s.v2;
      s.v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
      s.v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);
      const overlap = -gap + 1; s.x1 -= overlap / 2; s.x2 += overlap / 2;
    }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2 + 20, w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, cy + 34); ctx.lineTo(700, cy + 34); ctx.stroke();
    box(ctx, s.x1, cy + 32 - w1 / 2, w1, w1, "#2563eb", "#1e40af");
    box(ctx, s.x2, cy + 32 - w2 / 2, w2, w2, "#f59e0b", "#b45309");
    const ke = 0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2;
    const ke0 = 0.5 * p.m1 * p.u1 * p.u1 + 0.5 * p.m2 * p.u2 * p.u2;
    ctx.fillStyle = "#10b981"; ctx.font = "700 13px Outfit";
    ctx.fillText("KE conserved: " + r2(ke) + " J (started " + r2(ke0) + " J)", 60, 40);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), ke: r2(0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2), p: r2(p.m1 * s.v1 + p.m2 * s.v2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "ke", label: "Total KE (J)", color: "#10b981" },
    { key: "p", label: "Total momentum (kg·m/s)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Velocity 1", value: r2(s.v1), unit: "m/s" },
    { label: "Velocity 2", value: r2(s.v2), unit: "m/s" },
    { label: "Total KE", value: r2(0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2), unit: "J" },
    { label: "Momentum", value: r2(p.m1 * s.v1 + p.m2 * s.v2), unit: "kg·m/s" },
  ],
};

/* ============ 5. INELASTIC COLLISION (restitution fixed at 0) ============ */
const inelasticcollision = {
  title: "Inelastic Collision", topic: "mechanics", difficulty: "Intermediate",
  summary: "Two carts collide and stick together — momentum survives, but a visible chunk of kinetic energy is lost.",
  equation: "m_1u_1+m_2u_2=(m_1+m_2)v, \\quad \\Delta KE = KE_{before}-KE_{after}",
  params: [
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "u1", label: "Velocity 1", min: -6, max: 6, step: 0.5, default: 5, unit: "m/s" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "u2", label: "Velocity 2", min: -6, max: 6, step: 0.5, default: 0, unit: "m/s" },
  ],
  init: (p) => ({ x1: 220, x2: 540, v1: p.u1, v2: p.u2, t: 0, stuck: false }),
  step: (s, dt, p) => {
    const SP = 46;
    if (!s.stuck) {
      s.x1 += s.v1 * SP * dt; s.x2 += s.v2 * SP * dt;
      const w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
      const gap = s.x2 - s.x1 - (w1 + w2) / 2;
      if (gap < 0 && s.v1 - s.v2 > 0) {
        const vCombined = (p.m1 * s.v1 + p.m2 * s.v2) / (p.m1 + p.m2);
        s.v1 = vCombined; s.v2 = vCombined; s.stuck = true;
      }
    } else {
      s.x1 += s.v1 * SP * dt; s.x2 = s.x1 + (24 + p.m1 * 3) / 2 + (24 + p.m2 * 3) / 2;
    }
    s.t += dt;
    if (s.t > 5) { s.x1 = 220; s.x2 = 540; s.v1 = p.u1; s.v2 = p.u2; s.stuck = false; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2 + 20, w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, cy + 34); ctx.lineTo(700, cy + 34); ctx.stroke();
    box(ctx, s.x1, cy + 32 - w1 / 2, w1, w1, "#2563eb", "#1e40af");
    box(ctx, s.x2, cy + 32 - w2 / 2, w2, w2, "#f59e0b", "#b45309");
    const keNow = 0.5 * (p.m1 + p.m2) * s.v1 * s.v1;
    const ke0 = 0.5 * p.m1 * p.u1 * p.u1 + 0.5 * p.m2 * p.u2 * p.u2;
    ctx.fillStyle = "#ef4444"; ctx.font = "700 13px Outfit";
    ctx.fillText("KE lost: " + r2(ke0 - (s.stuck ? keNow : ke0)) + " J", 60, 40);
  },
  graphPoint: (s, p) => {
    const keNow = s.stuck ? 0.5 * (p.m1 + p.m2) * s.v1 * s.v1 : 0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2;
    return { t: r2(s.t), ke: r2(keNow), p: r2(p.m1 * s.v1 + (s.stuck ? 0 : p.m2 * s.v2)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "ke", label: "Total KE (J)", color: "#ef4444" },
    { key: "p", label: "Total momentum (kg·m/s)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const ke0 = 0.5 * p.m1 * p.u1 * p.u1 + 0.5 * p.m2 * p.u2 * p.u2;
    const keAfter = 0.5 * (p.m1 + p.m2) * s.v1 * s.v1;
    return [
      { label: "Combined velocity", value: r2(s.v1), unit: "m/s" },
      { label: "KE before", value: r2(ke0), unit: "J" },
      { label: "KE after", value: r2(s.stuck ? keAfter : ke0), unit: "J" },
      { label: "State", value: s.stuck ? "stuck together" : "approaching", unit: "" },
    ];
  },
};

const simsMomentum = { linearmomentum, impulse, momentumconservation, elasticcollision, inelasticcollision };
export default simsMomentum;