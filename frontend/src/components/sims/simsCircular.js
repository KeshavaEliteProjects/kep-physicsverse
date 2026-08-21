// Circular Motion simulations. SimEngine-compatible configs.
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

const angulardisplacement = {
  title: "Angular Displacement", topic: "mechanics", difficulty: "Beginner",
  summary: "Study angular displacement by tracing the relation between arc length (s) and radius (r).",
  equation: "\\theta = \\frac{s}{r}",
  params: [
    { key: "radius", label: "Radius (r)", min: 1.0, max: 4.0, step: 0.2, default: 2.0, unit: "m" },
    { key: "arcLength", label: "Arc Length (s)", min: 0.5, max: 12.0, step: 0.5, default: 4.0, unit: "m" },
  ],
  init: (p) => ({ theta: 0, t: 0, currentS: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    s.t += dt;
    s.currentS += (p.arcLength - s.currentS) * 4 * dt;
    s.theta = s.currentS / p.radius;
    if (Math.abs(p.arcLength - s.currentS) < 0.02) {
      s.currentS = p.arcLength;
      s.theta = p.arcLength / p.radius;
      s.running = false;
    }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 40;
    const r_px = p.radius * scale;
    const curTheta = s.currentS / p.radius;
    
    // Draw boundary circle
    ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    // Draw sector arc
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, curTheta); ctx.stroke();
    
    // Spokes bounding displacement
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r_px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r_px * Math.cos(curTheta), cy + r_px * Math.sin(curTheta)); ctx.stroke();
    
    // Label radius
    ctx.fillStyle = "#475569"; ctx.font = "italic 11px sans-serif";
    ctx.fillText("r = " + p.radius + "m", cx + r_px/2, cy - 6);
    
    // Label displacement angle inside sector
    ctx.fillStyle = "#2563eb"; ctx.font = "bold 13px sans-serif";
    ctx.fillText("θ", cx + 18, cy + 18);
  },
  graphPoint: (s) => ({ t: r2(s.t), theta: r2(s.theta) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "theta", label: "Displacement θ (rad)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Radius (r)", value: p.radius, unit: "m" },
    { label: "Arc Length (s)", value: p.arcLength, unit: "m" },
    { label: "θ (Radians)", value: r2(s.theta), unit: "rad" },
    { label: "θ (Degrees)", value: r2(s.theta * 180 / Math.PI), unit: "°" }
  ]
};

const angularvelocity = {
  title: "Angular Velocity", topic: "mechanics", difficulty: "Beginner",
  summary: "Observe how angular velocity relates to radius and tangential linear velocity (v = r * ω).",
  equation: "\\omega = \\frac{v}{r}",
  params: [
    { key: "radius", label: "Radius (r)", min: 1.0, max: 4.0, step: 0.2, default: 2.0, unit: "m" },
    { key: "linearSpeed", label: "Linear Speed (v)", min: 1, max: 10, step: 0.5, default: 4, unit: "m/s" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    const omega = p.linearSpeed / p.radius;
    s.phi += omega * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 40;
    const r_px = p.radius * scale;
    ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    const bx = cx + r_px * Math.cos(s.phi), by = cy + r_px * Math.sin(s.phi);
    // Draw string
    ctx.strokeStyle = "#94a3b8"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    circle(ctx, bx, by, 10, "#3b82f6", "#1d4ed8");
    
    // Draw linear velocity arrow (v)
    const tx = bx - Math.sin(s.phi) * 50, ty = by + Math.cos(s.phi) * 50;
    arrow(ctx, bx, by, tx, ty, "#10b981", 2.5);
    ctx.fillStyle = "#10b981"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("v = " + p.linearSpeed + "m/s", tx + 5, ty + 5);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), omega: r2(p.linearSpeed / p.radius) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "omega", label: "Angular Velocity ω (rad/s)", color: "#f59e0b" }],
  stats: (s, p) => {
    const omega = p.linearSpeed / p.radius;
    return [
      { label: "Radius (r)", value: p.radius, unit: "m" },
      { label: "Linear speed (v)", value: p.linearSpeed, unit: "m/s" },
      { label: "Angular velocity (ω)", value: r2(omega), unit: "rad/s" },
      { label: "RPM (Rev per Min)", value: r2(omega * 30 / Math.PI), unit: "" }
    ];
  }
};

