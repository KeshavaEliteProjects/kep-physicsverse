// Work, Energy & Power simulations. SimEngine-compatible configs.
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

const work = {
  title: "Work Done by Force", topic: "mechanics", difficulty: "Beginner",
  summary: "Apply a force at various angles to push a block and calculate W = F * d * cos(θ).",
  equation: "W = F d \\\\cos\\\\theta",
  params: [
    { key: "force", label: "Applied Force (F)", min: 0, max: 50, step: 2, default: 20, unit: "N" },
    { key: "distance", label: "Distance (d)", min: 1, max: 10, step: 0.5, default: 6, unit: "m" },
    { key: "angle", label: "Force Angle (θ)", min: -90, max: 90, step: 10, default: 30, unit: "°" },
  ],
  init: () => ({ x: 0, t: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    s.t += dt;
    s.x += 1.5 * dt;
    if (s.x >= p.distance) { s.x = p.distance; s.running = false; }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const gy = H - 100; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke();
    const bx = 100 + (s.x / 10) * (W - 240); const sz = 40;
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(bx, gy - sz, sz, sz);
    const theta = p.angle * RAD;
    const fx = bx + sz/2, fy = gy - sz/2;
    const ax = fx - Math.cos(theta) * 60, ay = fy + Math.sin(theta) * 60;
    arrow(ctx, ax, ay, fx, fy, "#ef4444", 3);
    ctx.fillStyle = "#1e293b"; ctx.font = "600 12px sans-serif";
    ctx.fillText("F = " + p.force + "N", ax - 10, ay + 15);
  },
  graphPoint: (s, p) => {
    const theta = p.angle * RAD;
    return { t: r2(s.t), W: r2(p.force * s.x * Math.cos(theta)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "W", label: "Work Done (J)", color: "#ef4444" }],
  stats: (s, p) => {
    const theta = p.angle * RAD;
    const cosVal = Math.cos(theta);
    return [
      { label: "Distance", value: r2(s.x), unit: "m" },
      { label: "cos(θ)", value: r2(cosVal), unit: "" },
      { label: "Work Done", value: r2(p.force * s.x * cosVal), unit: "J" },
      { label: "Status", value: s.running ? "Pushing..." : "Finished", unit: "" }
    ];
  }
};

const workenergy = {
  title: "Work-Energy Theorem", topic: "mechanics", difficulty: "Intermediate",
  summary: "Accelerate a mass using a constant force and prove Net Work equals the change in Kinetic Energy.",
  equation: "W_{net} = \\\\Delta KE = \\\\tfrac{1}{2}mv^2 - \\\\tfrac{1}{2}mu^2",
  params: [
    { key: "force", label: "Applied Force", min: 5, max: 40, step: 1, default: 15, unit: "N" },
    { key: "mass", label: "Mass", min: 1, max: 8, step: 0.5, default: 3, unit: "kg" },
    { key: "u", label: "Initial Speed (u)", min: 0, max: 6, step: 0.5, default: 2, unit: "m/s" },
    { key: "distance", label: "Distance", min: 2, max: 10, step: 0.5, default: 6, unit: "m" },
  ],
  init: (p) => ({ x: 0, v: p.u, t: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    const a = p.force / p.mass;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
    if (s.x >= p.distance) { s.x = p.distance; s.v = Math.sqrt(p.u*p.u + 2*a*p.distance); s.running = false; }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const gy = H - 100; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke();
    const bx = 100 + (s.x / 10) * (W - 240); const sz = 40;
    ctx.fillStyle = "#10b981"; ctx.fillRect(bx, gy - sz, sz, sz);
    arrow(ctx, bx - 50, gy - sz/2, bx, gy - sz/2, "#ef4444", 3);
    const ke_i = 0.5 * p.mass * p.u * p.u;
    const ke_f = 0.5 * p.mass * s.v * s.v;
    const work = p.force * s.x;
    const bar = (i, val, color, label) => {
      const bx0 = 40, bw = 26, bh = 100, by0 = 40;
      const x = bx0 + i * 46;
      ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x, by0, bw, bh);
      const maxVal = Math.max(1, p.force * p.distance + ke_i);
      const h = (val / maxVal) * bh;
      ctx.fillStyle = color; ctx.fillRect(x, by0 + bh - h, bw, h);
      ctx.fillStyle = "#475569"; ctx.font = "600 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(label, x + bw/2, by0 + bh + 14);
    };
    bar(0, ke_i, "#2563eb", "KE_i");
    bar(1, work, "#ef4444", "Work");
    bar(2, ke_f, "#10b981", "KE_f");
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), work: r2(p.force * s.x), delta_ke: r2(0.5 * p.mass * (s.v * s.v - p.u * p.u)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "work", label: "Work Done (J)", color: "#ef4444" },
    { key: "delta_ke", label: "Change in KE (J)", color: "#10b981" }
  ],
  stats: (s, p) => {
    const ke_i = 0.5 * p.mass * p.u * p.u;
    const ke_f = 0.5 * p.mass * s.v * s.v;
    return [
      { label: "Speed", value: r2(s.v), unit: "m/s" },
      { label: "Work Done", value: r2(p.force * s.x), unit: "J" },
      { label: "Change in KE", value: r2(ke_f - ke_i), unit: "J" },
      { label: "Equal?", value: Math.abs(p.force * s.x - (ke_f - ke_i)) < 0.1 ? "YES" : "NO", unit: "" }
    ];
  }
};

const kineticenergy = {
  title: "Kinetic Energy", topic: "mechanics", difficulty: "Beginner",
  summary: "Explore kinetic energy and verify its relationship with linear momentum.",
  equation: "KE = \\\\tfrac{1}{2}mv^2 = \\\\frac{p^2}{2m}",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "velocity", label: "Velocity", min: -8, max: 8, step: 0.5, default: 4, unit: "m/s" },
  ],
  init: () => ({ x: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    s.x += p.velocity * dt;
    if (Math.abs(s.x) > 5) s.x = -s.x;
  },
  draw: (ctx, s, p, W, H) => {
    const gy = H - 80; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke();
    const cx = W / 2;
    const bx = cx + (s.x / 5) * (W/2 - 100); const sz = 24 + p.mass * 2.5;
    ctx.fillStyle = "#8b5cf6"; ctx.fillRect(bx - sz/2, gy - sz, sz, sz);
    if (p.velocity !== 0) {
      arrow(ctx, bx, gy - sz/2, bx + (p.velocity > 0 ? 40 : -40), gy - sz/2, "#ef4444", 2.5);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), ke: r2(0.5 * p.mass * p.velocity * p.velocity) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "ke", label: "Kinetic Energy (J)", color: "#8b5cf6" }],
  stats: (s, p) => {
    const momentum = p.mass * p.velocity;
    const ke = 0.5 * p.mass * p.velocity * p.velocity;
    return [
      { label: "Momentum (p)", value: r2(momentum), unit: "kg·m/s" },
      { label: "KE = 0.5mv²", value: r2(ke), unit: "J" },
      { label: "KE = p²/(2m)", value: r2((momentum*momentum)/(2*p.mass)), unit: "J" }
    ];
  }
};

