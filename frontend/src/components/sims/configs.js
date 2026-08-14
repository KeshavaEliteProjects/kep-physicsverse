// Physics simulation configs for SimEngine.
// Each config: { params, init, step, draw, graphPoint, series, xKey, stats, done, equation, colors }
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;

/* ---------------- shared drawing helpers ---------------- */
function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/* ================= PROJECTILE ================= */
const projectile = {
  title: "Projectile Motion",
  equation: "R = \\frac{v_0^2 \\sin(2\\theta)}{g} \\qquad H = \\frac{v_0^2 \\sin^2\\theta}{2g}",
  params: [
    { key: "v0", label: "Initial velocity", min: 5, max: 60, step: 1, default: 30, unit: "m/s" },
    { key: "angle", label: "Launch angle", min: 5, max: 85, step: 1, default: 45, unit: "°" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "drag", label: "Air resistance", min: 0, max: 0.06, step: 0.002, default: 0, unit: "" },
    { key: "mass", label: "Mass", min: 0.5, max: 10, step: 0.5, default: 2, unit: "kg" },
  ],
  init: (p) => {
    const a = p.angle * RAD;
    return { x: 0, y: 0, vx: p.v0 * Math.cos(a), vy: p.v0 * Math.sin(a), t: 0, trail: [{ x: 0, y: 0 }], landed: false, range: 0, maxH: 0, tof: 0 };
  },
  step: (s, dt, p) => {
    if (s.landed) return;
    const k = p.drag / p.mass;
    const v = Math.hypot(s.vx, s.vy);
    s.vx += -k * v * s.vx * dt;
    s.vy += (-p.gravity - k * v * s.vy) * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.t += dt;
    if (s.y > s.maxH) s.maxH = s.y;
    if (s.y <= 0 && s.t > 0.05) { s.y = 0; s.landed = true; s.range = s.x; s.tof = s.t; }
    s.trail.push({ x: s.x, y: s.y });
  },
  done: (s) => s.landed,
  draw: (ctx, s, p, W, H) => {
    const a = p.angle * RAD;
    const R0 = (p.v0 * p.v0 * Math.sin(2 * a)) / p.gravity || 1;
    const H0 = (p.v0 * p.v0 * Math.sin(a) * Math.sin(a)) / (2 * p.gravity) || 1;
    const ox = 46, oy = H - 42;
    const scale = Math.min((W - 90) / Math.max(R0, 1), (H - 90) / Math.max(H0, 1));
    // ground
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(W - 20, oy); ctx.stroke();
    // trajectory
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sx = ox + pt.x * scale, sy = oy - pt.y * scale;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    // velocity vector at launch (only before moving far)
    const cur = s.trail[s.trail.length - 1];
    const cx = ox + cur.x * scale, cy = oy - cur.y * scale;
    circle(ctx, cx, cy, 9, "#f59e0b", "#b45309");
    // launch angle guide
    ctx.strokeStyle = "rgba(37,99,235,.35)"; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 60 * Math.cos(a), oy - 60 * Math.sin(a)); ctx.stroke();
    ctx.setLineDash([]);
  },
  graphPoint: (s) => ({ t: r2(s.t), x: r2(s.x), y: r2(s.y), v: r2(Math.hypot(s.vx, s.vy)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "y", label: "Height (m)", color: "#2563eb" },
    { key: "x", label: "Horizontal (m)", color: "#10b981" },
    { key: "v", label: "Speed (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => {
    const a = p.angle * RAD;
    const R = s.landed ? s.range : (p.v0 * p.v0 * Math.sin(2 * a)) / p.gravity;
    const Hm = s.landed ? s.maxH : (p.v0 * p.v0 * Math.sin(a) * Math.sin(a)) / (2 * p.gravity);
    const T = s.landed ? s.tof : (2 * p.v0 * Math.sin(a)) / p.gravity;
    return [
      { label: "Range", value: r2(R), unit: "m" },
      { label: "Max height", value: r2(Hm), unit: "m" },
      { label: "Time of flight", value: r2(T), unit: "s" },
      { label: "Speed", value: r2(Math.hypot(s.vx, s.vy)), unit: "m/s" },
    ];
  },
};

/* ================= PENDULUM ================= */
const pendulum = {
  title: "Simple Pendulum",
  equation: "T = 2\\pi\\sqrt{\\frac{L}{g}}",
  params: [
    { key: "length", label: "Length", min: 0.2, max: 3, step: 0.1, default: 1.5, unit: "m" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "angle0", label: "Start angle", min: 5, max: 85, step: 1, default: 45, unit: "°" },
    { key: "damping", label: "Damping", min: 0, max: 0.6, step: 0.01, default: 0.05, unit: "" },
  ],
  init: (p) => ({ theta: p.angle0 * RAD, omega: 0, t: 0 }),
  step: (s, dt, p) => {
    const alpha = -(p.gravity / p.length) * Math.sin(s.theta) - p.damping * s.omega;
    s.omega += alpha * dt;
    s.theta += s.omega * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const px = W / 2, py = 54;
    const len = Math.min(p.length * 110, H - 130);
    const bx = px + len * Math.sin(s.theta), by = py + len * Math.cos(s.theta);
    // support
    ctx.fillStyle = "#334155"; ctx.fillRect(px - 60, py - 12, 120, 8);
    // rod
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    // rest guide
    ctx.strokeStyle = "rgba(148,163,184,.5)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + len); ctx.stroke(); ctx.setLineDash([]);
    circle(ctx, px, py, 5, "#334155");
    circle(ctx, bx, by, 18, "#2563eb", "#1e40af");
  },
  graphPoint: (s) => ({ t: r2(s.t), angle: r2(s.theta / RAD), omega: r2(s.omega) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "angle", label: "Angle (°)", color: "#2563eb" },
    { key: "omega", label: "Angular velocity (rad/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Time period", value: r2(2 * Math.PI * Math.sqrt(p.length / p.gravity)), unit: "s" },
    { label: "Frequency", value: r2(1 / (2 * Math.PI * Math.sqrt(p.length / p.gravity))), unit: "Hz" },
    { label: "Angle", value: r2(s.theta / RAD), unit: "°" },
    { label: "Ang. velocity", value: r2(s.omega), unit: "rad/s" },
  ],
};

/* ================= MASS-SPRING ================= */
const spring = {
  title: "Mass-Spring Oscillator",
  equation: "T = 2\\pi\\sqrt{\\frac{m}{k}} \\qquad F = -kx",
  params: [
    { key: "mass", label: "Mass", min: 0.5, max: 10, step: 0.5, default: 2, unit: "kg" },
    { key: "k", label: "Spring constant", min: 5, max: 120, step: 1, default: 40, unit: "N/m" },
    { key: "amplitude", label: "Amplitude", min: 0.1, max: 2, step: 0.1, default: 1.2, unit: "m" },
    { key: "damping", label: "Damping", min: 0, max: 2, step: 0.05, default: 0.1, unit: "" },
  ],
  init: (p) => ({ x: p.amplitude, v: 0, t: 0 }),
  step: (s, dt, p) => {
    const a = -(p.k / p.mass) * s.x - (p.damping / p.mass) * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const wallX = 70, cy = H / 2, eqX = W / 2, scale = 90;
    const blockX = eqX + s.x * scale;
    // wall
    ctx.fillStyle = "#334155"; ctx.fillRect(wallX - 12, cy - 70, 12, 140);
    // equilibrium marker
    ctx.strokeStyle = "rgba(16,185,129,.6)"; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(eqX, cy - 60); ctx.lineTo(eqX, cy + 60); ctx.stroke(); ctx.setLineDash([]);
    // spring coils
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(wallX, cy);
    const coils = 14, span = blockX - 26 - wallX;
    for (let i = 0; i <= coils; i++) {
      const t = i / coils;
      const x = wallX + span * t;
      const y = cy + (i % 2 === 0 ? -14 : 14) * (i === 0 || i === coils ? 0 : 1);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(blockX - 26, cy);
    ctx.stroke();
    // block
    const sz = 52;
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(blockX - 26, cy - sz / 2, sz, sz);
    ctx.strokeStyle = "#1e40af"; ctx.lineWidth = 2; ctx.strokeRect(blockX - 26, cy - sz / 2, sz, sz);
  },
  graphPoint: (s) => ({ t: r2(s.t), x: r2(s.x), v: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement (m)", color: "#2563eb" },
    { key: "v", label: "Velocity (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Time period", value: r2(2 * Math.PI * Math.sqrt(p.mass / p.k)), unit: "s" },
    { label: "Frequency", value: r2(1 / (2 * Math.PI * Math.sqrt(p.mass / p.k))), unit: "Hz" },
    { label: "Displacement", value: r2(s.x), unit: "m" },
    { label: "Velocity", value: r2(s.v), unit: "m/s" },
  ],
};

/* ================= COLLISION (1D) ================= */
const collision = {
  title: "1D Collision",
  equation: "m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2",
  params: [
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "u1", label: "Velocity 1", min: -6, max: 6, step: 0.5, default: 3, unit: "m/s" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 5, unit: "kg" },
    { key: "u2", label: "Velocity 2", min: -6, max: 6, step: 0.5, default: -2, unit: "m/s" },
    { key: "e", label: "Restitution", min: 0, max: 1, step: 0.05, default: 1, unit: "" },
  ],
  init: (p) => ({ x1: 220, x2: 540, v1: p.u1, v2: p.u2, t: 0 }),
  step: (s, dt, p) => {
    const SP = 46;
    s.x1 += s.v1 * SP * dt;
    s.x2 += s.v2 * SP * dt;
    s.t += dt;
    const w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    // walls
    if (s.x1 - w1 / 2 < 70) { s.x1 = 70 + w1 / 2; s.v1 = Math.abs(s.v1); }
    if (s.x2 + w2 / 2 > 690) { s.x2 = 690 - w2 / 2; s.v2 = -Math.abs(s.v2); }
    if (s.x1 - w1 / 2 < 70) { s.x1 = 70 + w1 / 2; s.v1 = Math.abs(s.v1); }
    // collision
    const gap = s.x2 - s.x1 - (w1 + w2) / 2;
    if (gap < 0 && s.v1 - s.v2 > 0) {
      const { m1, m2, e } = p;
      const u1 = s.v1, u2 = s.v2;
      s.v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      s.v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);
      const overlap = -gap + 1;
      s.x1 -= overlap / 2; s.x2 += overlap / 2;
    }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2 + 30, w1 = 24 + p.m1 * 3, w2 = 24 + p.m2 * 3;
    // track
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, cy + 34); ctx.lineTo(700, cy + 34); ctx.stroke();
    const drawBox = (x, w, color, label) => {
      const h = w;
      ctx.fillStyle = color; ctx.fillRect(x - w / 2, cy + 32 - h, w, h);
      ctx.fillStyle = "#fff"; ctx.font = "600 12px 'Source Code Pro'";
      ctx.textAlign = "center"; ctx.fillText(label, x, cy + 32 - h / 2 + 4);
    };
    drawBox(s.x1, w1, "#2563eb", p.m1 + "kg");
    drawBox(s.x2, w2, "#f59e0b", p.m2 + "kg");
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({
    t: r2(s.t),
    p: r2(p.m1 * s.v1 + p.m2 * s.v2),
    ke: r2(0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2),
  }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "p", label: "Total momentum (kg·m/s)", color: "#2563eb" },
    { key: "ke", label: "Total KE (J)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Velocity 1", value: r2(s.v1), unit: "m/s" },
    { label: "Velocity 2", value: r2(s.v2), unit: "m/s" },
    { label: "Momentum", value: r2(p.m1 * s.v1 + p.m2 * s.v2), unit: "kg·m/s" },
    { label: "Kinetic energy", value: r2(0.5 * p.m1 * s.v1 * s.v1 + 0.5 * p.m2 * s.v2 * s.v2), unit: "J" },
  ],
};

