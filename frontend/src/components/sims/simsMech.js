// Extra Mechanics simulations. SimEngine-compatible configs.
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;
function circle(ctx, x, y, rad, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
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

const kinematics1d = {
  title: "Motion & Graphs (1D)", topic: "mechanics", difficulty: "Beginner",
  summary: "Uniformly accelerated motion — watch position, velocity and acceleration graphs build live.",
  equation: "v = u + at, \\quad s = ut + \\tfrac{1}{2}at^2",
  params: [
    { key: "u", label: "Initial velocity", min: -20, max: 30, step: 1, default: 5, unit: "m/s" },
    { key: "a", label: "Acceleration", min: -8, max: 8, step: 0.5, default: 2, unit: "m/s²" },
  ],
  init: (p) => ({ x: 0, v: p.u, t: 0 }),
  step: (s, dt, p) => { s.v += p.a * dt; s.x += s.v * dt; s.t += dt; if (s.t > 12) { s.x = 0; s.v = p.u; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const roadY = H - 90; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, roadY + 26); ctx.lineTo(W - 30, roadY + 26); ctx.stroke();
    const scale = 7; let px = 60 + ((s.x * scale) % (W - 120));
    if (px < 60) px += W - 120;
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px - 22, roadY - 6, 44, 26);
    circle(ctx, px - 12, roadY + 22, 6, "#334155"); circle(ctx, px + 12, roadY + 22, 6, "#334155");
    arrow(ctx, px, roadY - 16, px + Math.max(-40, Math.min(40, s.v * 3)), roadY - 16, "#f59e0b");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), x: r2(s.x), v: r2(s.v), a: p.a }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "x", label: "Position (m)", color: "#2563eb" }, { key: "v", label: "Velocity (m/s)", color: "#f59e0b" }, { key: "a", label: "Acceleration (m/s²)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Position", value: r2(s.x), unit: "m" }, { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "Acceleration", value: p.a, unit: "m/s²" }, { label: "Time", value: r2(s.t), unit: "s" }],
};

