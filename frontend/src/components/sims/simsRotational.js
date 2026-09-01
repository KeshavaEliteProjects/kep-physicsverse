// Rotational Motion simulations. SimEngine-compatible configs.
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

const torque = {
  title: "Torque & Rotation", topic: "mechanics", difficulty: "Intermediate",
  summary: "Apply a tangential force to a disk and watch it accelerate rotationally based on torque.",
  equation: "\\tau = I\\alpha \\qquad I = \\tfrac{1}{2}MR^2",
  params: [
    { key: "force", label: "Tangential Force (F)", min: 1, max: 30, step: 1, default: 10, unit: "N" },
    { key: "mass", label: "Disk Mass (M)", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "radius", label: "Disk Radius (R)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: () => ({ theta: 0, omega: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    const I = 0.5 * p.mass * p.radius * p.radius;
    const torqueVal = p.force * p.radius;
    const alpha = torqueVal / I;
    s.omega += alpha * dt;
    s.theta += s.omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 70;
    const r_px = p.radius * scale;
    circle(ctx, cx, cy, r_px, "#f8fafc", "#2563eb");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.theta);
    // Draw disk spokes
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r_px * Math.cos(i * Math.PI / 3), r_px * Math.sin(i * Math.PI / 3));
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, cx, cy, 6, "#334155");
    // Draw force vector arrow tangentially at the top of the disk
    arrow(ctx, cx - r_px, cy, cx - r_px, cy + 50, "#ef4444", 2.5);
    ctx.fillStyle = "#ef4444"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("F = " + p.force + " N", cx - r_px - 45, cy + 25);
  },
  graphPoint: (s) => ({ t: r2(s.t), omega: r2(s.omega) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "omega", label: "Angular velocity (rad/s)", color: "#f59e0b" }],
  stats: (s, p) => {
    const I = 0.5 * p.mass * p.radius * p.radius;
    const torqueVal = p.force * p.radius;
    return [
      { label: "Moment of Inertia (I)", value: r2(I), unit: "kg·m²" },
      { label: "Torque (τ)", value: r2(torqueVal), unit: "N·m" },
      { label: "Ang. Accel (α)", value: r2(torqueVal / I), unit: "rad/s²" },
      { label: "Ang. Velocity (ω)", value: r2(s.omega), unit: "rad/s" }
    ];
  }
};

const momentofinertia = {
  title: "Moment of Inertia Lab", topic: "mechanics", difficulty: "Intermediate",
  summary: "Compare how different shapes (Ring, Disc, Sphere) with the same mass and radius rotate under the same torque.",
  equation: "I = k M R^2 \\qquad k_{\\text{ring}} = 1.0, \\ k_{\\text{disc}} = 0.5, \\ k_{\\text{sphere}} = 0.4",
  params: [
    { key: "shape", label: "Shape Preset", type: "select", options: ["Thin Ring", "Solid Disc", "Solid Sphere"], default: "Solid Disc" },
    { key: "mass", label: "Mass (M)", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "radius", label: "Radius (R)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: () => ({ theta: 0, omega: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    // Determine shape factor k
    let k = 0.5;
    if (p.shape === "Thin Ring") k = 1.0;
    if (p.shape === "Solid Sphere") k = 0.4;
    
    const I = k * p.mass * p.radius * p.radius;
    const torqueVal = 10 * p.radius; // Constant force of 10 N
    const alpha = torqueVal / I;
    s.omega += alpha * dt;
    s.theta += s.omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 70;
    const r_px = p.radius * scale;
    
    // Draw outer boundary
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    // Draw shape visual representation
    if (p.shape === "Thin Ring") {
      ctx.fillStyle = "#f8fafc"; ctx.fill();
    } else if (p.shape === "Solid Disc") {
      ctx.fillStyle = "rgba(37,99,235,0.08)"; ctx.fill();
    } else if (p.shape === "Solid Sphere") {
      ctx.fillStyle = "rgba(16,185,129,0.08)"; ctx.fill();
    }
    
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.theta);
    // Draw indicator spokes to show rotation
    ctx.strokeStyle = "rgba(37,99,235,0.5)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r_px * Math.cos(i * Math.PI / 2), r_px * Math.sin(i * Math.PI / 2));
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, cx, cy, 5, "#475569");
  },
  graphPoint: (s) => ({ t: r2(s.t), omega: r2(s.omega) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "omega", label: "Angular velocity (rad/s)", color: "#10b981" }],
  stats: (s, p) => {
    let k = 0.5;
    if (p.shape === "Thin Ring") k = 1.0;
    if (p.shape === "Solid Sphere") k = 0.4;
    const I = k * p.mass * p.radius * p.radius;
    return [
      { label: "Shape Factor (k)", value: k, unit: "" },
      { label: "Moment of Inertia (I)", value: r2(I), unit: "kg·m²" },
      { label: "Ang. Accel (α)", value: r2((10 * p.radius) / I), unit: "rad/s²" },
      { label: "Current speed (ω)", value: r2(s.omega), unit: "rad/s" }
    ];
  }
};

