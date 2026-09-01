// Electricity & Magnetism simulations.
const r2 = (x) => Math.round(x * 100) / 100;
const RAD = Math.PI / 180;
function circle(ctx, x, y, rad, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function arrow(ctx, x1, y1, x2, y2, color, w = 2) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
  ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}

const charges = {
  title: "Electric Charges & Field", topic: "electricity", difficulty: "Intermediate",
  summary: "Place two charges and see the electric field and the Coulomb force between them.",
  equation: "F = \\frac{kq_1q_2}{r^2}, \\quad E = \\frac{kq}{r^2}",
  params: [
    { key: "q1", label: "Charge 1", min: -5, max: 5, step: 0.5, default: 3, unit: "μC" },
    { key: "q2", label: "Charge 2", min: -5, max: 5, step: 0.5, default: -3, unit: "μC" },
    { key: "sep", label: "Separation", min: 1.5, max: 8, step: 0.5, default: 4, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const y = H / 2, sc = 42, x1 = W / 2 - (p.sep * sc) / 2, x2 = W / 2 + (p.sep * sc) / 2;
    // field arrows on grid
    for (let gx = 60; gx < W - 40; gx += 56) for (let gy = 60; gy < H - 40; gy += 56) {
      let ex = 0, ey = 0;
      [[x1, p.q1], [x2, p.q2]].forEach(([cx, q]) => {
        const dx = gx - cx, dy = gy - y, d = Math.max(20, Math.hypot(dx, dy));
        const e = (q * 900) / (d * d); ex += e * dx / d; ey += e * dy / d;
      });
      const m = Math.hypot(ex, ey) || 1; const L = Math.min(20, m * 40);
      arrow(ctx, gx, gy, gx + (ex / m) * L, gy + (ey / m) * L, "rgba(37,99,235,.35)", 1.4);
    }
    const drawQ = (x, q) => { circle(ctx, x, y, 18, q >= 0 ? "#ef4444" : "#2563eb", "#334155");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Outfit"; ctx.textAlign = "center"; ctx.fillText(q >= 0 ? "+" : "−", x, y + 6); ctx.textAlign = "left"; };
    drawQ(x1, p.q1); drawQ(x2, p.q2);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), F: r2((9 * p.q1 * p.q2) / (p.sep * p.sep)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "F", label: "Coulomb force (relative)", color: "#ef4444" }],
  stats: (s, p) => { const F = (9 * p.q1 * p.q2) / (p.sep * p.sep); return [
    { label: "Force", value: r2(Math.abs(F)), unit: "×10⁻³ N" }, { label: "Nature", value: F > 0 ? "repulsive" : F < 0 ? "attractive" : "none", unit: "" },
    { label: "Separation", value: p.sep, unit: "m" }, { label: "Field at midpt", value: r2(9 * (p.q1 - p.q2) / Math.pow(p.sep / 2, 2)), unit: "" }]; },
};

const capacitor = {
  title: "Parallel Plate Capacitor", topic: "electricity", difficulty: "Intermediate",
  summary: "Change voltage, plate area and gap to explore capacitance, field and stored energy.",
  equation: "C = \\frac{\\varepsilon_0 A}{d}, \\quad E = \\frac{V}{d}, \\quad U = \\tfrac{1}{2}CV^2",
  params: [
    { key: "voltage", label: "Voltage", min: 1, max: 20, step: 1, default: 10, unit: "V" },
    { key: "area", label: "Plate area", min: 1, max: 10, step: 0.5, default: 5, unit: "cm²" },
    { key: "gap", label: "Plate gap", min: 1, max: 8, step: 0.5, default: 3, unit: "mm" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, ph = 40 + p.area * 10, gap = p.gap * 12;
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - gap / 2 - 10, cy - ph / 2, 8, ph);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx + gap / 2 + 2, cy - ph / 2, 8, ph);
    for (let i = 0; i < 5; i++) { const yy = cy - ph / 2 + (i + 0.5) * ph / 5; arrow(ctx, cx - gap / 2 - 2, yy, cx + gap / 2 + 2, yy, "rgba(245,158,11,.8)", 2); }
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText("+", cx - gap / 2 - 18, cy); ctx.fillText("−", cx + gap / 2 + 20, cy); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => { const C = (8.85 * p.area) / p.gap; return { t: r2(s.t), U: r2(0.5 * C * p.voltage * p.voltage / 1000) }; },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "U", label: "Energy stored (relative)", color: "#f59e0b" }],
  stats: (s, p) => { const C = (8.85 * p.area) / p.gap; return [
    { label: "Capacitance", value: r2(C), unit: "pF" }, { label: "Field E", value: r2(p.voltage / p.gap), unit: "V/mm" },
    { label: "Charge Q", value: r2(C * p.voltage), unit: "pC" }, { label: "Energy", value: r2(0.5 * C * p.voltage * p.voltage / 1000), unit: "nJ" }]; },
};

