// Ray Optics configurations. SimEngine-compatible configs.
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

// 1. Reflection
const reflection = {
  title: "Reflection of Light", topic: "optics", difficulty: "Beginner",
  summary: "Visualize the laws of reflection: angle of incidence equals angle of reflection.",
  equation: "\\theta_i = \\theta_r",
  params: [
    { key: "angle", label: "Angle of Incidence (θi)", min: 0, max: 80, step: 1, default: 45, unit: "°" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H - 60;
    
    // Draw Mirror Surface
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(40, cy, W - 80, 10);
    line(ctx, 40, cy, W - 40, cy, "#475569", 3);
    
    // Normal Line
    ctx.setLineDash([4, 4]);
    line(ctx, cx, 40, cx, cy, "#94a3b8", 1.5);
    ctx.setLineDash([]);
    ctx.fillStyle = "#64748b"; ctx.fillText("Normal", cx - 20, 35);
    
    // Incident ray
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 2) * 5) : p.angle;
    const th = activeAngle * RAD;
    const rayLen = 160;
    const ix = cx - rayLen * Math.sin(th), iy = cy - rayLen * Math.cos(th);
    arrow(ctx, ix, iy, cx, cy, "#eab308", 3);
    
    // Reflected ray
    const rx = cx + rayLen * Math.sin(th), ry = cy - rayLen * Math.cos(th);
    arrow(ctx, cx, cy, rx, ry, "#eab308", 3);
    
    // Angle labels
    ctx.fillStyle = "#475569"; ctx.font = "12px sans-serif";
    ctx.fillText("θi = " + r2(activeAngle) + "°", cx - 35, cy - 30);
    ctx.fillText("θr = " + r2(activeAngle) + "°", cx + 15, cy - 30);
  },
  graphPoint: (s, p) => {
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 2) * 5) : p.angle;
    return { t: r2(s.t), angle: r2(activeAngle) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "angle", label: "Reflected Angle (°)", color: "#eab308" }],
  stats: (s, p) => {
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 2) * 5) : p.angle;
    return [
      { label: "Angle of Incidence", value: r2(activeAngle), unit: "°" },
      { label: "Angle of Reflection", value: r2(activeAngle), unit: "°" },
      { label: "Angle of Deviation", value: r2(180 - 2 * activeAngle), unit: "°" }
    ];
  }
};

// 2. Refraction
const refraction = {
  title: "Refraction of Light", topic: "optics", difficulty: "Beginner",
  summary: "Study how light bends when passing from Air (n₁=1) to a denser medium (n₂).",
  equation: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
  params: [
    { key: "angle", label: "Incident Angle (θ₁)", min: 0, max: 80, step: 1, default: 40, unit: "°" },
    { key: "n2", label: "Refractive Index (n₂)", min: 1.0, max: 2.0, step: 0.05, default: 1.5, unit: "" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Draw Denser Medium (Bottom Half)
    ctx.fillStyle = "rgba(14, 165, 233, 0.15)"; ctx.fillRect(0, cy, W, H - cy);
    ctx.fillStyle = "#0284c7"; ctx.font = "bold 14px sans-serif";
    ctx.fillText("Medium n₂ = " + p.n2, 20, cy + 25);
    ctx.fillStyle = "#64748b"; ctx.fillText("Air n₁ = 1.00", 20, cy - 15);
    
    line(ctx, 40, cy, W - 40, cy, "#334155", 2);
    
    // Normal Line
    ctx.setLineDash([4, 4]);
    line(ctx, cx, 40, cx, H - 40, "rgba(148,163,184,.7)", 1.5);
    ctx.setLineDash([]);
    
    // Incident ray
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 1.5) * 4) : p.angle;
    const th1 = activeAngle * RAD;
    const ix = cx - 140 * Math.sin(th1), iy = cy - 140 * Math.cos(th1);
    arrow(ctx, ix, iy, cx, cy, "#f59e0b", 3);
    
    // Refracted ray
    const sinth2 = Math.sin(th1) / p.n2;
    const th2 = Math.asin(sinth2);
    const rx = cx + 140 * Math.sin(th2), ry = cy + 140 * Math.cos(th2);
    arrow(ctx, cx, cy, rx, ry, "#0284c7", 3);
  },
  graphPoint: (s, p) => {
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 1.5) * 4) : p.angle;
    const th2 = Math.asin(Math.sin(activeAngle * RAD) / p.n2) / RAD;
    return { t: r2(s.t), th2: r2(th2) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "th2", label: "Refraction Angle θ₂ (°)", color: "#0284c7" }],
  stats: (s, p) => {
    const activeAngle = s.active ? (p.angle + Math.sin(s.t * 1.5) * 4) : p.angle;
    const th2 = Math.asin(Math.sin(activeAngle * RAD) / p.n2) / RAD;
    return [
      { label: "Incident Angle θ₁", value: r2(activeAngle), unit: "°" },
      { label: "Refraction Angle θ₂", value: r2(th2), unit: "°" },
      { label: "Bending Deviation", value: r2(activeAngle - th2), unit: "°" }
    ];
  }
};

