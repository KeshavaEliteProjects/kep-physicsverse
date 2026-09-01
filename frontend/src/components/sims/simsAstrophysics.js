// Astrophysics configurations. SimEngine-compatible configs.
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;

function circle(ctx, x, y, rad, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, color, w = 2) {
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
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

// 1. Planets System
const planets = {
  title: "Planetary System", topic: "astrophysics", difficulty: "Beginner",
  summary: "Study Keplerian orbits of planets inside the solar system and compare orbital speeds.",
  equation: "T^2 \\propto a^3",
  params: [
    { key: "speed", label: "Speed Multiplier", min: 0.5, max: 4, step: 0.5, default: 2, unit: "x" },
    { key: "highlight", label: "Selected Planet", min: 0, max: 7, step: 1, default: 2, unit: " (0:Merc...7:Nept)" }
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Draw Sun
    circle(ctx, cx, cy, 18, "#f59e0b", "#d97706");
    
    const planetData = [
      { name: "Mercury", r: 35, speed: 4.5, color: "#94a3b8", size: 3.5 },
      { name: "Venus", r: 52, speed: 3.0, color: "#e2e8f0", size: 5 },
      { name: "Earth", r: 72, speed: 2.0, color: "#3b82f6", size: 5.5 },
      { name: "Mars", r: 95, speed: 1.4, color: "#ef4444", size: 4.5 },
      { name: "Jupiter", r: 125, speed: 0.7, color: "#f59e0b", size: 10 },
      { name: "Saturn", r: 160, speed: 0.45, color: "#fbbf24", size: 8.5 },
      { name: "Uranus", r: 195, speed: 0.25, color: "#67e8f9", size: 6.5 },
      { name: "Neptune", r: 230, speed: 0.15, color: "#2563eb", size: 6 }
    ];
    
    planetData.forEach((planet, idx) => {
      // Draw Orbit Line
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(cx, cy, planet.r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      
      // Calculate position
      const theta = s.t * planet.speed * p.speed * 0.5;
      const px = cx + planet.r * Math.cos(theta);
      const py = cy + planet.r * Math.sin(theta);
      
      // Draw Planet
      circle(ctx, px, py, planet.size, planet.color);
      
      // Highlight Ring
      if (idx === p.highlight) {
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, planet.size + 4, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#1e293b"; ctx.font = "bold 11px sans-serif";
        ctx.fillText(planet.name, px + planet.size + 6, py + 4);
      }
    });
  },
  graphPoint: (s, p) => {
    const planetData = [4.5, 3.0, 2.0, 1.4, 0.7, 0.45, 0.25, 0.15];
    const highlightedSpeed = planetData[p.highlight];
    const theta = (s.t * highlightedSpeed * p.speed * 0.5) % (Math.PI * 2);
    return { t: r2(s.t), angle: r2(theta / RAD) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "angle", label: "Orbit Angle (°)", color: "#10b981" }],
  stats: (s, p) => {
    const names = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
    const radii = [0.39, 0.72, 1.0, 1.52, 5.2, 9.58, 19.2, 30.05];
    const periods = [0.24, 0.62, 1.0, 1.88, 11.86, 29.45, 84.01, 164.79];
    return [
      { label: "Planet", value: names[p.highlight], unit: "" },
      { label: "Orbital Radius (a)", value: radii[p.highlight], unit: "a.u." },
      { label: "Period (T)", value: periods[p.highlight], unit: "years" }
    ];
  }
};

// 2. Orbits Concept
const orbits = {
  title: "Orbital Trajectories", topic: "astrophysics", difficulty: "Intermediate",
  summary: "Launch a satellite and observe circular, elliptical, parabolic or hyperbolic paths based on speed.",
  equation: "E = \\frac{1}{2}v^2 - \\frac{GM}{r}",
  params: [
    { key: "velocity", label: "Launch Speed (v₀)", min: 0.5, max: 1.6, step: 0.05, default: 1.0, unit: "x" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Central Earth
    circle(ctx, cx, cy, 24, "#3b82f6", "#1d4ed8");
    
    // Orbit curves
    const v0 = p.velocity;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (v0 < 1.414) { // Ellipse or circle
      const e = Math.abs(v0 * v0 - 1);
      const a = 80 / (2 - v0 * v0);
      const b = a * Math.sqrt(1 - e * e);
      const focusOffset = a * e;
      
      ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      ctx.beginPath();
      // Ellipse centered with Earth at focus
      ctx.ellipse(cx - focusOffset, cy, a, b, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Traveling satellite
      if (s.active) {
        const theta = s.t * v0 * 1.5;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const sx = cx + r * Math.cos(theta);
        const sy = cy + r * Math.sin(theta);
        circle(ctx, sx, sy, 5, "#ef4444");
      }
    } else { // Parabolic or hyperbolic escaping paths
      ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
      ctx.beginPath();
      for (let theta = -Math.PI/1.5; theta <= Math.PI/1.5; theta += 0.05) {
        const r = 80 / (1 + Math.min(0.99, v0 - 0.4) * Math.cos(theta));
        const sx = cx + r * Math.cos(theta);
        const sy = cy + r * Math.sin(theta);
        theta === -Math.PI/1.5 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      
      // Satellite escaping
      if (s.active) {
        const tVal = (s.t * 30) % 250;
        const theta = (tVal - 125) * 0.006;
        const r = 80 / (1 + Math.min(0.99, v0 - 0.4) * Math.cos(theta));
        const sx = cx + r * Math.cos(theta);
        const sy = cy + r * Math.sin(theta);
        circle(ctx, sx, sy, 5, "#ef4444");
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), energy: r2(0.5 * p.velocity * p.velocity - 1.0) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "energy", label: "Specific Energy (a.u.)", color: "#ef4444" }],
  stats: (s, p) => {
    const v0 = p.velocity;
    const shape = v0 < 0.95 ? "Ellipse (Low Energy)" : v0 < 1.05 ? "Circular" : v0 < 1.41 ? "Elliptical (High Energy)" : v0 < 1.45 ? "Parabolic (Escape)" : "Hyperbolic (Escape)";
    return [
      { label: "Launch Velocity", value: v0, unit: "x" },
      { label: "Specific Energy", value: r2(0.5 * v0 * v0 - 1.0), unit: "J/kg" },
      { label: "Orbit Shape", value: shape, unit: "" }
    ];
  }
};

// 3. Kepler's Laws
const kepler = {
  title: "Kepler's Second Law", topic: "astrophysics", difficulty: "Intermediate",
  summary: "Verify Kepler's Law of Equal Areas: radius vector sweeps equal area in equal intervals of time.",
  equation: "\\frac{dA}{dt} = \\text{constant}",
  params: [
    { key: "eccentricity", label: "Eccentricity (e)", min: 0.0, max: 0.7, step: 0.05, default: 0.45, unit: "" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const a = 110, e = p.eccentricity;
    const b = a * Math.sqrt(1 - e * e);
    const focusOffset = a * e;
    
    // Draw elliptical orbit path
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw Sun at focus
    const sunX = cx + focusOffset;
    circle(ctx, sunX, cy, 14, "#f59e0b", "#d97706");
    ctx.fillStyle = "#d97706"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("Sun (Focus)", sunX - 25, cy - 18);
    
    // Solve orbit Kepler equation approximately to get theta
    const meanAnomaly = s.t * 1.5;
    // Simple eccentric anomaly approximation
    let E_anom = meanAnomaly;
    for (let i = 0; i < 3; i++) {
      E_anom = meanAnomaly + e * Math.sin(E_anom);
    }
    const theta = 2 * Math.atan(Math.sqrt((1 + e)/(1 - e)) * Math.tan(E_anom / 2));
    
    // Planet coordinates (centered on ellipse center, then shift to Earth-focus relative offset)
    const px = cx + a * Math.cos(E_anom);
    const py = cy + b * Math.sin(E_anom);
    
    // Swept Sectors
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
    
    // Sector 1: Near Perihelion (right side)
    ctx.beginPath(); ctx.moveTo(sunX, cy);
    for (let angle = -0.3; angle <= 0.3; angle += 0.05) {
      const ex = cx + a * Math.cos(angle);
      const ey = cy + b * Math.sin(angle);
      ctx.lineTo(ex, ey);
    }
    ctx.closePath(); ctx.fill();
    
    // Sector 2: Near Aphelion (left side)
    ctx.beginPath(); ctx.moveTo(sunX, cy);
    for (let angle = Math.PI - 0.7; angle <= Math.PI + 0.7; angle += 0.05) {
      const ex = cx + a * Math.cos(angle);
      const ey = cy + b * Math.sin(angle);
      ctx.lineTo(ex, ey);
    }
    ctx.closePath(); ctx.fill();
    
    // Draw planet
    circle(ctx, px, py, 6, "#3b82f6", "#1d4ed8");
    line(ctx, sunX, cy, px, py, "rgba(59, 130, 246, 0.4)", 1.5);
  },
  graphPoint: (s) => ({ t: r2(s.t), swept: 100 }), // Swept area is constant (Kepler's 2nd law)
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "swept", label: "Swept Area dA (a.u.)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Eccentricity (e)", value: p.eccentricity, unit: "" },
    { label: "Sector Area 1 (Peri)", value: "Area A", unit: "" },
    { label: "Sector Area 2 (Aphe)", value: "Area A", unit: "" }
  ]
};

// 4. Gravity
const gravity = {
  title: "Universal Gravitation", topic: "astrophysics", difficulty: "Beginner",
  summary: "Verify Newton's Law of Gravitation: attractive force is proportional to masses and inversely to distance squared.",
  equation: "F_g = G \\frac{M_1 M_2}{r^2}",
  params: [
    { key: "m1", label: "Mass M₁ (Left)", min: 1, max: 10, step: 1, default: 6, unit: " Earths" },
    { key: "m2", label: "Mass M₂ (Right)", min: 1, max: 10, step: 1, default: 3, unit: " Earths" },
    { key: "distance", label: "Separation (r)", min: 80, max: 200, step: 10, default: 120, unit: "px" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2;
    const rad1 = 12 + p.m1 * 2;
    const rad2 = 12 + p.m2 * 2;
    const d0 = p.distance;
    
    // Cycle progress for collapse animation
    const cycle = s.active ? (s.t * 0.8) % 3 : 0;
    const progress = cycle / 3;
    const dActive = d0 - (d0 - (rad1 + rad2)) * progress * progress;
    
    const m1x = W / 2 - dActive / 2;
    const m2x = W / 2 + dActive / 2;
    
    // Mass 1 circle
    circle(ctx, m1x, cy, rad1, "#3b82f6", "#1d4ed8");
    ctx.fillStyle = "#1d4ed8"; ctx.font = "bold 12px sans-serif";
    ctx.fillText("M₁ (" + p.m1 + ")", m1x - 18, cy - rad1 - 10);
    
    // Mass 2 circle
    circle(ctx, m2x, cy, rad2, "#ef4444", "#b91c1c");
    ctx.fillStyle = "#b91c1c";
    ctx.fillText("M₂ (" + p.m2 + ")", m2x - 18, cy - rad2 - 10);
    
    // Force magnitude (always calculated using current dActive)
    const forceVal = (p.m1 * p.m2 * 1000) / (dActive * dActive);
    const arrowLen = Math.min(100, forceVal * 10);
    
    // Force arrows pulling each other
    if (dActive > (rad1 + rad2 + 4)) {
      arrow(ctx, m1x, cy, m1x + arrowLen, cy, "#10b981", 3);
      arrow(ctx, m2x, cy, m2x - arrowLen, cy, "#10b981", 3);
    } else {
      // Draw collision burst
      ctx.fillStyle = "#fbbf24"; ctx.font = "bold 14px sans-serif";
      ctx.fillText("COLLISION!", W / 2 - 35, cy - rad1 - 15);
    }
    
    // Measure ruler
    line(ctx, m1x, cy + 45, m2x, cy + 45, "#94a3b8", 1.5);
    line(ctx, m1x, cy + 40, m1x, cy + 50, "#94a3b8", 1.5);
    line(ctx, m2x, cy + 40, m2x, cy + 50, "#94a3b8", 1.5);
    ctx.fillStyle = "#475569"; ctx.fillText("r = " + r2(dActive) + " px", W / 2 - 30, cy + 62);
  },
  graphPoint: (s, p) => {
    const rad1 = 12 + p.m1 * 2;
    const rad2 = 12 + p.m2 * 2;
    const d0 = p.distance;
    const cycle = s.active ? (s.t * 0.8) % 3 : 0;
    const progress = cycle / 3;
    const dActive = d0 - (d0 - (rad1 + rad2)) * progress * progress;
    const forceVal = (p.m1 * p.m2 * 1000) / (dActive * dActive);
    return { t: r2(s.t), force: r2(forceVal) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "force", label: "Gravitational Force (a.u.)", color: "#10b981" }],
  stats: (s, p) => {
    const rad1 = 12 + p.m1 * 2;
    const rad2 = 12 + p.m2 * 2;
    const d0 = p.distance;
    const cycle = s.active ? (s.t * 0.8) % 3 : 0;
    const progress = cycle / 3;
    const dActive = d0 - (d0 - (rad1 + rad2)) * progress * progress;
    const forceVal = (p.m1 * p.m2 * 1000) / (dActive * dActive);
    return [
      { label: "Mass Product (M₁M₂)", value: p.m1 * p.m2, unit: "" },
      { label: "Distance (r)", value: r2(dActive), unit: "px" },
      { label: "Gravity Force Fg", value: r2(forceVal), unit: "N" }
    ];
  }
};

// 5. Earth Seasons Tilt
const seasons = {
  title: "Earth's Seasons & Tilt", topic: "astrophysics", difficulty: "Beginner",
  summary: "Study how Earth's axial tilt causes changes in solar intensity and produces the seasons.",
  equation: "\\text{Intensity} \\propto \\cos\\theta_{\\text{tilt}}",
  params: [
    { key: "month", label: "Month of Year", min: 1, max: 12, step: 1, default: 6, unit: " (1:Jan...12:Dec)" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Draw Sun in center
    circle(ctx, cx, cy, 22, "#f59e0b", "#d97706");
    
    // Orbit ellipse path
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.beginPath(); ctx.ellipse(cx, cy, 140, 75, 0, 0, Math.PI * 2); ctx.stroke();
    
    // Earth coordinates on orbit
    const activeMonth = s.active ? 1 + (p.month - 1 + s.t * 0.4) % 12 : p.month;
    const theta = ((activeMonth - 1) / 12) * Math.PI * 2 - Math.PI / 2;
    const ex = cx + 140 * Math.cos(theta);
    const ey = cy + 75 * Math.sin(theta);
    
    // Draw Earth
    circle(ctx, ex, ey, 10, "#3b82f6", "#1d4ed8");
    
    // Rotational Axis line (Tilted at 23.5 degrees to the right)
    const axisAngle = 23.5 * RAD;
    const ax = 18 * Math.sin(axisAngle), ay = 18 * Math.cos(axisAngle);
    line(ctx, ex - ax, ey - ay, ex + ax, ey + ay, "#94a3b8", 1.8);
    
    // Parallel yellow sunlight rays coming from Sun to Earth
    ctx.strokeStyle = "rgba(245, 158, 11, 0.35)"; ctx.lineWidth = 1;
    for (let offset = -6; offset <= 6; offset += 3) {
      line(ctx, cx + (ex - cx) * 0.2, cy + offset, ex - (ex - cx) * 0.15, ey + offset, "rgba(245, 158, 11, 0.35)", 1);
    }
  },
  graphPoint: (s, p) => {
    const activeMonth = s.active ? 1 + (p.month - 1 + s.t * 0.4) % 12 : p.month;
    // June (month 6) is maximum solar intensity for NH, December (month 12) is minimum
    const theta = ((activeMonth - 6) / 12) * Math.PI * 2;
    const intensity = 50 + 50 * Math.cos(theta);
    return { t: r2(s.t), intensity: r2(intensity) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "intensity", label: "Solar Intensity NH (%)", color: "#fbbf24" }],
  stats: (s, p) => {
    const activeMonth = s.active ? 1 + (p.month - 1 + s.t * 0.4) % 12 : p.month;
    const mIdx = Math.floor(activeMonth);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonNH = mIdx >= 11 || mIdx <= 1 ? "Winter Solstice" : mIdx >= 2 && mIdx <= 4 ? "Spring Equinox" : mIdx >= 5 && mIdx <= 7 ? "Summer Solstice" : "Autumn Equinox";
    const seasonSH = mIdx >= 11 || mIdx <= 1 ? "Summer Solstice" : mIdx >= 2 && mIdx <= 4 ? "Autumn Equinox" : mIdx >= 5 && mIdx <= 7 ? "Winter Solstice" : "Spring Equinox";
    return [
      { label: "Active Month", value: months[(mIdx - 1) % 12], unit: "" },
      { label: "Season (North)", value: seasonNH, unit: "" },
      { label: "Season (South)", value: seasonSH, unit: "" }
    ];
  }
};

// 6. Moon Phases
const moonphases = {
  title: "Phases of the Moon", topic: "astrophysics", difficulty: "Beginner",
  summary: "Study the lunar cycle: observe Moon's orbit around Earth side-by-side with its phase as seen from Earth.",
  equation: "\\text{Illuminated Fraction} = \\frac{1 + \\cos\\alpha}{2}",
  params: [
    { key: "angle", label: "Orbital Position", min: 0, max: 360, step: 10, default: 90, unit: "°" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2;
    
    // Left view: Space top-down
    const cx1 = W / 4 + 30;
    circle(ctx, cx1, cy, 18, "#3b82f6", "#1d4ed8"); // Earth
    ctx.fillStyle = "#1e293b"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("Earth", cx1 - 15, cy - 25);
    
    // Moon orbit path
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.beginPath(); ctx.arc(cx1, cy, 55, 0, Math.PI * 2); ctx.stroke();
    
    const activeAngle = s.active ? (p.angle + s.t * 22) % 360 : p.angle;
    const th = activeAngle * RAD;
    const mx = cx1 + 55 * Math.cos(th);
    const my = cy + 55 * Math.sin(th);
    
    // Draw Moon (Half white facing sun on the right, half black on the left)
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(mx, my, 6, Math.PI/2, 3*Math.PI/2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(mx, my, 6, -Math.PI/2, Math.PI/2); ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.stroke();
    
    // Sunlight indicators on the far right of Left panel
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1.5;
    arrow(ctx, cx1 + 90, cy - 20, cx1 + 70, cy - 20, "#fbbf24", 1.5);
    arrow(ctx, cx1 + 90, cy + 20, cx1 + 70, cy + 20, "#fbbf24", 1.5);
    ctx.fillStyle = "#fbbf24"; ctx.fillText("Sunlight", cx1 + 70, cy - 32);
    
    // Right view: Phase as seen from Earth
    const cx2 = 3 * W / 4 - 30;
    // Draw Moon Sphere background (dark)
    circle(ctx, cx2, cy, 40, "#1e293b", "#475569");
    
    // Draw Illuminated Phase Overlay (dynamic shape using cosine projection)
    const phaseFraction = (1 + Math.cos(th)) / 2;
    
    ctx.fillStyle = "#f8fafc";
    if (activeAngle >= 0 && activeAngle < 180) { // Waxing phases
      ctx.beginPath();
      ctx.arc(cx2, cy, 40, -Math.PI / 2, Math.PI / 2);
      ctx.ellipse(cx2, cy, 40 * Math.abs(Math.cos(th)), 40, 0, -Math.PI / 2, Math.PI / 2, activeAngle > 90);
      ctx.fill();
    } else { // Waning phases
      ctx.beginPath();
      ctx.arc(cx2, cy, 40, Math.PI / 2, 3 * Math.PI / 2);
      ctx.ellipse(cx2, cy, 40 * Math.abs(Math.cos(th)), 40, 0, Math.PI / 2, 3 * Math.PI / 2, activeAngle < 270);
      ctx.fill();
    }
  },
  graphPoint: (s, p) => {
    const activeAngle = s.active ? (p.angle + s.t * 22) % 360 : p.angle;
    const fraction = (1 + Math.cos(activeAngle * RAD)) / 2 * 100;
    return { t: r2(s.t), fraction: r2(fraction) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "fraction", label: "Illuminated area (%)", color: "#10b981" }],
  stats: (s, p) => {
    const activeAngle = s.active ? (p.angle + s.t * 22) % 360 : p.angle;
    const fraction = (1 + Math.cos(activeAngle * RAD)) / 2 * 100;
    
    let phaseName = "";
    if (activeAngle < 10 || activeAngle > 350) phaseName = "New Moon";
    else if (activeAngle >= 10 && activeAngle < 80) phaseName = "Waxing Crescent";
    else if (activeAngle >= 80 && activeAngle < 100) phaseName = "First Quarter";
    else if (activeAngle >= 100 && activeAngle < 170) phaseName = "Waxing Gibbous";
    else if (activeAngle >= 170 && activeAngle < 190) phaseName = "Full Moon";
    else if (activeAngle >= 190 && activeAngle < 260) phaseName = "Waning Gibbous";
    else if (activeAngle >= 260 && activeAngle < 280) phaseName = "Third Quarter";
    else phaseName = "Waning Crescent";
    
    return [
      { label: "Orbital Angle", value: r2(activeAngle), unit: "°" },
      { label: "Phase Name", value: phaseName, unit: "" },
      { label: "Illuminated Fraction", value: r2(fraction), unit: "%" }
    ];
  }
};

const simsAstrophysics = { planets, orbits, kepler, gravity, seasons, moonphases };
export default simsAstrophysics;