const ohms = {
  title: "Ohm's Law", topic: "electricity", difficulty: "Beginner",
  summary: "Set voltage and resistance and watch current flow and the bulb glow brighter.",
  equation: "V = IR, \\quad P = VI",
  params: [
    { key: "voltage", label: "Voltage", min: 1, max: 24, step: 1, default: 12, unit: "V" },
    { key: "resistance", label: "Resistance", min: 1, max: 24, step: 1, default: 6, unit: "Ω" },
  ],
  init: () => ({ t: 0, ph: 0 }),
  step: (s, dt, p) => { s.t += dt; s.ph += (p.voltage / p.resistance) * dt * 1.4; },
  draw: (ctx, s, p, W, H) => {
    const I = p.voltage / p.resistance; const L = 70, T = 70, Rt = W - 70, B = H - 70;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.strokeRect(L, T, Rt - L, B - T);
    // battery
    ctx.fillStyle = "#334155"; ctx.fillRect(L - 4, (T + B) / 2 - 14, 8, 28); ctx.fillRect(L - 12, (T + B) / 2 - 8, 6, 16);
    // bulb
    const bx = (L + Rt) / 2, by = T; const glow = Math.min(1, I / 8);
    circle(ctx, bx, by, 16, `rgba(245,158,11,${0.25 + glow * 0.75})`, "#b45309");
    // current dots
    const perim = 2 * ((Rt - L) + (B - T));
    for (let k = 0; k < 12; k++) {
      let d = (s.ph * 40 + (k * perim) / 12) % perim; let x, y;
      if (d < Rt - L) { x = L + d; y = T; } else if (d < (Rt - L) + (B - T)) { x = Rt; y = T + (d - (Rt - L)); }
      else if (d < 2 * (Rt - L) + (B - T)) { x = Rt - (d - (Rt - L) - (B - T)); y = B; } else { x = L; y = B - (d - 2 * (Rt - L) - (B - T)); }
      circle(ctx, x, y, 3.5, "#2563eb");
    }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), I: r2(p.voltage / p.resistance) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "I", label: "Current (A)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Current", value: r2(p.voltage / p.resistance), unit: "A" }, { label: "Power", value: r2(p.voltage * p.voltage / p.resistance), unit: "W" },
    { label: "Voltage", value: p.voltage, unit: "V" }, { label: "Resistance", value: p.resistance, unit: "Ω" }],
};