/* ================= GRAVITY & ORBITS ================= */
const G = 2600;
const orbit = {
  title: "Gravity & Orbits",
  equation: "v_{orbit} = \\sqrt{\\frac{GM}{r}}",
  params: [
    { key: "speed", label: "Satellite speed", min: 1, max: 14, step: 0.2, default: 7, unit: "" },
    { key: "radius", label: "Start distance", min: 80, max: 250, step: 5, default: 150, unit: "px" },
    { key: "mass", label: "Planet mass", min: 2, max: 10, step: 0.5, default: 5, unit: "" },
  ],
  init: (p) => ({ x: p.radius, y: 0, vx: 0, vy: p.speed, t: 0, trail: [], state: "orbiting" }),
  step: (s, dt, p) => {
    if (s.state !== "orbiting") return;
    const r = Math.hypot(s.x, s.y) || 1;
    const acc = (-G * p.mass) / (r * r);
    s.vx += (acc * s.x) / r * dt;
    s.vy += (acc * s.y) / r * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.t += dt;
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 1600) s.trail.shift();
    if (r < 26) s.state = "crashed";
    if (r > 600) s.state = "escaped";
  },
  done: (s) => s.state !== "orbiting",
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // planet
    const pr = 14 + p.mass * 2;
    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 4, cx, cy, pr);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, pr, grad);
    // trail
    ctx.strokeStyle = "rgba(37,99,235,.5)"; ctx.lineWidth = 2; ctx.beginPath();
    s.trail.forEach((pt, i) => { const sx = cx + pt.x, sy = cy + pt.y; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); });
    ctx.stroke();
    // satellite
    circle(ctx, cx + s.x, cy + s.y, 7, "#f59e0b", "#b45309");
    if (s.state !== "orbiting") {
      ctx.fillStyle = s.state === "crashed" ? "#ef4444" : "#10b981";
      ctx.font = "700 16px Outfit"; ctx.textAlign = "center";
      ctx.fillText(s.state === "crashed" ? "Crashed into planet!" : "Escaped orbit!", cx, 40);
      ctx.textAlign = "left";
    }
  },
  graphPoint: (s) => ({ t: r2(s.t), speed: r2(Math.hypot(s.vx, s.vy)), dist: r2(Math.hypot(s.x, s.y)) }),
  xKey: "t", xLabel: "Time",
  series: [
    { key: "speed", label: "Speed", color: "#f59e0b" },
    { key: "dist", label: "Distance from planet", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const r = Math.hypot(s.x, s.y) || 1;
    return [
      { label: "Speed", value: r2(Math.hypot(s.vx, s.vy)), unit: "" },
      { label: "Distance", value: r2(r), unit: "px" },
      { label: "Orbital v (ideal)", value: r2(Math.sqrt((G * p.mass) / r)), unit: "" },
      { label: "Status", value: s.state, unit: "" },
    ];
  },
};

