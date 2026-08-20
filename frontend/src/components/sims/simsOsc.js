// Oscillations simulations for KEP PhysicsVerse.
// Real SI physics with exact differential equations, analytical models, and responsive Canvas rendering.

const r2 = (x) => {
  if (x === null || x === undefined || isNaN(x) || !isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};
const r3 = (x) => {
  if (x === null || x === undefined || isNaN(x) || !isFinite(x)) return 0;
  return Math.round(x * 1000) / 1000;
};
const RAD = Math.PI / 180;

function circle(ctx, x, y, rad, fill, stroke, strokeWidth = 2) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, rad), 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke(); }
}

function arrow(ctx, x1, y1, x2, y2, color, w = 2.5) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const a = Math.atan2(dy, dx);
  const h = Math.min(10, Math.max(5, len * 0.3));
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45));
  ctx.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45));
  ctx.closePath();
  ctx.fill();
}

function drawSpringCoil(ctx, x1, y1, x2, y2, coils = 12, radius = 12, color = "#64748b", lineWidth = 2.5) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 5) return;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  const leadIn = Math.min(15, dist * 0.08);
  ctx.lineTo(leadIn, 0);

  const coilSpan = dist - 2 * leadIn;
  const numPts = coils * 2;
  for (let i = 1; i <= numPts; i++) {
    const cx = leadIn + (i / numPts) * coilSpan;
    const cy = (i % 2 === 1 ? -1 : 1) * radius * (i === numPts ? 0 : 1);
    ctx.lineTo(cx, cy);
  }

  ctx.lineTo(dist, 0);
  ctx.stroke();
  ctx.restore();
}

