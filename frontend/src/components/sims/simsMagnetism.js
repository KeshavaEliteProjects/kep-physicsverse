// Magnetism & Induction simulations. SimEngine-compatible configs.
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

// 1. Bar Magnet Field Mapping (Interactive Labs / Mapping)
const barmagnet = {
  title: "Bar Magnet Field Mapping", topic: "magnetism", difficulty: "Beginner",
  summary: "Explore a bar magnet's dipole field and watch a compass align with the field lines.",
  equation: "\\vec{B} \\text{ points North to South outside the magnet}",
  params: [
    { key: "cx", label: "Compass X", min: -6, max: 6, step: 0.5, default: 3, unit: "" },
    { key: "cy", label: "Compass Y", min: -4, max: 4, step: 0.5, default: 2, unit: "" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - 70, cy - 20, 70, 40);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx, cy - 20, 70, 40);
    ctx.fillStyle = "#fff"; ctx.font = "700 16px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("N", cx - 35, cy + 6); ctx.fillText("S", cx + 35, cy + 6); ctx.textAlign = "left";
    // Draw field lines
    ctx.strokeStyle = "rgba(37,99,235,.25)"; ctx.lineWidth = 1.5;
    [30, 60, 95].forEach((r) => { ctx.beginPath(); ctx.ellipse(cx, cy, 70 + r, r, 0, 0, Math.PI * 2); ctx.stroke(); });
    
    // Draw compass
    const activeX = s.active ? 4.5 * Math.cos(s.t * 0.8) : p.cx;
    const activeY = s.active ? -2.5 * Math.sin(s.t * 0.8) : p.cy;
    const px = cx + activeX * 26, py = cy - activeY * 26;
    
    const dx = px - (cx - 35), dy = py - cy;
    const dist = Math.max(15, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    circle(ctx, px, py, 14, "rgba(255,255,255,.9)", "#334155");
    arrow(ctx, px - 12 * Math.cos(ang), py - 12 * Math.sin(ang), px + 12 * Math.cos(ang), py + 12 * Math.sin(ang), "#ef4444", 2.5);
  },
  graphPoint: (s, p) => {
    const activeX = s.active ? 4.5 * Math.cos(s.t * 0.8) : p.cx;
    const activeY = s.active ? -2.5 * Math.sin(s.t * 0.8) : p.cy;
    return { t: r2(s.t), dist: r2(Math.hypot(activeX, activeY)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "dist", label: "Distance", color: "#2563eb" }],
  stats: (s, p) => {
    const activeX = s.active ? 4.5 * Math.cos(s.t * 0.8) : p.cx;
    const activeY = s.active ? -2.5 * Math.sin(s.t * 0.8) : p.cy;
    return [
      { label: "Compass X", value: r2(activeX), unit: "" },
      { label: "Compass Y", value: r2(activeY), unit: "" },
      { label: "Distance", value: r2(Math.hypot(activeX, activeY)), unit: "units" }
    ];
  }
};

// 1b. Magnetic Field Concept (Section A Concept Card)
const magneticfield = {
  title: "Magnetic Field Concept", topic: "magnetism", difficulty: "Beginner",
  summary: "Visualize the region of magnetic influence (magnetic field strength field) surrounding a bar magnet.",
  equation: "\\vec{B} \\text{ represents the space where magnetic forces are active.}",
  params: [
    { key: "strength", label: "Magnet Strength", min: 1, max: 5, step: 0.5, default: 3, unit: "a.u." },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Draw magnetic field gradient glow (representing B-field strength in space)
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 80 + p.strength * 22);
    grad.addColorStop(0, "rgba(37,99,235,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Draw Bar Magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - 70, cy - 20, 70, 40);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx, cy - 20, 70, 40);
    ctx.fillStyle = "#fff"; ctx.font = "700 16px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("N", cx - 35, cy + 6); ctx.fillText("S", cx + 35, cy + 6); ctx.textAlign = "left";
    
    // Draw moving field flow particles if active (running)
    if (s.active) {
      for (let r = 1; r <= 3; r++) {
        const rx = 70 + r * 30;
        const ry = r * 25;
        for (let d = 0; d < 4; d++) {
          const angle = (s.t * 1.2 + d * (Math.PI / 2)) % (Math.PI * 2);
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          circle(ctx, x, y, 3, "#2563eb");
        }
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), strength: p.strength }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "strength", label: "Field Strength", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Magnet Strength", value: p.strength, unit: "a.u." },
    { label: "Field Area Radius", value: r2(80 + p.strength * 22), unit: "px" }
  ]
};

// 2. Earth's Magnetic Field
const earthsfield = {
  title: "Earth's Magnetic Field", topic: "magnetism", difficulty: "Beginner",
  summary: "Observe geographic vs magnetic poles and compass alignment around the Earth.",
  equation: "\\vec{B}_{\\text{earth}} \\text{ points from Magnetic South to North}",
  params: [
    { key: "lat", label: "Latitude Angle", min: -90, max: 90, step: 10, default: 30, unit: "°" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, r = 80;
    // Earth circle
    circle(ctx, cx, cy, r, "#dbeafe", "#1e3a8a");
    // Draw magnetic core
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - 8, cy - 40, 16, 40); // North
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx - 8, cy, 16, 40); // South
    
    // Compass at Latitude
    const activeLat = s.active ? Math.sin(s.t * 0.4) * 80 : p.lat;
    const rad = activeLat * RAD;
    const px = cx + 110 * Math.cos(rad), py = cy - 110 * Math.sin(rad);
    circle(ctx, px, py, 12, "#fff", "#334155");
    // Compass needle points towards magnetic North (top of core)
    const ang = Math.atan2(cy - 40 - py, cx - px);
    arrow(ctx, px - 9 * Math.cos(ang), py - 9 * Math.sin(ang), px + 9 * Math.cos(ang), py + 9 * Math.sin(ang), "#ef4444", 2);
  },
  graphPoint: (s, p) => {
    const activeLat = s.active ? Math.sin(s.t * 0.4) * 80 : p.lat;
    return { t: r2(s.t), lat: r2(activeLat) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "lat", label: "Latitude (deg)", color: "#1e3a8a" }],
  stats: (s, p) => {
    const activeLat = s.active ? Math.sin(s.t * 0.4) * 80 : p.lat;
    return [
      { label: "Active Latitude", value: r2(activeLat), unit: "°" },
      { label: "Magnetic Pole", value: activeLat > 0 ? "North Hemisphere" : "South Hemisphere", unit: "" }
    ];
  }
};