/* ================= INCLINED PLANE ================= */
const incline = {
  title: "Inclined Plane",
  equation: "a = g(\\sin\\theta - \\mu\\cos\\theta)",
  params: [
    { key: "angle", label: "Incline angle", min: 5, max: 45, step: 1, default: 30, unit: "°" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 1, step: 0.02, default: 0.2, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 2, unit: "kg" },
  ],
  init: () => ({ s: 0, v: 0, t: 0, done: false }),
  step: (st, dt, p) => {
    if (st.done) return;
    const th = p.angle * RAD;
    let a = p.gravity * (Math.sin(th) - p.mu * Math.cos(th));
    if (a < 0) a = 0;
    st.v += a * 22 * dt; // px scale
    st.s += st.v * dt;
    st.t += dt;
    if (st.s >= 360) { st.s = 360; st.done = true; }
  },
  done: (st) => st.done,
  draw: (ctx, st, p, W, H) => {
    const th = p.angle * RAD;
    const bx = 90, by = H - 46;
    const len = 420;
    const tx = bx + len * Math.cos(th), ty = by - len * Math.sin(th);
    // ground
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, by); ctx.lineTo(W - 30, by); ctx.stroke();
    // incline
    ctx.fillStyle = "rgba(37,99,235,.08)";
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.lineTo(tx, by); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    // block: start at top, slide down
    const frac = st.s / 360;
    const startX = tx, startY = ty;
    const px = startX - (len * frac) * Math.cos(th) * 0.86;
    const py = startY + (len * frac) * Math.sin(th) * 0.86;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-th);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-18, -34, 36, 32);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.strokeRect(-18, -34, 36, 32);
    ctx.restore();
  },
  graphPoint: (st) => ({ t: r2(st.t), s: r2(st.s / 22), v: r2(st.v / 22) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "s", label: "Distance (m)", color: "#2563eb" },
    { key: "v", label: "Speed (m/s)", color: "#f59e0b" },
  ],
  stats: (st, p) => {
    const th = p.angle * RAD;
    const a = Math.max(0, p.gravity * (Math.sin(th) - p.mu * Math.cos(th)));
    return [
      { label: "Acceleration", value: r2(a), unit: "m/s²" },
      { label: "Normal force", value: r2(p.mass * p.gravity * Math.cos(th)), unit: "N" },
      { label: "Friction force", value: r2(p.mu * p.mass * p.gravity * Math.cos(th)), unit: "N" },
      { label: "Status", value: a === 0 ? "static" : st.done ? "at base" : "sliding", unit: "" },
    ];
  },
};