// 3. Refractive Index
const refractiveindex = {
  title: "Refractive Index Concept", topic: "optics", difficulty: "Beginner",
  summary: "Visualize how light waves slow down and wavelength shortens inside a higher index medium.",
  equation: "v = \\frac{c}{n}, \\quad \\lambda = \\frac{\\lambda_0}{n}",
  params: [
    { key: "n", label: "Index of Refraction (n)", min: 1.0, max: 2.2, step: 0.1, default: 1.5, unit: "" }
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2;
    
    // Draw boundary
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)"; ctx.fillRect(0, cy, W, H - cy);
    line(ctx, 40, cy, W - 40, cy, "#10b981", 2);
    ctx.fillStyle = "#10b981"; ctx.font = "bold 13px sans-serif";
    ctx.fillText("Refractive Medium (n = " + p.n + ")", 20, cy + 20);
    ctx.fillStyle = "#64748b"; ctx.fillText("Vacuum / Air (n = 1.0)", 20, cy - 10);
    
    // Draw traveling wave fronts
    const c = 80;
    const v = c / p.n;
    const wavelength0 = 40;
    const wavelength = wavelength0 / p.n;
    
    // Top wave fronts
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)"; ctx.lineWidth = 3;
    for (let x = -80; x < W + 80; x += wavelength0) {
      const wx = x + (s.t * c) % wavelength0;
      line(ctx, wx, 40, wx, cy - 15, "rgba(245, 158, 11, 0.45)", 2.5);
    }
    
    // Bottom wave fronts
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    for (let x = -80; x < W + 80; x += wavelength) {
      const wx = x + (s.t * v) % wavelength;
      line(ctx, wx, cy + 15, wx, H - 40, "rgba(16, 185, 129, 0.55)", 2.5);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), speed: r2(3 / p.n) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "speed", label: "Speed of Light (×10⁸ m/s)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Refractive Index (n)", value: p.n, unit: "" },
    { label: "Speed of Light (v)", value: r2(3.0 / p.n), unit: "×10⁸ m/s" },
    { label: "Wavelength Ratio", value: r2(1 / p.n), unit: "" }
  ]
};