// 3. Magnetic Force
const magneticforce = {
  title: "Magnetic Force (Lorentz Force)", topic: "magnetism", difficulty: "Intermediate",
  summary: "Visualize the cross product relation of velocity (v) and magnetic field (B) to force.",
  equation: "\\vec{F} = q(\\vec{v} \\times \\vec{B})",
  params: [
    { key: "speed", label: "Velocity Speed (v)", min: 1, max: 8, step: 0.5, default: 4, unit: "m/s" },
    { key: "field", label: "Magnetic Field (B)", min: 0.5, max: 5.0, step: 0.5, default: 2.0, unit: "T" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.phi += (p.speed * p.field * 0.1) * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    circle(ctx, cx, cy, 60, "rgba(244,63,94,0.05)", "#f43f5e");
    
    // Draw vectors
    const vx = cx + 80 * Math.cos(s.phi), vy = cy + 80 * Math.sin(s.phi);
    arrow(ctx, cx, cy, vx, vy, "#10b981", 3); // Velocity (green)
    
    // Force vector (perpendicular to velocity)
    const fx = cx - 80 * Math.sin(s.phi), fy = cy + 80 * Math.cos(s.phi);
    arrow(ctx, cx, cy, fx, fy, "#2563eb", 3); // Force (blue)
  },
  graphPoint: (s, p) => ({ t: r2(s.t), F: r2(p.speed * p.field) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "F", label: "Force Magnitude (N)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Force Magnitude", value: p.speed * p.field, unit: "N" }
  ]
};

// 4. Lorentz Force
const lorentzforce = {
  title: "Lorentz Force", topic: "magnetism", difficulty: "Intermediate",
  summary: "Simulate a charged particle moving through BOTH electric and magnetic fields.",
  equation: "\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})",
  params: [
    { key: "electric", label: "Electric Field (E)", min: -10, max: 10, step: 1, default: 4, unit: "V/m" },
    { key: "magnetic", label: "Magnetic Field (B)", min: -5, max: 5, step: 0.5, default: 2, unit: "T" },
  ],
  init: () => ({ x: -160, y: 0, vx: 50, vy: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    // Equations of motion under Lorentz Force
    const ax = p.magnetic * s.vy;
    const ay = p.electric - p.magnetic * s.vx;
    s.vx += ax * dt;
    s.vy += ay * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.x > 200 || s.x < -200 || s.y > 100 || s.y < -100) {
      s.x = -160; s.y = 0; s.vx = 50; s.vy = 0;
    }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 180, cy - 90, 360, 180);
    
    // Draw moving particle
    circle(ctx, cx + s.x, cy + s.y, 8, "#ef4444", "#b91c1c");
  },
  graphPoint: (s) => ({ t: r2(s.t), y: r2(s.y) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Y displacement (m)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "X Velocity", value: r2(s.vx), unit: "m/s" },
    { label: "Y Velocity", value: r2(s.vy), unit: "m/s" }
  ]
};