/* ================= PULLEY (Atwood machine) ================= */
const pulley = {
  title: "Pulley System (Atwood)",
  equation: "a = \\frac{(m_1 - m_2)g}{m_1 + m_2}, \\quad T = \\frac{2 m_1 m_2 g}{m_1 + m_2}",
  params: [
    { key: "m1", label: "Left mass (m₁)", min: 0.5, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "m2", label: "Right mass (m₂)", min: 0.5, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ s: 0, v: 0, t: 0 }),
  step: (st, dt, p) => {
    const a = ((p.m1 - p.m2) * p.gravity) / (p.m1 + p.m2);
    st.v += a * dt;
    st.s += st.v * dt;
    st.t += dt;
    if (st.s > 2.4) { st.s = 2.4; st.v = 0; }
    if (st.s < -2.4) { st.s = -2.4; st.v = 0; }
  },
  draw: (ctx, st, p, W, H) => {
    const cx = W / 2, topY = 74, pr = 34;
    circle(ctx, cx, topY, pr, "#e2e8f0", "#64748b");
    circle(ctx, cx, topY, 5, "#334155");
    const leftX = cx - pr, rightX = cx + pr, scale = 52, restY = topY + 120;
    const y1 = restY + st.s * scale, y2 = restY - st.s * scale;
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(leftX, topY); ctx.lineTo(leftX, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightX, topY); ctx.lineTo(rightX, y2); ctx.stroke();
    const box = (x, y, m, color) => {
      const sz = 26 + m * 3.4;
      ctx.fillStyle = color; ctx.fillRect(x - sz / 2, y, sz, sz);
      ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.strokeRect(x - sz / 2, y, sz, sz);
      ctx.fillStyle = "#fff"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center";
      ctx.fillText(m + "kg", x, y + sz / 2 + 4);
    };
    box(leftX, y1, p.m1, "#2563eb");
    box(rightX, y2, p.m2, "#f59e0b");
    ctx.textAlign = "left";
  },
  graphPoint: (st) => ({ t: r2(st.t), v: r2(Math.abs(st.v)), s: r2(st.s) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v", label: "Speed (m/s)", color: "#2563eb" },
    { key: "s", label: "Displacement (m)", color: "#f59e0b" },
  ],
  stats: (st, p) => {
    const a = ((p.m1 - p.m2) * p.gravity) / (p.m1 + p.m2);
    const T = (2 * p.m1 * p.m2 * p.gravity) / (p.m1 + p.m2);
    return [
      { label: "Acceleration", value: r2(Math.abs(a)), unit: "m/s²" },
      { label: "Tension", value: r2(T), unit: "N" },
      { label: "Heavier side", value: p.m1 > p.m2 ? "left ↓" : p.m1 < p.m2 ? "right ↓" : "balanced", unit: "" },
      { label: "Speed", value: r2(Math.abs(st.v)), unit: "m/s" },
    ];
  },
};

/* ================= BANKED CURVE ================= */
const banked = {
  title: "Banked Curve",
  equation: "v_{ideal} = \\sqrt{g\\,r\\,\\tan\\theta}",
  params: [
    { key: "angle", label: "Banking angle", min: 5, max: 40, step: 1, default: 20, unit: "°" },
    { key: "speed", label: "Car speed", min: 5, max: 45, step: 1, default: 20, unit: "m/s" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 0.8, step: 0.02, default: 0.2, unit: "" },
    { key: "radius", label: "Turn radius", min: 5, max: 22, step: 0.5, default: 12, unit: "m" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: (p) => ({ r: p.radius * 11, theta: 0, t: 0, status: "stable" }),
  step: (st, dt, p) => {
    const rm = st.r / 11;
    const omega = p.speed / rm;
    st.theta += omega * dt;
    st.t += dt;
    const th = p.angle * RAD;
    const aReq = (p.speed * p.speed) / rm;
    const denom = Math.max(0.05, Math.cos(th) - p.mu * Math.sin(th));
    const aMax = (p.gravity * (Math.sin(th) + p.mu * Math.cos(th))) / denom;
    const aMin = (p.gravity * Math.max(0, Math.sin(th) - p.mu * Math.cos(th))) / (Math.cos(th) + p.mu * Math.sin(th));
    if (aReq > aMax) { st.r += (aReq - aMax) * 6 * dt; st.status = "skidding out"; }
    else if (aReq < aMin) { st.r -= (aMin - aReq) * 6 * dt; st.status = "sliding in"; }
    else st.status = "stable";
    st.r = Math.max(45, Math.min(250, st.r));
  },
  draw: (ctx, st, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "rgba(148,163,184,.5)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, p.radius * 11, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const color = st.status === "stable" ? "#10b981" : "#ef4444";
    ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.arc(cx, cy, st.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, st.r, 0, Math.PI * 2); ctx.stroke();
    const carX = cx + st.r * Math.cos(st.theta), carY = cy + st.r * Math.sin(st.theta);
    circle(ctx, carX, carY, 8, "#2563eb", "#1e40af");
    ctx.fillStyle = color; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText(st.status.toUpperCase(), cx, cy + 4);
    ctx.textAlign = "left";
  },
  graphPoint: (st, p) => ({ t: r2(st.t), radius: r2(st.r / 11), accel: r2((p.speed * p.speed) / (st.r / 11)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "radius", label: "Turn radius (m)", color: "#2563eb" },
    { key: "accel", label: "Centripetal accel (m/s²)", color: "#f59e0b" },
  ],
  stats: (st, p) => {
    const th = p.angle * RAD;
    return [
      { label: "Ideal speed", value: r2(Math.sqrt(p.gravity * (st.r / 11) * Math.tan(th))), unit: "m/s" },
      { label: "Required aᵢ", value: r2((p.speed * p.speed) / (st.r / 11)), unit: "m/s²" },
      { label: "Radius", value: r2(st.r / 11), unit: "m" },
      { label: "Status", value: st.status, unit: "" },
    ];
  },
};

/* ================= ENERGY SKATE RAMP ================= */
const CURVE = 0.0042;
const energyramp = {
  title: "Energy Skate Ramp",
  equation: "E = KE + PE = \\tfrac{1}{2}mv^2 + mgh = \\text{const}",
  params: [
    { key: "height", label: "Start height", min: 1, max: 8, step: 0.5, default: 6, unit: "m" },
    { key: "friction", label: "Friction", min: 0, max: 0.5, step: 0.02, default: 0, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "mass", label: "Mass", min: 0.5, max: 5, step: 0.5, default: 2, unit: "kg" },
  ],
  init: (p) => ({ X: -Math.sqrt((p.height * 20) / CURVE), vX: 0, t: 0 }),
  step: (st, dt, p) => {
    const gpx = p.gravity * 26;
    const slope = 2 * CURVE * st.X;
    st.vX += (-gpx * slope / (1 + slope * slope)) * dt;
    st.vX *= Math.max(0, 1 - p.friction * dt * 1.6);
    st.X += st.vX * dt;
    st.t += dt;
  },
  draw: (ctx, st, p, W, H) => {
    const cx = W / 2, baseY = H - 56;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = -232; x <= 232; x += 6) {
      const sx = cx + x, sy = baseY - CURVE * x * x;
      x === -232 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    const bx = cx + st.X, by = baseY - CURVE * st.X * st.X;
    circle(ctx, bx, by - 10, 11, "#2563eb", "#1e40af");
    const hm = (CURVE * st.X * st.X) / 20;
    const slope = 2 * CURVE * st.X;
    const speedM = (Math.abs(st.vX) * Math.sqrt(1 + slope * slope)) / 20;
    const pe = p.mass * p.gravity * hm, ke = 0.5 * p.mass * speedM * speedM;
    const maxE = p.mass * p.gravity * p.height * 1.08 || 1;
    const bx0 = 26, bw = 26, bh = 150, by0 = 40;
    const bar = (i, val, color, label) => {
      const x = bx0 + i * 42;
      ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x, by0, bw, bh);
      const h = Math.min(bh, (val / maxE) * bh);
      ctx.fillStyle = color; ctx.fillRect(x, by0 + bh - h, bw, h);
      ctx.fillStyle = "#475569"; ctx.font = "600 10px 'Source Code Pro'"; ctx.textAlign = "center";
      ctx.fillText(label, x + bw / 2, by0 + bh + 14);
    };
    bar(0, ke, "#10b981", "KE");
    bar(1, pe, "#2563eb", "PE");
    bar(2, pe + ke, "#f59e0b", "TOT");
    ctx.textAlign = "left";
  },
  graphPoint: (st, p) => {
    const hm = (CURVE * st.X * st.X) / 20;
    const slope = 2 * CURVE * st.X;
    const speedM = (Math.abs(st.vX) * Math.sqrt(1 + slope * slope)) / 20;
    const pe = p.mass * p.gravity * hm, ke = 0.5 * p.mass * speedM * speedM;
    return { t: r2(st.t), ke: r2(ke), pe: r2(pe), total: r2(ke + pe) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "ke", label: "Kinetic energy (J)", color: "#10b981" },
    { key: "pe", label: "Potential energy (J)", color: "#2563eb" },
    { key: "total", label: "Total energy (J)", color: "#f59e0b" },
  ],
  stats: (st, p) => {
    const hm = (CURVE * st.X * st.X) / 20;
    const slope = 2 * CURVE * st.X;
    const speedM = (Math.abs(st.vX) * Math.sqrt(1 + slope * slope)) / 20;
    const pe = p.mass * p.gravity * hm, ke = 0.5 * p.mass * speedM * speedM;
    return [
      { label: "Height", value: r2(hm), unit: "m" },
      { label: "Speed", value: r2(speedM), unit: "m/s" },
      { label: "KE", value: r2(ke), unit: "J" },
      { label: "Total E", value: r2(ke + pe), unit: "J" },
    ];
  },
};

/* ================= CONICAL PENDULUM ================= */
const conical = {
  title: "Conical Pendulum",
  equation: "T = 2\\pi\\sqrt{\\frac{L\\cos\\theta}{g}}, \\quad \\text{Tension} = \\frac{mg}{\\cos\\theta}",
  params: [
    { key: "length", label: "String length", min: 0.5, max: 3, step: 0.1, default: 2, unit: "m" },
    { key: "angle", label: "Cone angle", min: 10, max: 75, step: 1, default: 40, unit: "°" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "mass", label: "Mass", min: 0.5, max: 5, step: 0.5, default: 1, unit: "kg" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (st, dt, p) => {
    const th = p.angle * RAD;
    const omega = Math.sqrt(p.gravity / (p.length * Math.cos(th)));
    st.phi += omega * dt;
    st.t += dt;
  },
  draw: (ctx, st, p, W, H) => {
    const th = p.angle * RAD;
    const cx = W / 2, pivotY = 60, scale = 120;
    const drop = p.length * scale * Math.cos(th);
    const rad = p.length * scale * Math.sin(th);
    const centerY = pivotY + drop;
    // support
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 50, pivotY - 10, 100, 8);
    circle(ctx, cx, pivotY, 4, "#334155");
    // circle path (perspective ellipse)
    ctx.strokeStyle = "rgba(148,163,184,.6)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, centerY, rad, rad * 0.32, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // bob position
    const bx = cx + rad * Math.cos(st.phi);
    const by = centerY + rad * 0.32 * Math.sin(st.phi);
    // string
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(bx, by); ctx.stroke();
    circle(ctx, bx, by, 15, "#2563eb", "#1e40af");
  },
  graphPoint: (st, p) => {
    const rad = p.length * Math.sin(p.angle * RAD);
    return { t: r2(st.t), x: r2(rad * Math.cos(st.phi)), z: r2(rad * Math.sin(st.phi)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "x", label: "X-position (m)", color: "#2563eb" },
    { key: "z", label: "Z-position (m)", color: "#f59e0b" },
  ],
  stats: (st, p) => {
    const th = p.angle * RAD;
    const rad = p.length * Math.sin(th);
    const omega = Math.sqrt(p.gravity / (p.length * Math.cos(th)));
    return [
      { label: "Time period", value: r2(2 * Math.PI * Math.sqrt((p.length * Math.cos(th)) / p.gravity)), unit: "s" },
      { label: "Tension", value: r2((p.mass * p.gravity) / Math.cos(th)), unit: "N" },
      { label: "Radius", value: r2(rad), unit: "m" },
      { label: "Speed", value: r2(omega * rad), unit: "m/s" },
    ];
  },
};

/* ================= VERTICAL LOOP ================= */
const verticalloop = {
  title: "Vertical Loop",
  equation: "v_{top} \\geq \\sqrt{gr}, \\quad v_{bottom} \\geq \\sqrt{5gr}",
  params: [
    { key: "speed", label: "Speed at bottom", min: 5, max: 26, step: 0.5, default: 15, unit: "m/s" },
    { key: "radius", label: "Loop radius", min: 2, max: 6, step: 0.5, default: 4, unit: "m" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "mass", label: "Mass", min: 0.5, max: 5, step: 0.5, default: 1, unit: "kg" },
  ],
  init: (p) => ({ alpha: 0, v: p.speed, N: 0, t: 0, dir: 1, status: "on track" }),
  step: (st, dt, p) => {
    if (st.status === "left track") return;
    const r = p.radius, g = p.gravity;
    const vsq = p.speed * p.speed - 2 * g * r * (1 - Math.cos(st.alpha));
    st.v = Math.sqrt(Math.max(0, vsq));
    st.N = p.mass * (st.v * st.v / r) + p.mass * g * Math.cos(st.alpha);
    if (st.N < 0 && st.dir > 0) { st.status = "left track"; return; }
    if (vsq <= 0.01) { st.dir = -1; st.status = "oscillating"; }
    st.alpha += st.dir * (st.v / r) * dt;
    if (st.alpha <= 0) { st.alpha = 0; st.dir = 1; }
    if (st.alpha >= 2 * Math.PI) { st.alpha -= 2 * Math.PI; st.status = "completed loop"; }
    st.t += dt;
  },
  draw: (ctx, st, p, W, H) => {
    const cx = W / 2, r = p.radius * 22, cyc = H / 2 - 8;
    // loop
    const color = st.status === "left track" ? "#ef4444" : st.status === "completed loop" ? "#10b981" : "#2563eb";
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cyc, r, 0, Math.PI * 2); ctx.stroke();
    // ground / entry
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 200, cyc + r); ctx.lineTo(cx + 200, cyc + r); ctx.stroke();
    // ball
    const bx = cx + r * Math.sin(st.alpha), by = cyc + r * Math.cos(st.alpha);
    circle(ctx, bx, by, 10, "#f59e0b", "#b45309");
    if (st.status === "left track" || st.status === "completed loop") {
      ctx.fillStyle = color; ctx.font = "700 16px Outfit"; ctx.textAlign = "center";
      ctx.fillText(st.status === "left track" ? "Lost contact — fails loop!" : "Completed the loop!", cx, 34);
      ctx.textAlign = "left";
    }
  },
  graphPoint: (st) => ({ t: r2(st.t), speed: r2(st.v), normal: r2(st.N) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "speed", label: "Speed (m/s)", color: "#f59e0b" },
    { key: "normal", label: "Normal force (N)", color: "#2563eb" },
  ],
  stats: (st, p) => [
    { label: "Min speed at top", value: r2(Math.sqrt(p.gravity * p.radius)), unit: "m/s" },
    { label: "Current speed", value: r2(st.v), unit: "m/s" },
    { label: "Normal force", value: r2(st.N), unit: "N" },
    { label: "Status", value: st.status, unit: "" },
  ],
};

const configs = { projectile, pendulum, spring, collision, orbit, incline, pulley, banked, energyramp, conical, verticalloop };
export default configs;