const angularacceleration = {
  title: "Angular Acceleration", topic: "mechanics", difficulty: "Intermediate",
  summary: "Apply angular acceleration (α) and see angular speed (ω) grow over time.",
  equation: "\\alpha = \\frac{d\\omega}{dt}",
  params: [
    { key: "radius", label: "Radius (r)", min: 1.0, max: 4.0, step: 0.2, default: 2.0, unit: "m" },
    { key: "alpha", label: "Angular Acceleration (α)", min: -1.0, max: 4.0, step: 0.2, default: 1.2, unit: "rad/s²" },
  ],
  init: () => ({ theta: 0, omega: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.omega += p.alpha * dt;
    if (s.omega < 0) s.omega = 0;
    s.theta += s.omega * dt;
    if (s.t > 10) { s.theta = 0; s.omega = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 40;
    const r_px = p.radius * scale;
    ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    const bx = cx + r_px * Math.cos(s.theta), by = cy + r_px * Math.sin(s.theta);
    circle(ctx, bx, by, 10, "#e11d48", "#be123c");
    
    // Draw tangential acceleration arrow (a_t)
    const tx = bx - Math.sin(s.theta) * 45, ty = by + Math.cos(s.theta) * 45;
    arrow(ctx, bx, by, tx, ty, "#f59e0b", 2.5);
  },
  graphPoint: (s) => ({ t: r2(s.t), omega: r2(s.omega) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "omega", label: "Ang. Velocity (rad/s)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Ang. Accel (α)", value: p.alpha, unit: "rad/s²" },
    { label: "Current ω", value: r2(s.omega), unit: "rad/s" },
    { label: "Tangential Accel (a_t)", value: r2(p.radius * p.alpha), unit: "m/s²" },
    { label: "Elapsed Time", value: r2(s.t), unit: "s" }
  ]
};

const centripetalacceleration = {
  title: "Centripetal Acceleration", topic: "mechanics", difficulty: "Intermediate",
  summary: "Visualize the acceleration vector that continually pulls a revolving object inwards.",
  equation: "a_c = \\frac{v^2}{r}",
  params: [
    { key: "radius", label: "Radius (r)", min: 1.0, max: 4.0, step: 0.2, default: 2.0, unit: "m" },
    { key: "speed", label: "Linear Speed (v)", min: 2.0, max: 12.0, step: 0.5, default: 6.0, unit: "m/s" },
  ],
  init: () => ({ phi: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.phi += (p.speed / p.radius) * dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 45;
    const r_px = p.radius * scale;
    ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r_px, 0, Math.PI * 2); ctx.stroke();
    
    const bx = cx + r_px * Math.cos(s.phi), by = cy + r_px * Math.sin(s.phi);
    circle(ctx, bx, by, 10, "#8b5cf6", "#7c3aed");
    
    // Draw Centripetal Acceleration arrow pointing to center
    const ax = bx - Math.cos(s.phi) * 60, ay = by - Math.sin(s.phi) * 60;
    arrow(ctx, bx, by, ax, ay, "#2563eb", 2.5);
    ctx.fillStyle = "#2563eb"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("a_c", ax - 8, ay - 6);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), ac: r2((p.speed * p.speed) / p.radius) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "ac", label: "Centripetal Accel (m/s²)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Turn Radius", value: p.radius, unit: "m" },
    { label: "Linear Speed", value: p.speed, unit: "m/s" },
    { label: "Acceleration (a_c)", value: r2((p.speed * p.speed) / p.radius), unit: "m/s²" }
  ]
};