// 5. Charged Particle in Magnetic Field
const chargeinB = {
  title: "Charged Particle Orbit", topic: "magnetism", difficulty: "Intermediate",
  summary: "A moving charge curves in a magnetic field — see circular motion and the Lorentz force.",
  equation: "r = \\frac{mv}{qB}",
  params: [
    { key: "v", label: "Speed", min: 1, max: 8, step: 0.5, default: 4, unit: "" },
    { key: "B", label: "Field strength", min: 0.5, max: 5, step: 0.25, default: 2, unit: "T" },
    { key: "q", label: "Charge", min: -2, max: 2, step: 0.5, default: 1, unit: "" },
  ],
  init: (p) => ({ x: 0, y: 0, vx: p.v * 30, vy: 0, t: 0, trail: [] }),
  step: (s, dt, p) => {
    s.t += dt;
    const w = (p.q * p.B) * 0.6;
    const nvx = s.vx + w * s.vy * dt, nvy = s.vy - w * s.vx * dt;
    s.vx = nvx; s.vy = nvy; s.x += s.vx * dt; s.y += s.vy * dt;
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 300) s.trail.shift();
    if (s.t > 8) { s.x = 0; s.y = 0; s.vx = p.v * 30; s.vy = 0; s.trail = []; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "rgba(37,99,235,.4)"; ctx.lineWidth = 2; ctx.beginPath();
    s.trail.forEach((t, i) => { const sx = cx + t.x, sy = cy + t.y; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }); ctx.stroke();
    circle(ctx, cx + s.x, cy + s.y, 8, p.q >= 0 ? "#ef4444" : "#2563eb", "#334155");
  },
  graphPoint: (s) => ({ t: r2(s.t), y: r2(s.y) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Orbit Y (m)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Radius r", value: p.q === 0 ? "∞" : r2(p.v / (p.q * p.B)), unit: "m" }
  ]
};

// 6. Velocity Selector
const velocityselector = {
  title: "Velocity Selector", topic: "magnetism", difficulty: "Advanced",
  summary: "Filter charges: only particles with velocity v = E/B pass through straight.",
  equation: "v = \\frac{E}{B}",
  params: [
    { key: "electric", label: "Electric Field (E)", min: 10, max: 100, step: 5, default: 50, unit: "V/m" },
    { key: "magnetic", label: "Magnetic Field (B)", min: 1.0, max: 5.0, step: 0.5, default: 2.5, unit: "T" },
    { key: "speed", label: "Particle Speed (v)", min: 10, max: 40, step: 2, default: 20, unit: "m/s" },
  ],
  init: () => ({ x: -160, y: 0, t: 0, path: [] }),
  step: (s, dt, p) => {
    s.t += dt;
    const q = 1, m = 1;
    // Calculate net force: F = qE - qvB
    const F_net = q * p.electric - q * p.speed * p.magnetic;
    s.x += p.speed * 4 * dt;
    s.y += (F_net * 0.1) * dt;
    s.path.push({ x: s.x, y: s.y });
    if (s.x > 160) { s.x = -160; s.y = 0; s.path = []; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw selector slits/plates
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    ctx.strokeRect(cx - 150, cy - 40, 300, 80);
    // Draw target slit at the end
    ctx.clearRect(cx + 148, cy - 10, 5, 20);
    
    // Draw particle path
    ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 2; ctx.beginPath();
    s.path.forEach((pt, i) => { i === 0 ? ctx.moveTo(cx + pt.x, cy + pt.y) : ctx.lineTo(cx + pt.x, cy + pt.y); });
    ctx.stroke();
    
    circle(ctx, cx + s.x, cy + s.y, 6, "#ea580c");
  },
  graphPoint: (s) => ({ t: r2(s.t), y: r2(s.y) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Deflection (m)", color: "#ea580c" }],
  stats: (s, p) => [
    { label: "Target Speed v", value: r2(p.electric / p.magnetic), unit: "m/s" },
    { label: "Current Speed", value: p.speed, unit: "m/s" },
    { label: "Status", value: Math.abs(p.speed - p.electric/p.magnetic) < 1 ? "SAFE (Pass)" : "BLOCKED", unit: "" }
  ]
};

// 7. Cyclotron
const cyclotron = {
  title: "Cyclotron Particle Accelerator", topic: "magnetism", difficulty: "Advanced",
  summary: "Accelerate a proton in spiral orbits between two D-shaped magnetic electrodes (Dees).",
  equation: "f = \\frac{qB}{2\\pi m} \\qquad KE_{max} = \\frac{q^2 B^2 R^2}{2m}",
  params: [
    { key: "field", label: "Magnetic Field (B)", min: 1.0, max: 4.0, step: 0.5, default: 2.0, unit: "T" },
    { key: "voltage", label: "Dee Voltage (V)", min: 10, max: 50, step: 5, default: 25, unit: "kV" },
  ],
  init: () => ({ phi: 0, r: 20, t: 0, trail: [] }),
  step: (s, dt, p) => {
    s.t += dt;
    const omega = (1.0 * p.field); // constant frequency
    s.phi += omega * 6 * dt;
    
    // Every half rotation (angle % Math.PI), check if crossing the gap to accelerate!
    const cycle = Math.floor(s.phi / Math.PI);
    s.r = 20 + cycle * (p.voltage * 0.1) * p.field;
    
    const x = s.r * Math.cos(s.phi), y = s.r * Math.sin(s.phi);
    s.trail.push({ x, y });
    if (s.trail.length > 500) s.trail.shift();
    if (s.r > 120) { s.phi = 0; s.r = 20; s.trail = []; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw Dees (D-shaped electrodes)
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    // Left Dee
    ctx.beginPath(); ctx.arc(cx - 5, cy, 130, Math.PI / 2, -Math.PI / 2); ctx.closePath(); ctx.stroke();
    // Right Dee
    ctx.beginPath(); ctx.arc(cx + 5, cy, 130, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.stroke();
    
    // Draw spiral path
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2; ctx.beginPath();
    s.trail.forEach((pt, i) => { i === 0 ? ctx.moveTo(cx + pt.x, cy + pt.y) : ctx.lineTo(cx + pt.x, cy + pt.y); });
    ctx.stroke();
  },
  graphPoint: (s) => ({ t: r2(s.t), r: r2(s.r) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "r", label: "Orbit Radius (m)", color: "#3b82f6" }],
  stats: (s, p) => [
    { label: "Dee Voltage", value: p.voltage, unit: "kV" },
    { label: "Proton Radius", value: r2(s.r), unit: "m" }
  ]
};

// 8. Biot-Savart Law
const biotsavart = {
  title: "Biot-Savart Law", topic: "magnetism", difficulty: "Intermediate",
  summary: "Observe the magnetic field dB produced by a current element I dl.",
  equation: "d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I d\\vec{l} \\times \\hat{r}}{r^2}",
  params: [
    { key: "current", label: "Current (I)", min: 1, max: 10, step: 1, default: 5, unit: "A" },
    { key: "radius", label: "Distance (r)", min: 40, max: 140, step: 10, default: 80, unit: "cm" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Current wire element dl
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx, cy + 40); ctx.lineTo(cx, cy - 40); ctx.stroke();
    arrow(ctx, cx, cy + 10, cx, cy - 20, "#ef4444", 3); // current dl element
    
    // Field point
    const px = cx + p.radius, py = cy;
    circle(ctx, px, py, 6, "#2563eb");
    
    // Draw B-field direction (cross representing into page)
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px - 4, py - 4); ctx.lineTo(px + 4, py + 4); ctx.moveTo(px + 4, py - 4); ctx.lineTo(px - 4, py + 4); ctx.stroke();
    ctx.fillText("B (Into page)", px + 10, py + 4);
    
    // Flowing current pulses inside wire
    if (s.active) {
      ctx.fillStyle = "#ef4444";
      for (let i = 0; i < 3; i++) {
        const yOffset = ((s.t * 40 + i * 30) % 80) - 40;
        circle(ctx, cx, cy - yOffset, 3.5, "#ef4444");
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), B: r2(p.current / (p.radius * p.radius) * 1000) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "B", label: "Magnetic Field (μT)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "B field", value: r2(p.current / (p.radius * p.radius) * 1000), unit: "μT" }
  ]
};

// 9. Ampere's Law
const ampereslaw = {
  title: "Ampere's Law Loop", topic: "magnetism", difficulty: "Intermediate",
  summary: "Verify the line integral of B dl enclosing currents.",
  equation: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enclosed}}",
  params: [
    { key: "i1", label: "Enclosed Current I1", min: -5, max: 5, step: 1, default: 3, unit: "A" },
    { key: "i2", label: "Enclosed Current I2", min: -5, max: 5, step: 1, default: -2, unit: "A" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw Amperian Loop
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, 75, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    
    // Draw Current I1
    circle(ctx, cx - 30, cy, 6, p.i1 >= 0 ? "#ef4444" : "#2563eb");
    ctx.fillText("I1 = " + p.i1 + "A", cx - 45, cy - 12);
    // Draw Current I2
    circle(ctx, cx + 30, cy, 6, p.i2 >= 0 ? "#ef4444" : "#2563eb");
    ctx.fillText("I2 = " + p.i2 + "A", cx + 15, cy - 12);
    
    // Show green integration element dl traversing loop
    if (s.active) {
      const angle = s.t * 1.2;
      const ax = cx + 75 * Math.cos(angle);
      const ay = cy + 75 * Math.sin(angle);
      circle(ctx, ax, ay, 6, "#10b981");
      ctx.fillStyle = "#10b981"; ctx.font = "bold 13px sans-serif";
      ctx.fillText("dl", ax + 9, ay - 3);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), Ienc: p.i1 + p.i2 }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "Ienc", label: "Enclosed Current (A)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Enclosed Current", value: p.i1 + p.i2, unit: "A" }
  ]
};

// 10. Straight Conductor
const straightconductor = {
  title: "Straight Current Conductor", topic: "magnetism", difficulty: "Beginner",
  summary: "Simulate concentric magnetic field lines around a long straight current carrying wire.",
  equation: "B = \\frac{\\mu_0 I}{2\\pi r}",
  params: [
    { key: "current", label: "Current (I)", min: 1, max: 10, step: 1, default: 5, unit: "A" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw wire
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy + 90); ctx.stroke();
    
    // Concentric circles
    ctx.strokeStyle = "rgba(37,99,235,0.4)"; ctx.lineWidth = 1.5;
    [30, 55, 80].forEach((r) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      // Draw rotating field direction arrows
      const angle = s.active ? s.t * 1.5 : 0;
      const ax = cx + r * Math.cos(angle);
      const ay = cy + r * Math.sin(angle);
      const tx = -Math.sin(angle), ty = Math.cos(angle);
      arrow(ctx, ax, ay, ax + tx * 6, ay + ty * 6, "#2563eb", 2);
    });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), I: p.current }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "I", label: "Wire Current (A)", color: "#475569" }],
  stats: (s, p) => [
    { label: "Current (I)", value: p.current, unit: "A" }
  ]
};