const seriesparallel = {
  title: "Series & Parallel Circuits", topic: "electricity", difficulty: "Intermediate",
  summary: "Toggle between series and parallel and see how the equivalent resistance changes.",
  equation: "R_s = R_1+R_2, \\quad \\tfrac{1}{R_p}=\\tfrac{1}{R_1}+\\tfrac{1}{R_2}",
  params: [
    { key: "r1", label: "R₁", min: 1, max: 20, step: 1, default: 6, unit: "Ω" },
    { key: "r2", label: "R₂", min: 1, max: 20, step: 1, default: 3, unit: "Ω" },
    { key: "mode", label: "0=Series 1=Parallel", min: 0, max: 1, step: 1, default: 0, unit: "" },
    { key: "voltage", label: "Voltage", min: 1, max: 24, step: 1, default: 12, unit: "V" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    const rbox = (x, y, label) => { ctx.fillStyle = "#dbeafe"; ctx.fillRect(x - 30, y - 12, 60, 24); ctx.strokeRect(x - 30, y - 12, 60, 24);
      ctx.fillStyle = "#1e40af"; ctx.font = "600 12px 'Source Code Pro'"; ctx.textAlign = "center"; ctx.fillText(label, x, y + 4); ctx.textAlign = "left"; };
    if (p.mode < 0.5) { ctx.beginPath(); ctx.moveTo(cx - 200, cy); ctx.lineTo(cx + 200, cy); ctx.stroke(); rbox(cx - 80, cy, p.r1 + "Ω"); rbox(cx + 80, cy, p.r2 + "Ω"); }
    else { ctx.beginPath(); ctx.moveTo(cx - 160, cy); ctx.lineTo(cx + 160, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 60, cy - 50); ctx.lineTo(cx + 60, cy - 50); ctx.moveTo(cx - 60, cy + 50); ctx.lineTo(cx + 60, cy + 50);
      ctx.moveTo(cx - 60, cy - 50); ctx.lineTo(cx - 60, cy + 50); ctx.moveTo(cx + 60, cy - 50); ctx.lineTo(cx + 60, cy + 50); ctx.stroke();
      rbox(cx, cy - 50, p.r1 + "Ω"); rbox(cx, cy + 50, p.r2 + "Ω"); }
  },
  graphPoint: (s, p) => { const req = p.mode < 0.5 ? p.r1 + p.r2 : (p.r1 * p.r2) / (p.r1 + p.r2); return { t: r2(s.t), I: r2(p.voltage / req) }; },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "I", label: "Total current (A)", color: "#2563eb" }],
  stats: (s, p) => { const req = p.mode < 0.5 ? p.r1 + p.r2 : (p.r1 * p.r2) / (p.r1 + p.r2); return [
    { label: "Configuration", value: p.mode < 0.5 ? "series" : "parallel", unit: "" }, { label: "R equivalent", value: r2(req), unit: "Ω" },
    { label: "Total current", value: r2(p.voltage / req), unit: "A" }, { label: "Power", value: r2(p.voltage * p.voltage / req), unit: "W" }]; },
};