const potentialenergy = {
  title: "Potential Energy & Drop Lab", topic: "mechanics", difficulty: "Beginner",
  summary: "Lift a block to store potential energy (PE = mgh), then release it to watch it convert to KE.",
  equation: "PE = mgh",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 10, step: 0.5, default: 4, unit: "kg" },
    { key: "height", label: "Lift Height", min: 1, max: 10, step: 0.5, default: 6, unit: "m" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.5, default: 9.8, unit: "m/s²" },
  ],
  init: (p) => ({ y: p.height, v: 0, t: 0, dropped: false }),
  step: (s, dt, p) => {
    s.dropped = true; 
    if (s.dropped && s.y > 0) {
      s.v += p.gravity * dt;
      s.y -= s.v * dt;
      s.t += dt;
      if (s.y <= 0) { s.y = 0; s.v = 0; }
    }
  },
  done: (s) => s.y <= 0,
  draw: (ctx, s, p, W, H) => {
    const gy = H - 80; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(100, gy); ctx.lineTo(W - 100, gy); ctx.stroke();
    const bx = W / 2;
    const by = gy - (s.y / 10) * (H - 180); const sz = 30 + p.mass * 2;
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(bx - sz/2, by - sz, sz, sz);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), pe: r2(p.mass * p.gravity * s.y), ke: r2(0.5 * p.mass * s.v * s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "pe", label: "Potential Energy (J)", color: "#3b82f6" },
    { key: "ke", label: "Kinetic Energy (J)", color: "#10b981" }
  ],
  stats: (s, p) => [
    { label: "Height", value: r2(s.y), unit: "m" },
    { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "PE = mgh", value: r2(p.mass * p.gravity * s.y), unit: "J" },
    { label: "KE = 0.5mv²", value: r2(0.5 * p.mass * s.v * s.v), unit: "J" }
  ]
};