// 11. Circular Loop
const circularloop = {
  title: "Circular Current Loop", topic: "magnetism", difficulty: "Intermediate",
  summary: "Verify magnetic field lines passing through the center of a circular loop.",
  equation: "B_c = \\frac{\\mu_0 I}{2R}",
  params: [
    { key: "current", label: "Current (I)", min: 1, max: 10, step: 1, default: 5, unit: "A" },
    { key: "radius", label: "Loop Radius (R)", min: 40, max: 90, step: 5, default: 60, unit: "cm" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw loop (perspective ellipse)
    ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(cx, cy, p.radius, p.radius * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
    
    // Draw central B-field lines flowing upwards through loop center
    if (s.active) {
      for (let i = 0; i < 3; i++) {
        const yOffset = ((s.t * 35 + i * 40) % 120) - 60;
        arrow(ctx, cx, cy - yOffset + 15, cx, cy - yOffset, "#2563eb", 2);
      }
    } else {
      arrow(ctx, cx, cy + 60, cx, cy - 60, "#2563eb", 2.5);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), B: r2(p.current / (2 * p.radius) * 1000) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "B", label: "Field at Center (μT)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Field at Center", value: r2(p.current / (2 * p.radius) * 1000), unit: "μT" }
  ]
};

// 12. Solenoid Magnetic Field
const solenoidlab = {
  title: "Solenoid Magnetic Field", topic: "magnetism", difficulty: "Intermediate",
  summary: "Observe field lines produced inside a long helical solenoid coil.",
  equation: "B = \\mu_0 n I",
  params: [
    { key: "current", label: "Current (I)", min: 1, max: 8, step: 0.5, default: 4, unit: "A" },
    { key: "turns", label: "Turns density (n)", min: 5, max: 20, step: 1, default: 10, unit: "" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, len = 280;
    
    // Show horizontal magnetic flux arrows passing inside the core
    if (s.active) {
      ctx.strokeStyle = "rgba(37,99,235,0.4)"; ctx.lineWidth = 1.5;
      for (let y = -20; y <= 20; y += 20) {
        ctx.beginPath(); ctx.moveTo(cx - 140, cy + y); ctx.lineTo(cx + 140, cy + y); ctx.stroke();
        const xOffset = ((s.t * 50) % 280) - 140;
        arrow(ctx, cx + xOffset, cy + y, cx + xOffset + 10, cy + y, "#2563eb", 1.5);
      }
    }
    
    // Draw Solenoid Loops
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3;
    for (let i = 0; i < p.turns; i++) {
      const x = cx - len / 2 + (i + 0.5) * len / p.turns;
      ctx.beginPath(); ctx.ellipse(x, cy, 6, 40, 0, 0, Math.PI * 2); ctx.stroke();
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), B: r2(p.current * p.turns * 0.1) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "B", label: "Inside Field strength", color: "#d97706" }],
  stats: (s, p) => [
    { label: "Relative Field B", value: r2(p.current * p.turns * 0.1), unit: "a.u." }
  ]
};

// 13. Toroid
const toroid = {
  title: "Toroid Coil Lab", topic: "magnetism", difficulty: "Advanced",
  summary: "Study a toroid coil, showing magnetic field entirely confined inside the donut ring.",
  equation: "B = \\frac{\\mu_0 N I}{2\\pi r}",
  params: [
    { key: "current", label: "Current (I)", min: 1, max: 10, step: 1, default: 5, unit: "A" },
    { key: "turns", label: "Total Turns (N)", min: 100, max: 500, step: 50, default: 250, unit: "" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw Toroid boundary rings
    circle(ctx, cx, cy, 60, null, "#475569");
    circle(ctx, cx, cy, 100, null, "#475569");
    
    // Draw confined field line inside the core
    ctx.setLineDash([4, 4]);
    circle(ctx, cx, cy, 80, null, "#2563eb");
    ctx.setLineDash([]);
    
    // Show circular magnetic flow circulating inside the core
    if (s.active) {
      for (let a = 0; a < 4; a++) {
        const angle = s.t * 0.9 + a * (Math.PI / 2);
        const ax = cx + 80 * Math.cos(angle);
        const ay = cy + 80 * Math.sin(angle);
        const tx = -Math.sin(angle), ty = Math.cos(angle);
        arrow(ctx, ax, ay, ax + tx * 8, ay + ty * 8, "#2563eb", 2);
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), B: r2(p.current * p.turns / 80) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "B", label: "Confined Field (μT)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Confined Field B", value: r2(p.current * p.turns / 80), unit: "μT" }
  ]
};

// 14. Faraday's Law
const faradayslaw = {
  title: "Faraday's Law of Induction", topic: "magnetism", difficulty: "Intermediate",
  summary: "Move a magnet in and out of a coil and observe the induced voltage pulse.",
  equation: "\\varepsilon = -N \\frac{d\\Phi}{dt}",
  params: [
    { key: "speed", label: "Magnet speed", min: 1, max: 5, step: 0.5, default: 3, unit: "" },
    { key: "turns", label: "Coil turns", min: 10, max: 40, step: 2, default: 20, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const mx = cx + Math.sin(s.t * p.speed) * 110;
    
    // Coil representation
    for (let i = 0; i < 6; i++) {
      circle(ctx, cx - 40 + i * 16, cy, 35, null, "#d97706");
    }
    
    // Magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(mx - 40, cy - 14, 40, 28);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(mx, cy - 14, 40, 28);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), emf: r2(-p.turns * p.speed * Math.cos(s.t * p.speed) * 0.1) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "emf", label: "Induced Voltage (V)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Peak EMF", value: r2(p.turns * p.speed * 0.1), unit: "V" }
  ]
};

// 15. Lenz's Law
const lenzslaw = {
  title: "Lenz's Law Lab", topic: "magnetism", difficulty: "Intermediate",
  summary: "Verify how induced current opposes the magnet's field change.",
  equation: "Opposition: \\varepsilon = - \\frac{d\\Phi}{dt}",
  params: [
    { key: "speed", label: "Magnet Speed", min: 1, max: 4, step: 0.5, default: 2, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const mx = cx + Math.sin(s.t * p.speed) * 110;
    
    // Draw Coil
    circle(ctx, cx, cy, 40, null, "#475569");
    
    // Draw Magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(mx - 30, cy - 12, 30, 24);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(mx, cy - 12, 30, 24);
    
    // Indicate current direction
    const movingIn = Math.cos(s.t * p.speed) * p.speed > 0;
    ctx.fillStyle = movingIn ? "#10b981" : "#ef4444"; ctx.font = "bold 14px sans-serif";
    ctx.fillText(movingIn ? "Opposing: Repelling N" : "Opposing: Attracting N", cx - 75, cy - 65);
  },
  graphPoint: (s) => ({ t: r2(s.t), opposition: 1 }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "opposition", label: "Opposition Factor", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Action Status", value: "Induced current opposes magnet", unit: "" }
  ]
};

// 16. Magnetic Flux
const magneticflux = {
  title: "Magnetic Flux Lab", topic: "magnetism", difficulty: "Intermediate",
  summary: "Rotate a coil loop in a magnetic field to see the change in magnetic flux.",
  equation: "\\Phi = B A \\cos\\theta",
  params: [
    { key: "field", label: "Magnetic Field (B)", min: 1, max: 5, step: 0.5, default: 3, unit: "T" },
    { key: "angle", label: "Coil Angle (θ)", min: 0, max: 90, step: 5, default: 30, unit: "°" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Automatic rotation if running, else use slider angle
    const activeAngle = s.active ? (s.t * 30) % 90 : p.angle;
    const th = activeAngle * RAD;
    
    // Draw uniform B-field lines (into page / background lines)
    ctx.strokeStyle = "rgba(37,99,235,0.2)"; ctx.lineWidth = 1;
    for (let x = cx - 120; x <= cx + 120; x += 30) {
      arrow(ctx, x, cy - 70, x, cy + 70, "rgba(37,99,235,0.2)", 1.5);
    }
    
    // Draw rotated coil (represented as tilted rectangle line)
    ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 70 * Math.cos(th), cy - 70 * Math.sin(th));
    ctx.lineTo(cx + 70 * Math.cos(th), cy + 70 * Math.sin(th));
    ctx.stroke();
  },
  graphPoint: (s, p) => {
    const activeAngle = s.active ? (s.t * 30) % 90 : p.angle;
    return { t: r2(s.t), flux: r2(p.field * Math.cos(activeAngle * RAD)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "flux", label: "Flux (Wb)", color: "#ea580c" }],
  stats: (s, p) => {
    const activeAngle = s.active ? (s.t * 30) % 90 : p.angle;
    return [
      { label: "Coil Angle", value: r2(activeAngle), unit: "°" },
      { label: "Magnetic Flux", value: r2(p.field * Math.cos(activeAngle * RAD)), unit: "Wb" }
    ];
  }
};

// 17. Motional EMF
const motionalemf = {
  title: "Motional EMF", topic: "magnetism", difficulty: "Advanced",
  summary: "Slide a metal conductor bar across magnetic rails to generate current.",
  equation: "\\varepsilon = B L v",
  params: [
    { key: "field", label: "Magnetic Field (B)", min: 0.5, max: 3.0, step: 0.5, default: 1.5, unit: "T" },
    { key: "speed", label: "Slide Speed (v)", min: 1.0, max: 5.0, step: 0.5, default: 2.5, unit: "m/s" },
    { key: "length", label: "Rod Length (L)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: () => ({ x: -120, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.x += p.speed * 12 * dt;
    if (s.x > 120) s.x = -120;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw rails
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 140, cy - 40); ctx.lineTo(cx + 140, cy - 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 140, cy + 40); ctx.lineTo(cx + 140, cy + 40); ctx.stroke();
    
    // Draw conductor rod sliding
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + s.x, cy - 45);
    ctx.lineTo(cx + s.x, cy + 45);
    ctx.stroke();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), emf: r2(p.field * p.length * p.speed) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "emf", label: "Motional EMF (V)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Motional EMF", value: r2(p.field * p.length * p.speed), unit: "V" }
  ]
};

// 18. AC Generator
const acgenerator = {
  title: "AC Generator Lab", topic: "magnetism", difficulty: "Advanced",
  summary: "Spin a coil loop in a magnetic field and generate sinusoidal alternating EMF.",
  equation: "\\varepsilon = N B A \\omega \\sin(\\omega t)",
  params: [
    { key: "rpm", label: "Rotation speed (ω)", min: 0.5, max: 5, step: 0.25, default: 2, unit: "rad/s" },
    { key: "B", label: "Magnetic Field (B)", min: 1, max: 6, step: 0.5, default: 3, unit: "T" },
    { key: "turns", label: "Coil turns (N)", min: 5, max: 40, step: 1, default: 20, unit: "" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { s.th += p.rpm * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw poles
    ctx.fillStyle = "#fca5a5"; ctx.fillRect(cx - 130, cy - 60, 20, 120);
    ctx.fillStyle = "#93c5fd"; ctx.fillRect(cx + 110, cy - 60, 20, 120);
    
    // Draw rotating loop
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.th);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4;
    ctx.strokeRect(-55, -28, 110, 56);
    ctx.restore();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), emf: r2(p.turns * p.B * p.rpm * Math.sin(s.th) * 0.1) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "emf", label: "Induced EMF (V)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Peak EMF", value: r2(p.turns * p.B * p.rpm * 0.1), unit: "V" }
  ]
};

// 19. Transformer
const transformer = {
  title: "Transformer Lab", topic: "magnetism", difficulty: "Advanced",
  summary: "Simulate step-up or step-down AC transformer configurations.",
  equation: "\\frac{V_s}{V_p} = \\frac{N_s}{N_p}",
  params: [
    { key: "vp", label: "Primary Voltage (Vp)", min: 10, max: 120, step: 5, default: 110, unit: "V" },
    { key: "np", label: "Primary Turns (Np)", min: 50, max: 200, step: 10, default: 100, unit: "" },
    { key: "ns", label: "Secondary Turns (Ns)", min: 50, max: 400, step: 10, default: 200, unit: "" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw iron core frame
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 14;
    ctx.strokeRect(cx - 100, cy - 60, 200, 120);
    
    // Animate AC current oscillation with flashing brightness
    if (s.active) {
      const primaryOsc = Math.round(130 + 125 * Math.sin(s.t * 5));
      ctx.strokeStyle = "rgb(" + primaryOsc + ", 119, 6)";
    } else {
      ctx.strokeStyle = "#d97706";
    }
    ctx.lineWidth = 2;
    // Primary loops
    const primaryCoils = Math.round(p.np / 10);
    for (let i = 0; i < primaryCoils; i++) {
      ctx.beginPath(); ctx.ellipse(cx - 100, cy - 50 + (i * 100 / primaryCoils), 12, 5, 0, 0, Math.PI * 2); ctx.stroke();
    }
    
    if (s.active) {
      const secondaryOsc = Math.round(130 + 125 * Math.sin(s.t * 5 * (p.ns / p.np)));
      ctx.strokeStyle = "rgb(" + secondaryOsc + ", 119, 6)";
    } else {
      ctx.strokeStyle = "#d97706";
    }
    // Secondary loops
    const secondaryCoils = Math.round(p.ns / 10);
    for (let i = 0; i < secondaryCoils; i++) {
      ctx.beginPath(); ctx.ellipse(cx + 100, cy - 50 + (i * 100 / secondaryCoils), 12, 5, 0, 0, Math.PI * 2); ctx.stroke();
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), vs: r2(p.vp * p.ns / p.np) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vs", label: "Secondary Voltage Vs (V)", color: "#d97706" }],
  stats: (s, p) => [
    { label: "Voltage Primary", value: p.vp, unit: "V" },
    { label: "Voltage Secondary", value: r2(p.vp * p.ns / p.np), unit: "V" },
    { label: "Ratio Ns/Np", value: r2(p.ns / p.np), unit: "" }
  ]
};

// 19b. Magnetic Field Lines (Section A Card 2)
const magneticfieldlines = {
  title: "Magnetic Field Lines", topic: "magnetism", difficulty: "Beginner",
  summary: "Simulate and visualize the closed magnetic field lines emerging from North and entering South.",
  equation: "\\vec{B} \\text{ line density indicates field strength}",
  params: [
    { key: "lines", label: "Number of Lines", min: 4, max: 12, step: 1, default: 6, unit: "" },
    { key: "magnetLength", label: "Magnet Size", min: 100, max: 180, step: 10, default: 140, unit: "px" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const halfL = p.magnetLength / 2;
    
    // Draw Bar Magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - 70, cy - 20, 70, 40);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx, cy - 20, 70, 40);
    ctx.fillStyle = "#fff"; ctx.font = "700 16px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("N", cx - 35, cy + 6); ctx.fillText("S", cx + 35, cy + 6); ctx.textAlign = "left";
    
    // Draw Dipole Field Lines with arrows emerging from N and entering S
    ctx.strokeStyle = "rgba(37,99,235,0.35)"; ctx.lineWidth = 1.5;
    for (let i = 1; i <= p.lines; i++) {
      const rx = halfL;
      const ry = i * 20;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + ry, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw dynamic sliding direction arrows if active (running)
      if (s.active) {
        for (let a = 0; a < 2; a++) {
          const theta = (s.t * 0.8 + a * Math.PI) % (Math.PI * 2);
          const ax = cx + (rx + ry) * Math.cos(theta);
          const ay = cy + ry * Math.sin(theta);
          const tx = -(rx + ry) * Math.sin(theta);
          const ty = ry * Math.cos(theta);
          const len = Math.max(1, Math.hypot(tx, ty));
          arrow(ctx, ax, ay, ax + (tx / len) * 6, ay + (ty / len) * 6, "#ef4444", 2);
        }
      } else {
        // Draw static indicators
        const topX = cx, topY = cy - ry;
        arrow(ctx, topX - 1, topY, topX + 5, topY, "#ef4444", 2);
        const botX = cx, botY = cy + ry;
        arrow(ctx, botX + 1, botY, botX - 5, botY, "#ef4444", 2);
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), lines: p.lines }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "lines", label: "Lines Count", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Lines Displayed", value: p.lines, unit: "" },
    { label: "Magnet Length", value: p.magnetLength, unit: "px" }
  ]
};

const simsMagnetism = { barmagnet, magneticfield, magneticfieldlines, earthsfield, magneticforce, lorentzforce, chargeinB, velocityselector, cyclotron, biotsavart, ampereslaw, straightconductor, circularloop, solenoidlab, toroid, faradayslaw, lenzslaw, magneticflux, motionalemf, acgenerator, transformer };
export default simsMagnetism;