const rc = {
  title: "RC Charging Circuit", topic: "electricity", difficulty: "Advanced",
  summary: "Charge a capacitor through a resistor and watch the exponential rise to full voltage.",
  equation: "V_C = V_0(1 - e^{-t/RC}), \\quad \\tau = RC",
  params: [
    { key: "voltage", label: "Source voltage", min: 1, max: 20, step: 1, default: 10, unit: "V" },
    { key: "R", label: "Resistance", min: 1, max: 10, step: 0.5, default: 4, unit: "kΩ" },
    { key: "C", label: "Capacitance", min: 100, max: 1000, step: 50, default: 500, unit: "μF" },
  ],
  init: () => ({ t: 0, vc: 0 }),
  step: (s, dt, p) => { const tau = p.R * p.C / 1000; s.vc += ((p.voltage - s.vc) / tau) * dt; s.t += dt; if (s.t > 6 * tau) { s.t = 0; s.vc = 0; } },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; const frac = s.vc / p.voltage;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 160, cy - 12, 8, 24);
    ctx.fillStyle = "#dbeafe"; ctx.fillRect(cx - 40, cy - 12, 60, 24); ctx.strokeRect(cx - 40, cy - 12, 60, 24);
    // capacitor plates fill
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx + 120, cy - 40, 8, 80); ctx.fillRect(cx + 140, cy - 40, 8, 80);
    ctx.fillStyle = "#f59e0b"; ctx.fillRect(cx + 130, cy + 40 - 80 * frac, 8, 80 * frac);
    ctx.fillStyle = "#334155"; ctx.font = "600 13px 'Source Code Pro'"; ctx.fillText("Vc = " + r2(s.vc) + " V", cx - 40, cy - 30);
  },
  graphPoint: (s) => ({ t: r2(s.t), vc: r2(s.vc) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vc", label: "Capacitor voltage (V)", color: "#f59e0b" }],
  stats: (s, p) => { const tau = p.R * p.C / 1000; return [
    { label: "Time constant τ", value: r2(tau), unit: "s" }, { label: "Vc now", value: r2(s.vc), unit: "V" },
    { label: "Current", value: r2((p.voltage - s.vc) / p.R), unit: "mA" }, { label: "% charged", value: r2(100 * s.vc / p.voltage), unit: "%" }]; },
};

const kirchhoff = {
  title: "Kirchhoff's Laws Lab", topic: "electricity", difficulty: "Intermediate",
  summary: "Simulate a two-loop circuit and verify Kirchhoff's Junction and Loop rules.",
  equation: "\\sum I_{\\text{in}} = \\sum I_{\\text{out}} \\qquad \\sum V_{\\text{loop}} = 0",
  params: [
    { key: "v1", label: "Voltage V1", min: 5, max: 20, step: 1, default: 12, unit: "V" },
    { key: "v2", label: "Voltage V2", min: 5, max: 20, step: 1, default: 6, unit: "V" },
    { key: "r1", label: "Resistor R1", min: 2, max: 10, step: 1, default: 4, unit: "Ω" },
    { key: "r2", label: "Resistor R2", min: 2, max: 10, step: 1, default: 6, unit: "Ω" },
    { key: "r3", label: "Resistor R3", min: 2, max: 10, step: 1, default: 8, unit: "Ω" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    
    // Draw wire frames
    ctx.strokeRect(cx - 150, cy - 70, 150, 140);
    ctx.strokeRect(cx, cy - 70, 150, 140);
    
    // Draw left battery V1
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - 154, cy - 15, 8, 30);
    ctx.strokeStyle = "#334155"; ctx.strokeRect(cx - 154, cy - 15, 8, 30);
    ctx.fillStyle = "#1e293b"; ctx.font = "bold 10px sans-serif";
    ctx.fillText("V1 = " + p.v1 + "V", cx - 146, cy + 4);
    
    // Draw right battery V2
    ctx.fillStyle = "#fff"; ctx.fillRect(cx + 146, cy - 15, 8, 30);
    ctx.strokeStyle = "#334155"; ctx.strokeRect(cx + 146, cy - 15, 8, 30);
    ctx.fillText("V2 = " + p.v2 + "V", cx + 105, cy + 4);
    
    const rbox = (x, y, label) => {
      ctx.fillStyle = "#ffe4e6"; ctx.fillRect(x - 20, y - 8, 40, 16);
      ctx.strokeStyle = "#e11d48"; ctx.strokeRect(x - 20, y - 8, 40, 16);
      ctx.fillStyle = "#be123c"; ctx.font = "600 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, x, y + 4); ctx.textAlign = "left";
    };
    rbox(cx - 75, cy - 70, p.r1 + "Ω");
    rbox(cx + 75, cy - 70, p.r2 + "Ω");
    rbox(cx, cy, p.r3 + "Ω");
    
    // Draw Junction A
    circle(ctx, cx, cy - 70, 5, "#ef4444");
    ctx.fillStyle = "#ef4444"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("A", cx - 4, cy - 78);
  },
  graphPoint: (s, p) => {
    const denom = p.r1 * p.r2 + p.r1 * p.r3 + p.r2 * p.r3;
    const i1 = (p.v1 * (p.r2 + p.r3) - p.v2 * p.r3) / denom;
    return { t: r2(s.t), i1: r2(i1) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "i1", label: "Current I1 (A)", color: "#2563eb" }],
  stats: (s, p) => {
    const denom = p.r1 * p.r2 + p.r1 * p.r3 + p.r2 * p.r3;
    const i1 = (p.v1 * (p.r2 + p.r3) - p.v2 * p.r3) / denom;
    const i2 = (p.v2 * (p.r1 + p.r3) - p.v1 * p.r3) / denom;
    const i3 = i1 + i2;
    return [
      { label: "Current I1", value: r2(i1), unit: "A" },
      { label: "Current I2", value: r2(i2), unit: "A" },
      { label: "Current I3 (Middle)", value: r2(i3), unit: "A" },
      { label: "Junction A check", value: r2(i1) + " + " + r2(i2) + " = " + r2(i3), unit: "" }
    ];
  }
};

const capacitorcharging = {
  title: "Capacitor Charging Lab", topic: "electricity", difficulty: "Intermediate",
  summary: "Simulate a capacitor charging through a resistor and observe positive/negative charge build-up on the plates.",
  equation: "q(t) = C V_0 (1 - e^{-t/RC})",
  params: [
    { key: "voltage", label: "Source Voltage", min: 5, max: 20, step: 1, default: 10, unit: "V" },
    { key: "R", label: "Resistor (R)", min: 1, max: 10, step: 0.5, default: 5, unit: "kΩ" },
    { key: "C", label: "Capacitor (C)", min: 100, max: 1000, step: 50, default: 500, unit: "μF" },
  ],
  init: () => ({ t: 0, vc: 0, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    const tau = p.R * p.C / 1000;
    s.vc += ((p.voltage - s.vc) / tau) * dt;
    s.t += dt;
    if (s.vc >= p.voltage * 0.99) {
      s.vc = p.voltage;
      s.running = false;
    }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    const frac = s.vc / p.voltage;
    
    // Draw wire frame
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    ctx.strokeRect(cx - 150, cy - 60, 300, 120);
    
    // Draw Resistor Box
    ctx.fillStyle = "#ffedd5"; ctx.fillRect(cx - 30, cy - 68, 60, 16);
    ctx.strokeStyle = "#f97316"; ctx.strokeRect(cx - 30, cy - 68, 60, 16);
    ctx.fillStyle = "#ea580c"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(p.R + " kΩ", cx, cy - 56);
    
    // Draw Capacitor Parallel Plates
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - 10, cy + 30, 20, 60);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx - 6, cy + 30, 4, 60);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx + 2, cy + 30, 4, 60);
    
    // Draw electric charges
    ctx.fillStyle = "#ef4444"; ctx.font = "bold 10px sans-serif";
    const numCharges = Math.floor(frac * 6);
    for (let i = 0; i < numCharges; i++) {
      ctx.fillText("+", cx - 18, cy + 38 + i * 9);
      ctx.fillStyle = "#2563eb";
      ctx.fillText("-", cx + 12, cy + 38 + i * 9);
      ctx.fillStyle = "#ef4444";
    }
    ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), q: r2(p.C * s.vc) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "q", label: "Charge q (μC)", color: "#3b82f6" }],
  stats: (s, p) => {
    const tau = p.R * p.C / 1000;
    return [
      { label: "Time Constant τ", value: r2(tau), unit: "s" },
      { label: "Voltage Vc", value: r2(s.vc), unit: "V" },
      { label: "Stored Charge (q)", value: r2(p.C * s.vc), unit: "μC" },
      { label: "Charge Percentage", value: r2(100 * s.vc / p.voltage), unit: "%" }
    ];
  }
};