// 4. Snell's Law
const snellslaw = {
  title: "Snell's Law Verification", topic: "optics", difficulty: "Intermediate",
  summary: "Measure and verify that the product n₁ sin(θ₁) equals n₂ sin(θ₂) at any angle.",
  equation: "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2",
  params: [
    { key: "angle", label: "Incident Angle (θ₁)", min: 0, max: 80, step: 1, default: 45, unit: "°" },
    { key: "n1", label: "Index n₁ (top)", min: 1.0, max: 2.0, step: 0.1, default: 1.0, unit: "" },
    { key: "n2", label: "Index n₂ (bottom)", min: 1.0, max: 2.0, step: 0.1, default: 1.5, unit: "" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    ctx.fillStyle = "rgba(139, 92, 246, 0.08)"; ctx.fillRect(0, cy, W, H - cy);
    line(ctx, 40, cy, W - 40, cy, "#6d28d9", 2);
    
    ctx.setLineDash([4, 4]);
    line(ctx, cx, 40, cx, H - 40, "rgba(148,163,184,.6)", 1);
    ctx.setLineDash([]);
    
    const activeAngle = s.active ? p.angle + Math.sin(s.t * 1.5) * 5 : p.angle;
    const th1 = activeAngle * RAD;
    const ix = cx - 130 * Math.sin(th1), iy = cy - 130 * Math.cos(th1);
    arrow(ctx, ix, iy, cx, cy, "#f59e0b", 3);
    
    const sinth2 = (p.n1 * Math.sin(th1)) / p.n2;
    if (sinth2 <= 1) {
      const th2 = Math.asin(sinth2);
      const rx = cx + 130 * Math.sin(th2), ry = cy + 130 * Math.cos(th2);
      arrow(ctx, cx, cy, rx, ry, "#8b5cf6", 3);
    }
    
    ctx.fillStyle = "#1e293b"; ctx.font = "bold 13px sans-serif";
    ctx.fillText("n₁ sin(θ₁) = " + r2(p.n1 * Math.sin(th1)), cx - 180, cy - 60);
    ctx.fillText("n₂ sin(θ₂) = " + r2(p.n2 * Math.min(1.0, sinth2)), cx + 60, cy + 60);
  },
  graphPoint: (s, p) => {
    const activeAngle = s.active ? p.angle + Math.sin(s.t * 1.5) * 5 : p.angle;
    return { t: r2(s.t), lhs: r2(p.n1 * Math.sin(activeAngle * RAD)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "lhs", label: "n sin(θ) value", color: "#8b5cf6" }],
  stats: (s, p) => {
    const activeAngle = s.active ? p.angle + Math.sin(s.t * 1.5) * 5 : p.angle;
    const th1 = activeAngle * RAD;
    const sinth2 = (p.n1 * Math.sin(th1)) / p.n2;
    const th2 = sinth2 <= 1 ? Math.asin(sinth2) / RAD : 90;
    return [
      { label: "n₁ sin(θ₁)", value: r2(p.n1 * Math.sin(th1)), unit: "" },
      { label: "n₂ sin(θ₂)", value: r2(p.n2 * Math.sin(th2 * RAD)), unit: "" },
      { label: "Verified Ratio", value: r2((p.n1 * Math.sin(th1)) / (p.n2 * Math.sin(th2 * RAD) || 1)), unit: "" }
    ];
  }
};

// 5. Total Internal Reflection
const totalinternalreflection = {
  title: "Total Internal Reflection", topic: "optics", difficulty: "Intermediate",
  summary: "Observe light reflecting entirely back into the denser medium when angle exceeds Critical Angle.",
  equation: "\\theta_c = \\sin^{-1}\\left(\\frac{n_2}{n_1}\\right)",
  params: [
    { key: "angle", label: "Angle of Incidence (θ₁)", min: 10, max: 80, step: 1, default: 45, unit: "°" },
    { key: "n1", label: "Denser Index (n₁)", min: 1.3, max: 2.0, step: 0.05, default: 1.5, unit: "" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    ctx.fillStyle = "rgba(225, 29, 72, 0.08)"; ctx.fillRect(0, cy, W, H - cy);
    line(ctx, 40, cy, W - 40, cy, "#e11d48", 2);
    
    ctx.setLineDash([4, 4]);
    line(ctx, cx, 40, cx, H - 40, "rgba(148,163,184,.6)", 1);
    ctx.setLineDash([]);
    
    const activeAngle = s.active ? p.angle + Math.sin(s.t * 1.2) * 8 : p.angle;
    const th1 = activeAngle * RAD;
    const ix = cx - 130 * Math.sin(th1), iy = cy + 130 * Math.cos(th1);
    arrow(ctx, ix, iy, cx, cy, "#f59e0b", 3);
    
    const crit = Math.asin(1.0 / p.n1);
    if (th1 < crit) {
      const th2 = Math.asin(p.n1 * Math.sin(th1));
      const rx = cx + 130 * Math.sin(th2), ry = cy - 130 * Math.cos(th2);
      arrow(ctx, cx, cy, rx, ry, "#e11d48", 3);
    } else {
      const rx = cx + 130 * Math.sin(th1), ry = cy + 130 * Math.cos(th1);
      arrow(ctx, cx, cy, rx, ry, "#e11d48", 3);
      ctx.fillStyle = "#ef4444"; ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Total Internal Reflection (TIR)", cx, 50); ctx.textAlign = "left";
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), crit: r2(Math.asin(1.0 / p.n1) / RAD) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "crit", label: "Critical Angle (°)", color: "#e11d48" }],
  stats: (s, p) => {
    const activeAngle = s.active ? p.angle + Math.sin(s.t * 1.2) * 8 : p.angle;
    const th1 = activeAngle * RAD;
    const crit = Math.asin(1.0 / p.n1);
    return [
      { label: "Incident Angle", value: r2(activeAngle), unit: "°" },
      { label: "Critical Angle", value: r2(crit / RAD), unit: "°" },
      { label: "Status", value: th1 >= crit ? "TIR (Reflected)" : "Refracted", unit: "" }
    ];
  }
};

// 6. Spherical Mirrors
const mirrors = {
  title: "Spherical Mirrors Concept", topic: "optics", difficulty: "Beginner",
  summary: "Study how parallel light rays converge at the focus of concave mirrors or diverge from convex mirrors.",
  equation: "f = \\frac{R}{2}",
  params: [
    { key: "type", label: "Mirror Type", min: -1, max: 1, step: 2, default: 1, unit: " (1:Concave, -1:Convex)" },
    { key: "radius", label: "Radius of Curvature (R)", min: 8, max: 16, step: 1, default: 12, unit: "cm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, sc = 14;
    
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
    ctx.beginPath();
    if (p.type === 1) {
      ctx.arc(cx + 80, cy, 140, Math.PI - 0.5, Math.PI + 0.5);
    } else {
      ctx.arc(cx - 80, cy, 140, -0.5, 0.5);
    }
    ctx.stroke();
    
    const fPos = p.type === 1 ? (cx - (p.radius / 2) * sc) : (cx + (p.radius / 2) * sc);
    const cPos = p.type === 1 ? (cx - p.radius * sc) : (cx + p.radius * sc);
    circle(ctx, fPos, cy, 4, "#ef4444"); ctx.fillStyle = "#ef4444"; ctx.fillText("F", fPos - 4, cy - 10);
    circle(ctx, cPos, cy, 4, "#2563eb"); ctx.fillStyle = "#2563eb"; ctx.fillText("C", cPos - 4, cy - 10);

    // Rays drawing
    const raysY = [cy - 45, cy - 20, cy + 20, cy + 45];
    
    raysY.forEach(y => {
      let xm;
      if (p.type === 1) {
        xm = (cx + 80) - Math.sqrt(140*140 - (y - cy)*(y - cy));
      } else {
        xm = (cx - 80) + Math.sqrt(140*140 - (y - cy)*(y - cy));
      }
      
      line(ctx, 40, y, xm, y, "rgba(245, 158, 11, 0.65)", 1.5);
      
      if (p.type === 1) { // Concave
        const dx = fPos - xm, dy = cy - y;
        const len = Math.hypot(dx, dy);
        const rx = xm + (dx / len) * 200, ry = y + (dy / len) * 200;
        line(ctx, xm, y, rx, ry, "rgba(239, 68, 68, 0.65)", 1.5);
        
        if (s.active) {
          const tPos = (s.t * 80) % (xm - 40 + len);
          if (tPos < (xm - 40)) {
            circle(ctx, 40 + tPos, y, 3, "#f59e0b");
          } else {
            const fDist = tPos - (xm - 40);
            circle(ctx, xm + (dx / len) * fDist, y + (dy / len) * fDist, 3, "#ef4444");
          }
        }
      } else { // Convex
        const dx = xm - fPos, dy = y - cy;
        const len = Math.hypot(dx, dy);
        const rx = xm + (dx / len) * 150, ry = y + (dy / len) * 150;
        line(ctx, xm, y, rx, ry, "rgba(239, 68, 68, 0.65)", 1.5);
        
        ctx.setLineDash([2, 2]);
        line(ctx, xm, y, fPos, cy, "rgba(239, 68, 68, 0.35)", 1);
        ctx.setLineDash([]);
        
        if (s.active) {
          const tPos = (s.t * 80) % (xm - 40 + 150);
          if (tPos < (xm - 40)) {
            circle(ctx, 40 + tPos, y, 3, "#f59e0b");
          } else {
            const fDist = tPos - (xm - 40);
            circle(ctx, xm + (dx / len) * fDist, y + (dy / len) * fDist, 3, "#ef4444");
          }
        }
      }
    });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), f: r2(p.radius / 2) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "f", label: "Focal Length (cm)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Radius of Curvature", value: p.radius, unit: "cm" },
    { label: "Focal Length (f)", value: r2(p.radius / 2), unit: "cm" }
  ]
};

// 7. Mirror Equation Lab
const mirrorequation = {
  title: "Mirror Equation Lab", topic: "optics", difficulty: "Intermediate",
  summary: "Form real or virtual images using a concave mirror and verify the mirror formula.",
  equation: "\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}",
  params: [
    { key: "focal", label: "Focal Length (f)", min: 3, max: 7, step: 0.5, default: 5, unit: "cm" },
    { key: "object", label: "Object Distance (u)", min: 4, max: 16, step: 0.5, default: 9, unit: "cm" },
    { key: "height", label: "Object Height", min: 1, max: 4, step: 0.5, default: 2.5, unit: "cm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2 + 80, cy = H / 2, sc = 14;
    
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 180, Math.PI - 0.4, Math.PI + 0.4); ctx.stroke();
    
    const fVal = p.focal;
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const vVal = 1 / (1 / fVal - 1 / uVal);
    
    circle(ctx, cx - fVal * sc, cy, 4, "#ef4444"); ctx.fillStyle = "#ef4444"; ctx.fillText("F", cx - fVal * sc - 4, cy - 10);
    circle(ctx, cx - fVal * 2 * sc, cy, 4, "#2563eb"); ctx.fillStyle = "#2563eb"; ctx.fillText("C", cx - fVal * 2 * sc - 4, cy - 10);
    
    const ox = cx - uVal * sc;
    const oh = p.height * sc;
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - oh); ctx.stroke();
    ctx.fillStyle = "#f59e0b"; ctx.fillText("Object", ox - 15, cy - oh - 8);
    
    if (uVal !== fVal) {
      const ix = cx - vVal * sc;
      const m = -vVal / uVal;
      const ih = p.height * m * sc;
      ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - ih); ctx.stroke();
      ctx.fillStyle = "#10b981"; ctx.fillText("Image", ix - 15, cy - ih - 8);
      
      // Principal rays from object tip to mirror to image tip
      line(ctx, ox, cy - oh, cx, cy - oh, "rgba(245, 158, 11, 0.4)", 1.5);
      line(ctx, cx, cy - oh, ix, cy - ih, "rgba(10, 185, 129, 0.4)", 1.5);
      
      line(ctx, ox, cy - oh, cx, cy - ih, "rgba(245, 158, 11, 0.4)", 1.5);
      line(ctx, cx, cy - ih, ix, cy - ih, "rgba(10, 185, 129, 0.4)", 1.5);
    }
  },
  graphPoint: (s, p) => {
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const v = 1 / (1 / p.focal - 1 / uVal);
    return { t: r2(s.t), v: isFinite(v) ? r2(v) : 0 };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Image distance (cm)", color: "#10b981" }],
  stats: (s, p) => {
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const v = 1 / (1 / p.focal - 1 / uVal);
    const m = -v / uVal;
    return [
      { label: "Image Distance (v)", value: isFinite(v) ? r2(v) : "∞", unit: "cm" },
      { label: "Magnification (m)", value: isFinite(m) ? r2(m) : "∞", unit: "x" },
      { label: "Image Type", value: v > 0 ? "Real, Inverted" : "Virtual, Erect", unit: "" }
    ];
  }
};