/* ================= 1. PERIODIC MOTION ================= */
const periodicmotion = {
  title: "Periodic Motion",
  topic: "mechanics",
  difficulty: "Beginner",
  summary: "Examine fundamental relationships of periodic motion: time period T = 1/f, frequency f = 1/T, and uniform circular reference projection.",
  equation: "T = \\frac{1}{f} \\qquad f = \\frac{1}{T} \\qquad \\omega = 2\\pi f = \\frac{2\\pi}{T}",
  params: [
    { key: "freq", label: "Frequency (f)", min: 0.2, max: 3.0, step: 0.1, default: 1.0, unit: "Hz" },
    { key: "amplitude", label: "Amplitude / Radius (R)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
    { key: "mode", label: "View Mode (1:Circular 2:Oscillator)", min: 1, max: 2, step: 1, default: 1, unit: "" },
  ],
  init: () => ({ t: 0, waveHistory: [] }),
  step: (s, dt, p) => {
    s.t += dt;
    const omega = 2 * Math.PI * p.freq;
    const x = p.amplitude * Math.cos(omega * s.t);
    const y = p.amplitude * Math.sin(omega * s.t);
    s.waveHistory.push({ t: s.t, x, y });
    if (s.waveHistory.length > 250) s.waveHistory.shift();
  },
  draw: (ctx, s, p, W, H) => {
    const omega = 2 * Math.PI * p.freq;
    const T = 1 / p.freq;
    const currentAngle = (omega * s.t) % (Math.PI * 2);
    const R_px = p.amplitude * 55;

    // Left side: Reference Circle & Phasor
    const cx = 150, cy = H / 2 - 10;

    // Reference circle
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, R_px, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - R_px - 20, cy); ctx.lineTo(cx + R_px + 20, cy);
    ctx.moveTo(cx, cy - R_px - 20); ctx.lineTo(cx, cy + R_px + 20);
    ctx.stroke();

    // Rotating point on circle
    const px = cx + R_px * Math.cos(currentAngle);
    const py = cy - R_px * Math.sin(currentAngle);

    // Phasor vector
    arrow(ctx, cx, cy, px, py, "#6366f1", 2.5);
    circle(ctx, cx, cy, 4, "#6366f1");
    circle(ctx, px, py, 6, "#8b5cf6", "#4c1d95");

    // Horizontal projection on X-axis (Harmonic position)
    const projX = cx + R_px * Math.cos(currentAngle);
    ctx.strokeStyle = "rgba(37,99,235,0.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(projX, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    circle(ctx, projX, cy, 8, "#2563eb", "#1d4ed8");

    // Right side: Scrolling Waveform x(t) = R cos(ωt)
    const waveStartX = 310;
    const waveW = W - waveStartX - 40;
    const waveCy = cy;

    // Wave axis
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(waveStartX, waveCy);
    ctx.lineTo(waveStartX + waveW, waveCy);
    ctx.stroke();

    // Axis label
    ctx.fillStyle = "#64748b";
    ctx.font = "600 11px 'Source Code Pro', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("x(t) = R cos(2π f t)", waveStartX, waveCy - R_px - 14);

    // Projection connection line from particle to wave
    ctx.strokeStyle = "rgba(37,99,235,0.3)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(projX, cy);
    ctx.lineTo(waveStartX, waveCy - (R_px * Math.cos(currentAngle)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw wave
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const timeSpan = 3.0; // Show 3 seconds of wave history
    for (let i = 0; i < s.waveHistory.length; i++) {
      const pt = s.waveHistory[i];
      const dtHist = s.t - pt.t;
      if (dtHist > timeSpan) continue;
      const wx = waveStartX + (dtHist / timeSpan) * waveW;
      const wy = waveCy - (pt.x / p.amplitude) * R_px;
      i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // Marker on wave lead
    const curWy = waveCy - (R_px * Math.cos(currentAngle));
    circle(ctx, waveStartX, curWy, 6, "#2563eb", "#1e40af");

    // Cycle & Frequency Information Banner
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, H - 48, W - 60, 36, 8);
    else ctx.rect(30, H - 48, W - 60, 36);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cycleCount = Math.floor(s.t * p.freq);
    ctx.fillText(`Period T = ${r2(T)} s • Frequency f = ${p.freq} Hz • Angular Speed ω = ${r2(omega)} rad/s • Completed Cycles: ${cycleCount}`, W / 2, H - 30);
  },
  graphPoint: (s, p) => {
    const omega = 2 * Math.PI * p.freq;
    return {
      t: r2(s.t),
      x: r2(p.amplitude * Math.cos(omega * s.t)),
      v: r2(-p.amplitude * omega * Math.sin(omega * s.t)),
    };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement x (m)", color: "#2563eb" },
    { key: "v", label: "Velocity v (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => {
    const T = 1 / p.freq;
    const omega = 2 * Math.PI * p.freq;
    const x = p.amplitude * Math.cos(omega * s.t);
    const v = -p.amplitude * omega * Math.sin(omega * s.t);
    return [
      { label: "Time Period T", value: r2(T), unit: "s" },
      { label: "Frequency f", value: p.freq, unit: "Hz" },
      { label: "Angular Frequency ω", value: r2(omega), unit: "rad/s" },
      { label: "Displacement x", value: r2(x), unit: "m" },
      { label: "Velocity v", value: r2(v), unit: "m/s" },
    ];
  },
};

/* ================= 2. SIMPLE HARMONIC MOTION (SHM) ================= */
const shm = {
  title: "Simple Harmonic Motion (SHM)",
  topic: "mechanics",
  difficulty: "Beginner",
  summary: "Simulate linear SHM with exact kinematic relationships: x(t) = A cos(ωt + φ), v(t) = -Aω sin(ωt + φ), and a(t) = -ω²x.",
  equation: "x(t) = A\\cos(\\omega t + \\phi) \\qquad v(t) = -A\\omega\\sin(\\omega t + \\phi) \\qquad a(t) = -\\omega^2 x",
  params: [
    { key: "amplitude", label: "Amplitude (A)", min: 0.5, max: 2.5, step: 0.1, default: 1.5, unit: "m" },
    { key: "period", label: "Time Period (T)", min: 0.8, max: 5.0, step: 0.1, default: 2.0, unit: "s" },
    { key: "phase", label: "Initial Phase (φ)", min: 0, max: 180, step: 15, default: 0, unit: "°" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const omega = (2 * Math.PI) / p.period;
    const phi = p.phase * RAD;
    const x = p.amplitude * Math.cos(omega * s.t + phi);
    const v = -p.amplitude * omega * Math.sin(omega * s.t + phi);
    const a = -omega * omega * x;

    const cy = H / 2 - 25;
    const eqX = W / 2;
    const scale = 110; // 1m -> 110px

    const blockX = eqX + x * scale;
    const maxSpan = p.amplitude * scale;

    // Track
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eqX - maxSpan - 60, cy + 30);
    ctx.lineTo(eqX + maxSpan + 60, cy + 30);
    ctx.stroke();

    // Extreme limit markers (+A, -A)
    ctx.strokeStyle = "rgba(239,68,68,0.5)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(eqX - maxSpan, cy - 40); ctx.lineTo(eqX - maxSpan, cy + 40);
    ctx.moveTo(eqX + maxSpan, cy - 40); ctx.lineTo(eqX + maxSpan, cy + 40);
    ctx.stroke();

    // Equilibrium marker (x = 0)
    ctx.strokeStyle = "rgba(16,185,129,0.7)";
    ctx.beginPath();
    ctx.moveTo(eqX, cy - 45); ctx.lineTo(eqX, cy + 45);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#10b981";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Equilibrium (x = 0)", eqX, cy - 48);

    ctx.fillStyle = "#ef4444";
    ctx.fillText("-A", eqX - maxSpan, cy - 44);
    ctx.fillText("+A", eqX + maxSpan, cy - 44);

    // Oscillating Particle
    circle(ctx, blockX, cy, 14, "#2563eb", "#1d4ed8", 2.5);

    // Vector 1: Velocity vector (Amber)
    const vScale = 22;
    if (Math.abs(v) > 0.05) {
      arrow(ctx, blockX, cy - 20, blockX + v * vScale, cy - 20, "#f59e0b", 2.5);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "700 11px 'Source Code Pro', monospace";
      ctx.textAlign = v >= 0 ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`v = ${r2(v)} m/s`, blockX + v * vScale + (v >= 0 ? 8 : -8), cy - 20);
    }

    // Vector 2: Acceleration vector (Emerald, points to x=0)
    const aScale = 8;
    if (Math.abs(a) > 0.05) {
      arrow(ctx, blockX, cy + 20, blockX + a * aScale, cy + 20, "#10b981", 2.5);
      ctx.fillStyle = "#10b981";
      ctx.font = "700 11px 'Source Code Pro', monospace";
      ctx.textAlign = a >= 0 ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`a = ${r2(a)} m/s²`, blockX + a * aScale + (a >= 0 ? 8 : -8), cy + 20);
    }

    // Educational banner
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, H - 48, W - 60, 36, 8);
    else ctx.rect(30, H - 48, W - 60, 36);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Restoring acceleration a ∝ -x • Velocity leads displacement by 90° • Acceleration is 180° out of phase`, W / 2, H - 30);
  },
  graphPoint: (s, p) => {
    const omega = (2 * Math.PI) / p.period;
    const phi = p.phase * RAD;
    const x = p.amplitude * Math.cos(omega * s.t + phi);
    const v = -p.amplitude * omega * Math.sin(omega * s.t + phi);
    const a = -omega * omega * x;
    return { t: r2(s.t), x: r2(x), v: r2(v), a: r2(a) };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement x (m)", color: "#2563eb" },
    { key: "v", label: "Velocity v (m/s)", color: "#f59e0b" },
    { key: "a", label: "Acceleration a (m/s²)", color: "#10b981" },
  ],
  stats: (s, p) => {
    const omega = (2 * Math.PI) / p.period;
    const phi = p.phase * RAD;
    const x = p.amplitude * Math.cos(omega * s.t + phi);
    const v = -p.amplitude * omega * Math.sin(omega * s.t + phi);
    const a = -omega * omega * x;
    const vmax = p.amplitude * omega;
    const amax = omega * omega * p.amplitude;
    return [
      { label: "Displacement x", value: r2(x), unit: "m" },
      { label: "Velocity v", value: r2(v), unit: "m/s" },
      { label: "Acceleration a", value: r2(a), unit: "m/s²" },
      { label: "Max Velocity v_max", value: r2(vmax), unit: "m/s" },
      { label: "Max Accel a_max", value: r2(amax), unit: "m/s²" },
      { label: "Angular freq ω", value: r2(omega), unit: "rad/s" },
    ];
  },
};

/* ================= 3. SIMPLE PENDULUM ================= */
const pendulum = {
  title: "Simple Pendulum",
  topic: "mechanics",
  difficulty: "Beginner",
  summary: "Simulate a simple pendulum with exact non-linear rotational dynamics, string tension, restoring torque, and small-angle comparison.",
  equation: "T = 2\\pi\\sqrt{\\frac{L}{g}} \\qquad \\frac{d^2\\theta}{dt^2} + \\frac{g}{L}\\sin\\theta = 0",
  params: [
    { key: "length", label: "String Length (L)", min: 0.5, max: 3.0, step: 0.1, default: 1.5, unit: "m" },
    { key: "gravity", label: "Gravity (g)", min: 1.0, max: 25.0, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "angle0", label: "Initial Angle (θ₀)", min: 5, max: 75, step: 1, default: 25, unit: "°" },
    { key: "mass", label: "Bob Mass (m)", min: 0.2, max: 5.0, step: 0.1, default: 1.0, unit: "kg" },
    { key: "damping", label: "Air Damping", min: 0, max: 0.4, step: 0.01, default: 0.02, unit: "" },
  ],
  init: (p) => ({
    theta: p.angle0 * RAD,
    omega: 0,
    t: 0,
  }),
  step: (s, dt, p) => {
    // Non-linear pendulum ODE: d²θ/dt² = -(g/L) sin(θ) - γ ω
    const alpha = -(p.gravity / p.length) * Math.sin(s.theta) - p.damping * s.omega;
    s.omega += alpha * dt;
    s.theta += s.omega * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const px = W / 2, py = 50;
    const lenPx = Math.min(p.length * 90, H - 150);
    const bx = px + lenPx * Math.sin(s.theta);
    const by = py + lenPx * Math.cos(s.theta);

    // Support ceiling clamp
    ctx.fillStyle = "#334155";
    ctx.fillRect(px - 60, py - 12, 120, 8);
    // Pivot screw
    circle(ctx, px, py, 5, "#64748b", "#334155");

    // Rest position vertical guide
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py + lenPx + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle protractor arc
    const arcR = 40;
    ctx.strokeStyle = "rgba(99,102,241,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, arcR, Math.PI / 2, Math.PI / 2 + s.theta, s.theta < 0);
    ctx.stroke();

    ctx.fillStyle = "#6366f1";
    ctx.font = "600 11px 'Source Code Pro', monospace";
    ctx.textAlign = s.theta >= 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`θ = ${r2(s.theta / RAD)}°`, px + (s.theta >= 0 ? 46 : -46), py + 24);

    // Pendulum string
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Bob
    const bobR = Math.max(12, Math.min(26, 10 + p.mass * 3.5));
    const grad = ctx.createRadialGradient(bx - bobR * 0.3, by - bobR * 0.3, bobR * 0.1, bx, by, bobR);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, bx, by, bobR, grad, "#1e40af", 2);

    // Tangential Velocity Vector
    const v_tan = p.length * s.omega;
    if (Math.abs(v_tan) > 0.05) {
      const vLen = v_tan * 24;
      const vx = bx + vLen * Math.cos(s.theta);
      const vy = by - vLen * Math.sin(s.theta);
      arrow(ctx, bx, by, vx, vy, "#f59e0b", 2.5);
    }

    // Educational banner
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, H - 48, W - 60, 36, 8);
    else ctx.rect(30, H - 48, W - 60, 36);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const T_small = 2 * Math.PI * Math.sqrt(p.length / p.gravity);
    ctx.fillText(`Small-angle Period T₀ = ${r2(T_small)} s • Restoring torque τ = -mgL sin θ • Independent of bob mass m`, W / 2, H - 30);
  },
  graphPoint: (s, p) => ({
    t: r2(s.t),
    angle: r2(s.theta / RAD),
    omega: r2(s.omega),
    v: r2(p.length * s.omega),
  }),
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "angle", label: "Angle θ (°)", color: "#2563eb" },
    { key: "omega", label: "Angular Velocity ω (rad/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => {
    const T0 = 2 * Math.PI * Math.sqrt(p.length / p.gravity);
    const f0 = 1 / T0;
    const v_tan = p.length * s.omega;
    const tension = p.mass * (p.gravity * Math.cos(s.theta) + p.length * s.omega * s.omega);
    return [
      { label: "Time Period T₀", value: r2(T0), unit: "s" },
      { label: "Frequency f", value: r2(f0), unit: "Hz" },
      { label: "Current Angle θ", value: r2(s.theta / RAD), unit: "°" },
      { label: "Angular speed ω", value: r2(s.omega), unit: "rad/s" },
      { label: "Linear Speed v", value: r2(Math.abs(v_tan)), unit: "m/s" },
      { label: "String Tension", value: r2(tension), unit: "N" },
    ];
  },
};

/* ================= 4. MASS-SPRING OSCILLATOR ================= */
const spring = {
  title: "Mass-Spring Oscillator",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary: "Simulate a mass on a spring adhering to Hooke's Law F = -kx with exact natural frequency ω = √(k/m) and time period T = 2π√(m/k).",
  equation: "F = -kx \\qquad \\omega = \\sqrt{\\frac{k}{m}} \\qquad T = 2\\pi\\sqrt{\\frac{m}{k}}",
  params: [
    { key: "mass", label: "Mass (m)", min: 0.5, max: 5.0, step: 0.2, default: 1.5, unit: "kg" },
    { key: "k", label: "Spring Constant (k)", min: 10, max: 150, step: 5, default: 50, unit: "N/m" },
    { key: "amplitude", label: "Amplitude (A)", min: 0.2, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
    { key: "damping", label: "Damping (c)", min: 0, max: 1.5, step: 0.05, default: 0.08, unit: "N·s/m" },
  ],
  init: (p) => ({
    x: p.amplitude,
    v: 0,
    t: 0,
  }),
  step: (s, dt, p) => {
    // Exact differential equation: m x'' + c x' + k x = 0
    const a = -(p.k / p.mass) * s.x - (p.damping / p.mass) * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const wallX = 80;
    const cy = H / 2 - 15;
    const eqX = W / 2;
    const scale = 95; // 1m -> 95px
    const blockX = eqX + s.x * scale;

    // Rigid Wall
    ctx.fillStyle = "#334155";
    ctx.fillRect(wallX - 16, cy - 70, 16, 140);
    // Wall hatch pattern
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    for (let y = cy - 65; y <= cy + 65; y += 12) {
      ctx.beginPath();
      ctx.moveTo(wallX - 16, y);
      ctx.lineTo(wallX - 4, y - 10);
      ctx.stroke();
    }

    // Floor
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX - 16, cy + 36);
    ctx.lineTo(W - 40, cy + 36);
    ctx.stroke();

    // Equilibrium marker (x = 0)
    ctx.strokeStyle = "rgba(16,185,129,0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(eqX, cy - 50);
    ctx.lineTo(eqX, cy + 45);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#10b981";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("x = 0 (Equilibrium)", eqX, cy - 52);

    // Spring Coils
    const blockSize = Math.max(44, Math.min(70, 36 + p.mass * 8));
    const springEndX = blockX - blockSize / 2;
    drawSpringCoil(ctx, wallX, cy, springEndX, cy, 14, 15, "#64748b", 2.5);

    // Mass Block
    const grad = ctx.createLinearGradient(blockX - blockSize / 2, cy - blockSize / 2, blockX + blockSize / 2, cy + blockSize / 2);
    grad.addColorStop(0, "#3b82f6"); grad.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = grad;
    ctx.fillRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${p.mass} kg`, blockX, cy);

    // Restoring Spring Force vector F = -kx (Red)
    const F_spring = -p.k * s.x;
    if (Math.abs(F_spring) > 1) {
      const fVecLen = Math.max(-60, Math.min(60, F_spring * 0.9));
      arrow(ctx, blockX, cy - blockSize / 2 - 14, blockX + fVecLen, cy - blockSize / 2 - 14, "#ef4444", 2.5);
      ctx.fillStyle = "#ef4444";
      ctx.font = "700 11px 'Source Code Pro', monospace";
      ctx.textAlign = fVecLen >= 0 ? "left" : "right";
      ctx.fillText(`F_s = ${r2(F_spring)} N`, blockX + fVecLen + (fVecLen >= 0 ? 6 : -6), cy - blockSize / 2 - 14);
    }

    // Educational banner
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, H - 48, W - 60, 36, 8);
    else ctx.rect(30, H - 48, W - 60, 36);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const T_calc = 2 * Math.PI * Math.sqrt(p.mass / p.k);
    ctx.fillText(`Period T = ${r2(T_calc)} s • Frequency f = ${r2(1 / T_calc)} Hz • Restoring Force F = -kx`, W / 2, H - 30);
  },
  graphPoint: (s, p) => ({
    t: r2(s.t),
    x: r2(s.x),
    v: r2(s.v),
    F: r2(-p.k * s.x),
  }),
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement x (m)", color: "#2563eb" },
    { key: "v", label: "Velocity v (m/s)", color: "#f59e0b" },
    { key: "F", label: "Spring Force F (N)", color: "#ef4444" },
  ],
  stats: (s, p) => {
    const omega = Math.sqrt(p.k / p.mass);
    const T = (2 * Math.PI) / omega;
    const f = 1 / T;
    const F_spring = -p.k * s.x;
    return [
      { label: "Time Period T", value: r2(T), unit: "s" },
      { label: "Frequency f", value: r2(f), unit: "Hz" },
      { label: "Displacement x", value: r2(s.x), unit: "m" },
      { label: "Velocity v", value: r2(s.v), unit: "m/s" },
      { label: "Spring Force F", value: r2(F_spring), unit: "N" },
      { label: "Angular Freq ω", value: r2(omega), unit: "rad/s" },
    ];
  },
};