const conservationofenergy = {
  title: "Conservation of Energy Lab", topic: "mechanics", difficulty: "Intermediate",
  summary: "Watch potential, kinetic, and thermal energy conserve completely on a track with friction.",
  equation: "E_{total} = KE + PE + E_{thermal} = \\\\text{constant}",
  params: [
    { key: "height", label: "Release Height", min: 1, max: 8, step: 0.5, default: 6, unit: "m" },
    { key: "friction", label: "Friction Coeff (μ)", min: 0, max: 0.4, step: 0.02, default: 0.06, unit: "" },
    { key: "mass", label: "Skater Mass", min: 1, max: 5, step: 0.5, default: 2, unit: "kg" },
  ],
  init: (p) => ({ X: -Math.sqrt((p.height * 20) / 0.003), vX: 0, thermal: 0, t: 0 }),
  step: (s, dt, p) => {
    const curve = 0.003;
    const gpx = 9.8 * 26;
    const slope = 2 * curve * s.X;
    const angle = Math.atan(slope);
    const normalForce = p.mass * 9.8 * Math.cos(angle);
    const frictionForce = p.friction * normalForce;
    const accGravity = (-gpx * slope / (1 + slope * slope));
    s.vX += accGravity * dt;
    const vMag = Math.abs(s.vX);
    if (vMag > 0.01) {
      const vLoss = (frictionForce / p.mass) * 12 * dt;
      const prevKE = 0.5 * p.mass * vMag * vMag;
      let newVMag = Math.max(0, vMag - vLoss);
      s.vX = (s.vX > 0 ? 1 : -1) * newVMag;
      const newKE = 0.5 * p.mass * newVMag * newVMag;
      s.thermal += Math.max(0, prevKE - newKE) * 0.001;
    }
    s.X += s.vX * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, baseY = H - 56, curve = 0.003;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = -230; x <= 230; x += 6) {
      ctx.lineTo(cx + x, baseY - curve * x * x);
    }
    ctx.stroke();
    const bx = cx + s.X, by = baseY - curve * s.X * s.X;
    circle(ctx, bx, by - 10, 10, "#e11d48", "#be123c");
    
    const hm = (curve * s.X * s.X) / 20;
    const slope = 2 * curve * s.X;
    const vMag = Math.abs(s.vX) * Math.sqrt(1 + slope*slope) / 20;
    const pe = p.mass * 9.8 * hm;
    const ke = 0.5 * p.mass * vMag * vMag;
    const total_mech = pe + ke;
    const maxE = p.mass * 9.8 * p.height * 1.05;
    
    const bar = (i, val, color, label) => {
      const bx0 = 26, bw = 22, bh = 120, by0 = 40;
      const x = bx0 + i * 36;
      ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x, by0, bw, bh);
      const h = Math.min(bh, (val / maxE) * bh);
      ctx.fillStyle = color; ctx.fillRect(x, by0 + bh - h, bw, h);
      ctx.fillStyle = "#475569"; ctx.font = "600 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(label, x + bw/2, by0 + bh + 14);
    };
    bar(0, ke, "#10b981", "KE");
    bar(1, pe, "#2563eb", "PE");
    bar(2, s.thermal * 1000, "#f59e0b", "THERM");
    bar(3, ke + pe + s.thermal * 1000, "#64748b", "TOTAL");
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => {
    const curve = 0.003;
    const hm = (curve * s.X * s.X) / 20;
    const slope = 2 * curve * s.X;
    const vMag = Math.abs(s.vX) * Math.sqrt(1 + slope*slope) / 20;
    const pe = p.mass * 9.8 * hm;
    const ke = 0.5 * p.mass * vMag * vMag;
    return { t: r2(s.t), ke: r2(ke), pe: r2(pe), thermal: r2(s.thermal*1000), total: r2(ke+pe+s.thermal*1000) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "ke", label: "KE (J)", color: "#10b981" },
    { key: "pe", label: "PE (J)", color: "#2563eb" },
    { key: "thermal", label: "Thermal (J)", color: "#f59e0b" },
    { key: "total", label: "Total E (J)", color: "#64748b" }
  ],
  stats: (s, p) => {
    const curve = 0.003;
    const hm = (curve * s.X * s.X) / 20;
    const slope = 2 * curve * s.X;
    const vMag = Math.abs(s.vX) * Math.sqrt(1 + slope*slope) / 20;
    const pe = p.mass * 9.8 * hm;
    const ke = 0.5 * p.mass * vMag * vMag;
    return [
      { label: "PE", value: r2(pe), unit: "J" },
      { label: "KE", value: r2(ke), unit: "J" },
      { label: "Thermal", value: r2(s.thermal*1000), unit: "J" },
      { label: "Total Energy", value: r2(ke + pe + s.thermal*1000), unit: "J" }
    ];
  }
};