const radiusofgyration = {
  title: "Radius of Gyration", topic: "mechanics", difficulty: "Intermediate",
  summary: "Visualize the equivalent radius (k) at which the entire mass could be concentrated to yield the same inertia.",
  equation: "k = \\sqrt{\\frac{I}{M}} \\qquad I = M k^2",
  params: [
    { key: "shape", label: "Shape Preset", type: "select", options: ["Thin Ring", "Solid Disc"], default: "Solid Disc" },
    { key: "radius", label: "Outer Radius (R)", min: 0.5, max: 2.0, step: 0.1, default: 1.5, unit: "m" },
  ],
  init: () => ({ theta: 0, t: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.theta += 1.5 * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 70;
    const r_px = p.radius * scale;
    
    // Draw outer physical boundary
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    // Calculate radius of gyration: Ring k = R, Disc k = R / sqrt(2)
    const factor = p.shape === "Thin Ring" ? 1.0 : 1 / Math.sqrt(2);
    const k_px = r_px * factor;
    
    // Draw Radius of Gyration ring as dotted red circle
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, k_px, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    
    // Label k
    ctx.fillStyle = "#ef4444"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("Radius of Gyration (k) = " + r2(p.radius * factor) + " m", cx - 70, cy + k_px + 15);
  },
  graphPoint: (s, p) => {
    const factor = p.shape === "Thin Ring" ? 1.0 : 1 / Math.sqrt(2);
    return { t: r2(s.t), k: r2(p.radius * factor) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "k", label: "Radius of Gyration k (m)", color: "#ef4444" }],
  stats: (s, p) => {
    const factor = p.shape === "Thin Ring" ? 1.0 : 1 / Math.sqrt(2);
    return [
      { label: "Outer Radius (R)", value: p.radius, unit: "m" },
      { label: "Inertia Factor", value: p.shape === "Thin Ring" ? 1.0 : 0.5, unit: "" },
      { label: "Gyration Radius (k)", value: r2(p.radius * factor), unit: "m" }
    ];
  }
};

const angularmomentum = {
  title: "Angular Momentum", topic: "mechanics", difficulty: "Intermediate",
  summary: "Revolve a point mass to study how its angular momentum vector scales with mass, radius, and rotation speed.",
  equation: "\\vec{L} = \\vec{r} \\times \\vec{p} \\qquad L = I \\omega",
  params: [
    { key: "mass", label: "Mass (m)", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "omega", label: "Angular speed (ω)", min: 1, max: 6, step: 0.5, default: 3, unit: "rad/s" },
    { key: "radius", label: "Radius (r)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.phi += p.omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 75;
    const r_px = p.radius * scale;
    ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    const bx = cx + r_px * Math.cos(s.phi), by = cy + r_px * Math.sin(s.phi);
    ctx.strokeStyle = "#94a3b8"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    circle(ctx, bx, by, 8 + p.mass, "#3b82f6", "#1d4ed8");
    
    // Draw Angular Momentum Vector arrow (Pointing upwards perpendicular to canvas plane)
    const L = p.mass * p.radius * p.radius * p.omega;
    ctx.fillStyle = "#8b5cf6"; ctx.fillRect(cx - 15, cy - 20 - L * 0.8, 30, L * 0.8);
    ctx.strokeStyle = "#7c3aed"; ctx.strokeRect(cx - 15, cy - 20 - L * 0.8, 30, L * 0.8);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), L: r2(p.mass * p.radius * p.radius * p.omega) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "L", label: "Angular Momentum L (kg·m²/s)", color: "#8b5cf6" }],
  stats: (s, p) => {
    const I = p.mass * p.radius * p.radius;
    return [
      { label: "Inertia (I = mr²)", value: r2(I), unit: "kg·m²" },
      { label: "Angular speed (ω)", value: p.omega, unit: "rad/s" },
      { label: "Ang. Momentum (L)", value: r2(I * p.omega), unit: "kg·m²/s" }
    ];
  }
};

