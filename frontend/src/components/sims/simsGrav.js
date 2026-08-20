// Gravitation simulations for KEP PhysicsVerse.
// Real SI physics with accurate astronomical scaling for canvas rendering.

const G_SI = 6.6743e-11; // Universal Gravitational Constant (N·m²/kg²)
const M_EARTH = 5.972e24; // Earth mass in kg
const R_EARTH = 6.371e6;  // Earth radius in m (6371 km)
const AU_METERS = 1.496e11; // 1 Astronomical Unit in meters
const M_SUN = 1.989e30;   // Sun mass in kg

const r2 = (x) => {
  if (x === null || x === undefined || isNaN(x) || !isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};
const r4 = (x) => {
  if (x === null || x === undefined || isNaN(x) || !isFinite(x)) return 0;
  return Math.round(x * 10000) / 10000;
};

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

/* ================= 1. UNIVERSAL LAW OF GRAVITATION ================= */
const gravitationlaw = {
  title: "Universal Law of Gravitation",
  topic: "mechanics",
  difficulty: "Beginner",
  summary: "Explore Newton's Universal Law of Gravitation: every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance.",
  equation: "F = G\\frac{M_1 M_2}{r^2} \\qquad (G = 6.674 \\times 10^{-11}\\,\\text{N}\\cdot\\text{m}^2/\\text{kg}^2)",
  params: [
    { key: "m1", label: "Mass M₁", min: 1, max: 10, step: 0.5, default: 6, unit: "×10²⁴ kg" },
    { key: "m2", label: "Mass M₂", min: 1, max: 10, step: 0.5, default: 2, unit: "×10²² kg" },
    { key: "r", label: "Separation r", min: 100, max: 800, step: 20, default: 380, unit: "×10³ km" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cy = H / 2 - 15;
    const m1_kg = p.m1 * 1e24;
    const m2_kg = p.m2 * 1e22;
    const r_m = p.r * 1e6;
    const F_N = (G_SI * m1_kg * m2_kg) / (r_m * r_m);
    const F_10e19 = F_N / 1e19;

    // Visual placement
    const spanPx = Math.min(W - 220, Math.max(160, (p.r / 800) * (W - 220)));
    const x1 = W / 2 - spanPx / 2;
    const x2 = W / 2 + spanPx / 2;
    const r1 = Math.max(14, Math.min(36, 12 + p.m1 * 2.5));
    const r2_pix = Math.max(8, Math.min(22, 6 + p.m2 * 1.6));

    // Distance dimension line
    const dimY = cy + 70;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, dimY);
    ctx.lineTo(x2, dimY);
    ctx.stroke();
    ctx.setLineDash([]);
    // End ticks
    ctx.beginPath();
    ctx.moveTo(x1, dimY - 10); ctx.lineTo(x1, dimY + 10);
    ctx.moveTo(x2, dimY - 10); ctx.lineTo(x2, dimY + 10);
    ctx.stroke();

    // Distance label with clear background cutout
    const distText = `r = ${p.r} × 10³ km`;
    ctx.font = "600 12px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const distTw = ctx.measureText(distText).width;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(W / 2 - distTw / 2 - 6, dimY - 9, distTw + 12, 18);
    ctx.fillStyle = "#475569";
    ctx.fillText(distText, W / 2, dimY);

    // Body 1 (Earth-like)
    const grad1 = ctx.createRadialGradient(x1 - r1 * 0.3, cy - r1 * 0.3, r1 * 0.1, x1, cy, r1);
    grad1.addColorStop(0, "#60a5fa");
    grad1.addColorStop(1, "#1d4ed8");
    circle(ctx, x1, cy, r1, grad1, "#1e40af", 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M₁", x1, cy);

    // Body 1 mass caption
    ctx.fillStyle = "#1e40af";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(`${p.m1} × 10²⁴ kg`, x1, cy + r1 + 8);

    // Body 2 (Moon-like)
    const grad2 = ctx.createRadialGradient(x2 - r2_pix * 0.3, cy - r2_pix * 0.3, r2_pix * 0.1, x2, cy, r2_pix);
    grad2.addColorStop(0, "#cbd5e1");
    grad2.addColorStop(1, "#64748b");
    circle(ctx, x2, cy, r2_pix, grad2, "#475569", 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M₂", x2, cy);

    // Body 2 mass caption
    ctx.fillStyle = "#475569";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(`${p.m2} × 10²² kg`, x2, cy + r2_pix + 8);

    // Force vectors (Action-Reaction, Newton's 3rd law)
    const availableGap = (x2 - r2_pix) - (x1 + r1) - 16;
    const maxArrowLen = Math.max(10, Math.min(80, availableGap * 0.45));
    const vecLen = Math.min(maxArrowLen, Math.max(15, Math.sqrt(F_10e19) * 14));

    // Arrow 1: F on 1 towards 2
    arrow(ctx, x1 + r1 + 4, cy, x1 + r1 + 4 + vecLen, cy, "#ef4444", 3);

    // Arrow 2: F on 2 towards 1
    arrow(ctx, x2 - r2_pix - 4, cy, x2 - r2_pix - 4 - vecLen, cy, "#ef4444", 3);

    // Responsive force vector labels
    const f12Text = `+F₁₂ = ${r2(F_10e19)}×10¹⁹ N`;
    const f21Text = `-F₂₁ = ${r2(F_10e19)}×10¹⁹ N`;
    ctx.font = "700 11px 'Source Code Pro', monospace";
    ctx.textBaseline = "middle";

    let f12X, f12Y, f21X, f21Y;
    if (availableGap >= 260) {
      // Wide spacing: position labels directly centered above each arrow
      f12X = x1 + r1 + 4 + vecLen / 2;
      f12Y = cy - 14;
      f21X = x2 - r2_pix - 4 - vecLen / 2;
      f21Y = cy - 14;
    } else {
      // Compact spacing: position labels centered above each body to avoid collision
      f12X = x1;
      f12Y = cy - r1 - 14;
      f21X = x2;
      f21Y = cy - r2_pix - 14;
    }

    // Draw F12 label with soft backing
    ctx.textAlign = "center";
    const f12Tw = ctx.measureText(f12Text).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(f12X - f12Tw / 2 - 4, f12Y - 8, f12Tw + 8, 16);
    ctx.fillStyle = "#ef4444";
    ctx.fillText(f12Text, f12X, f12Y);

    // Draw F21 label with soft backing
    const f21Tw = ctx.measureText(f21Text).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(f21X - f21Tw / 2 - 4, f21Y - 8, f21Tw + 8, 16);
    ctx.fillStyle = "#ef4444";
    ctx.fillText(f21Text, f21X, f21Y);

    // Educational banner at bottom
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(30, H - 48, W - 60, 36, 8);
    } else {
      ctx.rect(30, H - 48, W - 60, 36);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Equal & opposite mutual attraction • F ∝ (M₁ × M₂) / r² • Doubling separation cuts force to 1/4", W / 2, H - 30);
  },
  graphPoint: (s, p) => {
    const m1_kg = p.m1 * 1e24;
    const m2_kg = p.m2 * 1e22;
    const r_m = p.r * 1e6;
    const F_N = (G_SI * m1_kg * m2_kg) / (r_m * r_m);
    return { r: p.r, F: r2(F_N / 1e19) };
  },
  xKey: "r",
  xLabel: "Separation (10³ km)",
  series: [
    { key: "F", label: "Gravitational Force (×10¹⁹ N)", color: "#ef4444" },
  ],
  stats: (s, p) => {
    const m1_kg = p.m1 * 1e24;
    const m2_kg = p.m2 * 1e22;
    const r_m = p.r * 1e6;
    const F_N = (G_SI * m1_kg * m2_kg) / (r_m * r_m);
    const F_10e19 = F_N / 1e19;
    return [
      { label: "Mutual Force F", value: r2(F_10e19), unit: "×10¹⁹ N" },
      { label: "Exact Force", value: F_N.toExponential(2), unit: "N" },
      { label: "Separation r", value: p.r, unit: "×10³ km" },
      { label: "Newton's 3rd Law", value: "F₁₂ = -F₂₁", unit: "" },
    ];
  },
};

/* ================= 2. GRAVITATIONAL FIELD ================= */
const gravfield = {
  title: "Gravitational Field",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary: "Visualize the gravitational field intensity vector g = GM/r² around a massive central body at different altitudes and radii.",
  equation: "g = \\frac{GM}{r^2} \\qquad \\vec{g} = -\\frac{GM}{r^2}\\hat{r}",
  params: [
    { key: "mass", label: "Planet mass (M)", min: 1, max: 10, step: 0.5, default: 5.97, unit: "×10²⁴ kg" },
    { key: "radius", label: "Planet radius (R)", min: 4000, max: 10000, step: 200, default: 6371, unit: "km" },
    { key: "testR", label: "Test probe distance (r)", min: 6400, max: 36000, step: 400, default: 12000, unit: "km" },
  ],
  init: () => ({ t: 0, angle: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.angle = (s.angle + dt * 0.4) % (Math.PI * 2);
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const M_kg = p.mass * 1e24;
    const R_m = p.radius * 1e3;
    const r_m = Math.max(R_m, p.testR * 1e3);

    const g_probe = (G_SI * M_kg) / (r_m * r_m);
    const g_surface = (G_SI * M_kg) / (R_m * R_m);

    // Canvas scaling: 40,000 km -> 180 px
    const scale = 180 / 38000;
    const planetR_px = Math.max(16, p.radius * scale);
    const probeR_px = p.testR * scale;

    // Draw 2D vector field grid (concentric rings of field vectors pointing radially inward)
    const ringRadii = [p.radius * 1.3, p.radius * 2.0, p.radius * 3.2, p.radius * 4.8];
    ringRadii.forEach((radKm) => {
      const radPx = radKm * scale;
      const ring_m = radKm * 1e3;
      const g_ring = (G_SI * M_kg) / (ring_m * ring_m);
      const intensity = Math.min(1, g_ring / 9.8);
      const arrowLen = Math.max(8, Math.min(26, 6 + intensity * 20));

      const numArrows = Math.max(8, Math.floor(radPx / 12));
      for (let i = 0; i < numArrows; i++) {
        const ang = (i * Math.PI * 2) / numArrows;
        const ax = cx + radPx * Math.cos(ang);
        const ay = cy + radPx * Math.sin(ang);
        const tox = ax - arrowLen * Math.cos(ang);
        const toy = ay - arrowLen * Math.sin(ang);
        arrow(ctx, ax, ay, tox, toy, `rgba(37,99,235,${0.18 + intensity * 0.55})`, 1.8);
      }
    });

    // Central Planet
    const grad = ctx.createRadialGradient(cx - planetR_px * 0.3, cy - planetR_px * 0.3, planetR_px * 0.1, cx, cy, planetR_px);
    grad.addColorStop(0, "#60a5fa");
    grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, planetR_px, grad, "#1e40af", 2);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 11px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("M", cx, cy + 4);

    // Equipotential/distance circle for test probe
    ctx.strokeStyle = "rgba(245,158,11,0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, probeR_px, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Test Probe position
    const probeX = cx + probeR_px * Math.cos(s.angle);
    const probeY = cy + probeR_px * Math.sin(s.angle);
    circle(ctx, probeX, probeY, 6, "#f59e0b", "#b45309", 2);

    // Large highlighted g vector at probe position
    const gVecLen = Math.max(15, Math.min(65, g_probe * 4.5));
    const gToX = probeX - gVecLen * Math.cos(s.angle);
    const gToY = probeY - gVecLen * Math.sin(s.angle);
    arrow(ctx, probeX, probeY, gToX, gToY, "#ef4444", 3);

    ctx.fillStyle = "#ef4444";
    ctx.font = "700 12px 'Source Code Pro'";
    ctx.textAlign = "left";
    ctx.fillText(`g = ${r2(g_probe)} m/s²`, probeX + 10, probeY - 10);
  },
  graphPoint: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r_m = Math.max(p.radius * 1e3, p.testR * 1e3);
    const g = (G_SI * M_kg) / (r_m * r_m);
    return { r: p.testR, g: r2(g) };
  },
  xKey: "r",
  xLabel: "Distance r (km)",
  series: [
    { key: "g", label: "Field Strength g (m/s²)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const M_kg = p.mass * 1e24;
    const R_m = p.radius * 1e3;
    const r_m = Math.max(R_m, p.testR * 1e3);
    const g_probe = (G_SI * M_kg) / (r_m * r_m);
    const g_surface = (G_SI * M_kg) / (R_m * R_m);
    const alt_km = Math.max(0, p.testR - p.radius);
    return [
      { label: "Field at Probe g", value: r2(g_probe), unit: "m/s²" },
      { label: "Surface Gravity g₀", value: r2(g_surface), unit: "m/s²" },
      { label: "Altitude h", value: alt_km, unit: "km" },
      { label: "Ratio g/g₀", value: r4(g_probe / g_surface), unit: "" },
    ];
  },
};

/* ================= 3. GRAVITATIONAL POTENTIAL ================= */
const gravpotential = {
  title: "Gravitational Potential",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary: "Investigate gravitational potential V = -GM/r and potential energy U = -GMm/r relative to zero at infinity.",
  equation: "V = -\\frac{GM}{r} \\qquad U = -\\frac{GMm}{r}",
  params: [
    { key: "mass", label: "Central mass (M)", min: 1, max: 10, step: 0.5, default: 5.97, unit: "×10²⁴ kg" },
    { key: "m", label: "Test mass (m)", min: 100, max: 5000, step: 100, default: 1000, unit: "kg" },
    { key: "r", label: "Distance r", min: 6400, max: 40000, step: 400, default: 15000, unit: "km" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const M_kg = p.mass * 1e24;
    const r_m = p.r * 1e3;
    const R_surf_m = 6.371e6;

    const V_J_kg = -(G_SI * M_kg) / r_m;
    const V_MJ_kg = V_J_kg / 1e6; // in MJ/kg
    const V_surf_MJ = -(G_SI * M_kg) / R_surf_m / 1e6;
    const U_GJ = (V_J_kg * p.m) / 1e9; // in GJ

    // Top section: Spatial equipotentials
    const cx = W / 2, cy = 110;
    const scale = 110 / 40000;
    const planetR_px = Math.max(12, 6371 * scale);
    const probeR_px = p.r * scale;

    // Equipotential concentric rings
    [10000, 20000, 30000, 40000].forEach((rk) => {
      const px = rk * scale;
      const vVal = (-(G_SI * M_kg) / (rk * 1e3)) / 1e6;
      ctx.strokeStyle = "rgba(139,92,246,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, px, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8b5cf6";
      ctx.font = "500 9px 'Source Code Pro'";
      ctx.fillText(`${r2(vVal)} MJ/kg`, cx + px + 4, cy - 2);
    });

    // Central planet
    const grad = ctx.createRadialGradient(cx - planetR_px * 0.3, cy - planetR_px * 0.3, planetR_px * 0.1, cx, cy, planetR_px);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, planetR_px, grad, "#1e40af", 2);

    // Probe marker in space
    const probeX = cx + probeR_px;
    circle(ctx, probeX, cy, 6, "#f59e0b", "#b45309", 2);

    // Bottom section: Gravitational Potential Well Curve V(r)
    const wellY0 = H - 35;
    const wellTopY = H - 165;
    const wellW = W - 140;
    const wellX0 = 70;

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // V = 0 line (infinity asymptote)
    ctx.moveTo(wellX0, wellTopY);
    ctx.lineTo(wellX0 + wellW, wellTopY);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "600 11px 'Source Code Pro'";
    ctx.textAlign = "left";
    ctx.fillText("V = 0 (at r = ∞)", wellX0 + wellW - 120, wellTopY - 6);
    ctx.fillText("Potential Well V(r) = -GM/r", wellX0, wellTopY - 6);

    // Plot negative hyperbola V(r)
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= wellW; x += 3) {
      const r_km = 6371 + (x / wellW) * (40000 - 6371);
      const v_mj = (-(G_SI * M_kg) / (r_km * 1e3)) / 1e6;
      const frac = Math.abs(v_mj / V_surf_MJ); // 0 at inf, 1 at surface
      const y = wellTopY + frac * (wellY0 - wellTopY);
      if (x === 0) ctx.moveTo(wellX0 + x, y);
      else ctx.lineTo(wellX0 + x, y);
    }
    ctx.stroke();

    // Mark current distance on well curve
    const curFracX = (p.r - 6371) / (40000 - 6371);
    const curWellX = wellX0 + Math.max(0, Math.min(wellW, curFracX * wellW));
    const curVFrac = Math.abs(V_MJ_kg / V_surf_MJ);
    const curWellY = wellTopY + curVFrac * (wellY0 - wellTopY);

    circle(ctx, curWellX, curWellY, 6, "#f59e0b", "#b45309", 2);
    ctx.strokeStyle = "rgba(245,158,11,0.6)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curWellX, wellTopY);
    ctx.lineTo(curWellX, curWellY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "700 11px 'Source Code Pro'";
    ctx.textAlign = "center";
    ctx.fillText(`V = ${r2(V_MJ_kg)} MJ/kg`, curWellX, curWellY + 18);
  },
  graphPoint: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r_m = p.r * 1e3;
    const V_MJ = (-(G_SI * M_kg) / r_m) / 1e6;
    return { r: p.r, V: r2(V_MJ) };
  },
  xKey: "r",
  xLabel: "Distance r (km)",
  series: [
    { key: "V", label: "Gravitational Potential V (MJ/kg)", color: "#8b5cf6" },
  ],
  stats: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r_m = p.r * 1e3;
    const V_J_kg = -(G_SI * M_kg) / r_m;
    const V_MJ_kg = V_J_kg / 1e6;
    const U_GJ = (V_J_kg * p.m) / 1e9;
    const escapeWork_GJ = Math.abs(U_GJ);
    return [
      { label: "Potential V", value: r2(V_MJ_kg), unit: "MJ/kg" },
      { label: "Potential Energy U", value: r2(U_GJ), unit: "GJ" },
      { label: "Work to reach ∞", value: r2(escapeWork_GJ), unit: "GJ" },
      { label: "Distance r", value: p.r, unit: "km" },
    ];
  },
};

/* ================= 4. ESCAPE VELOCITY ================= */
const escapevelocity = {
  title: "Escape Velocity",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Simulate a projectile launched from a planet's surface and observe whether it remains gravitationally bound or escapes to infinity based on v_e = √(2GM/R).",
  equation: "v_e = \\sqrt{\\frac{2GM}{R}} \\qquad \\mathcal{E} = \\tfrac{1}{2}v^2 - \\frac{GM}{r}",
  params: [
    { key: "v0", label: "Launch velocity (v₀)", min: 4, max: 20, step: 0.2, default: 11.2, unit: "km/s" },
    { key: "mass", label: "Planet mass (M)", min: 1, max: 10, step: 0.5, default: 5.97, unit: "×10²⁴ kg" },
    { key: "radius", label: "Planet radius (R)", min: 4000, max: 10000, step: 200, default: 6371, unit: "km" },
  ],
  init: (p) => {
    const R_m = p.radius * 1e3;
    const v0_ms = p.v0 * 1e3;
    return {
      r: R_m,
      v: v0_ms,
      t: 0,
      trail: [{ r: R_m, t: 0 }],
      status: "launched",
      maxAlt: 0,
      landed: false,
      escaped: false,
    };
  },
  step: (s, dt, p) => {
    if (s.landed || s.escaped) return;
    const M_kg = p.mass * 1e24;
    const R_m = p.radius * 1e3;
    const simDt = dt * 120; // 120x real-time acceleration for educational display

    // Newtonian gravity acceleration: a = -GM/r²
    const a = -(G_SI * M_kg) / (s.r * s.r);
    s.v += a * simDt;
    s.r += s.v * simDt;
    s.t += simDt;

    const alt_km = (s.r - R_m) / 1e3;
    if (alt_km > s.maxAlt) s.maxAlt = alt_km;

    // Check collision with planet surface
    if (s.r <= R_m && s.t > 1) {
      s.r = R_m;
      s.v = 0;
      s.landed = true;
      s.status = "fell_back";
    }

    // Check escape (distance > 120,000 km and speed > 0)
    if (s.r > 120000e3 && s.v > 0) {
      s.escaped = true;
      s.status = "escaped";
    }

    s.trail.push({ r: s.r, t: s.t });
    if (s.trail.length > 800) s.trail.shift();
  },
  done: (s) => s.landed || s.escaped,
  draw: (ctx, s, p, W, H) => {
    const cx = 140, cy = H / 2;
    const R_m = p.radius * 1e3;
    const v_e_ms = Math.sqrt((2 * G_SI * p.mass * 1e24) / R_m);
    const v_e_kms = v_e_ms / 1e3;

    // Visual scale: 120,000 km -> W - 220 px
    const scale = (W - 240) / 100000e3;
    const planetR_px = Math.max(20, R_m * scale * 1.5);
    const probeX = cx + (s.r - R_m) * scale;

    // Planet at left
    const grad = ctx.createRadialGradient(cx - planetR_px * 0.3, cy - planetR_px * 0.3, planetR_px * 0.1, cx, cy, planetR_px);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, planetR_px, grad, "#1e40af", 2);

    // Launch trajectory line
    ctx.strokeStyle = s.status === "escaped" ? "#10b981" : s.status === "fell_back" ? "#ef4444" : "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + planetR_px, cy);
    ctx.lineTo(probeX, cy);
    ctx.stroke();

    // Rocket / Projectile
    circle(ctx, probeX, cy, 7, "#f59e0b", "#b45309", 2);

    // Status Banner
    const isEscape = p.v0 >= v_e_kms;
    ctx.fillStyle = isEscape ? "#10b981" : "#ef4444";
    ctx.font = "700 15px Outfit";
    ctx.textAlign = "center";
    if (s.status === "escaped") {
      const v_inf = Math.sqrt(Math.max(0, p.v0 * p.v0 - v_e_kms * v_e_kms));
      ctx.fillText(`🚀 Escaped Planet Gravitational Field! (Excess v∞ ≈ ${r2(v_inf)} km/s)`, W / 2, 40);
    } else if (s.status === "fell_back") {
      ctx.fillText(`🛑 Sub-orbital: Projectile fell back to planet (Max altitude: ${r2(s.maxAlt)} km)`, W / 2, 40);
    } else {
      ctx.fillText(isEscape ? "v₀ ≥ v_e: Trajectory is Unbound (Escaping)" : "v₀ < v_e: Trajectory is Bound (Will fall back)", W / 2, 40);
    }
  },
  graphPoint: (s) => ({
    t: r2(s.t / 60),
    v: r2(s.v / 1e3),
    alt: r2((s.r - 6371e3) / 1e6),
  }),
  xKey: "t",
  xLabel: "Elapsed Time (min)",
  series: [
    { key: "v", label: "Velocity (km/s)", color: "#f59e0b" },
    { key: "alt", label: "Altitude (×10³ km)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const R_m = p.radius * 1e3;
    const v_e_ms = Math.sqrt((2 * G_SI * p.mass * 1e24) / R_m);
    const v_e_kms = v_e_ms / 1e3;
    const cur_alt_km = Math.max(0, (s.r - R_m) / 1e3);
    const specificE = 0.5 * (s.v * s.v) - (G_SI * p.mass * 1e24) / s.r;
    return [
      { label: "Escape Velocity v_e", value: r2(v_e_kms), unit: "km/s" },
      { label: "Launch Speed v₀", value: p.v0, unit: "km/s" },
      { label: "Current Speed", value: r2(s.v / 1e3), unit: "km/s" },
      { label: "Max Altitude", value: r2(s.maxAlt), unit: "km" },
      { label: "Specific Energy", value: r2(specificE / 1e6), unit: "MJ/kg" },
      { label: "Trajectory Type", value: p.v0 >= v_e_kms ? "Unbound" : "Bound", unit: "" },
    ];
  },
};

/* ================= 5. ORBITAL VELOCITY ================= */
const orbitalvelocity = {
  title: "Orbital Velocity",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Analyze circular orbital speed v_orbit = √(GM/r). Vary the initial speed to transition smoothly between sub-orbital, circular, elliptical, and escape trajectories.",
  equation: "v_{\\text{orbit}} = \\sqrt{\\frac{GM}{r}} \\qquad T = 2\\pi\\sqrt{\\frac{r^3}{GM}}",
  params: [
    { key: "altitude", label: "Altitude (h)", min: 400, max: 36000, step: 400, default: 2000, unit: "km" },
    { key: "vRatio", label: "Speed ratio (v / v_circ)", min: 0.5, max: 1.45, step: 0.02, default: 1.0, unit: "×" },
    { key: "mass", label: "Planet mass (M)", min: 1, max: 10, step: 0.5, default: 5.97, unit: "×10²⁴ kg" },
  ],
  init: (p) => {
    const M_kg = p.mass * 1e24;
    const r0_m = (6371 + p.altitude) * 1e3;
    const v_circ = Math.sqrt((G_SI * M_kg) / r0_m);
    const v0 = p.vRatio * v_circ;
    return {
      x: r0_m,
      y: 0,
      vx: 0,
      vy: v0,
      t: 0,
      trail: [],
      state: "orbiting",
      rMin: r0_m,
      rMax: r0_m,
    };
  },
  step: (s, dt, p) => {
    if (s.state !== "orbiting") return;
    const M_kg = p.mass * 1e24;
    const R_planet_m = 6371e3;
    const simDt = dt * 180; // Accelerated time scale

    // Velocity Verlet / Symplectic Integration
    const r = Math.hypot(s.x, s.y) || 1;
    const a = -(G_SI * M_kg) / (r * r * r);
    s.vx += a * s.x * simDt;
    s.vy += a * s.y * simDt;
    s.x += s.vx * simDt;
    s.y += s.vy * simDt;
    s.t += simDt;

    if (r < s.rMin) s.rMin = r;
    if (r > s.rMax) s.rMax = r;

    // Check surface collision
    if (r <= R_planet_m) {
      s.state = "crashed";
    }
    // Check escape (r > 150,000 km)
    if (r > 150000e3) {
      s.state = "escaped";
    }

    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 1200) s.trail.shift();
  },
  done: (s) => s.state !== "orbiting",
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const r0_m = (6371 + p.altitude) * 1e3;
    const M_kg = p.mass * 1e24;
    const v_circ = Math.sqrt((G_SI * M_kg) / r0_m);

    // Canvas scaling
    const maxViewR_m = 80000e3;
    const scale = (Math.min(W, H) * 0.42) / maxViewR_m;
    const planetR_px = Math.max(14, 6371e3 * scale);

    // Target circular orbit guide
    ctx.strokeStyle = "rgba(37,99,235,0.25)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, r0_m * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central Planet
    const grad = ctx.createRadialGradient(cx - planetR_px * 0.3, cy - planetR_px * 0.3, planetR_px * 0.1, cx, cy, planetR_px);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, planetR_px, grad, "#1e40af", 2);

    // Orbit Trail
    ctx.strokeStyle = s.state === "crashed" ? "#ef4444" : s.state === "escaped" ? "#10b981" : "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sx = cx + pt.x * scale;
      const sy = cy + pt.y * scale;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();

    // Satellite
    const satX = cx + s.x * scale;
    const satY = cy + s.y * scale;
    circle(ctx, satX, satY, 6, "#f59e0b", "#b45309", 2);

    // Status announcement
    if (s.state === "crashed") {
      ctx.fillStyle = "#ef4444";
      ctx.font = "700 15px Outfit";
      ctx.textAlign = "center";
      ctx.fillText("💥 Re-entered atmosphere / Crashed on surface (Perigee < Radius)", cx, 36);
    } else if (s.state === "escaped") {
      ctx.fillStyle = "#10b981";
      ctx.font = "700 15px Outfit";
      ctx.textAlign = "center";
      ctx.fillText("🚀 Parabolic/Hyperbolic Escape (v ≥ v_escape)", cx, 36);
    }
  },
  graphPoint: (s) => ({
    t: r2(s.t / 60),
    speed: r2(Math.hypot(s.vx, s.vy) / 1e3),
    alt: r2((Math.hypot(s.x, s.y) - 6371e3) / 1e3),
  }),
  xKey: "t",
  xLabel: "Time (min)",
  series: [
    { key: "speed", label: "Speed (km/s)", color: "#f59e0b" },
    { key: "alt", label: "Altitude (km)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r0_m = (6371 + p.altitude) * 1e3;
    const v_circ_kms = Math.sqrt((G_SI * M_kg) / r0_m) / 1e3;
    const cur_v_kms = Math.hypot(s.vx, s.vy) / 1e3;
    const cur_r_km = Math.hypot(s.x, s.y) / 1e3;
    const T_period_min = (2 * Math.PI * Math.sqrt(Math.pow(r0_m, 3) / (G_SI * M_kg))) / 60;
    const orbType = p.vRatio === 1 ? "Circular" : p.vRatio < 1 ? "Elliptical (Sub-circular)" : p.vRatio < 1.414 ? "Elliptical (Super-circular)" : "Escape";
    return [
      { label: "Circular Speed v_c", value: r2(v_circ_kms), unit: "km/s" },
      { label: "Actual Speed v", value: r2(cur_v_kms), unit: "km/s" },
      { label: "Circular Period", value: r2(T_period_min), unit: "min" },
      { label: "Distance r", value: r2(cur_r_km), unit: "km" },
      { label: "Orbit Type", value: orbType, unit: "" },
      { label: "Status", value: s.state, unit: "" },
    ];
  },
};