// 8. Lenses Focus
const lenses = {
  title: "Lenses Focus Concept", topic: "optics", difficulty: "Beginner",
  summary: "Study focal length properties of converging (convex) and diverging (concave) lenses.",
  equation: "P = \\frac{1}{f}",
  params: [
    { key: "type", label: "Lens Type", min: -1, max: 1, step: 2, default: 1, unit: " (1:Convex, -1:Concave)" },
    { key: "focal", label: "Focal length (f)", min: 4, max: 10, step: 0.5, default: 6, unit: "cm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, sc = 14;
    
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3.5;
    line(ctx, cx, cy - 80, cx, cy + 80, "#3b82f6", 3);
    
    circle(ctx, cx - p.focal * sc, cy, 4, "#ef4444");
    circle(ctx, cx + p.focal * sc, cy, 4, "#ef4444");

    // Rays drawing
    const raysY = [cy - 40, cy - 20, cy + 20, cy + 40];
    const fVal = p.focal * sc;
    
    raysY.forEach(y => {
      line(ctx, 40, y, cx, y, "rgba(245, 158, 11, 0.65)", 1.5);
      
      if (p.type === 1) { // Convex
        const dx = fVal, dy = cy - y;
        const len = Math.hypot(dx, dy);
        const rx = cx + dx * 2, ry = y + dy * 2;
        line(ctx, cx, y, rx, ry, "rgba(59, 130, 246, 0.65)", 1.5);
        
        if (s.active) {
          const tPos = (s.t * 80) % (cx - 40 + len);
          if (tPos < (cx - 40)) {
            circle(ctx, 40 + tPos, y, 3, "#f59e0b");
          } else {
            const fDist = tPos - (cx - 40);
            circle(ctx, cx + (dx / len) * fDist, y + (dy / len) * fDist, 3, "#3b82f6");
          }
        }
      } else { // Concave
        const dx = fVal, dy = y - cy;
        const len = Math.hypot(dx, dy);
        const rx = cx + dx * 1.5, ry = y + dy * 1.5;
        line(ctx, cx, y, rx, ry, "rgba(59, 130, 246, 0.65)", 1.5);
        
        ctx.setLineDash([2, 2]);
        line(ctx, cx - fVal, cy, cx, y, "rgba(59, 130, 246, 0.35)", 1);
        ctx.setLineDash([]);
        
        if (s.active) {
          const tPos = (s.t * 80) % (cx - 40 + 150);
          if (tPos < (cx - 40)) {
            circle(ctx, 40 + tPos, y, 3, "#f59e0b");
          } else {
            const fDist = tPos - (cx - 40);
            circle(ctx, cx + (dx / len) * fDist, y + (dy / len) * fDist, 3, "#3b82f6");
          }
        }
      }
    });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), power: r2(100 / p.focal) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "power", label: "Lens Power (D)", color: "#3b82f6" }],
  stats: (s, p) => [
    { label: "Focal Length", value: p.focal, unit: "cm" },
    { label: "Optical Power", value: r2(100 / p.focal), unit: "Diopters" }
  ]
};