const rotationalkineticenergy = {
  title: "Rotational Kinetic Energy", topic: "mechanics", difficulty: "Intermediate",
  summary: "Study how mechanical energy stores in a rotating body, scaling quadratically with angular velocity.",
  equation: "KE_{rot} = \\tfrac{1}{2} I \\omega^2",
  params: [
    { key: "mass", label: "Disk Mass (M)", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "radius", label: "Disk Radius (R)", min: 0.5, max: 2.0, step: 0.1, default: 1.2, unit: "m" },
    { key: "omega", label: "Angular Speed (ω)", min: 1, max: 8, step: 0.5, default: 4, unit: "rad/s" },
  ],
  init: () => ({ theta: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.theta += p.omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 70;
    const r_px = p.radius * scale;
    circle(ctx, cx, cy, r_px, "#f1f5f9", "#3b82f6");
    
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.theta);
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r_px * Math.cos(i * Math.PI / 2), r_px * Math.sin(i * Math.PI / 2));
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw energy bar
    const I = 0.5 * p.mass * p.radius * p.radius;
    const rot_ke = 0.5 * I * p.omega * p.omega;
    const max_ke = 0.5 * (0.5 * 10 * 2.0 * 2.0) * 8 * 8; // Max possible config energy
    
    const bx0 = 40, bw = 24, bh = 110, by0 = 40;
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(bx0, by0, bw, bh);
    const h = (rot_ke / max_ke) * bh;
    ctx.fillStyle = "#10b981"; ctx.fillRect(bx0, by0 + bh - h, bw, h);
  },
  graphPoint: (s, p) => {
    const I = 0.5 * p.mass * p.radius * p.radius;
    return { t: r2(s.t), ke: r2(0.5 * I * p.omega * p.omega) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "ke", label: "Rotational KE (J)", color: "#10b981" }],
  stats: (s, p) => {
    const I = 0.5 * p.mass * p.radius * p.radius;
    return [
      { label: "Moment of Inertia", value: r2(I), unit: "kg·m²" },
      { label: "Angular speed (ω)", value: p.omega, unit: "rad/s" },
      { label: "Rotational KE", value: r2(0.5 * I * p.omega * p.omega), unit: "J" }
    ];
  }
};