const rccircuit = {
  title: "RC Circuit Dynamics", topic: "electricity", difficulty: "Advanced",
  summary: "Select charging or discharging mode to observe the transient responses of an RC circuit.",
  equation: "V_C(t) = V_0(1 - e^{-t/RC}) \\quad \\text{or} \\quad V_0 e^{-t/RC}",
  params: [
    { key: "mode", label: "Circuit Mode", type: "select", options: ["Charging", "Discharging"], default: "Charging" },
    { key: "voltage", label: "Source V0", min: 5, max: 20, step: 1, default: 10, unit: "V" },
    { key: "R", label: "Resistor (R)", min: 1, max: 10, step: 0.5, default: 4, unit: "kΩ" },
    { key: "C", label: "Capacitor (C)", min: 100, max: 1000, step: 50, default: 500, unit: "μF" },
  ],
  init: (p) => ({ t: 0, vc: p.mode === "Charging" ? 0 : p.voltage, running: true }),
  step: (s, dt, p) => {
    if (!s.running) return;
    const tau = p.R * p.C / 1000;
    s.t += dt;
    if (p.mode === "Charging") {
      s.vc += ((p.voltage - s.vc) / tau) * dt;
      if (s.vc >= p.voltage * 0.99) { s.vc = p.voltage; s.running = false; }
    } else {
      s.vc -= (s.vc / tau) * dt;
      if (s.vc <= p.voltage * 0.01) { s.vc = 0; s.running = false; }
    }
  },
  done: (s) => !s.running,
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
    ctx.strokeRect(cx - 150, cy - 60, 300, 120);
    
    // Battery
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 154, cy - 14, 8, 28);
    
    // Capacitor plates
    ctx.fillStyle = "#fff"; ctx.fillRect(cx + 110, cy + 30, 20, 60);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx + 112, cy + 30, 4, 60);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx + 124, cy + 30, 4, 60);
    
    // Resistor
    ctx.fillStyle = "#ffedd5"; ctx.fillRect(cx - 30, cy - 68, 60, 16);
    ctx.strokeStyle = "#f97316"; ctx.strokeRect(cx - 30, cy - 68, 60, 16);
    ctx.fillStyle = "#ea580c"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(p.R + " kΩ", cx, cy - 56);
    ctx.textAlign = "left";
    
    // Display current state
    ctx.fillStyle = "#1e293b"; ctx.font = "bold 13px sans-serif";
    ctx.fillText("Vc = " + r2(s.vc) + " V", cx - 40, cy + 10);
  },
  graphPoint: (s) => ({ t: r2(s.t), vc: r2(s.vc) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "vc", label: "Capacitor Voltage Vc (V)", color: "#ea580c" }],
  stats: (s, p) => {
    const tau = p.R * p.C / 1000;
    return [
      { label: "Time Constant τ", value: r2(tau), unit: "s" },
      { label: "Capacitor Voltage", value: r2(s.vc), unit: "V" },
      { label: "Current (mA)", value: r2(Math.abs(p.voltage - s.vc) / p.R), unit: "mA" }
    ];
  }
};

