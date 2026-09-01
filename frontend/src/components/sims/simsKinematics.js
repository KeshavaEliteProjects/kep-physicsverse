// Distinct 1D/2D Kinematics simulations — one concept, one sim.
// SimEngine-compatible configs. Drop this file in components/sims/ and
// import it into registry.js alongside simsMech, simsEM, etc.
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

/* ============ 1. POSITION & DISPLACEMENT ============
   Object wanders along a bent path (out-and-back-ish). Shows the difference
   between the actual path travelled (distance) and the straight-line
   displacement from the start point. This is the concept "distance vs
   displacement" is actually about — a different question than the
   "Distance" odometer sim below. */
const displacement = {
  title: "Position & Displacement", topic: "mechanics", difficulty: "Beginner",
  summary: "Walk a bent path and compare your straight-line displacement to the path you actually walked.",
  equation: "\\vec{d} = \\vec{r}_f - \\vec{r}_i \\quad (\\text{displacement} \\ne \\text{path length})",
  params: [
    { key: "speed", label: "Walking speed", min: 1, max: 8, step: 0.5, default: 3, unit: "m/s" },
    { key: "turn", label: "Turn sharpness", min: 0, max: 100, step: 5, default: 55, unit: "%" },
  ],
  init: (p) => ({ t: 0, path: [{ x: 0, y: 0 }], x: 0, y: 0, dist: 0, leg: 0 }),
  step: (s, dt, p) => {
    const legLen = 3.2;
    const angle = (p.turn / 100) * 2.1; // radians of turn per leg
    const legIndex = Math.floor(s.leg);
    const dirAngle = legIndex * angle;
    const vx = p.speed * Math.cos(dirAngle), vy = p.speed * Math.sin(dirAngle);
    s.x += vx * dt; s.y += vy * dt;
    s.dist += p.speed * dt;
    s.leg += (p.speed * dt) / legLen;
    s.t += dt;
    s.path.push({ x: s.x, y: s.y });
    if (s.leg > 5) { s.x = 0; s.y = 0; s.dist = 0; s.leg = 0; s.t = 0; s.path = [{ x: 0, y: 0 }]; }
  },
  draw: (ctx, s, p, W, H) => {
    const ox = W / 2 - 100, oy = H / 2 + 60, sc = 16;
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath();
    s.path.forEach((pt, i) => {
      const sx = ox + pt.x * sc, sy = oy - pt.y * sc;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    // displacement vector (dashed, green)
    ctx.strokeStyle = "#10b981"; ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + s.x * sc, oy - s.y * sc); ctx.stroke();
    ctx.setLineDash([]);
    circle(ctx, ox, oy, 6, "#334155");
    circle(ctx, ox + s.x * sc, oy - s.y * sc, 8, "#f59e0b", "#b45309");
    ctx.fillStyle = "#10b981"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("displacement", ox + s.x * sc / 2 + 10, oy - s.y * sc / 2);
  },
  graphPoint: (s) => ({ t: r2(s.t), dist: r2(s.dist), disp: r2(Math.hypot(s.x, s.y)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "dist", label: "Distance travelled (m)", color: "#2563eb" },
    { key: "disp", label: "Displacement magnitude (m)", color: "#10b981" },
  ],
  stats: (s) => [
    { label: "Distance", value: r2(s.dist), unit: "m" },
    { label: "Displacement", value: r2(Math.hypot(s.x, s.y)), unit: "m" },
    { label: "Ratio disp/dist", value: s.dist > 0 ? r2(Math.hypot(s.x, s.y) / s.dist) : 0, unit: "" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 2. DISTANCE (odometer) ============
   Straight-line back-and-forth motion; distance is the total odometer
   reading, which only ever increases, unlike position/displacement. */
const distancetracker = {
  title: "Distance Travelled", topic: "mechanics", difficulty: "Beginner",
  summary: "Watch the odometer climb — distance keeps adding up even when the object turns back.",
  equation: "\\text{distance} = \\int |v| \\, dt",
  params: [
    { key: "speed", label: "Speed", min: 1, max: 10, step: 0.5, default: 4, unit: "m/s" },
    { key: "range", label: "Track half-length", min: 3, max: 15, step: 1, default: 8, unit: "m" },
  ],
  init: () => ({ x: 0, dir: 1, dist: 0, t: 0 }),
  step: (s, dt, p) => {
    s.x += s.dir * p.speed * dt;
    s.dist += p.speed * dt;
    s.t += dt;
    if (s.x > p.range) { s.x = p.range; s.dir = -1; }
    if (s.x < -p.range) { s.x = -p.range; s.dir = 1; }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, sc = (W - 140) / (2 * p.range), ox = W / 2;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox - p.range * sc, cy + 30); ctx.lineTo(ox + p.range * sc, cy + 30); ctx.stroke();
    circle(ctx, ox + s.x * sc, cy, 12, "#2563eb", "#1e40af");
    // odometer readout box
    ctx.fillStyle = "#0f172a"; ctx.fillRect(ox - 70, 40, 140, 46);
    ctx.fillStyle = "#22c55e"; ctx.font = "700 20px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText(r2(s.dist).toFixed(1) + " m", ox, 70);
    ctx.textAlign = "left";
  },
  graphPoint: (s) => ({ t: r2(s.t), dist: r2(s.dist), x: r2(s.x) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "dist", label: "Total distance (m)", color: "#22c55e" },
    { key: "x", label: "Position (m)", color: "#2563eb" },
  ],
  stats: (s) => [
    { label: "Total distance", value: r2(s.dist), unit: "m" },
    { label: "Current position", value: r2(s.x), unit: "m" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 3. SPEED & VELOCITY ============
   Object oscillates; compares scalar average speed to vector average
   velocity, making the sign/direction distinction concrete. */
const speedvelocity = {
  title: "Speed vs Velocity", topic: "mechanics", difficulty: "Beginner",
  summary: "Bounce a ball between two walls and compare its speed (scalar) to its velocity (vector, with sign).",
  equation: "\\text{speed} = |v|, \\qquad \\text{velocity} = v \\ (\\text{signed})",
  params: [
    { key: "speed", label: "Speed", min: 1, max: 12, step: 0.5, default: 5, unit: "m/s" },
    { key: "wall", label: "Wall distance", min: 3, max: 12, step: 1, default: 6, unit: "m" },
  ],
  init: () => ({ x: 0, v: 1, t: 0, dist: 0 }),
  step: (s, dt, p) => {
    s.x += s.v * p.speed * dt;
    s.dist += p.speed * dt;
    s.t += dt;
    if (s.x > p.wall) { s.x = p.wall; s.v = -1; }
    if (s.x < -p.wall) { s.x = -p.wall; s.v = 1; }
  },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2, sc = (W - 140) / (2 * p.wall), ox = W / 2;
    ctx.fillStyle = "#334155"; ctx.fillRect(ox - p.wall * sc - 10, cy - 40, 8, 80);
    ctx.fillRect(ox + p.wall * sc + 2, cy - 40, 8, 80);
    circle(ctx, ox + s.x * sc, cy, 12, "#2563eb", "#1e40af");
    arrow(ctx, ox + s.x * sc, cy - 26, ox + s.x * sc + s.v * 34, cy - 26, "#f59e0b");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), speed: p.speed, velocity: r2(s.v * p.speed) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "speed", label: "Speed (m/s, always +)", color: "#f59e0b" },
    { key: "velocity", label: "Velocity (m/s, signed)", color: "#2563eb" },
  ],
  stats: (s, p) => [
    { label: "Speed", value: p.speed, unit: "m/s" },
    { label: "Velocity", value: r2(s.v * p.speed), unit: "m/s" },
    { label: "Avg speed so far", value: s.t > 0 ? r2(s.dist / s.t) : 0, unit: "m/s" },
    { label: "Avg velocity so far", value: s.t > 0 ? r2(s.x / s.t) : 0, unit: "m/s" },
  ],
};

/* ============ 4. ACCELERATION ============
   Focused purely on how velocity changes over time under a constant
   acceleration — no position graph clutter, just v-t and the slope-as-a idea. */
const acceleration1d = {
  title: "Acceleration", topic: "mechanics", difficulty: "Beginner",
  summary: "See how velocity changes at a constant rate — acceleration is the slope of the v–t line.",
  equation: "a = \\frac{\\Delta v}{\\Delta t}, \\quad v = u + at",
  params: [
    { key: "u", label: "Initial velocity", min: -15, max: 15, step: 1, default: 0, unit: "m/s" },
    { key: "a", label: "Acceleration", min: -6, max: 6, step: 0.5, default: 3, unit: "m/s²" },
  ],
  init: (p) => ({ v: p.u, t: 0, x: 0 }),
  step: (s, dt, p) => { s.v += p.a * dt; s.x += s.v * dt; s.t += dt; if (s.t > 8) { s.v = p.u; s.x = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2 + 40; const trackY = cy;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 26); ctx.lineTo(W - 40, trackY + 26); ctx.stroke();
    let px = 60 + (((s.x * 6) % (W - 120)) + (W - 120)) % (W - 120);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px - 20, trackY - 6, 40, 24);
    arrow(ctx, px, trackY - 22, px + Math.max(-50, Math.min(50, s.v * 3)), trackY - 22, "#f59e0b");
    // acceleration arrow (fixed, shows direction of a)
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("v = " + r2(s.v) + " m/s", 40, 40);
    arrow(ctx, 40, 60, 40 + Math.max(-40, Math.min(40, p.a * 8)), 60, "#ef4444");
    ctx.fillText("a", 90, 64);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v: r2(s.v), a: p.a }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v", label: "Velocity (m/s)", color: "#f59e0b" },
    { key: "a", label: "Acceleration (m/s²)", color: "#ef4444" },
  ],
  stats: (s, p) => [
    { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "Acceleration", value: p.a, unit: "m/s²" },
    { label: "Δv over 1s", value: p.a, unit: "m/s" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 5. UNIFORM MOTION ============
   Constant velocity ONLY — no acceleration parameter at all, so the x-t
   graph is a straight line and v-t is flat. Deliberately simpler than
   kinematics1d/uarm. */
const uniformmotion = {
  title: "Uniform Motion", topic: "mechanics", difficulty: "Beginner",
  summary: "Constant velocity, no acceleration — equal distances in equal time intervals.",
  equation: "x = x_0 + vt \\quad (v = \\text{constant})",
  params: [
    { key: "v", label: "Velocity", min: -15, max: 15, step: 1, default: 6, unit: "m/s" },
  ],
  init: () => ({ x: 0, t: 0 }),
  step: (s, dt, p) => { s.x += p.v * dt; s.t += dt; if (s.t > 10) { s.x = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const trackY = H / 2 + 30;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 26); ctx.lineTo(W - 40, trackY + 26); ctx.stroke();
    // equal-interval tick marks to emphasise "equal distance, equal time"
    for (let i = -6; i <= 6; i++) {
      const tx = W / 2 + i * 40;
      ctx.strokeStyle = "#cbd5e1"; ctx.beginPath(); ctx.moveTo(tx, trackY + 20); ctx.lineTo(tx, trackY + 32); ctx.stroke();
    }
    let px = W / 2 + (((s.x * 6) % (W - 120)));
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px - 20, trackY - 6, 40, 24);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), x: r2(s.x), v: p.v }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "x", label: "Position (m)", color: "#2563eb" },
    { key: "v", label: "Velocity (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Position", value: r2(s.x), unit: "m" },
    { label: "Velocity", value: p.v, unit: "m/s" },
    { label: "Acceleration", value: 0, unit: "m/s²" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 6. MOTION GRAPHS (reader) ============
   Not a moving object at all — a graph-reading tool. Pick a motion
   scenario and see x-t, v-t, a-t side by side conceptually (single-series
   view driven by a dropdown-like param), reinforcing "what does the shape
   of the graph tell you". */
const motiongraphs = {
  title: "Reading Motion Graphs", topic: "mechanics", difficulty: "Intermediate",
  summary: "Pick a motion scenario and learn to read what its position, velocity and acceleration graphs look like.",
  equation: "\\text{slope of } x\\text{-}t = v, \\quad \\text{slope of } v\\text{-}t = a",
  params: [
    { key: "scenario", label: "Scenario (0=rest,1=uniform,2=speeding up,3=slowing down)", min: 0, max: 3, step: 1, default: 1, unit: "" },
  ],
  init: () => ({ t: 0, x: 0, v: 0 }),
  step: (s, dt, p) => {
    let a = 0, v0 = 0;
    if (p.scenario === 0) { a = 0; v0 = 0; }
    if (p.scenario === 1) { a = 0; v0 = 4; }
    if (p.scenario === 2) { a = 1.5; v0 = 1; }
    if (p.scenario === 3) { a = -1.2; v0 = 9; }
    if (s.t === 0) s.v = v0;
    s.v += a * dt; if (p.scenario === 3 && s.v < 0) s.v = 0;
    s.x += s.v * dt; s.t += dt;
    if (s.t > 8) { s.t = 0; s.x = 0; s.v = v0; }
  },
  draw: (ctx, s, p, W, H) => {
    const trackY = 70;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, trackY + 20); ctx.lineTo(W - 40, trackY + 20); ctx.stroke();
    let px = 60 + (((s.x * 5) % (W - 120)) + (W - 120)) % (W - 120);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px - 18, trackY - 4, 36, 22);
    const labels = ["At rest", "Uniform motion", "Speeding up", "Slowing to a stop"];
    ctx.fillStyle = "#334155"; ctx.font = "700 15px Outfit";
    ctx.fillText(labels[p.scenario] ?? "Uniform motion", 40, 40);
  },
  graphPoint: (s) => ({ t: r2(s.t), x: r2(s.x), v: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "x", label: "Position (m)", color: "#2563eb" },
    { key: "v", label: "Velocity (m/s)", color: "#f59e0b" },
  ],
  stats: (s) => [
    { label: "Position", value: r2(s.x), unit: "m" },
    { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

/* ============ 7. FREE FALL ============
   Purely vertical drop under gravity — distinct from projectile (which
   has horizontal launch + angle). Air resistance toggle included. */
const freefall = {
  title: "Free Fall", topic: "mechanics", difficulty: "Beginner",
  summary: "Drop an object from a height and watch it accelerate straight down under gravity alone.",
  equation: "h = h_0 - \\tfrac{1}{2}gt^2, \\quad v = gt",
  params: [
    { key: "height", label: "Drop height", min: 5, max: 100, step: 5, default: 45, unit: "m" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
    { key: "drag", label: "Air resistance", min: 0, max: 0.1, step: 0.005, default: 0, unit: "" },
  ],
  init: (p) => ({ y: p.height, v: 0, t: 0, landed: false }),
  step: (s, dt, p) => {
    if (s.landed) return;
    const drag = p.drag * s.v * s.v;
    s.v += (p.gravity - drag / Math.max(1, p.height / 10)) * dt;
    s.y -= s.v * dt;
    s.t += dt;
    if (s.y <= 0) { s.y = 0; s.landed = true; }
  },
  done: (s) => s.landed,
  draw: (ctx, s, p, W, H) => {
    const groundY = H - 40, topY = 40, scale = (groundY - topY) / p.height;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, groundY); ctx.lineTo(W - 40, groundY); ctx.stroke();
    const bx = W / 2, by = groundY - s.y * scale;
    circle(ctx, bx, by, 12, "#2563eb", "#1e40af");
    ctx.strokeStyle = "rgba(37,99,235,.25)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(bx, topY); ctx.lineTo(bx, groundY); ctx.stroke(); ctx.setLineDash([]);
  },
  graphPoint: (s) => ({ t: r2(s.t), h: r2(s.y), v: r2(s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "h", label: "Height (m)", color: "#2563eb" },
    { key: "v", label: "Speed (m/s)", color: "#f59e0b" },
  ],
  stats: (s, p) => [
    { label: "Height", value: r2(s.y), unit: "m" },
    { label: "Speed", value: r2(s.v), unit: "m/s" },
    { label: "Time to fall (ideal)", value: r2(Math.sqrt((2 * p.height) / p.gravity)), unit: "s" },
    { label: "Status", value: s.landed ? "landed" : "falling", unit: "" },
  ],
};

/* ============ 8. MOTION IN 2D ============
   Independent x and y velocity/acceleration components (no gravity
   assumption), distinct from Projectile (which is specifically launch +
   gravity). Shows how 2D motion is two independent 1D motions. */
const motion2d = {
  title: "Motion in 2D", topic: "mechanics", difficulty: "Intermediate",
  summary: "Set independent x and y velocities and accelerations and watch the combined 2D path emerge.",
  equation: "x = x_0 + v_{x}t + \\tfrac{1}{2}a_xt^2, \\quad y = y_0 + v_{y}t + \\tfrac{1}{2}a_yt^2",
  params: [
    { key: "vx", label: "Initial x-velocity", min: -10, max: 10, step: 1, default: 4, unit: "m/s" },
    { key: "vy", label: "Initial y-velocity", min: -10, max: 10, step: 1, default: 6, unit: "m/s" },
    { key: "ax", label: "x-acceleration", min: -4, max: 4, step: 0.5, default: 0, unit: "m/s²" },
    { key: "ay", label: "y-acceleration", min: -4, max: 4, step: 0.5, default: -2, unit: "m/s²" },
  ],
  init: (p) => ({ x: 0, y: 0, vx: p.vx, vy: p.vy, t: 0, trail: [{ x: 0, y: 0 }] }),
  step: (s, dt, p) => {
    s.vx += p.ax * dt; s.vy += p.ay * dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    s.t += dt;
    s.trail.push({ x: s.x, y: s.y });
    if (s.t > 6) { s.x = 0; s.y = 0; s.vx = p.vx; s.vy = p.vy; s.t = 0; s.trail = [{ x: 0, y: 0 }]; }
  },
  draw: (ctx, s, p, W, H) => {
    const ox = 90, oy = H - 80, sc = 16;
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(W - 30, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, 30); ctx.stroke();
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sx = ox + pt.x * sc, sy = oy - pt.y * sc;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    const cx = ox + s.x * sc, cy = oy - s.y * sc;
    circle(ctx, cx, cy, 9, "#f59e0b", "#b45309");
    arrow(ctx, cx, cy, cx + s.vx * 5, cy, "#10b981", 2);
    arrow(ctx, cx, cy, cx, cy - s.vy * 5, "#ef4444", 2);
  },
  graphPoint: (s) => ({ t: r2(s.t), x: r2(s.x), y: r2(s.y) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "x", label: "X position (m)", color: "#10b981" },
    { key: "y", label: "Y position (m)", color: "#ef4444" },
  ],
  stats: (s) => [
    { label: "X position", value: r2(s.x), unit: "m" },
    { label: "Y position", value: r2(s.y), unit: "m" },
    { label: "Speed", value: r2(Math.hypot(s.vx, s.vy)), unit: "m/s" },
    { label: "Time", value: r2(s.t), unit: "s" },
  ],
};

const simsKinematics = {
  displacement, distancetracker, speedvelocity, acceleration1d,
  uniformmotion, motiongraphs, freefall, motion2d,
};
export default simsKinematics;