// 9. Lens Equation Lab
const lensequation = {
  title: "Lens Equation Lab", topic: "optics", difficulty: "Intermediate",
  summary: "Form real or virtual images through a convex thin lens and verify the lens formula.",
  equation: "\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}",
  params: [
    { key: "focal", label: "Focal Length (f)", min: 3, max: 8, step: 0.5, default: 5, unit: "cm" },
    { key: "object", label: "Object Distance (u)", min: 4, max: 16, step: 0.5, default: 10, unit: "cm" },
    { key: "height", label: "Object Height", min: 1, max: 4, step: 0.5, default: 2.5, unit: "cm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, sc = 14;
    
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    line(ctx, cx, cy - 80, cx, cy + 80, "#2563eb", 3);
    
    const fVal = p.focal;
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const vVal = 1 / (1 / fVal - 1 / uVal);
    
    circle(ctx, cx - fVal * sc, cy, 4, "#ef4444"); ctx.fillStyle = "#ef4444"; ctx.fillText("F₁", cx - fVal * sc - 4, cy - 10);
    circle(ctx, cx + fVal * sc, cy, 4, "#ef4444"); ctx.fillStyle = "#ef4444"; ctx.fillText("F₂", cx + fVal * sc - 4, cy - 10);
    
    const ox = cx - uVal * sc;
    const oh = p.height * sc;
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - oh); ctx.stroke();
    ctx.fillStyle = "#f59e0b"; ctx.fillText("Object", ox - 15, cy - oh - 8);
    
    if (uVal !== fVal) {
      const ix = cx + vVal * sc;
      const m = vVal / uVal;
      const ih = -p.height * m * sc;
      ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - ih); ctx.stroke();
      ctx.fillStyle = "#10b981"; ctx.fillText("Image", ix - 15, cy - ih - 8);
      
      // Draw principal rays
      line(ctx, ox, cy - oh, cx, cy - oh, "rgba(245, 158, 11, 0.4)", 1.5);
      line(ctx, cx, cy - oh, ix, cy - ih, "rgba(10, 185, 129, 0.4)", 1.5);
      
      line(ctx, ox, cy - oh, ix, cy - ih, "rgba(245, 158, 11, 0.45)", 1.5);
    }
  },
  graphPoint: (s, p) => {
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const v = 1 / (1 / p.focal - 1 / uVal);
    return { t: r2(s.t), v: isFinite(v) ? r2(v) : 0 };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Image distance (cm)", color: "#10b981" }],
  stats: (s, p) => {
    const uVal = s.active ? p.object + Math.sin(s.t * 1.2) * 2 : p.object;
    const v = 1 / (1 / p.focal - 1 / uVal);
    const m = v / uVal;
    return [
      { label: "Image Distance (v)", value: isFinite(v) ? r2(v) : "∞", unit: "cm" },
      { label: "Magnification (m)", value: isFinite(m) ? r2(m) : "∞", unit: "x" },
      { label: "Image Type", value: v > 0 ? "Real, Inverted" : "Virtual, Erect", unit: "" }
    ];
  }
};