const power = {
  title: "Power & Efficiency", topic: "mechanics", difficulty: "Intermediate",
  summary: "Adjust input power and mass to see how fast a vehicle accelerates and its efficiency.",
  equation: "P = F v \\\\qquad \\\\eta = \\\\frac{P_{out}}{P_{in}} \\\\times 100\\\\%",
  params: [
    { key: "power", label: "Input Power (Pin)", min: 100, max: 1000, step: 50, default: 500, unit: "W" },
    { key: "mass", label: "Vehicle Mass", min: 100, max: 1000, step: 50, default: 400, unit: "kg" },
    { key: "drag", label: "Drag Coefficient", min: 0.1, max: 1.0, step: 0.05, default: 0.4, unit: "" },
  ],
  init: () => ({ v: 0, x: 0, t: 0 }),
  step: (s, dt, p) => {
    s.t += dt;
    const dragForce = 0.5 * p.drag * s.v * s.v;
    const currentForce = s.v > 0.1 ? (p.power / s.v) : p.power / 0.1;
    const netForce = currentForce - dragForce;
    const a = netForce / p.mass;
    s.v += a * dt; if (s.v < 0) s.v = 0;
    s.x += s.v * dt;
    if (s.x > 300) s.x = 0;
  },
  draw: (ctx, s, p, W, H) => {
    const gy = H - 80; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke();
    const bx = 100 + (s.x / 300) * (W - 240); const sz = 20;
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(bx - 20, gy - sz, 40, sz);
    circle(ctx, bx - 10, gy, 5, "#475569"); circle(ctx, bx + 10, gy, 5, "#475569");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), v: r2(s.v), P_out: r2(0.5 * p.drag * s.v * s.v * s.v) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "v", label: "Speed (m/s)", color: "#10b981" },
    { key: "P_out", label: "Useful Output Power (W)", color: "#ef4444" }
  ],
  stats: (s, p) => {
    const dragForce = 0.5 * p.drag * s.v * s.v;
    const P_out = dragForce * s.v;
    const efficiency = (P_out / p.power) * 100;
    return [
      { label: "Speed", value: r2(s.v), unit: "m/s" },
      { label: "Output Power", value: r2(P_out), unit: "W" },
      { label: "Efficiency", value: r2(Math.min(100, efficiency)), unit: "%" }
    ];
  }
};