const rollingmotion = {
  title: "Rolling Motion Down Incline", topic: "mechanics", difficulty: "Advanced",
  summary: "Race different shapes down an incline to show how mass distribution dictates rolling acceleration.",
  equation: "a = \\frac{g \\sin\\theta}{1 + k^2/R^2}",
  params: [
    { key: "shape", label: "Rolling Object", type: "select", options: ["Solid Sphere", "Solid Disc", "Thin Ring"], default: "Solid Disc" },
    { key: "angle", label: "Incline Angle (θ)", min: 5, max: 35, step: 1, default: 20, unit: "°" },
  ],
  init: () => ({ s: 0, v: 0, t: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    s.t += dt;
    let factor = 0.5; // Disc
    if (p.shape === "Solid Sphere") factor = 0.4;
    if (p.shape === "Thin Ring") factor = 1.0;
    
    const a = (9.8 * Math.sin(p.angle * RAD)) / (1 + factor);
    s.v += a * 20 * dt;
    s.s += s.v * dt;
    if (s.s > 360) { s.s = 360; s.running = false; }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const th = p.angle * RAD, bx = 80, by = H - 80, len = 420;
    const tx = bx + len * Math.cos(th), ty = by - len * Math.sin(th);
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    
    const f = s.s / 360, r = 22;
    const px = tx - (len * f) * Math.cos(th) * 0.86 - r * Math.sin(th);
    const py = ty + (len * f) * Math.sin(th) * 0.86 - r * Math.cos(th);
    
    ctx.save(); ctx.translate(px, py); ctx.rotate(s.s / r);
    circle(ctx, 0, 0, r, p.shape === "Thin Ring" ? "#f8fafc" : "#f59e0b", "#b45309");
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke();
    ctx.restore();
  },
  graphPoint: (s) => ({ t: r2(s.t), speed: r2(s.v / 20) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "speed", label: "Speed (m/s)", color: "#f59e0b" }],
  stats: (s, p) => {
    let factor = 0.5;
    if (p.shape === "Solid Sphere") factor = 0.4;
    if (p.shape === "Thin Ring") factor = 1.0;
    const a = (9.8 * Math.sin(p.angle * RAD)) / (1 + factor);
    return [
      { label: "Shape Factor k²/R²", value: factor, unit: "" },
      { label: "Acceleration (a)", value: r2(a), unit: "m/s²" },
      { label: "Speed at bottom", value: r2(s.v / 20), unit: "m/s" }
    ];
  }
};

const conservationofangularmomentum = {
  title: "Conservation of Angular Momentum", topic: "mechanics", difficulty: "Advanced",
  summary: "Observe how pulling arms in reduces the moment of inertia and causes the figure skater to spin faster.",
  equation: "I_1 \\omega_1 = I_2 \\omega_2 = \\text{constant}",
  params: [
    { key: "armsState", label: "Skater Arms State", type: "select", options: ["Extended (Large I)", "Pulled In (Small I)"], default: "Extended (Large I)" },
    { key: "mass", label: "Skater Mass", min: 40, max: 80, step: 2, default: 60, unit: "kg" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    // Extended I_1 = 4.5, Pulled In I_2 = 1.8. Constant L = 12
    const I = p.armsState === "Extended (Large I)" ? 4.5 : 1.8;
    const omega = 12 / I;
    s.phi += omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const extended = p.armsState === "Extended (Large I)";
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
    // Draw revolving platform
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(cx - 80, cy + 40, 160, 15);
    
    // Draw skater head/body torso dynamically
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.phi);
    // Skater head
    circle(ctx, 0, -25, 12, "#3b82f6", "#1d4ed8");
    // Skater torso
    ctx.fillStyle = "#1e293b"; ctx.fillRect(-10, -10, 20, 45);
    // Skater arms (length depends on armsState)
    const armLen = extended ? 42 : 15;
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-10, -5); ctx.lineTo(-armLen, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(armLen, -5); ctx.stroke();
    ctx.restore();
  },
  graphPoint: (s, p) => {
    const I = p.armsState === "Extended (Large I)" ? 4.5 : 1.8;
    return { t: r2(s.t), omega: r2(12 / I) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "omega", label: "Rotation Speed ω (rad/s)", color: "#10b981" }],
  stats: (s, p) => {
    const I = p.armsState === "Extended (Large I)" ? 4.5 : 1.8;
    return [
      { label: "Moment of Inertia (I)", value: I, unit: "kg·m²" },
      { label: "Angular velocity (ω)", value: r2(12 / I), unit: "rad/s" },
      { label: "Total momentum (L)", value: 12, unit: "kg·m²/s" },
      { label: "Rotational KE", value: r2(0.5 * I * (12/I) * (12/I)), unit: "J" }
    ];
  }
};

const simsRotational = { torque, momentofinertia, radiusofgyration, angularmomentum, rotationalkineticenergy, rollingmotion, conservationofangularmomentum };
export default simsRotational;