const centripetalforce = {
  title: "Centripetal Force & String Tension", topic: "mechanics", difficulty: "Intermediate",
  summary: "Simulate centripetal force and observe string tension; exceed 100N to see the string snap!",
  equation: "F_c = \\frac{mv^2}{r}",
  params: [
    { key: "mass", label: "Mass (m)", min: 1, max: 8, step: 0.5, default: 3, unit: "kg" },
    { key: "speed", label: "Speed (v)", min: 2, max: 12, step: 0.5, default: 6, unit: "m/s" },
    { key: "radius", label: "Radius (r)", min: 1.0, max: 3.5, step: 0.1, default: 2.0, unit: "m" },
  ],
  init: () => ({ phi: 0, t: 0, snapped: false, sx: 0, sy: 0, svx: 0, svy: 0 }),
  step: (s, dt, p) => {
    const force = (p.mass * p.speed * p.speed) / p.radius;
    if (force > 100 && !s.snapped) {
      s.snapped = true;
      s.sx = p.radius * 45 * Math.cos(s.phi);
      s.sy = p.radius * 45 * Math.sin(s.phi);
      const vMag = p.speed * 45;
      s.svx = -vMag * Math.sin(s.phi);
      s.svy = vMag * Math.cos(s.phi);
    }
    
    if (s.snapped) {
      s.t += dt;
      s.sx += s.svx * dt;
      s.sy += s.svy * dt;
      if (s.t > 4) { s.snapped = false; s.t = 0; s.phi = 0; }
    } else {
      s.t += dt;
      s.phi += (p.speed / p.radius) * dt;
    }
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, scale = 45;
    const rad = p.radius * scale;
    
    if (!s.snapped) {
      ctx.strokeStyle = "rgba(148,163,184,.3)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      
      const bx = cx + rad * Math.cos(s.phi), by = cy + rad * Math.sin(s.phi);
      ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
      circle(ctx, bx, by, 10, "#e11d48", "#be123c");
      
      // Draw force vector arrow pointing inwards
      const fx = bx - Math.cos(s.phi) * 55, fy = by - Math.sin(s.phi) * 55;
      arrow(ctx, bx, by, fx, fy, "#ef4444", 2.5);
    } else {
      // Snapped string representation
      ctx.fillStyle = "#ef4444"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("STRING SNAPPED (F > 100 N)", cx, cy - 100);
      ctx.textAlign = "left";
      
      // Draw snapped moving bob
      circle(ctx, cx + s.sx, cy + s.sy, 10, "#e11d48", "#be123c");
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), Fc: s.snapped ? 0 : r2((p.mass * p.speed * p.speed) / p.radius) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "Fc", label: "Tension Force (N)", color: "#ef4444" }],
  stats: (s, p) => {
    const force = (p.mass * p.speed * p.speed) / p.radius;
    return [
      { label: "Centripetal Force", value: s.snapped ? 0 : r2(force), unit: "N" },
      { label: "String Tension", value: s.snapped ? "0 (Broken)" : r2(force) + " N", unit: "" },
      { label: "Max String Limit", value: "100", unit: "N" }
    ];
  }
};