/* ================= 5. ENERGY IN SHM ================= */
const energyshm = {
  title: "Energy in SHM",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary: "Track the continuous interchange between kinetic energy KE = ½mv² and potential energy PE = ½kx², proving that total mechanical energy E = ½kA² remains constant.",
  equation: "E = \\tfrac{1}{2}kA^2 \\qquad KE = \\tfrac{1}{2}mv^2 \\qquad PE = \\tfrac{1}{2}kx^2 \\qquad E = KE + PE = \\text{const}",
  params: [
    { key: "mass", label: "Mass (m)", min: 0.5, max: 4.0, step: 0.5, default: 1.5, unit: "kg" },
    { key: "k", label: "Spring Constant (k)", min: 10, max: 120, step: 5, default: 45, unit: "N/m" },
    { key: "amplitude", label: "Amplitude (A)", min: 0.4, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: (p) => ({
    x: p.amplitude,
    v: 0,
    t: 0,
  }),
  step: (s, dt, p) => {
    const omega = Math.sqrt(p.k / p.mass);
    s.t += dt;
    // Exact conservative SHM
    s.x = p.amplitude * Math.cos(omega * s.t);
    s.v = -p.amplitude * omega * Math.sin(omega * s.t);
  },
  draw: (ctx, s, p, W, H) => {
    const E_total = 0.5 * p.k * p.amplitude * p.amplitude;
    const PE = 0.5 * p.k * s.x * s.x;
    const KE = Math.max(0, E_total - PE);

    // Top section: Mass-spring animation
    const wallX = 70;
    const topCy = 85;
    const eqX = 260;
    const scale = 75;
    const blockX = eqX + s.x * scale;
    const blockSize = 40;

    // Wall & floor
    ctx.fillStyle = "#334155";
    ctx.fillRect(wallX - 12, topCy - 35, 12, 70);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wallX - 12, topCy + blockSize / 2);
    ctx.lineTo(440, topCy + blockSize / 2);
    ctx.stroke();

    // Spring
    drawSpringCoil(ctx, wallX, topCy, blockX - blockSize / 2, topCy, 11, 11, "#64748b", 2);

    // Mass
    circle(ctx, blockX, topCy, blockSize / 2, "#2563eb", "#1d4ed8", 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${p.mass}kg`, blockX, topCy);

    // Bottom section: Potential Well Parabola PE(x) = 1/2 k x²
    const wellX0 = 60;
    const wellW = 380;
    const wellY0 = H - 60;
    const wellH = 110;
    const wellEqX = wellX0 + wellW / 2;

    // Energy Well Axes
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wellX0, wellY0); ctx.lineTo(wellX0 + wellW, wellY0);
    ctx.moveTo(wellEqX, wellY0 - wellH - 15); ctx.lineTo(wellEqX, wellY0 + 5);
    ctx.stroke();

    // Total Energy Line (Green)
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(wellX0 + 20, wellY0 - wellH);
    ctx.lineTo(wellX0 + wellW - 20, wellY0 - wellH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#10b981";
    ctx.font = "700 11px 'Source Code Pro', monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`E_total = ${r2(E_total)} J`, wellX0 + wellW - 130, wellY0 - wellH - 10);

    // Draw Parabola PE(x)
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= wellW; i += 4) {
      const curX_m = ((i - wellW / 2) / (wellW / 2)) * (p.amplitude * 1.25);
      const peVal = 0.5 * p.k * curX_m * curX_m;
      const py = wellY0 - (peVal / (E_total * 1.5)) * wellH;
      i === 0 ? ctx.moveTo(wellX0 + i, py) : ctx.lineTo(wellX0 + i, py);
    }
    ctx.stroke();

    // Current State Point on Parabola
    const ptCanvasX = wellEqX + (s.x / (p.amplitude * 1.25)) * (wellW / 2);
    const ptCanvasY = wellY0 - (PE / (E_total * 1.5)) * wellH;
    circle(ctx, ptCanvasX, ptCanvasY, 7, "#f59e0b", "#b45309", 2);

    // Right side: Energy Bar Meters (KE, PE, Total)
    const barX = W - 220;
    const barW = 32;
    const barMaxH = 150;
    const barBaseY = H - 65;

    // PE Bar (Blue)
    const peH = (PE / E_total) * barMaxH;
    ctx.fillStyle = "rgba(37,99,235,0.15)";
    ctx.fillRect(barX, barBaseY - barMaxH, barW, barMaxH);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(barX, barBaseY - peH, barW, peH);
    ctx.strokeStyle = "#1e40af"; ctx.strokeRect(barX, barBaseY - barMaxH, barW, barMaxH);

    ctx.fillStyle = "#2563eb";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PE", barX + barW / 2, barBaseY + 14);
    ctx.font = "600 10px 'Source Code Pro', monospace";
    ctx.fillText(`${r2(PE)} J`, barX + barW / 2, barBaseY - peH - 6);

    // KE Bar (Amber)
    const keH = (KE / E_total) * barMaxH;
    ctx.fillStyle = "rgba(245,158,11,0.15)";
    ctx.fillRect(barX + 55, barBaseY - barMaxH, barW, barMaxH);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(barX + 55, barBaseY - keH, barW, keH);
    ctx.strokeStyle = "#b45309"; ctx.strokeRect(barX + 55, barBaseY - barMaxH, barW, barMaxH);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.fillText("KE", barX + 55 + barW / 2, barBaseY + 14);
    ctx.font = "600 10px 'Source Code Pro', monospace";
    ctx.fillText(`${r2(KE)} J`, barX + 55 + barW / 2, barBaseY - keH - 6);

    // Total Energy Bar (Green)
    ctx.fillStyle = "rgba(16,185,129,0.15)";
    ctx.fillRect(barX + 110, barBaseY - barMaxH, barW, barMaxH);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(barX + 110, barBaseY - barMaxH, barW, barMaxH);
    ctx.strokeStyle = "#047857"; ctx.strokeRect(barX + 110, barBaseY - barMaxH, barW, barMaxH);

    ctx.fillStyle = "#10b981";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.fillText("Total E", barX + 110 + barW / 2, barBaseY + 14);
    ctx.font = "600 10px 'Source Code Pro', monospace";
    ctx.fillText(`${r2(E_total)} J`, barX + 110 + barW / 2, barBaseY - barMaxH - 6);
  },
  graphPoint: (s, p) => {
    const E_total = 0.5 * p.k * p.amplitude * p.amplitude;
    const PE = 0.5 * p.k * s.x * s.x;
    const KE = Math.max(0, E_total - PE);
    return {
      t: r2(s.t),
      E: r2(E_total),
      PE: r2(PE),
      KE: r2(KE),
    };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "E", label: "Total Energy E (J)", color: "#10b981" },
    { key: "KE", label: "Kinetic Energy KE (J)", color: "#f59e0b" },
    { key: "PE", label: "Potential Energy PE (J)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const E_total = 0.5 * p.k * p.amplitude * p.amplitude;
    const PE = 0.5 * p.k * s.x * s.x;
    const KE = Math.max(0, E_total - PE);
    return [
      { label: "Total Energy E", value: r2(E_total), unit: "J" },
      { label: "Kinetic Energy KE", value: r2(KE), unit: "J" },
      { label: "Potential Energy PE", value: r2(PE), unit: "J" },
      { label: "Displacement x", value: r2(s.x), unit: "m" },
      { label: "Speed |v|", value: r2(Math.abs(s.v)), unit: "m/s" },
      { label: "Conservation", value: "KE + PE = E", unit: "" },
    ];
  },
};

/* ================= 6. DAMPED OSCILLATIONS ================= */
const damping = {
  title: "Damped Oscillations",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary: "Explore damped harmonic motion m x'' + c x' + kx = 0 across underdamped (ζ < 1), critically damped (ζ = 1), and overdamped (ζ > 1) regimes with exponential decay envelopes.",
  equation: "x(t) = A_0 e^{-\\beta t}\\cos(\\omega_d t + \\phi) \\qquad \\beta = \\frac{c}{2m} \\qquad \\omega_d = \\sqrt{\\omega_0^2 - \\beta^2}",
  params: [
    { key: "dampingType", label: "Regime (1:Under 2:Critical 3:Over 4:Custom)", min: 1, max: 4, step: 1, default: 1, unit: "" },
    { key: "c", label: "Damping coefficient (c)", min: 0.1, max: 15.0, step: 0.1, default: 1.2, unit: "N·s/m" },
    { key: "mass", label: "Mass (m)", min: 0.5, max: 4.0, step: 0.5, default: 1.5, unit: "kg" },
    { key: "k", label: "Spring constant (k)", min: 20, max: 100, step: 5, default: 45, unit: "N/m" },
    { key: "amplitude", label: "Initial Amplitude (A₀)", min: 0.5, max: 2.0, step: 0.1, default: 1.4, unit: "m" },
  ],
  init: (p) => {
    let effectiveC = p.c;
    const omega0 = Math.sqrt(p.k / p.mass);
    const c_crit = 2 * Math.sqrt(p.k * p.mass);

    if (p.dampingType === 1) effectiveC = c_crit * 0.2; // Underdamped (zeta = 0.2)
    else if (p.dampingType === 2) effectiveC = c_crit;     // Critically damped (zeta = 1.0)
    else if (p.dampingType === 3) effectiveC = c_crit * 2.2; // Overdamped (zeta = 2.2)

    return {
      x: p.amplitude,
      v: 0,
      t: 0,
      history: [{ t: 0, x: p.amplitude }],
    };
  },
  step: (s, dt, p) => {
    let effectiveC = p.c;
    const c_crit = 2 * Math.sqrt(p.k * p.mass);
    if (p.dampingType === 1) effectiveC = c_crit * 0.2;
    else if (p.dampingType === 2) effectiveC = c_crit;
    else if (p.dampingType === 3) effectiveC = c_crit * 2.2;

    // Damped ODE integration
    const a = -(p.k / p.mass) * s.x - (effectiveC / p.mass) * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;

    s.history.push({ t: s.t, x: s.x });
    if (s.history.length > 400) s.history.shift();
  },
  draw: (ctx, s, p, W, H) => {
    let effectiveC = p.c;
    const omega0 = Math.sqrt(p.k / p.mass);
    const c_crit = 2 * Math.sqrt(p.k * p.mass);
    if (p.dampingType === 1) effectiveC = c_crit * 0.2;
    else if (p.dampingType === 2) effectiveC = c_crit;
    else if (p.dampingType === 3) effectiveC = c_crit * 2.2;

    const beta = effectiveC / (2 * p.mass);
    const zeta = effectiveC / c_crit;

    // Top section: Mass + Spring + Dashpot Damper
    const cy = 80;
    const wallX = 70;
    const eqX = 280;
    const scale = 80;
    const blockX = eqX + s.x * scale;
    const blockSize = 42;

    // Wall & floor
    ctx.fillStyle = "#334155";
    ctx.fillRect(wallX - 14, cy - 45, 14, 90);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wallX - 14, cy + blockSize / 2 + 5);
    ctx.lineTo(500, cy + blockSize / 2 + 5);
    ctx.stroke();

    // Spring (top half of wall connection)
    drawSpringCoil(ctx, wallX, cy - 14, blockX - blockSize / 2, cy - 14, 10, 9, "#64748b", 2);

    // Dashpot Damper (bottom half of wall connection)
    const damperY = cy + 14;
    const cylinderW = 60;
    // Cylinder body attached to wall
    ctx.fillStyle = "rgba(148,163,184,0.3)";
    ctx.fillRect(wallX, damperY - 8, cylinderW, 16);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.5;
    ctx.strokeRect(wallX, damperY - 8, cylinderW, 16);
    // Piston rod attached to mass
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(blockX - blockSize / 2, damperY);
    ctx.lineTo(wallX + cylinderW * 0.6, damperY);
    ctx.stroke();
    // Piston head
    ctx.fillStyle = "#475569";
    ctx.fillRect(wallX + cylinderW * 0.55, damperY - 7, 4, 14);

    // Mass
    const grad = ctx.createLinearGradient(blockX - blockSize / 2, cy - blockSize / 2, blockX + blockSize / 2, cy + blockSize / 2);
    grad.addColorStop(0, "#3b82f6"); grad.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = grad;
    ctx.fillRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);
    ctx.strokeStyle = "#1e40af"; ctx.lineWidth = 2;
    ctx.strokeRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${p.mass}kg`, blockX, cy);

    // Bottom section: Real-time Damped Waveform + Envelope Curves
    const plotX0 = 60;
    const plotW = W - 120;
    const plotCy = H - 95;
    const plotH = 65;
    const tSpan = 8.0;

    // Axes
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotCy); ctx.lineTo(plotX0 + plotW, plotCy);
    ctx.moveTo(plotX0, plotCy - plotH - 10); ctx.lineTo(plotX0, plotCy + plotH + 10);
    ctx.stroke();

    // Exponential Envelopes ± A₀ e^(-βt) (Dashed Purple)
    if (zeta < 1) {
      ctx.strokeStyle = "rgba(168,85,247,0.7)";
      ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);

      // Upper envelope
      ctx.beginPath();
      for (let x = 0; x <= plotW; x += 4) {
        const tVal = (x / plotW) * tSpan;
        const envY = plotCy - (p.amplitude * Math.exp(-beta * tVal) / (p.amplitude * 1.2)) * plotH;
        x === 0 ? ctx.moveTo(plotX0 + x, envY) : ctx.lineTo(plotX0 + x, envY);
      }
      ctx.stroke();

      // Lower envelope
      ctx.beginPath();
      for (let x = 0; x <= plotW; x += 4) {
        const tVal = (x / plotW) * tSpan;
        const envY = plotCy + (p.amplitude * Math.exp(-beta * tVal) / (p.amplitude * 1.2)) * plotH;
        x === 0 ? ctx.moveTo(plotX0 + x, envY) : ctx.lineTo(plotX0 + x, envY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Trajectory curve
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < s.history.length; i++) {
      const pt = s.history[i];
      if (pt.t > tSpan) continue;
      const px = plotX0 + (pt.t / tSpan) * plotW;
      const py = plotCy - (pt.x / (p.amplitude * 1.2)) * plotH;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current position on plot
    if (s.t <= tSpan) {
      const curPx = plotX0 + (s.t / tSpan) * plotW;
      const curPy = plotCy - (s.x / (p.amplitude * 1.2)) * plotH;
      circle(ctx, curPx, curPy, 5, "#f59e0b", "#b45309", 2);
    }

    // Regime Badge
    const regimeName = zeta < 0.98 ? "Underdamped (Oscillatory Decay)" : zeta < 1.05 ? "Critically Damped (Fastest Return)" : "Overdamped (Sluggish Return)";
    const badgeColor = zeta < 0.98 ? "#2563eb" : zeta < 1.05 ? "#10b981" : "#f59e0b";

    ctx.fillStyle = badgeColor;
    ctx.font = "700 13px Outfit, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${regimeName} • Damping Ratio ζ = ${r2(zeta)} • Decay β = ${r2(beta)} s⁻¹`, W / 2, H - 20);
  },
  graphPoint: (s, p) => {
    let effectiveC = p.c;
    const c_crit = 2 * Math.sqrt(p.k * p.mass);
    if (p.dampingType === 1) effectiveC = c_crit * 0.2;
    else if (p.dampingType === 2) effectiveC = c_crit;
    else if (p.dampingType === 3) effectiveC = c_crit * 2.2;
    const beta = effectiveC / (2 * p.mass);
    const envelope = p.amplitude * Math.exp(-beta * s.t);
    return {
      t: r2(s.t),
      x: r2(s.x),
      envelope: r2(envelope),
    };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement x (m)", color: "#2563eb" },
    { key: "envelope", label: "Envelope A₀e^(-βt) (m)", color: "#8b5cf6" },
  ],
  stats: (s, p) => {
    let effectiveC = p.c;
    const omega0 = Math.sqrt(p.k / p.mass);
    const c_crit = 2 * Math.sqrt(p.k * p.mass);
    if (p.dampingType === 1) effectiveC = c_crit * 0.2;
    else if (p.dampingType === 2) effectiveC = c_crit;
    else if (p.dampingType === 3) effectiveC = c_crit * 2.2;

    const beta = effectiveC / (2 * p.mass);
    const zeta = effectiveC / c_crit;
    const omega_d = zeta < 1 ? Math.sqrt(Math.max(0, omega0 * omega0 - beta * beta)) : 0;
    const Q = omega0 / (2 * Math.max(0.01, beta));
    const regime = zeta < 0.98 ? "Underdamped" : zeta < 1.05 ? "Critical" : "Overdamped";

    return [
      { label: "Damping Ratio ζ", value: r2(zeta), unit: "" },
      { label: "Decay Constant β", value: r2(beta), unit: "s⁻¹" },
      { label: "Damped Freq ω_d", value: r2(omega_d), unit: "rad/s" },
      { label: "Quality Factor Q", value: r2(Q), unit: "" },
      { label: "Displacement x", value: r2(s.x), unit: "m" },
      { label: "Regime", value: regime, unit: "" },
    ];
  },
};

/* ================= 7. FORCED OSCILLATIONS & RESONANCE ================= */
const resonance = {
  title: "Forced Oscillations & Resonance",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Simulate a driven damped oscillator m x'' + c x' + kx = F₀ cos(ωt). Observe how steady-state amplitude reaches its dramatic peak when driving frequency ω approaches natural frequency ω₀.",
  equation: "A(\\omega) = \\frac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (2\\beta\\omega)^2}} \\qquad \\tan\\delta = \\frac{2\\beta\\omega}{\\omega_0^2 - \\omega^2}",
  params: [
    { key: "driveFreq", label: "Driving Frequency (ω)", min: 1.0, max: 14.0, step: 0.2, default: 5.5, unit: "rad/s" },
    { key: "k", label: "Spring Constant (k)", min: 20, max: 120, step: 5, default: 45, unit: "N/m" },
    { key: "mass", label: "Mass (m)", min: 0.5, max: 3.0, step: 0.5, default: 1.5, unit: "kg" },
    { key: "c", label: "Damping (c)", min: 0.2, max: 3.0, step: 0.1, default: 0.8, unit: "N·s/m" },
    { key: "f0", label: "Driving Force (F₀)", min: 5, max: 40, step: 5, default: 20, unit: "N" },
  ],
  init: () => ({
    x: 0,
    v: 0,
    t: 0,
  }),
  step: (s, dt, p) => {
    // Driven damped oscillator ODE
    const F_drive = p.f0 * Math.cos(p.driveFreq * s.t);
    const a = (F_drive - p.c * s.v - p.k * s.x) / p.mass;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const omega0 = Math.sqrt(p.k / p.mass);
    const beta = p.c / (2 * p.mass);
    const denom = Math.sqrt(Math.pow(omega0 * omega0 - p.driveFreq * p.driveFreq, 2) + Math.pow(2 * beta * p.driveFreq, 2));
    const steadyA = (p.f0 / p.mass) / Math.max(0.01, denom);

    // Left side: Physical Driver + Mass-Spring System
    const cy = H / 2 - 25;
    const motorX = 70;
    const eqX = 230;
    const scale = 50;
    const blockX = eqX + s.x * scale;
    const blockSize = 38;

    // Motor driver wheel
    const crankR = 20;
    const crankAngle = p.driveFreq * s.t;
    const crankPinX = motorX + crankR * Math.cos(crankAngle);
    const crankPinY = cy + crankR * Math.sin(crankAngle);

    // Motor body
    circle(ctx, motorX, cy, crankR + 6, "#334155", "#1e293b", 2);
    circle(ctx, motorX, cy, 4, "#94a3b8");
    circle(ctx, crankPinX, crankPinY, 5, "#ef4444", "#991b1b", 2);

    // Connecting Rod from motor pin to spring base
    const springBaseX = 140 + crankR * Math.cos(crankAngle);
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(crankPinX, crankPinY); ctx.lineTo(springBaseX, cy);
    ctx.stroke();

    // Spring connecting driver to mass
    drawSpringCoil(ctx, springBaseX, cy, blockX - blockSize / 2, cy, 11, 12, "#64748b", 2);

    // Mass
    const grad = ctx.createLinearGradient(blockX - blockSize / 2, cy - blockSize / 2, blockX + blockSize / 2, cy + blockSize / 2);
    grad.addColorStop(0, "#3b82f6"); grad.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = grad;
    ctx.fillRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);
    ctx.strokeStyle = "#1e40af"; ctx.lineWidth = 2;
    ctx.strokeRect(blockX - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${p.mass}kg`, blockX, cy);

    // Right side: Resonance Response Curve A(ω) vs ω
    const curveX0 = 360;
    const curveW = W - curveX0 - 40;
    const curveY0 = H - 65;
    const curveH = 150;
    const maxOmega = 14.0;
    const maxPlotA = ((p.f0 / p.mass) / (2 * beta * omega0)) * 1.15; // Max peak scale

    // Axes
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(curveX0, curveY0); ctx.lineTo(curveX0 + curveW, curveY0);
    ctx.moveTo(curveX0, curveY0 - curveH - 10); ctx.lineTo(curveX0, curveY0 + 5);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#64748b";
    ctx.font = "600 10px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Driving Frequency ω (rad/s)", curveX0 + curveW / 2, curveY0 + 20);

    // Natural Frequency ω₀ dashed vertical line
    const omega0X = curveX0 + (omega0 / maxOmega) * curveW;
    ctx.strokeStyle = "rgba(239,68,68,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(omega0X, curveY0); ctx.lineTo(omega0X, curveY0 - curveH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "600 10px 'Source Code Pro', monospace";
    ctx.fillText(`ω₀ = ${r2(omega0)}`, omega0X, curveY0 - curveH - 4);

    // Plot Resonance Curve A(ω)
    ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= curveW; x += 3) {
      const om = (x / curveW) * maxOmega;
      const d = Math.sqrt(Math.pow(omega0 * omega0 - om * om, 2) + Math.pow(2 * beta * om, 2));
      const amp = (p.f0 / p.mass) / Math.max(0.01, d);
      const py = curveY0 - (amp / maxPlotA) * curveH;
      x === 0 ? ctx.moveTo(curveX0 + x, py) : ctx.lineTo(curveX0 + x, py);
    }
    ctx.stroke();

    // Current Driving Frequency Marker on Curve
    const curCurveX = curveX0 + (p.driveFreq / maxOmega) * curveW;
    const curCurveY = curveY0 - (steadyA / maxPlotA) * curveH;
    circle(ctx, curCurveX, curCurveY, 6, "#f59e0b", "#b45309", 2);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "700 10px 'Source Code Pro', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`A = ${r2(steadyA)} m`, curCurveX + 8, curCurveY - 2);

    // Educational banner
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(30, H - 48, W - 60, 36, 8);
    else ctx.rect(30, H - 48, W - 60, 36);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const isNearResonance = Math.abs(p.driveFreq - omega0) < 0.6;
    ctx.fillText(isNearResonance ? `🔥 RESONANCE PEAK: Driving frequency matches natural frequency (ω ≈ ω₀)!` : `Drive Frequency ω = ${p.driveFreq} rad/s • Natural Frequency ω₀ = ${r2(omega0)} rad/s • Max Amplitude at ω ≈ ω₀`, W / 2, H - 30);
  },
  graphPoint: (s, p) => {
    const F_drive = p.f0 * Math.cos(p.driveFreq * s.t);
    return {
      t: r2(s.t),
      x: r2(s.x),
      F_drive: r2(F_drive / 10), // Scaled for graph overlay
    };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "x", label: "Displacement x (m)", color: "#2563eb" },
    { key: "F_drive", label: "Drive Force F/10 (N)", color: "#ef4444" },
  ],
  stats: (s, p) => {
    const omega0 = Math.sqrt(p.k / p.mass);
    const beta = p.c / (2 * p.mass);
    const denom = Math.sqrt(Math.pow(omega0 * omega0 - p.driveFreq * p.driveFreq, 2) + Math.pow(2 * beta * p.driveFreq, 2));
    const steadyA = (p.f0 / p.mass) / Math.max(0.01, denom);
    const phaseLagRad = Math.atan2(2 * beta * p.driveFreq, omega0 * omega0 - p.driveFreq * p.driveFreq);
    const Q = omega0 / (2 * beta);

    return [
      { label: "Drive Frequency ω", value: p.driveFreq, unit: "rad/s" },
      { label: "Natural Freq ω₀", value: r2(omega0), unit: "rad/s" },
      { label: "Steady Amplitude A", value: r2(steadyA), unit: "m" },
      { label: "Phase Lag δ", value: r2(phaseLagRad / RAD), unit: "°" },
      { label: "Quality Factor Q", value: r2(Q), unit: "" },
      { label: "Current x", value: r2(s.x), unit: "m" },
    ];
  },
};

const simsOsc = {
  periodicmotion,
  shm,
  pendulum,
  spring,
  energyshm,
  damping,
  resonance,
};

export default simsOsc;