const barmagnet = {
  title: "Bar Magnet Field", topic: "magnetism", difficulty: "Beginner",
  summary: "Explore a bar magnet's dipole field and watch a compass align with the local field.",
  equation: "\\vec{B} \\text{ points N} \\rightarrow \\text{S outside the magnet}",
  params: [
    { key: "cx", label: "Compass X", min: -6, max: 6, step: 0.5, default: 3, unit: "" },
    { key: "cy", label: "Compass Y", min: -4, max: 4, step: 0.5, default: 2, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "#ef4444"; ctx.fillRect(cx - 70, cy - 20, 70, 40);
    ctx.fillStyle = "#2563eb"; ctx.fillRect(cx, cy - 20, 70, 40);
    ctx.fillStyle = "#fff"; ctx.font = "700 16px Outfit"; ctx.textAlign = "center";
    ctx.fillText("N", cx - 35, cy + 6); ctx.fillText("S", cx + 35, cy + 6); ctx.textAlign = "left";
    // dipole field lines (approx arcs)
    ctx.strokeStyle = "rgba(37,99,235,.35)"; ctx.lineWidth = 1.5;
    [30, 60, 95].forEach((r) => { ctx.beginPath(); ctx.ellipse(cx, cy, 70 + r, r, 0, 0, Math.PI * 2); ctx.stroke(); });
    // compass
    const px = cx + p.cx * 26, py = cy - p.cy * 26;
    const N = (dx, dy) => { const d = Math.max(15, Math.hypot(dx, dy)); return [dx / d, dy / d]; };
    const [bx, by] = N(px - (cx - 35), py - cy); // rough field dir from N pole
    const ang = Math.atan2(by, bx);
    circle(ctx, px, py, 14, "rgba(255,255,255,.9)", "#334155");
    arrow(ctx, px - 12 * Math.cos(ang), py - 12 * Math.sin(ang), px + 12 * Math.cos(ang), py + 12 * Math.sin(ang), "#ef4444", 2.5);
  },
  graphPoint: (s, p) => ({ t: r2(s.t), r: r2(Math.hypot(p.cx, p.cy)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "r", label: "Compass distance", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Compass X", value: p.cx, unit: "" }, { label: "Compass Y", value: p.cy, unit: "" },
    { label: "Distance", value: r2(Math.hypot(p.cx, p.cy)), unit: "" }, { label: "Field ∝", value: "1/r³", unit: "" }],
};

const chargeinB = {
  title: "Charge in Magnetic Field", topic: "magnetism", difficulty: "Advanced",
  summary: "A moving charge curves in a magnetic field — see circular motion and the Lorentz force.",
  equation: "r = \\frac{mv}{qB}, \\quad T = \\frac{2\\pi m}{qB}",
  params: [
    { key: "v", label: "Speed", min: 1, max: 8, step: 0.5, default: 4, unit: "" },
    { key: "B", label: "Field strength", min: 0.5, max: 5, step: 0.25, default: 2, unit: "T" },
    { key: "q", label: "Charge", min: 0.5, max: 3, step: 0.25, default: 1, unit: "" },
    { key: "mass", label: "Mass", min: 0.5, max: 3, step: 0.25, default: 1, unit: "" },
  ],
  init: (p) => ({ x: 0, y: 0, vx: p.v * 30, vy: 0, t: 0, trail: [] }),
  step: (s, dt, p) => {
    const w = (p.q * p.B) / p.mass * 1.2;
    const nvx = s.vx + w * s.vy * dt, nvy = s.vy - w * s.vx * dt;
    s.vx = nvx; s.vy = nvy; s.x += s.vx * dt; s.y += s.vy * dt; s.t += dt;
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 600) s.trail.shift();
  },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "rgba(16,185,129,.06)"; ctx.fillRect(0, 0, W, H);
    for (let gx = 50; gx < W; gx += 60) for (let gy = 50; gy < H; gy += 60) { circle(ctx, gx, gy, 2.5, "#10b981"); }
    ctx.strokeStyle = "rgba(37,99,235,.5)"; ctx.lineWidth = 2; ctx.beginPath();
    s.trail.forEach((t, i) => { const sx = cx + t.x, sy = cy + t.y; i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }); ctx.stroke();
    circle(ctx, cx + s.x, cy + s.y, 8, "#ef4444", "#7f1d1d");
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText("× B into page", 16, 24);
  },
  graphPoint: (s) => ({ t: r2(s.t), y: r2(s.y) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "y", label: "Y position", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Radius r", value: r2((p.mass * p.v) / (p.q * p.B) * 15), unit: "" }, { label: "Period T", value: r2((2 * Math.PI * p.mass) / (p.q * p.B)), unit: "s" },
    { label: "Frequency", value: r2((p.q * p.B) / (2 * Math.PI * p.mass)), unit: "Hz" }, { label: "Speed", value: p.v, unit: "" }],
};

const wireB = {
  title: "Solenoid Field", topic: "magnetism", difficulty: "Intermediate",
  summary: "Push current through a solenoid and see the uniform magnetic field it creates inside.",
  equation: "B = \\mu_0 n I",
  params: [
    { key: "current", label: "Current", min: 0, max: 10, step: 0.5, default: 5, unit: "A" },
    { key: "turns", label: "Turns/length", min: 1, max: 20, step: 1, default: 10, unit: "n" },
  ],
  init: () => ({ t: 0, ph: 0 }),
  step: (s, dt, p) => { s.t += dt; s.ph += p.current * dt * 0.6; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, len = 340, coils = Math.round(p.turns);
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3;
    for (let i = 0; i < coils; i++) { const x = cx - len / 2 + (i + 0.5) * len / coils; ctx.beginPath(); ctx.ellipse(x, cy, 8, 46, 0, 0, Math.PI * 2); ctx.stroke(); }
    // internal field arrows
    const strength = Math.min(1, (p.current * p.turns) / 120);
    for (let k = 0; k < 5; k++) { const yy = cy - 30 + k * 15; arrow(ctx, cx - len / 2 + 20, yy, cx + len / 2 - 20, yy, `rgba(37,99,235,${0.2 + strength * 0.7})`, 2); }
  },
  graphPoint: (s, p) => ({ t: r2(s.t), B: r2(p.current * p.turns) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "B", label: "Field B (relative)", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Field B ∝ nI", value: r2(p.current * p.turns), unit: "" }, { label: "Current", value: p.current, unit: "A" },
    { label: "Turns/length", value: p.turns, unit: "n" }, { label: "Inside field", value: "uniform", unit: "" }],
};

const induction = {
  title: "Electromagnetic Induction", topic: "magnetism", difficulty: "Advanced",
  summary: "Move a magnet in and out of a coil and watch Faraday's law generate an EMF.",
  equation: "\\varepsilon = -N\\frac{d\\Phi}{dt}",
  params: [
    { key: "speed", label: "Magnet speed", min: 0.5, max: 4, step: 0.25, default: 2, unit: "" },
    { key: "strength", label: "Magnet strength", min: 1, max: 6, step: 0.5, default: 3, unit: "" },
    { key: "turns", label: "Coil turns (N)", min: 5, max: 40, step: 1, default: 20, unit: "" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2; const mx = cx + Math.sin(s.t * p.speed) * 130;
    // coil
    for (let i = 0; i < 6; i++) { const x = cx - 40 + i * 16; ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, cy, 6, 44, 0, 0, Math.PI * 2); ctx.stroke(); }
    // magnet
    ctx.fillStyle = "#ef4444"; ctx.fillRect(mx - 40, cy - 14, 40, 28); ctx.fillStyle = "#2563eb"; ctx.fillRect(mx, cy - 14, 40, 28);
    const emf = -p.turns * p.strength * p.speed * Math.cos(s.t * p.speed) * 0.05;
    ctx.fillStyle = emf > 0 ? "#10b981" : "#ef4444"; ctx.font = "700 15px Outfit"; ctx.textAlign = "center";
    ctx.fillText("EMF = " + r2(emf) + " V", cx, 40); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), emf: r2(-p.turns * p.strength * p.speed * Math.cos(s.t * p.speed) * 0.05) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "emf", label: "Induced EMF (V)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Peak EMF", value: r2(p.turns * p.strength * p.speed * 0.05), unit: "V" }, { label: "Coil turns", value: p.turns, unit: "" },
    { label: "Magnet speed", value: p.speed, unit: "" }, { label: "Law", value: "Faraday–Lenz", unit: "" }],
};

const generator = {
  title: "AC Generator", topic: "magnetism", difficulty: "Advanced",
  summary: "Spin a coil in a magnetic field and generate a sinusoidal alternating EMF.",
  equation: "\\varepsilon = NBA\\omega\\sin(\\omega t)",
  params: [
    { key: "rpm", label: "Rotation speed", min: 0.5, max: 5, step: 0.25, default: 2, unit: "" },
    { key: "B", label: "Field strength", min: 1, max: 6, step: 0.5, default: 3, unit: "T" },
    { key: "turns", label: "Coil turns", min: 5, max: 40, step: 1, default: 20, unit: "" },
  ],
  init: () => ({ th: 0, t: 0 }),
  step: (s, dt, p) => { s.th += p.rpm * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2;
    ctx.fillStyle = "#fca5a5"; ctx.fillRect(cx - 150, cy - 70, 20, 140); ctx.fillStyle = "#93c5fd"; ctx.fillRect(cx + 130, cy - 70, 20, 140);
    ctx.fillStyle = "#334155"; ctx.font = "700 14px Outfit"; ctx.fillText("N", cx - 146, cy); ctx.fillText("S", cx + 136, cy);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.th);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.strokeRect(-70, -34, 140, 68); ctx.restore();
    const emf = p.turns * p.B * p.rpm * Math.sin(s.th) * 0.1;
    ctx.fillStyle = "#334155"; ctx.font = "600 13px 'Source Code Pro'"; ctx.textAlign = "center"; ctx.fillText("EMF = " + r2(emf) + " V", cx, cy + 100); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), emf: r2(p.turns * p.B * p.rpm * Math.sin(s.th) * 0.1) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "emf", label: "Output EMF (V)", color: "#f59e0b" }],
  stats: (s, p) => [
    { label: "Peak EMF", value: r2(p.turns * p.B * p.rpm * 0.1), unit: "V" }, { label: "Frequency", value: r2(p.rpm / (2 * Math.PI)), unit: "Hz" },
    { label: "Field", value: p.B, unit: "T" }, { label: "Output", value: "AC sine", unit: "" }],
};

const simsEM = { charges, capacitor, ohms, seriesparallel, rc, kirchhoff, capacitorcharging, rccircuit, barmagnet, chargeinB, wireB, induction, generator };
export default simsEM;