const vectors = {
  title: "Vector Addition", topic: "mechanics", difficulty: "Beginner",
  summary: "Add two vectors tip-to-tail and see the resultant and its components change instantly.",
  equation: "\\vec{R} = \\vec{A} + \\vec{B}",
  params: [
    { key: "a", label: "Vector A magnitude", min: 1, max: 10, step: 0.5, default: 6, unit: "" },
    { key: "aAng", label: "Vector A angle", min: 0, max: 360, step: 5, default: 30, unit: "°" },
    { key: "b", label: "Vector B magnitude", min: 1, max: 10, step: 0.5, default: 5, unit: "" },
    { key: "bAng", label: "Vector B angle", min: 0, max: 360, step: 5, default: 110, unit: "°" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const ox = W / 2 - 40, oy = H / 2 + 40, sc = 18;
    const ax = p.a * Math.cos(p.aAng * RAD), ay = -p.a * Math.sin(p.aAng * RAD);
    const bx = p.b * Math.cos(p.bAng * RAD), by = -p.b * Math.sin(p.bAng * RAD);
    arrow(ctx, ox, oy, ox + ax * sc, oy + ay * sc, "#2563eb", 3);
    arrow(ctx, ox + ax * sc, oy + ay * sc, ox + (ax + bx) * sc, oy + (ay + by) * sc, "#f59e0b", 3);
    arrow(ctx, ox, oy, ox + (ax + bx) * sc, oy + (ay + by) * sc, "#10b981", 3.5);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("A", ox + ax * sc / 2, oy + ay * sc / 2 - 6);
    ctx.fillText("R", ox + (ax + bx) * sc / 2 + 8, oy + (ay + by) * sc / 2);
  },
  graphPoint: (s, p) => {
    const rx = p.a * Math.cos(p.aAng * RAD) + p.b * Math.cos(p.bAng * RAD);
    const ry = p.a * Math.sin(p.aAng * RAD) + p.b * Math.sin(p.bAng * RAD);
    return { t: r2(s.t), R: r2(Math.hypot(rx, ry)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "R", label: "Resultant magnitude", color: "#10b981" }],
  stats: (s, p) => {
    const rx = p.a * Math.cos(p.aAng * RAD) + p.b * Math.cos(p.bAng * RAD);
    const ry = p.a * Math.sin(p.aAng * RAD) + p.b * Math.sin(p.bAng * RAD);
    return [{ label: "Resultant |R|", value: r2(Math.hypot(rx, ry)), unit: "" },
      { label: "Angle", value: r2(((Math.atan2(ry, rx) / RAD) + 360) % 360), unit: "°" },
      { label: "Rx", value: r2(rx), unit: "" }, { label: "Ry", value: r2(ry), unit: "" }];
  },
};

const newton2 = {
  title: "Newton's Second Law", topic: "mechanics", difficulty: "Beginner",
  summary: "Apply a force to a block on a rough surface and watch F = ma play out with friction.",
  equation: "F_{net} = ma, \\quad f = \\mu m g",
  params: [
    { key: "force", label: "Applied force", min: 0, max: 60, step: 1, default: 25, unit: "N" },
    { key: "mass", label: "Mass", min: 1, max: 12, step: 0.5, default: 4, unit: "kg" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 0.6, step: 0.02, default: 0.15, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ x: 0, v: 0, t: 0 }),
  step: (s, dt, p) => {
    const f = p.mu * p.mass * p.gravity;
    let net = p.force - (s.v > 0.001 ? f : p.force > f ? f : 0);
    let a = net / p.mass; if (p.force <= f && s.v <= 0.001) a = 0;
    s.v += a * dt; if (s.v < 0) s.v = 0; s.x += s.v * dt; s.t += dt;
    if (s.x > 30) { s.x = 0; s.v = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const gy = H - 80; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(W - 30, gy); ctx.stroke();
    let px = 80 + ((s.x * 20) % (W - 160)); const sz = 26 + p.mass * 3;
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px, gy - sz, sz, sz);
    arrow(ctx, px + sz, gy - sz / 2, px + sz + Math.min(70, p.force * 1.6), gy - sz / 2, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText(p.force + "N", px + sz + 8, gy - sz / 2 - 8);
  },
  graphPoint: (s) => ({ t: r2(s.t), v: r2(s.v), x: r2(s.x) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Velocity (m/s)", color: "#f59e0b" }, { key: "x", label: "Position (m)", color: "#2563eb" }],
  stats: (s, p) => {
    const f = p.mu * p.mass * p.gravity; const a = Math.max(0, (p.force - f) / p.mass);
    return [{ label: "Acceleration", value: r2(a), unit: "m/s²" }, { label: "Friction", value: r2(f), unit: "N" },
      { label: "Weight", value: r2(p.mass * p.gravity), unit: "N" }, { label: "Velocity", value: r2(s.v), unit: "m/s" }];
  },
};

const momentum2d = {
  title: "2D Collision", topic: "mechanics", difficulty: "Advanced",
  summary: "Fire a ball at a target ball with an offset and watch 2D momentum conservation scatter them.",
  equation: "\\vec{p}_i = \\vec{p}_f",
  params: [
    { key: "speed", label: "Incoming speed", min: 2, max: 12, step: 0.5, default: 7, unit: "" },
    { key: "impact", label: "Impact offset", min: -1, max: 1, step: 0.1, default: 0.4, unit: "" },
    { key: "m1", label: "Ball 1 mass", min: 1, max: 6, step: 0.5, default: 2, unit: "" },
    { key: "m2", label: "Ball 2 mass", min: 1, max: 6, step: 0.5, default: 2, unit: "" },
  ],
  init: (p) => ({ x1: 90, y1: 220 + p.impact * 40, vx1: p.speed * 34, vy1: 0, x2: 470, y2: 220, vx2: 0, vy2: 0, t: 0, hit: false }),
  step: (s, dt, p) => {
    s.x1 += s.vx1 * dt; s.y1 += s.vy1 * dt; s.x2 += s.vx2 * dt; s.y2 += s.vy2 * dt; s.t += dt;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, d = Math.hypot(dx, dy);
    if (!s.hit && d < 40) {
      s.hit = true; const nx = dx / d, ny = dy / d;
      const p1 = s.vx1 * nx + s.vy1 * ny, p2 = s.vx2 * nx + s.vy2 * ny;
      const m1 = p.m1, m2 = p.m2;
      const v1 = ((m1 - m2) * p1 + 2 * m2 * p2) / (m1 + m2);
      const v2 = ((m2 - m1) * p2 + 2 * m1 * p1) / (m1 + m2);
      s.vx1 += (v1 - p1) * nx; s.vy1 += (v1 - p1) * ny;
      s.vx2 += (v2 - p2) * nx; s.vy2 += (v2 - p2) * ny;
    }
    if (s.x1 > 700 || s.x2 > 700 || s.t > 10) Object.assign(s, kinInit(p));
  },
  draw: (ctx, s, p, W, H) => {
    circle(ctx, s.x1, s.y1, 14 + p.m1 * 2, "#2563eb", "#1e40af");
    circle(ctx, s.x2, s.y2, 14 + p.m2 * 2, "#f59e0b", "#b45309");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), p: r2(p.m1 * Math.hypot(s.vx1, s.vy1) / 34 + p.m2 * Math.hypot(s.vx2, s.vy2) / 34) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "p", label: "Total |momentum|", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Ball 1 speed", value: r2(Math.hypot(s.vx1, s.vy1) / 34), unit: "" },
    { label: "Ball 2 speed", value: r2(Math.hypot(s.vx2, s.vy2) / 34), unit: "" },
    { label: "Status", value: s.hit ? "after impact" : "approaching", unit: "" },
    { label: "Time", value: r2(s.t), unit: "s" }],
};
function kinInit(p) { return { x1: 90, y1: 220 + p.impact * 40, vx1: p.speed * 34, vy1: 0, x2: 470, y2: 220, vx2: 0, vy2: 0, t: 0, hit: false }; }

const com = {
  title: "Centre of Mass", topic: "mechanics", difficulty: "Intermediate",
  summary: "Place two masses on a rod and find the balance point — the centre of mass.",
  equation: "x_{cm} = \\frac{m_1x_1 + m_2x_2}{m_1 + m_2}",
  params: [
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 6, unit: "kg" },
    { key: "sep", label: "Separation", min: 1, max: 8, step: 0.5, default: 5, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const y = H / 2, sc = 44, x1 = W / 2 - (p.sep * sc) / 2, x2 = W / 2 + (p.sep * sc) / 2;
    const xcm = (p.m1 * 0 + p.m2 * p.sep) / (p.m1 + p.m2); const xcmpx = x1 + xcm * sc;
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    circle(ctx, x1, y, 12 + p.m1 * 2.4, "#2563eb", "#1e40af");
    circle(ctx, x2, y, 12 + p.m2 * 2.4, "#f59e0b", "#b45309");
    ctx.fillStyle = "#10b981"; ctx.beginPath(); ctx.moveTo(xcmpx, y + 24); ctx.lineTo(xcmpx - 8, y + 40); ctx.lineTo(xcmpx + 8, y + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText("CM", xcmpx, y + 54); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), xcm: r2((p.m2 * p.sep) / (p.m1 + p.m2)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "xcm", label: "CM position from m₁ (m)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "x_cm from m₁", value: r2((p.m2 * p.sep) / (p.m1 + p.m2)), unit: "m" },
    { label: "x_cm from m₂", value: r2((p.m1 * p.sep) / (p.m1 + p.m2)), unit: "m" },
    { label: "Total mass", value: r2(p.m1 + p.m2), unit: "kg" },
    { label: "Ratio m₁:m₂", value: r2(p.m1 / p.m2), unit: "" }],
};

const rotation = {
  title: "Torque & Rotation", topic: "mechanics", difficulty: "Intermediate",
  summary: "Apply a torque to a disk and study angular acceleration and moment of inertia.",
  equation: "\\tau = I\\alpha, \\quad I = \\tfrac{1}{2}MR^2",
  params: [
    { key: "torque", label: "Torque", min: 1, max: 40, step: 1, default: 12, unit: "N·m" },
    { key: "mass", label: "Disk mass", min: 1, max: 12, step: 0.5, default: 4, unit: "kg" },
    { key: "radius", label: "Radius", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "m" },
  ],
  init: () => ({ th: 0, om: 0, t: 0 }),
  step: (s, dt, p) => { const I = 0.5 * p.mass * p.radius * p.radius; s.om += (p.torque / I) * dt; s.th += s.om * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, R = 30 + p.radius * 34;
    circle(ctx, cx, cy, R, "#dbeafe", "#2563eb");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.th);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * Math.cos(i * Math.PI / 3), R * Math.sin(i * Math.PI / 3)); ctx.stroke(); }
    ctx.restore(); circle(ctx, cx, cy, 6, "#334155");
    arrow(ctx, cx + R + 8, cy - 20, cx + R + 8, cy + 20, "#ef4444", 3);
  },
  graphPoint: (s) => ({ t: r2(s.t), om: r2(s.om), th: r2(s.th) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "om", label: "Angular velocity (rad/s)", color: "#f59e0b" }, { key: "th", label: "Angle (rad)", color: "#2563eb" }],
  stats: (s, p) => { const I = 0.5 * p.mass * p.radius * p.radius; return [
    { label: "Moment of inertia", value: r2(I), unit: "kg·m²" }, { label: "Ang. accel", value: r2(p.torque / I), unit: "rad/s²" },
    { label: "Ang. velocity", value: r2(s.om), unit: "rad/s" }, { label: "Rot. KE", value: r2(0.5 * I * s.om * s.om), unit: "J" }]; },
};

const rolling = {
  title: "Rolling Motion", topic: "mechanics", difficulty: "Advanced",
  summary: "Roll a cylinder down an incline and see how rotational inertia slows its acceleration.",
  equation: "a = \\frac{g\\sin\\theta}{1 + I/mr^2}",
  params: [
    { key: "angle", label: "Incline angle", min: 5, max: 40, step: 1, default: 25, unit: "°" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ s: 0, v: 0, t: 0, done: false }),
  step: (st, dt, p) => { if (st.done) return; const a = (p.gravity * Math.sin(p.angle * RAD)) / 1.5; st.v += a * 20 * dt; st.s += st.v * dt; st.t += dt; if (st.s > 380) st.done = true; },
  draw: (ctx, st, p, W, H) => {
    const th = p.angle * RAD, bx = 80, by = H - 50, len = 420;
    const tx = bx + len * Math.cos(th), ty = by - len * Math.sin(th);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    const f = st.s / 380, r = 20;
    const px = tx - (len * f) * Math.cos(th) * 0.86 - r * Math.sin(th), py = ty + (len * f) * Math.sin(th) * 0.86 - r * Math.cos(th);
    ctx.save(); ctx.translate(px, py); ctx.rotate(st.s / r);
    circle(ctx, 0, 0, r, "#f59e0b", "#b45309"); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore();
  },
  graphPoint: (st) => ({ t: r2(st.t), v: r2(st.v / 20), s: r2(st.s / 20) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Speed (m/s)", color: "#f59e0b" }, { key: "s", label: "Distance (m)", color: "#2563eb" }],
  stats: (st, p) => [
    { label: "Acceleration", value: r2((p.gravity * Math.sin(p.angle * RAD)) / 1.5), unit: "m/s²" },
    { label: "Slide-only a", value: r2(p.gravity * Math.sin(p.angle * RAD)), unit: "m/s²" },
    { label: "Speed", value: r2(st.v / 20), unit: "m/s" }, { label: "I factor", value: "½MR²", unit: "" }],
};

const angmom = {
  title: "Angular Momentum", topic: "mechanics", difficulty: "Advanced",
  summary: "Pull a spinning skater's arms in and watch angular velocity rise as L stays conserved.",
  equation: "L = I\\omega = \\text{const}",
  params: [
    { key: "arm", label: "Arm extension", min: 0.3, max: 2, step: 0.1, default: 1.5, unit: "m" },
    { key: "L", label: "Angular momentum", min: 2, max: 20, step: 1, default: 10, unit: "kg·m²/s" },
  ],
  init: () => ({ ph: 0, t: 0 }),
  step: (s, dt, p) => { const I = 1 + p.arm * p.arm; s.ph += (p.L / I) * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, arm = 30 + p.arm * 55;
    circle(ctx, cx, cy, 20, "#2563eb", "#1e40af");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ph);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.stroke();
    circle(ctx, -arm, 0, 8, "#f59e0b"); circle(ctx, arm, 0, 8, "#f59e0b"); ctx.restore();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), om: r2(p.L / (1 + p.arm * p.arm)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "om", label: "Angular velocity (rad/s)", color: "#f59e0b" }],
  stats: (s, p) => { const I = 1 + p.arm * p.arm; return [
    { label: "Moment of inertia", value: r2(I), unit: "kg·m²" }, { label: "Angular velocity", value: r2(p.L / I), unit: "rad/s" },
    { label: "Angular momentum", value: p.L, unit: "kg·m²/s" }, { label: "Rot. KE", value: r2(0.5 * p.L * p.L / I), unit: "J" }]; },
};

const resonance = {
  title: "Resonance", topic: "mechanics", difficulty: "Advanced",
  summary: "Drive an oscillator at different frequencies and watch amplitude peak at resonance.",
  equation: "A = \\frac{F_0}{\\sqrt{(k-m\\omega^2)^2 + (c\\omega)^2}}",
  params: [
    { key: "drive", label: "Drive frequency", min: 0.2, max: 3, step: 0.05, default: 1, unit: "Hz" },
    { key: "damping", label: "Damping (c)", min: 0.2, max: 4, step: 0.1, default: 1, unit: "" },
    { key: "k", label: "Stiffness (k)", min: 10, max: 80, step: 1, default: 40, unit: "N/m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const m = 1, w = 2 * Math.PI * p.drive, w0 = Math.sqrt(p.k / m);
    const A = 8 / Math.sqrt(Math.pow(p.k - m * w * w, 2) + Math.pow(p.damping * w, 2));
    const cx = W / 2, cy = H / 2; const disp = A * 40 * Math.sin(w * s.t);
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 90, cy - 60, 10, 120);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 80, cy); ctx.lineTo(cx + disp - 24, cy); ctx.stroke();
    ctx.fillStyle = w > w0 * 0.9 && w < w0 * 1.1 ? "#ef4444" : "#2563eb"; ctx.fillRect(cx + disp - 24, cy - 24, 48, 48);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'"; ctx.fillText("f₀ = " + r2(w0 / (2 * Math.PI)) + " Hz", cx - 60, cy - 80);
  },
  graphPoint: (s, p) => {
    const w = 2 * Math.PI * p.drive; const A = 8 / Math.sqrt(Math.pow(p.k - w * w, 2) + Math.pow(p.damping * w, 2));
    return { t: r2(s.t), x: r2(A * Math.sin(w * s.t)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "x", label: "Displacement (m)", color: "#2563eb" }],
  stats: (s, p) => { const w = 2 * Math.PI * p.drive, w0 = Math.sqrt(p.k);
    const A = 8 / Math.sqrt(Math.pow(p.k - w * w, 2) + Math.pow(p.damping * w, 2));
    return [{ label: "Natural freq", value: r2(w0 / (2 * Math.PI)), unit: "Hz" }, { label: "Drive freq", value: p.drive, unit: "Hz" },
      { label: "Amplitude", value: r2(A), unit: "m" }, { label: "Near resonance", value: (w > w0 * 0.9 && w < w0 * 1.1) ? "YES" : "no", unit: "" }]; },
};

const relativemotion = {
  title: "Relative Motion", topic: "mechanics", difficulty: "Beginner",
  summary: "Two trains on parallel tracks — see how relative velocity depends on the observer.",
  equation: "\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B",
  params: [
    { key: "vA", label: "Train A velocity", min: -20, max: 20, step: 1, default: 12, unit: "m/s" },
    { key: "vB", label: "Train B velocity", min: -20, max: 20, step: 1, default: -6, unit: "m/s" },
  ],
  init: () => ({ xa: 0, xb: 0, t: 0 }),
  step: (s, dt, p) => { s.xa += p.vA * dt; s.xb += p.vB * dt; s.t += dt; if (Math.abs(s.xa) > 40 || Math.abs(s.xb) > 40) { s.xa = 0; s.xb = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const sc = 7; const cx = W / 2;
    const drawTrain = (y, x, color, label) => {
      let px = cx + ((x * sc) % (W - 120)); ctx.fillStyle = color; ctx.fillRect(px - 30, y - 14, 60, 28);
      circle(ctx, px - 16, y + 16, 6, "#334155"); circle(ctx, px + 16, y + 16, 6, "#334155");
      ctx.fillStyle = "#fff"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center"; ctx.fillText(label, px, y + 4); ctx.textAlign = "left";
    };
    drawTrain(H / 2 - 50, s.xa, "#2563eb", "A"); drawTrain(H / 2 + 50, s.xb, "#f59e0b", "B");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), rel: p.vA - p.vB }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "rel", label: "Relative velocity of A wrt B", color: "#10b981" }],
  stats: (s, p) => [
    { label: "v of A wrt B", value: r2(p.vA - p.vB), unit: "m/s" }, { label: "v of B wrt A", value: r2(p.vB - p.vA), unit: "m/s" },
    { label: "Closing speed", value: r2(Math.abs(p.vA - p.vB)), unit: "m/s" }, { label: "Same direction", value: (p.vA * p.vB) >= 0 ? "yes" : "no", unit: "" }],
};

const simsMech = { kinematics1d, vectors, newton2, momentum2d, com, rotation, rolling, angmom, resonance, relativemotion };
export default simsMech;