// 10. Magnification
const magnification = {
  title: "Optics Magnification", topic: "optics", difficulty: "Beginner",
  summary: "Understand the ratio of object height and image height formed by lenses.",
  equation: "m = \\frac{h_i}{h_o} = \\frac{v}{u}",
  params: [
    { key: "ho", label: "Object Height (ho)", min: 1, max: 4, step: 0.5, default: 2, unit: "cm" },
    { key: "mag", label: "Magnification Factor (m)", min: 0.5, max: 3.0, step: 0.25, default: 1.5, unit: "x" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2;
    const activeHeight = s.active ? p.ho + Math.sin(s.t * 1.5) * 0.4 : p.ho;
    
    ctx.fillStyle = "#fef3c7"; ctx.fillRect(W / 4 - 40, cy - activeHeight * 20, 80, activeHeight * 20);
    ctx.strokeStyle = "#d97706"; ctx.strokeRect(W / 4 - 40, cy - activeHeight * 20, 80, activeHeight * 20);
    ctx.fillStyle = "#d97706"; ctx.font = "bold 14px sans-serif"; ctx.fillText("Object ho=" + r2(activeHeight) + "cm", W / 4 - 55, cy + 25);
    
    const hi = activeHeight * p.mag;
    ctx.fillStyle = "#d1fae5"; ctx.fillRect(3 * W / 4 - 40, cy - hi * 20, 80, hi * 20);
    ctx.strokeStyle = "#059669"; ctx.strokeRect(3 * W / 4 - 40, cy - hi * 20, 80, hi * 20);
    ctx.fillStyle = "#059669"; ctx.fillText("Image hi=" + r2(hi) + "cm", 3 * W / 4 - 55, cy + 25);
  },
  graphPoint: (s, p) => {
    const activeHeight = s.active ? p.ho + Math.sin(s.t * 1.5) * 0.4 : p.ho;
    return { t: r2(s.t), hi: r2(activeHeight * p.mag) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "hi", label: "Image Height (cm)", color: "#059669" }],
  stats: (s, p) => {
    const activeHeight = s.active ? p.ho + Math.sin(s.t * 1.5) * 0.4 : p.ho;
    return [
      { label: "Object Height ho", value: r2(activeHeight), unit: "cm" },
      { label: "Magnification Factor", value: p.mag, unit: "x" },
      { label: "Calculated Height hi", value: r2(activeHeight * p.mag), unit: "cm" }
    ];
  }
};

// 11. Prism Dispersion
// 11. Prism Dispersion
const prism = {
  title: "Prism Dispersion", topic: "optics", difficulty: "Intermediate",
  summary: "Send white light through a prism and watch it split into a spectrum of colours.",
  equation: "\\delta = (n-1)A",
  params: [
    { key: "apex", label: "Apex angle", min: 30, max: 70, step: 1, default: 60, unit: "°" },
    { key: "n", label: "Refractive index", min: 1.3, max: 1.8, step: 0.02, default: 1.5, unit: "" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    
    // Draw Glass Prism Outline
    ctx.fillStyle = "rgba(37,99,235,.08)"; ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 75);
    ctx.lineTo(cx - 70, cy + 55);
    ctx.lineTo(cx + 70, cy + 55);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    
    // Oscillation of source incident ray height to make running state extremely obvious
    const yOsc = s.active ? Math.sin(s.t * 2.2) * 22 : 0;
    const yStart = cy - 25 + yOsc;
    
    // Point of contact on left face of prism
    const inX = cx - 35, inY = cy + 15;
    
    // White light beam
    line(ctx, 50, yStart, inX, inY, "#f1f5f9", 3.5); // Outer border
    line(ctx, 50, yStart, inX, inY, "#e5e7eb", 2);   // Inner ray
    
    // Colors of the spectrum
    const cols = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
    
    cols.forEach((c, i) => {
      // Exit point on right face
      const outX = cx + 32, outY = cy + 10 + i * 2.5;
      
      // Draw ray inside prism (dispersing slightly)
      line(ctx, inX, inY, outX, outY, c, 1.5);
      
      // Refracted ray exiting prism (with deviation depending on index, apex angle, and entrance height)
      const dev = (p.n - 1) * p.apex * RAD + i * 0.025 + yOsc * 0.003;
      const outEndX = cx + 220, outEndY = outY + Math.sin(dev) * 110;
      line(ctx, outX, outY, outEndX, outEndY, c, 2.5);
      
      // Animated photon pulses along exiting paths
      if (s.active) {
        const pulse = (s.t * 70 + i * 15) % 110;
        circle(ctx, outX + (220 - 32) * (pulse / 110), outY + Math.sin(dev) * pulse, 3, c);
      }
    });
  },
  graphPoint: (s, p) => ({ t: r2(s.t), d: r2((p.n - 1) * p.apex) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "d", label: "Deviation (°)", color: "#8b5cf6" }],
  stats: (s, p) => [
    { label: "Mean deviation", value: r2((p.n - 1) * p.apex), unit: "°" }, { label: "Apex angle", value: p.apex, unit: "°" },
    { label: "Index", value: p.n, unit: "" }, { label: "Colours", value: "red→violet", unit: "" }],
};

// 12. Optical Instruments (Microscope)
const opticalinstruments = {
  title: "Simple Microscope (Magnifying Glass)", topic: "optics", difficulty: "Advanced",
  summary: "Understand magnification inside focal lengths, creating a magnified virtual image.",
  equation: "M = 1 + \\frac{D}{f}",
  params: [
    { key: "focal", label: "Lens Focal Length (f)", min: 4, max: 8, step: 0.5, default: 6, unit: "cm" },
    { key: "object", label: "Object Position (u)", min: 1.5, max: 3.5, step: 0.5, default: 3, unit: "cm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2 + 40, cy = H / 2, sc = 18;
    
    line(ctx, 40, cy, W - 40, cy, "#94a3b8", 1);
    line(ctx, cx, cy - 80, cx, cy + 80, "#3b82f6", 3.5);
    
    const activeObject = s.active ? p.object + Math.sin(s.t * 1.2) * 0.5 : p.object;
    const ox = cx - activeObject * sc;
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - 25); ctx.stroke();
    
    circle(ctx, cx - p.focal * sc, cy, 4, "#ef4444");
    
    const vVal = 1 / (1 / p.focal - 1 / activeObject);
    const ix = cx + vVal * sc;
    const m = vVal / activeObject;
    const ih = -25 * m;
    
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - ih); ctx.stroke(); ctx.setLineDash([]);
  },
  graphPoint: (s, p) => {
    const activeObject = s.active ? p.object + Math.sin(s.t * 1.2) * 0.5 : p.object;
    return { t: r2(s.t), mag: r2(p.focal / (p.focal - activeObject)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "mag", label: "Magnification Factor", color: "#10b981" }],
  stats: (s, p) => {
    const activeObject = s.active ? p.object + Math.sin(s.t * 1.2) * 0.5 : p.object;
    return [
      { label: "Lens Focal Length (f)", value: p.focal, unit: "cm" },
      { label: "Object Distance (u)", value: r2(activeObject), unit: "cm" },
      { label: "Magnification (m)", value: r2(p.focal / (p.focal - activeObject)), unit: "x" }
    ];
  }
};

// 13. Huygens' Principle
const huygens = {
  title: "Huygens' Principle", topic: "optics", difficulty: "Intermediate",
  summary: "Observe how wavefronts act as sources of secondary wavelets to propagate light.",
  equation: "A(\\theta) \\propto 1 + \\cos\\theta",
  params: [
    { key: "wavelength", label: "Wavelength (λ)", min: 20, max: 60, step: 5, default: 35, unit: "px" },
    { key: "slit", label: "Slit Width (w)", min: 10, max: 60, step: 5, default: 30, unit: "px" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2 - 40, cy = H / 2;
    
    // Slit barrier
    ctx.fillStyle = "#334155";
    ctx.fillRect(cx - 5, 20, 10, cy - p.slit / 2 - 20);
    ctx.fillRect(cx - 5, cy + p.slit / 2, 10, H - cy - p.slit / 2 - 20);
    
    // 1. Plane wavefronts on the left
    ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"; ctx.lineWidth = 2.5;
    const speed = 40;
    for (let x = 40; x < cx; x += p.wavelength) {
      const wx = x + (s.t * speed) % p.wavelength;
      if (wx < cx) {
        line(ctx, wx, 30, wx, H - 30, "rgba(59, 130, 246, 0.4)");
      }
    }
    
    // 2. Secondary source points in the slit opening
    const numSources = 5;
    const stepSize = p.slit / (numSources - 1 || 1);
    ctx.fillStyle = "#ef4444";
    for (let i = 0; i < numSources; i++) {
      const sy = cy - p.slit / 2 + i * stepSize;
      circle(ctx, cx, sy, 3, "#ef4444");
      
      // Expand concentric secondary wavelets
      ctx.strokeStyle = "rgba(239, 68, 68, 0.25)"; ctx.lineWidth = 1.5;
      for (let r = p.wavelength; r < 200; r += p.wavelength) {
        const rad = r + (s.t * speed) % p.wavelength;
        ctx.beginPath();
        ctx.arc(cx, sy, rad, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    }
    
    // Envelope wavefront
    ctx.strokeStyle = "rgba(59, 130, 246, 0.75)"; ctx.lineWidth = 3;
    for (let r = p.wavelength; r < 180; r += p.wavelength) {
      const rad = r + (s.t * speed) % p.wavelength;
      line(ctx, cx + rad, cy - p.slit/2 - 20, cx + rad, cy + p.slit/2 + 20, "rgba(59, 130, 246, 0.75)", 3);
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), amp: r2(1 + Math.cos(s.t * 3)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "amp", label: "Wave Envelope Amplitude", color: "#5910b9" }],
  stats: (s, p) => [
    { label: "Wavelength", value: p.wavelength, unit: "px" },
    { label: "Slit Width (w)", value: p.slit, unit: "px" },
    { label: "Secondary Source Points", value: 5, unit: "" }
  ]
};

// 14. Wave Interference
const interference = {
  title: "Wave Interference Pattern", topic: "optics", difficulty: "Intermediate",
  summary: "Observe overlapping waves from two coherent sources creating constructive/destructive interference.",
  equation: "I = 4 I_0 \\cos^2\\left(\\frac{\\Delta \\phi}{2}\right)",
  params: [
    { key: "wavelength", label: "Wavelength (λ)", min: 20, max: 60, step: 5, default: 35, unit: "px" },
    { key: "spacing", label: "Source Spacing (d)", min: 30, max: 120, step: 10, default: 60, unit: "px" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 4, cy = H / 2;
    const s1y = cy - p.spacing / 2;
    const s2y = cy + p.spacing / 2;
    
    circle(ctx, cx, s1y, 5, "#3b82f6"); ctx.fillStyle = "#3b82f6"; ctx.fillText("S₁", cx - 20, s1y + 4);
    circle(ctx, cx, s2y, 5, "#3b82f6"); ctx.fillStyle = "#3b82f6"; ctx.fillText("S₂", cx - 20, s2y + 4);
    
    const speed = 40;
    ctx.lineWidth = 1.5;
    
    for (let r = p.wavelength; r < 240; r += p.wavelength) {
      const rad = r + (s.t * speed) % p.wavelength;
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.beginPath(); ctx.arc(cx, s1y, rad, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke();
      
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.beginPath(); ctx.arc(cx, s2y, rad, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke();
    }
    
    ctx.strokeStyle = "rgba(16, 185, 129, 0.6)"; ctx.lineWidth = 2;
    line(ctx, cx, cy, W - 40, cy, "rgba(16, 185, 129, 0.65)", 2.5);
    ctx.fillStyle = "#10b981"; ctx.fillText("Central Maxima", W - 140, cy - 8);
    
    const lambda = p.wavelength;
    const d = p.spacing;
    if (d > lambda) {
      ctx.beginPath();
      for (let x = cx; x < W - 40; x += 10) {
        const yOffset = Math.sqrt(Math.max(0, (lambda * lambda * ( (x - cx) * (x - cx) + d*d/4 - lambda*lambda/4 )) / (d*d - lambda*lambda)));
        ctx.lineTo(x, cy - yOffset);
      }
      ctx.stroke();
      
      ctx.beginPath();
      for (let x = cx; x < W - 40; x += 10) {
        const yOffset = Math.sqrt(Math.max(0, (lambda * lambda * ( (x - cx) * (x - cx) + d*d/4 - lambda*lambda/4 )) / (d*d - lambda*lambda)));
        ctx.lineTo(x, cy + yOffset);
      }
      ctx.stroke();
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), I: r2(2 + 2 * Math.cos(s.t * 4)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "I", label: "Center Intensity I(θ)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Wavelength", value: p.wavelength, unit: "px" },
    { label: "Source Spacing (d)", value: p.spacing, unit: "px" },
    { label: "Central Phase Difference", value: 0, unit: "rad" }
  ]
};

// 15. Young's Double-Slit
const doubleslit = {
  title: "Young's Double-Slit Experiment", topic: "optics", difficulty: "Intermediate",
  summary: "Simulate Young's double-slit experiment and observe the interference pattern.",
  equation: "y_m = \\frac{m\\lambda D}{d}",
  params: [
    { key: "wavelength", label: "Wavelength", min: 400, max: 700, step: 10, default: 600, unit: "nm" },
    { key: "slit", label: "Slit spacing", min: 0.1, max: 0.8, step: 0.05, default: 0.3, unit: "mm" },
    { key: "dist", label: "Screen distance", min: 1, max: 4, step: 0.2, default: 2, unit: "m" },
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const sx = 100;
    ctx.fillStyle = "#334155";
    ctx.fillRect(sx - 4, 30, 8, cy - 25);
    ctx.fillRect(sx - 4, cy - 15, 8, 30);
    ctx.fillRect(sx - 4, cy + 25, 8, H - cy - 55);
    
    ctx.fillStyle = "#64748b"; ctx.font = "11px sans-serif";
    ctx.fillText("S₁", sx - 20, cy - 20);
    ctx.fillText("S₂", sx - 20, cy + 24);
    
    const rx = W - 120;
    line(ctx, rx, 30, rx, H - 30, "#475569", 3);
    ctx.fillStyle = "#475569"; ctx.fillText("Screen", rx + 10, 45);
    
    const beta = (p.wavelength * 1e-9 * p.dist) / (p.slit * 1e-3);
    const bpx = beta * 4000;
    
    const col = p.wavelength < 450 ? "#8b5cf6" : p.wavelength < 500 ? "#3b82f6" : p.wavelength < 570 ? "#22c55e" : p.wavelength < 620 ? "#eab308" : "#ef4444";
    
    for (let y = 30; y < H - 30; y++) {
      const I = Math.pow(Math.cos((Math.PI * (y - cy)) / bpx), 2);
      ctx.fillStyle = col; ctx.globalAlpha = I;
      ctx.fillRect(rx - 15, y, 15, 1);
    }
    ctx.globalAlpha = 1.0;
    
    if (s.active) {
      ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      const speed = 50;
      for (let r = 10; r < rx - sx; r += 25) {
        const rad = r + (s.t * speed) % 25;
        ctx.beginPath(); ctx.arc(sx, cy - 20, rad, -Math.PI/3, Math.PI/3); ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, cy + 20, rad, -Math.PI/3, Math.PI/3); ctx.stroke();
      }
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), beta: r2((p.wavelength * p.dist) / p.slit / 100) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "beta", label: "Fringe Width (mm)", color: "#10b981" }],
  stats: (s, p) => {
    const beta = (p.wavelength * 1e-9 * p.dist) / (p.slit * 1e-3);
    return [
      { label: "Fringe Spacing", value: r2(beta * 1000), unit: "mm" },
      { label: "Screen Distance", value: p.dist, unit: "m" },
      { label: "Slit Separation", value: p.slit, unit: "mm" }
    ];
  }
};

// 16. Single-Slit Diffraction
const diffraction = {
  title: "Single-Slit Diffraction", topic: "optics", difficulty: "Intermediate",
  summary: "Study the bending of light through a single narrow slit forming central and side diffraction maxima.",
  equation: "I(\\theta) = I_0 \\left(\\frac{\\sin\\beta}{\\beta}\right)^2, \\quad \\beta = \\frac{\\pi a \\sin\\theta}{\\lambda}",
  params: [
    { key: "wavelength", label: "Wavelength", min: 400, max: 700, step: 10, default: 600, unit: "nm" },
    { key: "slit", label: "Slit width (a)", min: 0.05, max: 0.3, step: 0.02, default: 0.15, unit: "mm" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const sx = 100;
    
    ctx.fillStyle = "#334155";
    ctx.fillRect(sx - 4, 30, 8, cy - p.slit * 400);
    ctx.fillRect(sx - 4, cy + p.slit * 400, 8, H - cy - p.slit * 400 - 30);
    
    const rx = W - 120;
    line(ctx, rx, 30, rx, H - 30, "#475569", 3);
    
    const col = p.wavelength < 450 ? "#8b5cf6" : p.wavelength < 500 ? "#3b82f6" : p.wavelength < 570 ? "#22c55e" : p.wavelength < 620 ? "#eab308" : "#ef4444";
    
    for (let y = 30; y < H - 30; y++) {
      const angle = (y - cy) * 0.003;
      const beta = Math.PI * p.slit * 1e-3 * Math.sin(angle) / (p.wavelength * 1e-9);
      let I = Math.abs(beta) < 0.01 ? 1.0 : Math.pow(Math.sin(beta) / beta, 2);
      
      ctx.fillStyle = col; ctx.globalAlpha = Math.min(1.0, I);
      ctx.fillRect(rx - 15, y, 15, 1);
    }
    ctx.globalAlpha = 1.0;
    
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"; ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let y = 30; y < H - 30; y++) {
      const angle = (y - cy) * 0.003;
      const beta = Math.PI * p.slit * 1e-3 * Math.sin(angle) / (p.wavelength * 1e-9);
      const I = Math.abs(beta) < 0.01 ? 1.0 : Math.pow(Math.sin(beta) / beta, 2);
      const px = rx - 15 - I * 60;
      y === 30 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), peak: r2(1.22 * p.wavelength / (p.slit * 100)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "peak", label: "Central Peak Width (a.u.)", color: "#ef4444" }],
  stats: (s, p) => [
    { label: "Slit Width (a)", value: p.slit, unit: "mm" },
    { label: "Central Maximum Peak", value: "100%", unit: "Intensity" }
  ]
};

// 17. Polarization
const polarization = {
  title: "Polarization of Light", topic: "optics", difficulty: "Advanced",
  summary: "Study how transverse light waves are filtered using polarized filters and verify Malus's Law.",
  equation: "I = I_0 \\cos^2\\theta",
  params: [
    { key: "angle", label: "Analyzer Angle (θ)", min: 0, max: 90, step: 5, default: 45, unit: "°" }
  ],
  init: () => ({ t: 0, active: false }),
  step: (s, dt) => { s.t += dt; s.active = true; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2;
    const xStart = 60, xMid1 = W / 3, xMid2 = 2 * W / 3, xEnd = W - 60;
    
    ctx.fillStyle = "#334155"; ctx.fillRect(xMid1 - 10, cy - 50, 20, 100);
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(xMid1 - 2, cy - 40, 4, 80);
    ctx.fillStyle = "#334155"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("Polarizer (Vertical)", xMid1 - 40, cy - 60);
    
    ctx.save();
    ctx.translate(xMid2, cy);
    ctx.rotate(p.angle * RAD);
    ctx.fillStyle = "#475569"; ctx.fillRect(-10, -50, 20, 100);
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(-2, -40, 4, 80);
    ctx.restore();
    ctx.fillText("Analyzer (θ = " + p.angle + "°)", xMid2 - 40, cy - 60);
    
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = xStart; x < xMid1; x++) {
      const y = cy - Math.sin((x - xStart) * 0.15 - s.t * 5) * 20;
      x === xStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"; ctx.beginPath();
    for (let x = xStart; x < xMid1; x++) {
      const y = cy - Math.cos((x - xStart) * 0.15 - s.t * 5) * 10;
      x === xStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = xMid1; x < xMid2; x++) {
      const y = cy - Math.sin((x - xMid1) * 0.15 - s.t * 5) * 20;
      x === xMid1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    const amp = 20 * Math.cos(p.angle * RAD);
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = xMid2; x < xEnd; x++) {
      const y = cy - Math.sin((x - xMid2) * 0.15 - s.t * 5) * amp;
      x === xMid2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), intensity: r2(Math.pow(Math.cos(p.angle * RAD), 2) * 100) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "intensity", label: "Transmitted Intensity (%)", color: "#10b981" }],
  stats: (s, p) => {
    const intensity = Math.pow(Math.cos(p.angle * RAD), 2) * 100;
    return [
      { label: "Analyzer Angle (θ)", value: p.angle, unit: "°" },
      { label: "Transmitted Intensity", value: r2(intensity), unit: "%" },
      { label: "Malus Factor (cos²θ)", value: r2(Math.pow(Math.cos(p.angle * RAD), 2)), unit: "" }
    ];
  }
};

const simsOptics = { reflection, refraction, refractiveindex, snellslaw, totalinternalreflection, mirrors, mirrorequation, lenses, lensequation, magnification, prism, opticalinstruments, huygens, interference, doubleslit, diffraction, polarization };
export default simsOptics;