const bankedroads = {
  title: "Ideal Banked Road (No Friction)", topic: "mechanics", difficulty: "Advanced",
  summary: "Observe ideal banking design where centripetal force is provided entirely by the normal force component.",
  equation: "\\tan\\theta = \\frac{v^2}{rg}",
  params: [
    { key: "angle", label: "Banking Angle (θ)", min: 5, max: 40, step: 5, default: 15, unit: "°" },
    { key: "radius", label: "Curve Radius (r)", min: 20, max: 80, step: 5, default: 45, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2 + 50;
    const theta = p.angle * RAD;
    // Draw ramp
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(cx - 150, cy);
    const rx = cx + 150, ry = cy - 300 * Math.sin(theta);
    ctx.lineTo(rx, ry); ctx.lineTo(rx, cy); ctx.closePath();
    ctx.fillStyle = "#f8fafc"; ctx.fill(); ctx.stroke();
    
    // Calculate ideal velocity
    const vIdeal = Math.sqrt(p.radius * 9.8 * Math.tan(theta));
    const bx = cx - 150 + 170 * Math.cos(theta);
    const by = cy - 170 * Math.sin(theta);
    
    // Draw block
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-theta);
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(-18, -12, 36, 12);
    ctx.restore();
    
    ctx.fillStyle = "#10b981"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Ideal Speed: " + r2(vIdeal) + " m/s", cx, cy - 120);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => {
    const theta = p.angle * RAD;
    return { t: r2(s.t), vIdeal: r2(Math.sqrt(p.radius * 9.8 * Math.tan(theta))) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vIdeal", label: "Ideal Speed (m/s)", color: "#10b981" }],
  stats: (s, p) => {
    const theta = p.angle * RAD;
    const vIdeal = Math.sqrt(p.radius * 9.8 * Math.tan(theta));
    return [
      { label: "Optimal Speed (v)", value: r2(vIdeal), unit: "m/s" },
      { label: "Radius (r)", value: p.radius, unit: "m" },
      { label: "Req. Acceleration", value: r2(9.8 * Math.tan(theta)), unit: "m/s²" }
    ];
  }
};

const bankedcurve = {
  title: "Banked Curve with Friction", topic: "mechanics", difficulty: "Advanced",
  summary: "Simulate a vehicle on a banked circular turn to find minimum and maximum safe speeds with static friction.",
  equation: "v_{max} = \\sqrt{r g \\left(\\frac{\\tan\\theta + \\mu}{1 - \\mu \\tan\\theta}\\right)}",
  params: [
    { key: "angle", label: "Banking Angle (θ)", min: 5, max: 40, step: 5, default: 20, unit: "°" },
    { key: "friction", label: "Friction (μ)", min: 0.1, max: 0.6, step: 0.05, default: 0.2, unit: "" },
    { key: "radius", label: "Turn Radius (r)", min: 20, max: 100, step: 5, default: 50, unit: "m" },
    { key: "speed", label: "Vehicle Speed (v)", min: 5, max: 35, step: 1, default: 15, unit: "m/s" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2 + 50;
    const theta = p.angle * RAD;
    // Draw Banked Ramp
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(cx - 150, cy);
    const rx = cx + 150, ry = cy - 300 * Math.sin(theta);
    ctx.lineTo(rx, ry); ctx.lineTo(rx, cy); ctx.closePath();
    ctx.fillStyle = "#f1f5f9"; ctx.fill(); ctx.stroke();
    
    // Draw car
    const blockDist = 180;
    const bx = cx - 150 + blockDist * Math.cos(theta);
    const by = cy - blockDist * Math.sin(theta);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-theta);
    ctx.fillStyle = "#ef4444"; ctx.fillRect(-20, -15, 40, 15);
    ctx.restore();
    
    // Calculate speed stability
    const rg = p.radius * 9.8;
    const tanTh = Math.tan(theta);
    const maxDenom = 1 - p.friction * tanTh;
    const vMax = maxDenom > 0.02 ? Math.sqrt(rg * (tanTh + p.friction) / maxDenom) : 999;
    const vMin = p.friction >= tanTh ? 0 : Math.sqrt(rg * (tanTh - p.friction) / (1 + p.friction * tanTh));
    
    let status = "STABLE";
    let color = "#10b981";
    if (p.speed > vMax) { status = "SKIDDING OUT"; color = "#ef4444"; }
    else if (p.speed < vMin) { status = "SLIDING DOWN"; color = "#f59e0b"; }
    
    ctx.fillStyle = color; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(status, cx, cy - 140);
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), speed: p.speed }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "speed", label: "Current Speed (m/s)", color: "#ef4444" }],
  stats: (s, p) => {
    const theta = p.angle * RAD;
    const rg = p.radius * 9.8;
    const tanTh = Math.tan(theta);
    const maxDenom = 1 - p.friction * tanTh;
    const vMax = maxDenom > 0.02 ? Math.sqrt(rg * (tanTh + p.friction) / maxDenom) : 999;
    const vMin = p.friction >= tanTh ? 0 : Math.sqrt(rg * (tanTh - p.friction) / (1 + p.friction * tanTh));
    return [
      { label: "Max safe speed", value: vMax > 900 ? "∞" : r2(vMax), unit: "m/s" },
      { label: "Min safe speed", value: r2(vMin), unit: "m/s" },
      { label: "Friction Coeff (μ)", value: p.friction, unit: "" },
      { label: "Speed Limit Check", value: (p.speed >= vMin && p.speed <= vMax) ? "SAFE" : "DANGER", unit: "" }
    ];
  }
};

const simsCircular = { angulardisplacement, angularvelocity, angularacceleration, centripetalacceleration, centripetalforce, bankedroads, bankedcurve };
export default simsCircular;