/* ================= 6. SATELLITES & ORBITAL MECHANICS ================= */
const satellites = {
  title: "Satellites & Orbital Mechanics",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Simulate real Earth satellite constellations (ISS, GPS, Geostationary) and observe how orbital period, speed, and ground synchronization relate to altitude.",
  equation: "T = 2\\pi\\sqrt{\\frac{(R+h)^3}{GM}} \\qquad v = \\sqrt{\\frac{GM}{R+h}}",
  params: [
    { key: "preset", label: "Preset (1:ISS 2:GPS 3:GEO 4:Molniya)", min: 1, max: 4, step: 1, default: 3, unit: "" },
    { key: "timeSpeed", label: "Simulation Speed", min: 1, max: 5, step: 0.5, default: 2, unit: "×" },
  ],
  init: (p) => {
    return {
      t: 0,
      earthTheta: 0,
      satTheta: 0,
    };
  },
  step: (s, dt, p) => {
    const simRate = p.timeSpeed * 300; // Accelerated time step
    s.t += dt * simRate;
    // Earth rotation period: 23.934 hours = 86164 s
    const omegaEarth = (2 * Math.PI) / 86164;
    s.earthTheta = (s.earthTheta + omegaEarth * dt * simRate) % (Math.PI * 2);

    // Preset configurations
    let alt_m = 35786e3; // GEO
    if (p.preset === 1) alt_m = 400e3; // LEO (ISS)
    else if (p.preset === 2) alt_m = 20200e3; // MEO (GPS)
    else if (p.preset === 4) alt_m = 18000e3; // Molniya avg

    const r_m = R_EARTH + alt_m;
    const omegaSat = Math.sqrt((G_SI * M_EARTH) / (r_m * r_m * r_m));
    s.satTheta = (s.satTheta + omegaSat * dt * simRate) % (Math.PI * 2);
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;

    const PRESETS = {
      1: { name: "LEO (ISS)", alt_km: 400, color: "#10b981", info: "Low Earth Orbit • 92 min period • 15.5 revs/day" },
      2: { name: "MEO (GPS)", alt_km: 20200, color: "#f59e0b", info: "Medium Earth Orbit • 12 hr period • 2 revs/day" },
      3: { name: "GEO (Geostationary)", alt_km: 35786, color: "#6366f1", info: "Geostationary • 24 hr period • Stationary over ground!" },
      4: { name: "Molniya", alt_km: 26000, color: "#ec4899", info: "High Inclination / Elliptical Satellite Orbit" },
    };
    const cur = PRESETS[p.preset] || PRESETS[3];

    // Scale canvas: GEO (42,164 km radius) fits in 175 px
    const scale = 175 / 44000e3;
    const earthR_px = Math.max(16, R_EARTH * scale);
    const satR_px = (R_EARTH + cur.alt_km * 1e3) * scale;

    // Orbit path ring
    ctx.strokeStyle = `${cur.color}66`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, satR_px, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Earth with longitude marker
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(s.earthTheta);
    const grad = ctx.createRadialGradient(-earthR_px * 0.3, -earthR_px * 0.3, earthR_px * 0.1, 0, 0, earthR_px);
    grad.addColorStop(0, "#38bdf8"); grad.addColorStop(1, "#0369a1");
    circle(ctx, 0, 0, earthR_px, grad, "#0284c7", 2);

    // Ground reference point (Prime meridian beacon)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(earthR_px - 3, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Satellite Position
    const satX = cx + satR_px * Math.cos(s.satTheta);
    const satY = cy + satR_px * Math.sin(s.satTheta);

    // Beam to Earth
    ctx.strokeStyle = `${cur.color}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Satellite body + solar panels
    ctx.save();
    ctx.translate(satX, satY);
    ctx.rotate(s.satTheta + Math.PI / 2);
    ctx.fillStyle = "#334155";
    ctx.fillRect(-10, -3, 20, 6);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(-18, -2, 7, 4);
    ctx.fillRect(11, -2, 7, 4);
    circle(ctx, 0, 0, 3.5, cur.color);
    ctx.restore();

    // Educational banner
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Outfit";
    ctx.textAlign = "center";
    ctx.fillText(`${cur.name} — ${cur.info}`, W / 2, 34);
  },
  graphPoint: (s, p) => {
    let alt_km = 35786;
    if (p.preset === 1) alt_km = 400;
    else if (p.preset === 2) alt_km = 20200;
    else if (p.preset === 4) alt_km = 26000;
    const r_m = (R_EARTH + alt_km * 1e3);
    const v_kms = Math.sqrt((G_SI * M_EARTH) / r_m) / 1e3;
    return { t: r2(s.t / 3600), v: r2(v_kms) };
  },
  xKey: "t",
  xLabel: "Elapsed Time (hours)",
  series: [
    { key: "v", label: "Orbital Speed (km/s)", color: "#6366f1" },
  ],
  stats: (s, p) => {
    let alt_km = 35786;
    if (p.preset === 1) alt_km = 400;
    else if (p.preset === 2) alt_km = 20200;
    else if (p.preset === 4) alt_km = 26000;
    const r_m = (R_EARTH + alt_km * 1e3);
    const v_kms = Math.sqrt((G_SI * M_EARTH) / r_m) / 1e3;
    const T_hours = (2 * Math.PI * Math.sqrt(Math.pow(r_m, 3) / (G_SI * M_EARTH))) / 3600;
    const ac_ms2 = (G_SI * M_EARTH) / (r_m * r_m);
    return [
      { label: "Altitude h", value: alt_km, unit: "km" },
      { label: "Orbital Period T", value: r2(T_hours), unit: "hours" },
      { label: "Orbital Velocity", value: r2(v_kms), unit: "km/s" },
      { label: "Centripetal Accel", value: r2(ac_ms2), unit: "m/s²" },
    ];
  },
};

/* ================= 7. KEPLER'S LAWS OF PLANETARY MOTION ================= */
const kepler = {
  title: "Kepler's Laws of Planetary Motion",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Explore Kepler's three laws: 1st Law (Elliptical orbits with Sun at focus), 2nd Law (Equal areas swept in equal times), and 3rd Law (Harmonic law: T² ∝ a³).",
  equation: "r(\\theta) = \\frac{a(1-e^2)}{1+e\\cos\\theta} \\qquad \\frac{dA}{dt} = \\text{const} \\qquad T^2 = \\frac{4\\pi^2}{GM} a^3",
  params: [
    { key: "ecc", label: "Eccentricity (e)", min: 0, max: 0.85, step: 0.05, default: 0.5, unit: "" },
    { key: "a", label: "Semi-major axis (a)", min: 0.8, max: 3.5, step: 0.1, default: 1.8, unit: "AU" },
    { key: "showSectors", label: "Show 2nd Law Sectors", min: 0, max: 1, step: 1, default: 1, unit: "toggle" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => {
    const a_m = p.a * AU_METERS;
    const e = p.ecc;
    const r_m = (a_m * (1 - e * e)) / (1 + e * Math.cos(s.th));
    // Kepler 2: dθ/dt = h / r² = √(G M a (1-e²)) / r²
    const h_ang = Math.sqrt(G_SI * M_SUN * a_m * (1 - e * e));
    const dTheta = (h_ang / (r_m * r_m)) * (dt * 86400 * 25); // Accelerated by 25 days/s
    s.th = (s.th + dTheta) % (Math.PI * 2);
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const e = p.ecc;
    const a_AU = p.a;
    const b_AU = a_AU * Math.sqrt(Math.max(0.01, 1 - e * e));

    // Scale: 4 AU -> 170 px
    const scale = 170 / 3.8;
    const a_px = a_AU * scale;
    const b_px = b_AU * scale;
    const focus_px = a_px * e;

    const sunX = cx - focus_px;
    const sunY = cy;

    // Draw Kepler 2nd Law Swept Sectors (Equal Area Demonstration)
    if (p.showSectors > 0.5) {
      // Sector 1: Perihelion (around θ = 0)
      const dTh_p = 0.55; // Angle span
      ctx.fillStyle = "rgba(16,185,129,0.22)";
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      for (let th = -dTh_p; th <= dTh_p; th += 0.05) {
        const rr = (a_px * (1 - e * e)) / (1 + e * Math.cos(th));
        ctx.lineTo(sunX + rr * Math.cos(th), sunY + rr * Math.sin(th));
      }
      ctx.closePath();
      ctx.fill();

      // Sector 2: Aphelion (around θ = π)
      const dTh_a = dTh_p * Math.pow((1 - e) / (1 + e), 2); // Equal area angle span
      ctx.fillStyle = "rgba(245,158,11,0.22)";
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      for (let th = Math.PI - dTh_a; th <= Math.PI + dTh_a; th += 0.05) {
        const rr = (a_px * (1 - e * e)) / (1 + e * Math.cos(th));
        ctx.lineTo(sunX + rr * Math.cos(th), sunY + rr * Math.sin(th));
      }
      ctx.closePath();
      ctx.fill();
    }

    // Elliptical Orbit Path (1st Law)
    ctx.strokeStyle = "rgba(99,102,241,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a_px, b_px, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Major axis line & Empty focus
    ctx.strokeStyle = "rgba(148,163,184,0.4)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - a_px, cy); ctx.lineTo(cx + a_px, cy);
    ctx.stroke();
    circle(ctx, cx + focus_px, cy, 3, "#94a3b8"); // Empty focus
    ctx.setLineDash([]);

    // Sun at Focus
    const gradSun = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 18);
    gradSun.addColorStop(0, "#fde047"); gradSun.addColorStop(1, "#f59e0b");
    circle(ctx, sunX, sunY, 14, gradSun, "#d97706", 2);
    ctx.fillStyle = "#78350f";
    ctx.font = "700 9px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("Sun", sunX, sunY + 3);

    // Planet current position
    const r_current_px = (a_px * (1 - e * e)) / (1 + e * Math.cos(s.th));
    const planetX = sunX + r_current_px * Math.cos(s.th);
    const planetY = sunY + r_current_px * Math.sin(s.th);

    // Radius vector r(t)
    ctx.strokeStyle = "rgba(99,102,241,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(planetX, planetY);
    ctx.stroke();

    circle(ctx, planetX, planetY, 7, "#6366f1", "#3730a3", 2);

    // Annotations
    ctx.fillStyle = "#475569";
    ctx.font = "600 11px Outfit";
    ctx.textAlign = "center";
    ctx.fillText(`Perihelion: ${r2(a_AU * (1 - e))} AU`, cx + a_px - focus_px, cy - 12);
    ctx.fillText(`Aphelion: ${r2(a_AU * (1 + e))} AU`, cx - a_px - focus_px, cy - 12);
  },
  graphPoint: (s, p) => {
    const a_m = p.a * AU_METERS;
    const r_m = (a_m * (1 - p.ecc * p.ecc)) / (1 + p.ecc * Math.cos(s.th));
    const v_ms = Math.sqrt(G_SI * M_SUN * (2 / r_m - 1 / a_m));
    return { t: r2(s.t), speed: r2(v_ms / 1e3) };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "speed", label: "Orbital Speed (km/s)", color: "#6366f1" },
  ],
  stats: (s, p) => {
    const a_m = p.a * AU_METERS;
    const e = p.ecc;
    const r_m = (a_m * (1 - e * e)) / (1 + e * Math.cos(s.th));
    const v_ms = Math.sqrt(G_SI * M_SUN * (2 / r_m - 1 / a_m));
    const T_years = Math.pow(p.a, 1.5);
    const T2_over_a3 = (T_years * T_years) / Math.pow(p.a, 3);
    const v_peri_kms = Math.sqrt((G_SI * M_SUN * (1 + e)) / (a_m * (1 - e))) / 1e3;
    const v_aph_kms = Math.sqrt((G_SI * M_SUN * (1 - e)) / (a_m * (1 + e))) / 1e3;
    return [
      { label: "Orbital Period T", value: r2(T_years), unit: "years" },
      { label: "Kepler 3 (T²/a³)", value: r4(T2_over_a3), unit: "yr²/AU³" },
      { label: "Current Speed", value: r2(v_ms / 1e3), unit: "km/s" },
      { label: "Perihelion Speed", value: r2(v_peri_kms), unit: "km/s" },
      { label: "Aphelion Speed", value: r2(v_aph_kms), unit: "km/s" },
      { label: "Current Distance", value: r2(r_m / AU_METERS), unit: "AU" },
    ];
  },
};

/* ================= 8. GRAVITY & ORBITS ================= */
const orbit = {
  title: "Gravity & Orbits",
  topic: "mechanics",
  difficulty: "Advanced",
  summary: "Comprehensive orbital mechanics simulator with velocity Verlet numerical integration, dynamic energy conservation, and force/velocity vectors.",
  equation: "\\vec{a} = -\\frac{GM}{r^3}\\vec{r} \\qquad E = \\tfrac{1}{2}mv^2 - \\frac{GMm}{r} = \\text{const}",
  params: [
    { key: "speed", label: "Initial speed (v₀)", min: 2, max: 15, step: 0.2, default: 7.6, unit: "km/s" },
    { key: "radius", label: "Initial distance (r₀)", min: 7000, max: 35000, step: 500, default: 12000, unit: "km" },
    { key: "mass", label: "Central mass (M)", min: 1, max: 10, step: 0.5, default: 5.97, unit: "×10²⁴ kg" },
    { key: "satMass", label: "Satellite mass (m)", min: 500, max: 5000, step: 250, default: 1500, unit: "kg" },
  ],
  init: (p) => {
    const r0_m = p.radius * 1e3;
    const v0_ms = p.speed * 1e3;
    return {
      x: r0_m,
      y: 0,
      vx: 0,
      vy: v0_ms,
      t: 0,
      trail: [],
      state: "orbiting",
    };
  },
  step: (s, dt, p) => {
    if (s.state !== "orbiting") return;
    const M_kg = p.mass * 1e24;
    const R_planet_m = 6371e3;
    const simDt = dt * 150; // Accelerated time

    // Symplectic Velocity-Verlet Integration
    const r = Math.hypot(s.x, s.y) || 1;
    const acc = -(G_SI * M_kg) / (r * r * r);
    s.vx += acc * s.x * simDt;
    s.vy += acc * s.y * simDt;
    s.x += s.vx * simDt;
    s.y += s.vy * simDt;
    s.t += simDt;

    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 1400) s.trail.shift();

    // Collision with planet surface
    if (r <= R_planet_m) s.state = "crashed";
    // Escaped
    if (r > 120000e3) s.state = "escaped";
  },
  done: (s) => s.state !== "orbiting",
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const scale = (Math.min(W, H) * 0.44) / 50000e3;
    const planetR_px = Math.max(14, 6371e3 * scale);

    // Central Planet
    const grad = ctx.createRadialGradient(cx - planetR_px * 0.3, cy - planetR_px * 0.3, planetR_px * 0.1, cx, cy, planetR_px);
    grad.addColorStop(0, "#60a5fa"); grad.addColorStop(1, "#1d4ed8");
    circle(ctx, cx, cy, planetR_px, grad, "#1e40af", 2);

    // Orbit Trail
    ctx.strokeStyle = s.state === "crashed" ? "#ef4444" : s.state === "escaped" ? "#10b981" : "rgba(37,99,235,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sx = cx + pt.x * scale;
      const sy = cy + pt.y * scale;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();

    // Satellite Position
    const satX = cx + s.x * scale;
    const satY = cy + s.y * scale;
    circle(ctx, satX, satY, 6, "#f59e0b", "#b45309", 2);

    // Force vector (pointing to center)
    const r = Math.hypot(s.x, s.y) || 1;
    const fLen = 30;
    arrow(ctx, satX, satY, satX - (s.x / r) * fLen, satY - (s.y / r) * fLen, "#10b981", 2);

    // Velocity vector
    const v = Math.hypot(s.vx, s.vy) || 1;
    const vLen = 30;
    arrow(ctx, satX, satY, satX + (s.vx / v) * vLen, satY + (s.vy / v) * vLen, "#f59e0b", 2);

    // Status Banner
    if (s.state === "crashed") {
      ctx.fillStyle = "#ef4444";
      ctx.font = "700 15px Outfit";
      ctx.textAlign = "center";
      ctx.fillText("💥 Crashed into Planet Surface!", cx, 36);
    } else if (s.state === "escaped") {
      ctx.fillStyle = "#10b981";
      ctx.font = "700 15px Outfit";
      ctx.textAlign = "center";
      ctx.fillText("🚀 Escaped Orbit (Unbound Trajectory)", cx, 36);
    }
  },
  graphPoint: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r = Math.hypot(s.x, s.y) || 1;
    const v = Math.hypot(s.vx, s.vy);
    const KE_GJ = (0.5 * p.satMass * v * v) / 1e9;
    const PE_GJ = (-(G_SI * M_kg * p.satMass) / r) / 1e9;
    return {
      t: r2(s.t / 60),
      E: r2(KE_GJ + PE_GJ),
      KE: r2(KE_GJ),
      PE: r2(PE_GJ),
    };
  },
  xKey: "t",
  xLabel: "Time (min)",
  series: [
    { key: "E", label: "Total Energy E (GJ)", color: "#10b981" },
    { key: "KE", label: "Kinetic Energy (GJ)", color: "#f59e0b" },
    { key: "PE", label: "Potential Energy (GJ)", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const M_kg = p.mass * 1e24;
    const r = Math.hypot(s.x, s.y) || 1;
    const v = Math.hypot(s.vx, s.vy);
    const KE_GJ = (0.5 * p.satMass * v * v) / 1e9;
    const PE_GJ = (-(G_SI * M_kg * p.satMass) / r) / 1e9;
    const v_circ_kms = Math.sqrt((G_SI * M_kg) / r) / 1e3;
    const v_esc_kms = Math.sqrt((2 * G_SI * M_kg) / r) / 1e3;
    return [
      { label: "Speed", value: r2(v / 1e3), unit: "km/s" },
      { label: "Distance r", value: r2(r / 1e3), unit: "km" },
      { label: "Total Energy E", value: r2(KE_GJ + PE_GJ), unit: "GJ" },
      { label: "Circular Speed", value: r2(v_circ_kms), unit: "km/s" },
      { label: "Escape Speed", value: r2(v_esc_kms), unit: "km/s" },
      { label: "Status", value: s.state, unit: "" },
    ];
  },
};

const simsGrav = {
  gravitationlaw,
  gravfield,
  gravpotential,
  escapevelocity,
  orbitalvelocity,
  satellites,
  kepler,
  orbit,
};

export default simsGrav;