const conservativeforces = {
  title: "Conservative vs Non-Conservative Forces", topic: "mechanics", difficulty: "Advanced",
  summary: "Slide a block from A to B along a straight vs winding path to show path independence of gravity and path dependence of friction.",
  equation: "W_{grav} = \\\\text{path-independent} \\\\qquad W_{fric} = \\\\text{path-dependent}",
  params: [
    { key: "friction", label: "Friction coeff (μ)", min: 0.1, max: 0.6, step: 0.05, default: 0.2, unit: "" },
    { key: "mass", label: "Block Mass", min: 1, max: 5, step: 0.5, default: 2, unit: "kg" },
  ],
  init: () => ({ x: 0, t: 0, w_grav: 0, w_fric_straight: 0, w_fric_winding: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    s.t += dt;
    s.x += 1.2 * dt;
    s.w_grav = p.mass * 9.8 * (s.x * 0.4);
    s.w_fric_straight = p.friction * p.mass * 9.8 * s.x;
    s.w_fric_winding = p.friction * p.mass * 9.8 * s.x * 1.8;
    if (s.x >= 6) { s.x = 6; s.running = false; }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    // Draw straight path (top)
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(80, cy - 40); ctx.lineTo(W - 80, cy - 40); ctx.stroke();
    // Draw winding path (bottom)
    ctx.beginPath();
    ctx.moveTo(80, cy + 40);
    for (let x = 80; x <= W - 80; x += 10) {
      ctx.lineTo(x, cy + 40 + Math.sin((x - 80) * 0.06) * 15);
    }
    ctx.stroke();
    
    // Draw straight block
    const sx = 80 + (s.x / 6) * (W - 160);
    ctx.fillStyle = "#3b82f6"; ctx.fillRect(sx - 10, cy - 50, 20, 10);
    
    // Draw winding block
    const wy = cy + 40 + Math.sin((sx - 80) * 0.06) * 15;
    ctx.fillStyle = "#e11d48"; ctx.fillRect(sx - 10, wy - 10, 20, 10);
  },
  graphPoint: (s) => ({ t: r2(s.t), straight: r2(s.w_fric_straight), winding: r2(s.w_fric_winding) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "straight", label: "Straight Friction Work (J)", color: "#3b82f6" },
    { key: "winding", label: "Winding Friction Work (J)", color: "#e11d48" }
  ],
  stats: (s, p) => [
    { label: "Gravity Work (Both)", value: r2(s.w_grav), unit: "J" },
    { label: "Straight Friction W", value: r2(s.w_fric_straight), unit: "J" },
    { label: "Winding Friction W", value: r2(s.w_fric_winding), unit: "J" }
  ]
};

const springenergy = {
  title: "Spring Potential & Kinetic Energy", topic: "mechanics", difficulty: "Intermediate",
  summary: "Simulate a mass on a spring and track the continuous exchange between elastic potential and kinetic energy.",
  equation: "E = KE + PE_{spring} = \\\\tfrac{1}{2}mv^2 + \\\\tfrac{1}{2}kx^2 = \\\\text{const}",
  params: [
    { key: "mass", label: "Mass", min: 1, max: 8, step: 0.5, default: 2, unit: "kg" },
    { key: "k", label: "Spring Constant (k)", min: 10, max: 80, step: 2, default: 30, unit: "N/m" },
    { key: "amplitude", label: "Amplitude", min: 0.5, max: 2, step: 0.1, default: 1.2, unit: "m" },
  ],
  init: (p) => ({ x: p.amplitude, v: 0, t: 0 }),
  step: (s, dt, p) => {
    const a = -(p.k / p.mass) * s.x;
    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const wallX = 70, cy = H / 2, eqX = W / 2, scale = 90;
    const blockX = eqX + s.x * scale;
    // wall
    ctx.fillStyle = "#334155"; ctx.fillRect(wallX - 12, cy - 70, 12, 140);
    // spring
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(wallX, cy);
    const coils = 14, span = blockX - 20 - wallX;
    for (let i = 0; i <= coils; i++) {
      ctx.lineTo(wallX + span * (i / coils), cy + (i % 2 === 0 ? -12 : 12) * (i === 0 || i === coils ? 0 : 1));
    }
    ctx.stroke();
    // block
    ctx.fillStyle = "#2563eb"; ctx.fillRect(blockX - 20, cy - 20, 40, 40);
    
    // energy bars
    const ke = 0.5 * p.mass * s.v * s.v;
    const pe = 0.5 * p.k * s.x * s.x;
    const total = ke + pe;
    const maxE = 0.5 * p.k * p.amplitude * p.amplitude * 1.1;
    
    const bar = (i, val, color, label) => {
      const bx0 = 26, bw = 22, bh = 100, by0 = 40;
      const x = bx0 + i * 36;
      ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x, by0, bw, bh);
      const h = Math.min(bh, (val / maxE) * bh);
      ctx.fillStyle = color; ctx.fillRect(x, by0 + bh - h, bw, h);
      ctx.fillStyle = "#475569"; ctx.font = "600 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(label, x + bw/2, by0 + bh + 14);
    };
    bar(0, ke, "#10b981", "KE");
    bar(1, pe, "#2563eb", "E_PE");
    bar(2, total, "#f59e0b", "TOTAL");
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), ke: r2(0.5 * p.mass * s.v * s.v), pe: r2(0.5 * p.k * s.x * s.x) }),
  xKey: "t", xLabel: "Time (s)",
  series: [
    { key: "ke", label: "KE (J)", color: "#10b981" },
    { key: "pe", label: "Elastic PE (J)", color: "#2563eb" }
  ],
  stats: (s, p) => [
    { label: "Displacement", value: r2(s.x), unit: "m" },
    { label: "KE", value: r2(0.5 * p.mass * s.v * s.v), unit: "J" },
    { label: "Elastic PE", value: r2(0.5 * p.k * s.x * s.x), unit: "J" },
    { label: "Total Energy", value: r2(0.5 * p.mass * s.v * s.v + 0.5 * p.k * s.x * s.x), unit: "J" }
  ]
};

const simsWEP = { work, workenergy, kineticenergy, potentialenergy, conservationofenergy, power, conservativeforces, springenergy };
export default simsWEP;
