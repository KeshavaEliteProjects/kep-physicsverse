// Extra Mechanics simulations. SimEngine-compatible configs.
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

/* ================= 1. PHYSICAL QUANTITIES ================= */
const physicalQuantities = {
  title: "Physical Quantities",
  topic: "mechanics",
  difficulty: "Beginner",
  summary:
    "Explore fundamental vs derived physical quantities and interactively see how every measurement is a numerical value multiplied by a unit (Q = n · [u]).",
  equation: "Q = n \\cdot [u]",
  params: [
    {
      key: "qty",
      label: "Quantity Type (1-9)",
      min: 1,
      max: 9,
      step: 1,
      default: 1,
      unit: "",
    },
    {
      key: "val1",
      label: "Primary Magnitude (n₁)",
      min: 1,
      max: 50,
      step: 0.5,
      default: 5,
      unit: "",
    },
    {
      key: "val2",
      label: "Secondary Parameter (n₂)",
      min: 1,
      max: 20,
      step: 0.5,
      default: 2,
      unit: "",
    },
  ],
  init: () => ({ t: 0, scanPos: 0, pulse: 0, carX: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.scanPos = (s.scanPos + dt * 1.5) % 1;
    s.pulse = (s.pulse + dt * 4) % (Math.PI * 2);
    s.carX = (s.carX + dt * 50) % 460;
  },
  draw: (ctx, s, p, W, H) => {
    const q = Math.max(1, Math.min(9, Math.round(p.qty || 1)));
    const v1 = Math.max(0.5, p.val1 || 5);
    const v2 = Math.max(0.5, p.val2 || 2);
    const round2 = (x) => Math.round(x * 100) / 100;

    const META = {
      1: {
        name: "Length",
        type: "Fundamental",
        symbol: "L",
        unit: "m",
        base: "metre",
        dim: "[L]",
        n: v1,
        calc: "Direct Measurement",
      },
      2: {
        name: "Mass",
        type: "Fundamental",
        symbol: "M",
        unit: "kg",
        base: "kilogram",
        dim: "[M]",
        n: v1,
        calc: "Direct Measurement",
      },
      3: {
        name: "Time",
        type: "Fundamental",
        symbol: "T",
        unit: "s",
        base: "second",
        dim: "[T]",
        n: v1,
        calc: "Direct Measurement",
      },
      4: {
        name: "Temperature",
        type: "Fundamental",
        symbol: "Θ",
        unit: "K",
        base: "kelvin",
        dim: "[K]",
        n: v1 * 10 + 250,
        calc: "Direct Measurement",
      },
      5: {
        name: "Speed",
        type: "Derived",
        symbol: "v",
        unit: "m/s",
        base: "m·s⁻¹",
        dim: "[L T⁻¹]",
        n: round2(v1 / v2),
        formula: `v = d/t = ${v1}m / ${v2}s`,
      },
      6: {
        name: "Force",
        type: "Derived",
        symbol: "F",
        unit: "N",
        base: "kg·m·s⁻²",
        dim: "[M L T⁻²]",
        n: round2(v1 * v2),
        formula: `F = m × a = ${v1}kg × ${v2}m/s²`,
      },
      7: {
        name: "Area",
        type: "Derived",
        symbol: "A",
        unit: "m²",
        base: "m²",
        dim: "[L²]",
        n: round2(v1 * v2),
        formula: `A = l × w = ${v1}m × ${v2}m`,
      },
      8: {
        name: "Volume",
        type: "Derived",
        symbol: "V",
        unit: "m³",
        base: "m³",
        dim: "[L³]",
        n: round2(v1 * v1 * v2),
        formula: `V = l × w × h = ${v1}m × ${v1}m × ${v2}m`,
      },
      9: {
        name: "Density",
        type: "Derived",
        symbol: "ρ",
        unit: "kg/m³",
        base: "kg·m⁻³",
        dim: "[M L⁻³]",
        n: round2(v1 / v2),
        formula: `ρ = m/V = ${v1}kg / ${v2}m³`,
      },
    };
    const info = META[q];
    const isFund = info.type === "Fundamental";

    const tabLabels = [
      "1.Length",
      "2.Mass",
      "3.Time",
      "4.Temp",
      "5.Speed",
      "6.Force",
      "7.Area",
      "8.Volume",
      "9.Density",
    ];
    const tabW = 74,
      tabH = 26,
      tabY = 8,
      startX = 26;
    tabLabels.forEach((label, idx) => {
      const tx = startX + idx * (tabW + 5);
      const active = idx + 1 === q;
      ctx.fillStyle = active ? (isFund ? "#2563eb" : "#f59e0b") : "#ffffff";
      ctx.strokeStyle = active ? (isFund ? "#1d4ed8" : "#d97706") : "#cbd5e1";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(tx, tabY, tabW, tabH, 6)
        : ctx.rect(tx, tabY, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#ffffff" : "#475569";
      ctx.font = active
        ? "600 11px Outfit, sans-serif"
        : "500 11px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, tx + tabW / 2, tabY + 17);
    });

    const bannerY = 40,
      bannerH = 56;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(26, bannerY, W - 52, bannerH, 8)
      : ctx.rect(26, bannerY, W - 52, bannerH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isFund ? "#ecfdf5" : "#fffbeb";
    ctx.strokeStyle = isFund ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(38, bannerY + 8, 160, 20, 5)
      : ctx.rect(38, bannerY + 8, 160, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isFund ? "#047857" : "#b45309";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      isFund ? "● FUNDAMENTAL QUANTITY" : "● DERIVED QUANTITY",
      38 + 80,
      bannerY + 22
    );

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(38, bannerY + 30, 160, 18, 4)
      : ctx.rect(38, bannerY + 30, 160, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "600 10px 'Source Code Pro', monospace";
    ctx.fillText(`Dim: ${info.dim}`, 38 + 80, bannerY + 43);

    const eqX = 215,
      eqY = bannerY + 9;
    ctx.fillStyle = "#dbeafe";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(eqX, eqY, 115, 38, 6)
      : ctx.rect(eqX, eqY, 115, 38);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`n = ${info.n}`, eqX + 57, eqY + 18);
    ctx.font = "500 9px Outfit, sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("Numerical Value", eqX + 57, eqY + 31);

    ctx.fillStyle = "#64748b";
    ctx.font = "700 18px Outfit, sans-serif";
    ctx.fillText("×", eqX + 130, eqY + 24);

    ctx.fillStyle = "#dcfce7";
    ctx.strokeStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(eqX + 145, eqY, 100, 38, 6)
      : ctx.rect(eqX + 145, eqY, 100, 38);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#065f46";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.fillText(`[ ${info.unit} ]`, eqX + 145 + 50, eqY + 18);
    ctx.font = "500 9px Outfit, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText("Unit of Measure", eqX + 145 + 50, eqY + 31);

    ctx.fillStyle = "#64748b";
    ctx.font = "700 18px Outfit, sans-serif";
    ctx.fillText("=", eqX + 260, eqY + 24);

    ctx.fillStyle = isFund ? "#ede9fe" : "#fef3c7";
    ctx.strokeStyle = isFund ? "#8b5cf6" : "#f59e0b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(eqX + 276, eqY, 205, 38, 6)
      : ctx.rect(eqX + 276, eqY, 205, 38);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isFund ? "#5b21b6" : "#92400e";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.fillText(`Q = ${info.n} ${info.unit}`, eqX + 276 + 102, eqY + 18);
    ctx.font = "500 9px Outfit, sans-serif";
    ctx.fillStyle = isFund ? "#6d28d9" : "#b45309";
    ctx.fillText(`Physical Quantity (${info.name})`, eqX + 276 + 102, eqY + 31);

    const stageY = 104,
      stageH = 294;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(26, stageY, W - 52, stageH, 8)
      : ctx.rect(26, stageY, W - 52, stageH);
    ctx.fill();
    ctx.stroke();

    if (q === 1) {
      const benchY = stageY + 180,
        sc = Math.min(14, (W - 180) / Math.max(v1, 10));
      const lenPx = v1 * sc;
      ctx.fillStyle = "#334155";
      ctx.fillRect(50, benchY - 32, 44, 32);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(90, benchY - 22, 10, 12);
      ctx.strokeStyle = "rgba(239,68,68,0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(100, benchY - 16);
      ctx.lineTo(100 + lenPx, benchY - 16);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(100 + lenPx, benchY - 48, 16, 48);
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.fillRect(100, benchY, Math.max(lenPx + 40, 320), 34);
      ctx.strokeRect(100, benchY, Math.max(lenPx + 40, 320), 34);
      ctx.fillStyle = "#475569";
      ctx.font = "500 10px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      for (let m = 0; m <= Math.ceil(v1) + 2; m++) {
        const tx = 100 + m * sc;
        if (tx > W - 50) break;
        ctx.beginPath();
        ctx.moveTo(tx, benchY);
        ctx.lineTo(tx, benchY + (m % 5 === 0 ? 16 : 9));
        ctx.stroke();
        if (m % 2 === 0 || sc > 15) ctx.fillText(`${m}m`, tx, benchY + 27);
      }
      arrow(ctx, 100, benchY - 65, 100 + lenPx, benchY - 65, "#2563eb", 2);
      arrow(ctx, 100 + lenPx, benchY - 65, 100, benchY - 65, "#2563eb", 2);
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.fillText(
        `Measured Distance: L = ${v1} m`,
        100 + lenPx / 2,
        benchY - 76
      );
    } else if (q === 2) {
      const fulX = W / 2,
        fulY = stageY + 210,
        beamL = 180;
      const bob = Math.sin(s.t * 3) * 2.5;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(fulX, fulY - 70);
      ctx.lineTo(fulX - 28, fulY);
      ctx.lineTo(fulX + 28, fulY);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(fulX - 55, fulY, 110, 12);
      ctx.save();
      ctx.translate(fulX, fulY - 70);
      ctx.rotate((bob * Math.PI) / 180);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-beamL, 0);
      ctx.lineTo(beamL, 0);
      ctx.stroke();
      const panY = 75;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-beamL, 0);
      ctx.lineTo(-beamL - 28, panY);
      ctx.lineTo(-beamL + 28, panY);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(-beamL - 22, panY - 38, 44, 38);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 12px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${v1}kg`, -beamL, panY - 15);
      ctx.beginPath();
      ctx.moveTo(beamL, 0);
      ctx.lineTo(beamL - 28, panY);
      ctx.lineTo(beamL + 28, panY);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(beamL - 22, panY - 34, 44, 34);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 12px 'Source Code Pro', monospace";
      ctx.fillText(`${v1}×1kg`, beamL, panY - 14);
      ctx.restore();
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Calibrated Analytical Balance: M = ${v1} kg`, fulX, stageY + 34);
    } else if (q === 3) {
      const cx = W / 2,
        cy = stageY + 130,
        R = 68;
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let sec = 0; sec < 12; sec++) {
        const ang = (sec * Math.PI) / 6;
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = sec % 3 === 0 ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.sin(ang) * (R - 9), cy - Math.cos(ang) * (R - 9));
        ctx.lineTo(cx + Math.sin(ang) * R, cy - Math.cos(ang) * R);
        ctx.stroke();
      }
      const handAng = ((s.t % 60) * Math.PI * 2) / 60;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.sin(handAng) * (R - 15),
        cy - Math.cos(handAng) * (R - 15)
      );
      ctx.stroke();
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(cx - 75, cy + 84, 150, 34);
      ctx.fillStyle = "#10b981";
      ctx.font = "700 17px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`00:${v1 < 10 ? "0" : ""}${v1}.00 s`, cx, cy + 107);
    } else if (q === 4) {
      const thermX = 130,
        thermY = stageY + 40,
        thermH = 190;
      const tVal = v1 * 10 + 250;
      const fillH = Math.min(
        thermH - 35,
        ((tVal - 200) / 600) * (thermH - 35)
      );
      ctx.fillStyle = "#f1f5f9";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.fillRect(thermX, thermY, 22, thermH);
      ctx.strokeRect(thermX, thermY, 22, thermH);
      ctx.beginPath();
      ctx.arc(thermX + 11, thermY + thermH + 11, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(thermX + 4, thermY + thermH - fillH, 14, fillH);
      const chX = 250,
        chY = stageY + 40,
        chW = 440,
        chH = 190;
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.fillRect(chX, chY, chW, chH);
      ctx.strokeRect(chX, chY, chW, chH);
      ctx.fillStyle = "#475569";
      ctx.font = "600 12px Outfit, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        "Molecular Kinetic Energy Chamber (v_rms ∝ √T)",
        chX + 14,
        chY + 24
      );
      for (let i = 0; i < 24; i++) {
        const mx =
          chX + 30 + ((i * 37 + s.t * (30 + v1 * 4)) % (chW - 60));
        const my =
          chY +
          45 +
          ((i * 29 + Math.sin(s.t * (2 + i * 0.5)) * 25) % (chH - 80));
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `T = ${tVal} K  (${round2(tVal - 273.15)} °C)`,
        chX + chW / 2,
        chY + chH - 16
      );
    } else if (q === 5) {
      const trackY = stageY + 180,
        trkW = W - 140;
      const speed = round2(v1 / v2);
      ctx.fillStyle = "#334155";
      ctx.fillRect(70, trackY, trkW, 36);
      ctx.strokeStyle = "#e2e8f0";
      ctx.setLineDash([12, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(70, trackY + 18);
      ctx.lineTo(70 + trkW, trackY + 18);
      ctx.stroke();
      ctx.setLineDash([]);
      const carPx = 70 + ((s.carX * (speed / 5)) % (trkW - 60));
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(carPx, trackY - 20, 52, 22);
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(carPx + 12, trackY + 2, 7, 0, Math.PI * 2);
      ctx.arc(carPx + 40, trackY + 2, 7, 0, Math.PI * 2);
      ctx.fill();
      arrow(
        ctx,
        carPx + 52,
        trackY - 9,
        carPx + 52 + Math.min(65, speed * 4.5),
        trackY - 9,
        "#f59e0b",
        3
      );
      ctx.fillStyle = "#eff6ff";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(140, stageY + 25, W - 280, 58, 8)
        : ctx.rect(140, stageY + 25, W - 280, 58);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `v = distance / time = (${v1} m) ÷ (${v2} s) = ${speed} m/s`,
        W / 2,
        stageY + 52
      );
      ctx.font = "500 11px Outfit, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(
        "Derived Unit: metre per second (m/s)  •  Dimension: [L T⁻¹]",
        W / 2,
        stageY + 70
      );
    } else if (q === 6) {
      const floorY = stageY + 190,
        blockX = 170,
        blockSz = 56;
      const force = round2(v1 * v2);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, floorY);
      ctx.lineTo(W - 60, floorY);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(blockX, floorY - blockSz, blockSz, blockSz);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 13px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`m=${v1}kg`, blockX + blockSz / 2, floorY - blockSz / 2 + 5);
      const dynX = blockX + blockSz,
        dynL = 130;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dynX, floorY - blockSz / 2);
      for (let i = 0; i <= 8; i++) {
        const cx = dynX + (dynL / 8) * i,
          cy = floorY - blockSz / 2 + (i % 2 === 0 ? -9 : 9);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(dynX + dynL, floorY - blockSz / 2);
      ctx.stroke();
      arrow(
        ctx,
        dynX + dynL,
        floorY - blockSz / 2,
        dynX + dynL + 75,
        floorY - blockSz / 2,
        "#ef4444",
        3.5
      );
      ctx.fillStyle = "#ef4444";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        `F = ${force} N`,
        dynX + dynL + 14,
        floorY - blockSz / 2 - 14
      );
      ctx.fillStyle = "#eff6ff";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(140, stageY + 25, W - 280, 58, 8)
        : ctx.rect(140, stageY + 25, W - 280, 58);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `F = mass × acceleration = (${v1} kg) × (${v2} m/s²) = ${force} N`,
        W / 2,
        stageY + 52
      );
      ctx.font = "500 11px Outfit, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(
        "1 Newton = 1 kg·m/s²  •  Dimension: [M L T⁻²]",
        W / 2,
        stageY + 70
      );
    } else if (q === 7) {
      const lClamped = Math.min(v1, 12),
        wClamped = Math.min(v2, 8);
      const cellSz = 24,
        gridW = lClamped * cellSz,
        gridH = wClamped * cellSz;
      const ox = (W - gridW) / 2,
        oy = stageY + 95;
      for (let r = 0; r < wClamped; r++) {
        for (let c = 0; c < lClamped; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#dbeafe" : "#bfdbfe";
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 1;
          ctx.fillRect(ox + c * cellSz, oy + r * cellSz, cellSz, cellSz);
          ctx.strokeRect(ox + c * cellSz, oy + r * cellSz, cellSz, cellSz);
        }
      }
      arrow(ctx, ox, oy - 14, ox + gridW, oy - 14, "#2563eb", 2);
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 12px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Length = ${v1} m`, ox + gridW / 2, oy - 22);
      arrow(ctx, ox - 14, oy, ox - 14, oy + gridH, "#2563eb", 2);
      ctx.save();
      ctx.translate(ox - 24, oy + gridH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`Width = ${v2} m`, 0, 0);
      ctx.restore();
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.fillText(
        `Area = Length × Width = (${v1} m) × (${v2} m) = ${round2(
          v1 * v2
        )} m²`,
        W / 2,
        stageY + 38
      );
    } else if (q === 8) {
      const cx = W / 2,
        cy = stageY + 165,
        sz = Math.min(65, 28 + v1 * 3);
      const vol = round2(v1 * v1 * v2);
      ctx.strokeStyle = "#2563eb";
      ctx.fillStyle = "rgba(37,99,235,0.15)";
      ctx.lineWidth = 2;
      ctx.fillRect(cx - sz, cy - sz, sz * 2, sz * 2);
      ctx.strokeRect(cx - sz, cy - sz, sz * 2, sz * 2);
      ctx.beginPath();
      ctx.moveTo(cx - sz, cy - sz);
      ctx.lineTo(cx - sz + 42, cy - sz - 32);
      ctx.lineTo(cx + sz + 42, cy - sz - 32);
      ctx.lineTo(cx + sz, cy - sz);
      ctx.closePath();
      ctx.fillStyle = "rgba(59,130,246,0.25)";
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + sz, cy - sz);
      ctx.lineTo(cx + sz + 42, cy - sz - 32);
      ctx.lineTo(cx + sz + 42, cy + sz - 32);
      ctx.lineTo(cx + sz, cy + sz);
      ctx.closePath();
      ctx.fillStyle = "rgba(29,78,216,0.2)";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1e40af";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `Volume = l × w × h = (${v1} m) × (${v1} m) × (${v2} m) = ${vol} m³`,
        W / 2,
        stageY + 38
      );
    } else if (q === 9) {
      const bkW = 160,
        bkH = 160,
        bkX = W / 2 - bkW / 2,
        bkY = stageY + 85;
      const density = round2(v1 / v2);
      ctx.fillStyle = "#334155";
      ctx.fillRect(bkX - 28, bkY + bkH, bkW + 56, 22);
      ctx.fillStyle = "#10b981";
      ctx.font = "700 13px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Digital Balance: ${v1} kg`, W / 2, bkY + bkH + 16);
      ctx.fillStyle = "rgba(6,182,212,0.12)";
      ctx.strokeStyle = "#0891b2";
      ctx.lineWidth = 2.5;
      ctx.fillRect(bkX, bkY, bkW, bkH);
      ctx.strokeRect(bkX, bkY, bkW, bkH);
      const numParticles = Math.min(100, Math.round(density * 8.5));
      for (let i = 0; i < numParticles; i++) {
        const px = bkX + 12 + ((i * 23 + s.t * 4) % (bkW - 24));
        const py = bkY + 12 + ((i * 17) % (bkH - 24));
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#0369a1";
      ctx.font = "700 15px 'Source Code Pro', monospace";
      ctx.fillText(
        `Density ρ = Mass / Volume = (${v1} kg) ÷ (${v2} m³) = ${density} kg/m³`,
        W / 2,
        stageY + 38
      );
    }

    const tipY = H - 32;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(26, tipY, W - 52, 26, 6)
      : ctx.rect(26, tipY, W - 52, 26);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("💡 CORE PRINCIPLE:", 38, tipY + 17);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      `A physical quantity = numerical value × unit  (Q = n · [u]) • Without a unit, a number has no physical meaning.`,
      165,
      tipY + 17
    );
  },
  graphPoint: (s, p) => {
    const q = Math.max(1, Math.min(9, Math.round(p.qty || 1)));
    const v1 = Math.max(0.5, p.val1 || 5);
    const v2 = Math.max(0.5, p.val2 || 2);
    const round2 = (x) => Math.round(x * 100) / 100;
    let Q = v1,
      n = v1,
      rate = v1;
    if (q === 4) {
      Q = v1 * 10 + 250;
      n = Q;
      rate = Q;
    } else if (q === 5) {
      Q = round2(v1 / v2);
      n = Q;
      rate = round2(Q * (s.t % 5));
    } else if (q === 6) {
      Q = round2(v1 * v2);
      n = Q;
      rate = round2(Q * (s.t % 4));
    } else if (q === 7) {
      Q = round2(v1 * v2);
      n = Q;
      rate = Q;
    } else if (q === 8) {
      Q = round2(v1 * v1 * v2);
      n = Q;
      rate = Q;
    } else if (q === 9) {
      Q = round2(v1 / v2);
      n = Q;
      rate = round2(v1);
    }
    return { t: round2(s.t), Q: round2(Q), n: round2(n), rate: round2(rate) };
  },
  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "Q", label: "Physical Quantity Magnitude (Q)", color: "#2563eb" },
    { key: "n", label: "Numerical Value (n)", color: "#f59e0b" },
    { key: "rate", label: "Dynamic Output Rate", color: "#10b981" },
  ],
  stats: (s, p) => {
    const q = Math.max(1, Math.min(9, Math.round(p.qty || 1)));
    const v1 = Math.max(0.5, p.val1 || 5);
    const v2 = Math.max(0.5, p.val2 || 2);
    const round2 = (x) => Math.round(x * 100) / 100;

    const META = {
      1: {
        name: "Length",
        type: "Base",
        val: `${v1}`,
        unit: "m",
        baseUnit: "[SI]",
        dim: "[L]",
        rel: "Direct standard",
      },
      2: {
        name: "Mass",
        type: "Base",
        val: `${v1}`,
        unit: "kg",
        baseUnit: "[SI]",
        dim: "[M]",
        rel: "Direct standard",
      },
      3: {
        name: "Time",
        type: "Base",
        val: `${v1}`,
        unit: "s",
        baseUnit: "[SI]",
        dim: "[T]",
        rel: "Direct standard",
      },
      4: {
        name: "Temperature",
        type: "Base",
        val: `${v1 * 10 + 250}`,
        unit: "K",
        baseUnit: "[SI]",
        dim: "[K]",
        rel: "Direct standard",
      },
      5: {
        name: "Speed",
        type: "Derived",
        val: `${round2(v1 / v2)}`,
        unit: "m/s",
        baseUnit: "m·s⁻¹",
        dim: "[L T⁻¹]",
        rel: "d / t",
      },
      6: {
        name: "Force",
        type: "Derived",
        val: `${round2(v1 * v2)}`,
        unit: "N",
        baseUnit: "kg·m/s²",
        dim: "[M L T⁻²]",
        rel: "m × a",
      },
      7: {
        name: "Area",
        type: "Derived",
        val: `${round2(v1 * v2)}`,
        unit: "m²",
        baseUnit: "m²",
        dim: "[L²]",
        rel: "l × w",
      },
      8: {
        name: "Volume",
        type: "Derived",
        val: `${round2(v1 * v1 * v2)}`,
        unit: "m³",
        baseUnit: "m³",
        dim: "[L³]",
        rel: "l × w × h",
      },
      9: {
        name: "Density",
        type: "Derived",
        val: `${round2(v1 / v2)}`,
        unit: "kg/m³",
        baseUnit: "kg/m³",
        dim: "[M L⁻³]",
        rel: "m / V",
      },
    };
    const info = META[q];
    return [
      { label: "Quantity & Type", value: info.name, unit: `(${info.type})` },
      { label: "Physical Q", value: `${info.val}`, unit: info.unit },
      { label: "Magnitude (n)", value: `${info.val}`, unit: "" },
      { label: "Unit [u]", value: info.unit, unit: info.baseUnit },
      { label: "Dimension", value: info.dim, unit: "" },
      { label: "Relation", value: info.rel, unit: "" },
    ];
  },
};

/* ================= 2. SI UNITS ================= */
const siUnits = {
  title: "SI Units",
  topic: "mechanics",
  difficulty: "Beginner",
  summary:
    "Explore the seven fundamental SI base units and convert measured values into their SI base equivalents.",
  equation: "Q = n \\cdot [u]",
  params: [
    {
      key: "qty",
      label: "SI Quantity (1-7)",
      min: 1,
      max: 7,
      step: 1,
      default: 1,
      unit: "",
    },
    {
      key: "val",
      label: "Numerical Value",
      min: 0.1,
      max: 50,
      step: 0.1,
      default: 5,
      unit: "",
    },
    {
      key: "prefix",
      label: "Prefix / Temperature Scale",
      min: 1,
      max: 6,
      step: 1,
      default: 4,
      unit: "",
    },
  ],
  init: () => ({
    t: 0,
  }),
  step: (s, dt) => {
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const q = Math.max(1, Math.min(7, Math.round(p.qty || 1)));
    const v = Math.max(0.1, Number(p.val) || 5);
    const pref = Math.max(1, Math.min(6, Math.round(p.prefix || 4)));
    const r2local = (x) => Math.round(x * 100) / 100;

    const formatValue = (x) => {
      const abs = Math.abs(x);
      if (abs !== 0 && (abs < 0.001 || abs >= 100000)) {
        return x.toExponential(3);
      }
      return String(r2local(x));
    };

    const DATA = {
      1: {
        name: "Length",
        unit: "metre",
        base: "m",
        dim: "[L]",
        prefixes: [
          ["micro", "μm", 1e-6],
          ["milli", "mm", 1e-3],
          ["centi", "cm", 1e-2],
          ["base", "m", 1],
          ["kilo", "km", 1e3],
          ["mega", "Mm", 1e6],
        ],
      },
      2: {
        name: "Mass",
        unit: "kilogram",
        base: "kg",
        dim: "[M]",
        prefixes: [
          ["microgram", "μg", 1e-9],
          ["milligram", "mg", 1e-6],
          ["gram", "g", 1e-3],
          ["base", "kg", 1],
          ["megagram", "Mg", 1e3],
          ["base", "kg", 1],
        ],
      },
      3: {
        name: "Time",
        unit: "second",
        base: "s",
        dim: "[T]",
        prefixes: [
          ["micro", "μs", 1e-6],
          ["milli", "ms", 1e-3],
          ["centi", "cs", 1e-2],
          ["base", "s", 1],
          ["kilo", "ks", 1e3],
          ["mega", "Ms", 1e6],
        ],
      },
      4: {
        name: "Electric Current",
        unit: "ampere",
        base: "A",
        dim: "[I]",
        prefixes: [
          ["micro", "μA", 1e-6],
          ["milli", "mA", 1e-3],
          ["centi", "cA", 1e-2],
          ["base", "A", 1],
          ["kilo", "kA", 1e3],
          ["mega", "MA", 1e6],
        ],
      },
      5: {
        name: "Temperature",
        unit: "kelvin",
        base: "K",
        dim: "[Θ]",
        prefixes: [
          ["kelvin", "K", 1, 0],
          ["celsius", "°C", 1, 273.15],
          ["kelvin", "K", 1, 0],
          ["kelvin", "K", 1, 0],
          ["kelvin", "K", 1, 0],
          ["kelvin", "K", 1, 0],
        ],
      },
      6: {
        name: "Amount of Substance",
        unit: "mole",
        base: "mol",
        dim: "[N]",
        prefixes: [
          ["micro", "μmol", 1e-6],
          ["milli", "mmol", 1e-3],
          ["centi", "cmol", 1e-2],
          ["base", "mol", 1],
          ["kilo", "kmol", 1e3],
          ["mega", "Mmol", 1e6],
        ],
      },
      7: {
        name: "Luminous Intensity",
        unit: "candela",
        base: "cd",
        dim: "[J]",
        prefixes: [
          ["micro", "μcd", 1e-6],
          ["milli", "mcd", 1e-3],
          ["centi", "ccd", 1e-2],
          ["base", "cd", 1],
          ["kilo", "kcd", 1e3],
          ["mega", "Mcd", 1e6],
        ],
      },
    };

    const info = DATA[q];
    const selected = info.prefixes[pref - 1];

    let siValue;
    let conversion;
    let inputUnit;
    let inputLabel;

    if (q === 5 && pref === 2) {
      siValue = v + 273.15;
      inputUnit = "°C";
      inputLabel = `${formatValue(v)} °C`;
      conversion = `${formatValue(v)} °C + 273.15 = ${formatValue(siValue)} K`;
    } else if (q === 5) {
      siValue = v;
      inputUnit = "K";
      inputLabel = `${formatValue(v)} K`;
      conversion = `${formatValue(v)} K = ${formatValue(v - 273.15)} °C`;
    } else {
      inputUnit = selected[1];
      inputLabel = `${formatValue(v)} ${inputUnit}`;
      siValue = v * selected[2];
      conversion = `${formatValue(v)} ${inputUnit} = ${formatValue(siValue)} ${info.base}`;
    }

    const pad = Math.max(14, Math.min(28, W * 0.035));
    const contentW = Math.max(100, W - pad * 2);

    const labels = [
      "Length · m",
      "Mass · kg",
      "Time · s",
      "Current · A",
      "Temperature · K",
      "Amount · mol",
      "Luminous · cd",
    ];

    const columns = W >= 760 ? 4 : W >= 500 ? 3 : 2;
    const tabGap = 7;
    const tabW = (contentW - tabGap * (columns - 1)) / columns;
    const tabH = 25;
    const tabRows = Math.ceil(labels.length / columns);
    const tabsBottom = 8 + tabRows * (tabH + 5);

    const infoY = tabsBottom + 7;
    const infoH = 70;
    const stageY = infoY + infoH + 12;
    const stageH = Math.max(150, H - stageY - 45);

    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, radius);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    const drawSafeText = (text, x, y, maxWidth, font) => {
      ctx.font = font;
      ctx.textAlign = "center";
      let output = String(text);
      while (ctx.measureText(output).width > maxWidth && output.length > 4) {
        output = output.slice(0, -2) + "…";
      }
      ctx.fillText(output, x, y);
    };

    ctx.clearRect(0, 0, W, H);

    labels.forEach((label, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = pad + col * (tabW + tabGap);
      const y = 8 + row * (tabH + 5);
      const active = index + 1 === q;

      ctx.fillStyle = active ? "#2563eb" : "#ffffff";
      ctx.strokeStyle = active ? "#1d4ed8" : "#cbd5e1";
      ctx.lineWidth = active ? 1.5 : 1;

      roundRect(x, y, tabW, tabH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#ffffff" : "#475569";
      drawSafeText(
        label,
        x + tabW / 2,
        y + 16,
        tabW - 10,
        "600 10px Outfit, sans-serif"
      );
    });

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.2;
    roundRect(pad, infoY, contentW, infoH, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#047857";
    ctx.font = "700 10px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("FUNDAMENTAL SI QUANTITY", pad + 12, infoY + 17);

    const cells = [
      ["Quantity", info.name],
      ["SI Unit", info.unit],
      ["Symbol", info.base],
      ["Dimension", info.dim],
    ];

    const cellGap = 6;
    const cellW = (contentW - 24 - cellGap * 3) / 4;
    const cellY = infoY + 27;
    const cellH = 32;

    cells.forEach((item, index) => {
      const x = pad + 12 + index * (cellW + cellGap);
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#e2e8f0";
      roundRect(x, cellY, cellW, cellH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      drawSafeText(
        item[0],
        x + cellW / 2,
        cellY + 11,
        cellW - 8,
        "500 8px Outfit, sans-serif"
      );

      ctx.fillStyle = "#0f172a";
      drawSafeText(
        item[1],
        x + cellW / 2,
        cellY + 25,
        cellW - 8,
        "700 10px 'Source Code Pro', monospace"
      );
    });

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.2;
    roundRect(pad, stageY, contentW, stageH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    drawSafeText(
      "NUMBER + UNIT → PHYSICAL MEASUREMENT",
      W / 2,
      stageY + 28,
      contentW - 30,
      "700 13px Outfit, sans-serif"
    );

    const boxY = stageY + 50;
    const boxGap = Math.max(8, Math.min(18, contentW * 0.02));
    const boxW = (contentW - 36 - boxGap * 2) / 3;
    const boxH = Math.min(76, Math.max(60, stageH * 0.28));

    const x1 = pad + 18;
    const x2 = x1 + boxW + boxGap;
    const x3 = x2 + boxW + boxGap;

    const drawCard = (x, fill, stroke, main, sub) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.4;
      roundRect(x, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      drawSafeText(
        main,
        x + boxW / 2,
        boxY + boxH * 0.46,
        boxW - 12,
        "700 15px 'Source Code Pro', monospace"
      );

      ctx.fillStyle = "#64748b";
      drawSafeText(
        sub,
        x + boxW / 2,
        boxY + boxH * 0.75,
        boxW - 12,
        "500 10px Outfit, sans-serif"
      );
    };

    drawCard(x1, "#eff6ff", "#93c5fd", formatValue(v), "number");
    drawCard(
      x2,
      "#f0fdf4",
      "#86efac",
      inputUnit,
      q === 5 && pref === 2 ? "temperature scale" : selected[0]
    );
    drawCard(
      x3,
      "#ecfdf5",
      "#6ee7b7",
      `${formatValue(siValue)} ${info.base}`,
      "SI base equivalent"
    );

    ctx.fillStyle = "#64748b";
    ctx.font = "700 20px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("×", x1 + boxW + boxGap / 2, boxY + boxH / 2 + 6);
    ctx.fillText("→", x2 + boxW + boxGap / 2, boxY + boxH / 2 + 6);

    const conversionY = boxY + boxH + 25;
    const conversionH = 48;

    ctx.fillStyle = "#eff6ff";
    ctx.strokeStyle = "#bfdbfe";
    roundRect(pad + 18, conversionY, contentW - 36, conversionH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e40af";
    drawSafeText(
      conversion,
      W / 2,
      conversionY + 21,
      contentW - 60,
      "700 13px 'Source Code Pro', monospace"
    );

    ctx.fillStyle = "#475569";
    drawSafeText(
      q === 5
        ? "Kelvin is the SI base unit; Celsius uses the 273.15 K offset."
        : `${formatValue(v)} ${inputUnit} = number × unit`,
      W / 2,
      conversionY + 38,
      contentW - 60,
      "500 10px Outfit, sans-serif"
    );

    const lowerY = conversionY + 62;
    const lowerH = stageY + stageH - lowerY - 12;

    if (lowerH >= 45) {
      ctx.fillStyle = "#0f172a";
      roundRect(pad + 18, lowerY, contentW - 36, lowerH, 8);
      ctx.fill();

      ctx.fillStyle = "#fde047";
      ctx.font = "700 11px Outfit, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SI PRINCIPLE", pad + 30, lowerY + 18);

      ctx.fillStyle = "#f8fafc";
      drawSafeText(
        "SI units give physics a common language.",
        W / 2,
        lowerY + 18,
        contentW - 150,
        "600 11px Outfit, sans-serif"
      );

      if (lowerH >= 60) {
        ctx.fillStyle = "#cbd5e1";
        drawSafeText(
          `${formatValue(v)} → number only     |     ${inputLabel} → physical measurement`,
          W / 2,
          lowerY + 36,
          contentW - 50,
          "500 10px 'Source Code Pro', monospace"
        );
      }
    }
  },

  graphPoint: (s, p) => {
    const q = Math.max(1, Math.min(7, Math.round(p.qty || 1)));
    const v = Math.max(0.1, Number(p.val) || 5);
    const pref = Math.max(1, Math.min(6, Math.round(p.prefix || 4)));
    const r2local = (x) => Math.round(x * 100) / 100;

    const MULT_MAP = {
      1: [1e-6, 1e-3, 1e-2, 1, 1e3, 1e6],
      2: [1e-9, 1e-6, 1e-3, 1, 1e3, 1],
      3: [1e-6, 1e-3, 1e-2, 1, 1e3, 1e6],
      4: [1e-6, 1e-3, 1e-2, 1, 1e3, 1e6],
      5: [1, 1, 1, 1, 1, 1],
      6: [1e-6, 1e-3, 1e-2, 1, 1e3, 1e6],
      7: [1e-6, 1e-3, 1e-2, 1, 1e3, 1e6],
    };
    const mult = MULT_MAP[q] ? MULT_MAP[q][pref - 1] : 1;
    const siVal = q === 5 && pref === 2 ? v + 273.15 : v * mult;
    return { t: r2local(s.t), siVal: r2local(siVal), inputVal: r2local(v) };
  },

  xKey: "t",
  xLabel: "Time (s)",
  series: [
    { key: "siVal", label: "SI Base Equivalent Value", color: "#10b981" },
    { key: "inputVal", label: "Selected Input Value", color: "#2563eb" },
  ],

  stats: (s, p) => {
    const q = Math.max(1, Math.min(7, Math.round(p.qty || 1)));
    const v = Math.max(0.1, Number(p.val) || 5);
    const pref = Math.max(1, Math.min(6, Math.round(p.prefix || 4)));

    const DATA = {
      1: {
        name: "Length",
        unit: "metre",
        base: "m",
        dim: "[L]",
        opts: [
          ["μm", 1e-6],
          ["mm", 1e-3],
          ["cm", 1e-2],
          ["m", 1],
          ["km", 1e3],
          ["Mm", 1e6],
        ],
      },
      2: {
        name: "Mass",
        unit: "kilogram",
        base: "kg",
        dim: "[M]",
        opts: [
          ["μg", 1e-9],
          ["mg", 1e-6],
          ["g", 1e-3],
          ["kg", 1],
          ["Mg", 1e3],
          ["kg", 1],
        ],
      },
      3: {
        name: "Time",
        unit: "second",
        base: "s",
        dim: "[T]",
        opts: [
          ["μs", 1e-6],
          ["ms", 1e-3],
          ["cs", 1e-2],
          ["s", 1],
          ["ks", 1e3],
          ["Ms", 1e6],
        ],
      },
      4: {
        name: "Electric Current",
        unit: "ampere",
        base: "A",
        dim: "[I]",
        opts: [
          ["μA", 1e-6],
          ["mA", 1e-3],
          ["cA", 1e-2],
          ["A", 1],
          ["kA", 1e3],
          ["MA", 1e6],
        ],
      },
      5: {
        name: "Temperature",
        unit: "kelvin",
        base: "K",
        dim: "[Θ]",
        opts: [
          ["K", 1],
          ["°C", 1],
          ["K", 1],
          ["K", 1],
          ["K", 1],
          ["K", 1],
        ],
      },
      6: {
        name: "Amount of Substance",
        unit: "mole",
        base: "mol",
        dim: "[N]",
        opts: [
          ["μmol", 1e-6],
          ["mmol", 1e-3],
          ["cmol", 1e-2],
          ["mol", 1],
          ["kmol", 1e3],
          ["Mmol", 1e6],
        ],
      },
      7: {
        name: "Luminous Intensity",
        unit: "candela",
        base: "cd",
        dim: "[J]",
        opts: [
          ["μcd", 1e-6],
          ["mcd", 1e-3],
          ["ccd", 1e-2],
          ["cd", 1],
          ["kcd", 1e3],
          ["Mcd", 1e6],
        ],
      },
    };

    const info = DATA[q];
    const r2local = (x) => Math.round(x * 100) / 100;

    let siValue;
    let inputUnit;
    let conversion;

    if (q === 5 && pref === 2) {
      siValue = v + 273.15;
      inputUnit = "°C";
      conversion = `${r2local(siValue)} K`;
    } else if (q === 5) {
      siValue = v;
      inputUnit = "K";
      conversion = `${r2local(v - 273.15)} °C`;
    } else {
      inputUnit = info.opts[pref - 1][0];
      siValue = v * info.opts[pref - 1][1];
      conversion = `${r2local(siValue)} ${info.base}`;
    }

    let scaleText;
    if (q === 2) {
      if (pref === 1) scaleText = "1 μg = 10⁻⁹ kg";
      else if (pref === 2) scaleText = "1 mg = 10⁻⁶ kg";
      else if (pref === 3) scaleText = "1 g = 10⁻³ kg";
      else if (pref === 4) scaleText = "1 kg = 1 kg";
      else if (pref === 5) scaleText = "1 Mg = 10³ kg";
      else scaleText = "SI base: kg";
    } else if (q === 5) {
      scaleText = pref === 2 ? "K = °C + 273.15" : "1 K = SI base";
    } else {
      scaleText = `10^${Math.round(Math.log10(info.opts[pref - 1][1]))}`;
    }

    return [
      { label: "Quantity", value: info.name, unit: "" },
      { label: "Type", value: "Fundamental SI Quantity", unit: "" },
      { label: "SI Unit", value: info.unit, unit: "" },
      { label: "Symbol", value: info.base, unit: "" },
      { label: "Dimension", value: info.dim, unit: "" },
      { label: "Input Value", value: r2local(v), unit: inputUnit },
      { label: "Measurement", value: `${r2local(v)} ${inputUnit}`, unit: "" },
      { label: "SI Base Equivalent", value: r2local(siValue), unit: info.base },
      { label: "Conversion", value: conversion, unit: "" },
      { label: "Scale", value: scaleText, unit: "" },
    ];
  },
};

/* ================= 3. DIMENSIONS ================= */
const dimensions = {
  title: "Dimensions",
  topic: "mechanics",
  difficulty: "Beginner",
  summary:
    "Understand how physical quantities are constructed from fundamental dimensions [M], [L], [T], [I], [Θ], [N], [J].",
  equation: "[Q] = [M^a L^b T^c I^d \\Theta^e N^f J^g]",
  params: [
    {
      key: "qty",
      label: "Select Quantity (1-13)",
      min: 1,
      max: 13,
      step: 1,
      default: 7,
      unit: "",
    },
    {
      key: "val",
      label: "Test Value (n)",
      min: 1,
      max: 20,
      step: 1,
      default: 5,
      unit: "",
    },
  ],
  init: () => ({ t: 0, animPos: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.animPos = (s.animPos + dt * 40) % 400;
  },
  draw: (ctx, s, p, W, H) => {
    const q = Math.max(1, Math.min(13, Math.round(p.qty || 7)));
    const v = Math.max(1, p.val || 5);

    const DIMS_DB = {
      1: {
        name: "Length",
        sym: "l",
        dim: "[L]",
        baseUnits: "m",
        m: 0,
        l: 1,
        t: 0,
        formula: "Base Quantity",
        breakdown: "[L]",
      },
      2: {
        name: "Mass",
        sym: "m",
        dim: "[M]",
        baseUnits: "kg",
        m: 1,
        l: 0,
        t: 0,
        formula: "Base Quantity",
        breakdown: "[M]",
      },
      3: {
        name: "Time",
        sym: "t",
        dim: "[T]",
        baseUnits: "s",
        m: 0,
        l: 0,
        t: 1,
        formula: "Base Quantity",
        breakdown: "[T]",
      },
      4: {
        name: "Area",
        sym: "A",
        dim: "[L²]",
        baseUnits: "m²",
        m: 0,
        l: 2,
        t: 0,
        formula: "length × width",
        breakdown: "[L] × [L] = [L²]",
      },
      5: {
        name: "Volume",
        sym: "V",
        dim: "[L³]",
        baseUnits: "m³",
        m: 0,
        l: 3,
        t: 0,
        formula: "length × width × height",
        breakdown: "[L] × [L] × [L] = [L³]",
      },
      6: {
        name: "Speed",
        sym: "v",
        dim: "[L T⁻¹]",
        baseUnits: "m·s⁻¹",
        m: 0,
        l: 1,
        t: -1,
        formula: "distance / time",
        breakdown: "[L] / [T] = [L T⁻¹]",
      },
      7: {
        name: "Acceleration",
        sym: "a",
        dim: "[L T⁻²]",
        baseUnits: "m·s⁻²",
        m: 0,
        l: 1,
        t: -2,
        formula: "velocity / time",
        breakdown: "[L T⁻¹] / [T] = [L T⁻²]",
      },
      8: {
        name: "Force",
        sym: "F",
        dim: "[M L T⁻²]",
        baseUnits: "kg·m·s⁻² (N)",
        m: 1,
        l: 1,
        t: -2,
        formula: "mass × acceleration",
        breakdown: "[M] × [L T⁻²] = [M L T⁻²]",
      },
      9: {
        name: "Momentum",
        sym: "p",
        dim: "[M L T⁻¹]",
        baseUnits: "kg·m·s⁻¹",
        m: 1,
        l: 1,
        t: -1,
        formula: "mass × velocity",
        breakdown: "[M] × [L T⁻¹] = [M L T⁻¹]",
      },
      10: {
        name: "Work / Energy",
        sym: "W",
        dim: "[M L² T⁻²]",
        baseUnits: "kg·m²·s⁻² (J)",
        m: 1,
        l: 2,
        t: -2,
        formula: "force × distance",
        breakdown: "[M L T⁻²] × [L] = [M L² T⁻²]",
      },
      11: {
        name: "Power",
        sym: "P",
        dim: "[M L² T⁻³]",
        baseUnits: "kg·m²·s⁻³ (W)",
        m: 1,
        l: 2,
        t: -3,
        formula: "work / time",
        breakdown: "[M L² T⁻²] / [T] = [M L² T⁻³]",
      },
      12: {
        name: "Pressure",
        sym: "P",
        dim: "[M L⁻¹ T⁻²]",
        baseUnits: "kg·m⁻¹·s⁻² (Pa)",
        m: 1,
        l: -1,
        t: -2,
        formula: "force / area",
        breakdown: "[M L T⁻²] / [L²] = [M L⁻¹ T⁻²]",
      },
      13: {
        name: "Density",
        sym: "ρ",
        dim: "[M L⁻³]",
        baseUnits: "kg·m⁻³",
        m: 1,
        l: -3,
        t: 0,
        formula: "mass / volume",
        breakdown: "[M] / [L³] = [M L⁻³]",
      },
    };
    const info = DIMS_DB[q];

    const tabLabels = [
      "1.L",
      "2.M",
      "3.T",
      "4.Area",
      "5.Vol",
      "6.Speed",
      "7.Accel",
      "8.Force",
      "9.Mom",
      "10.Work",
      "11.Power",
      "12.Press",
      "13.Dens",
    ];
    const tabW = 50,
      tabH = 26,
      tabY = 8,
      startX = 24;
    tabLabels.forEach((label, idx) => {
      const tx = startX + idx * (tabW + 5);
      const active = idx + 1 === q;
      ctx.fillStyle = active ? "#2563eb" : "#ffffff";
      ctx.strokeStyle = active ? "#1d4ed8" : "#cbd5e1";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(tx, tabY, tabW, tabH, 5)
        : ctx.rect(tx, tabY, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#ffffff" : "#475569";
      ctx.font = active
        ? "700 10px Outfit, sans-serif"
        : "500 10px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, tx + tabW / 2, tabY + 17);
    });

    const cardY = 40,
      cardH = 56;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, cardY, W - 48, cardH, 8)
      : ctx.rect(24, cardY, W - 48, cardH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ede9fe";
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(36, cardY + 8, 140, 40, 6)
      : ctx.rect(36, cardY + 8, 140, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5b21b6";
    ctx.font = "700 13px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${info.name} (${info.sym})`, 36 + 70, cardY + 24);
    ctx.font = "500 10px 'Source Code Pro', monospace";
    ctx.fillStyle = "#6d28d9";
    ctx.fillText(info.baseUnits, 36 + 70, cardY + 39);

    const derX = 188,
      derY = cardY + 8;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(derX, derY, 260, 40, 6)
      : ctx.rect(derX, derY, 260, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";
    ctx.font = "600 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Formula: ${info.formula}`, derX + 130, derY + 17);
    ctx.font = "700 12px 'Source Code Pro', monospace";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(info.breakdown, derX + 130, derY + 33);

    const resX = 460;
    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(resX, derY, W - 48 - resX + 12, 40, 6)
      : ctx.rect(resX, derY, W - 48 - resX + 12, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#047857";
    ctx.font = "700 16px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `[${info.name}] = ${info.dim}`,
      resX + (W - 48 - resX + 12) / 2,
      derY + 25
    );

    const stageY = 104,
      stageH = 294;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, stageY, W - 48, stageH, 8)
      : ctx.rect(24, stageY, W - 48, stageH);
    ctx.fill();
    ctx.stroke();

    const dimsList = [
      { sym: "M", name: "Mass", p: info.m },
      { sym: "L", name: "Length", p: info.l },
      { sym: "T", name: "Time", p: info.t },
      { sym: "I", name: "Current", p: 0 },
      { sym: "Θ", name: "Temp", p: 0 },
      { sym: "N", name: "Mole", p: 0 },
      { sym: "J", name: "Candela", p: 0 },
    ];
    const gridStartX = 48,
      gridY = stageY + 30,
      boxW = 86,
      boxH = 75;
    dimsList.forEach((d, idx) => {
      const bx = gridStartX + idx * (boxW + 8);
      const isPresent = d.p !== 0;
      ctx.fillStyle = isPresent
        ? d.p > 0
          ? "#dbeafe"
          : "#fee2e2"
        : "#f8fafc";
      ctx.strokeStyle = isPresent
        ? d.p > 0
          ? "#2563eb"
          : "#ef4444"
        : "#cbd5e1";
      ctx.lineWidth = isPresent ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(bx, gridY, boxW, boxH, 6)
        : ctx.rect(bx, gridY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isPresent ? "#0f172a" : "#64748b";
      ctx.font = "700 16px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`[${d.sym}]`, bx + boxW / 2, gridY + 28);

      ctx.font = "700 14px 'Source Code Pro', monospace";
      ctx.fillStyle = isPresent
        ? d.p > 0
          ? "#1d4ed8"
          : "#b91c1c"
        : "#94a3b8";
      ctx.fillText(
        `power: ${d.p > 0 ? "+" + d.p : d.p}`,
        bx + boxW / 2,
        gridY + 48
      );

      ctx.font = "500 9px Outfit, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(d.name, bx + boxW / 2, gridY + 65);
    });

    const demoY = stageY + 130,
      demoW = W - 96,
      demoH = 145;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.fillRect(48, demoY, demoW, demoH);
    ctx.strokeRect(48, demoY, demoW, demoH);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Interactive Physical Model: ${info.name}`, W / 2, demoY + 24);

    if (q === 8) {
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(W / 2 - 80, demoY + 50, 60, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 12px 'Source Code Pro'";
      ctx.fillText("m [M]", W / 2 - 50, demoY + 80);
      arrow(ctx, W / 2 - 20, demoY + 75, W / 2 + 70, demoY + 75, "#ef4444", 3);
      ctx.fillStyle = "#ef4444";
      ctx.font = "700 13px 'Source Code Pro'";
      ctx.textAlign = "left";
      ctx.fillText(`F = ${v} N  [M L T⁻²]`, W / 2 + 78, demoY + 78);
    } else if (q === 6 || q === 7) {
      const carPx = 70 + ((s.animPos * (v / 5)) % (demoW - 120));
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(48 + carPx, demoY + 65, 45, 22);
      arrow(
        ctx,
        48 + carPx + 45,
        demoY + 76,
        48 + carPx + 85,
        demoY + 76,
        "#f59e0b",
        2.5
      );
      ctx.fillStyle = "#0f172a";
      ctx.font = "600 12px 'Source Code Pro'";
      ctx.textAlign = "left";
      ctx.fillText(`v = ${v} m/s  [L T⁻¹]`, 48 + carPx, demoY + 55);
    } else {
      ctx.fillStyle = "#334155";
      ctx.font = "600 13px 'Source Code Pro', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `Physical Nature: ${info.name} is composed of ${info.breakdown}`,
        W / 2,
        demoY + 65
      );
      ctx.fillStyle = "#059669";
      ctx.font = "700 14px 'Source Code Pro', monospace";
      ctx.fillText(
        `Dimensional Formula: [${info.sym}] = [M^${info.m} L^${info.l} T^${info.t}]`,
        W / 2,
        demoY + 95
      );
    }

    const tipY = H - 32;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, tipY, W - 48, 26, 6)
      : ctx.rect(24, tipY, W - 48, 26);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("💡 DIMENSION PRINCIPLE:", 36, tipY + 17);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      "Dimensions represent the base physical nature of a quantity, completely independent of the unit system.",
      190,
      tipY + 17
    );
  },
  graphPoint: (s, p) => {
    const q = Math.max(1, Math.min(13, Math.round(p.qty || 7)));
    return { qty: q, powerSum: q };
  },
  xKey: "qty",
  xLabel: "Quantity Index (1-13)",
  series: [
    { key: "powerSum", label: "Selected Quantity Index", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const q = Math.max(1, Math.min(13, Math.round(p.qty || 7)));
    const DIMS_DB = {
      1: { name: "Length", dim: "[L]", si: "m", form: "[M⁰ L¹ T⁰]" },
      2: { name: "Mass", dim: "[M]", si: "kg", form: "[M¹ L⁰ T⁰]" },
      3: { name: "Time", dim: "[T]", si: "s", form: "[M⁰ L⁰ T¹]" },
      4: { name: "Area", dim: "[L²]", si: "m²", form: "[M⁰ L² T⁰]" },
      5: { name: "Volume", dim: "[L³]", si: "m³", form: "[M⁰ L³ T⁰]" },
      6: { name: "Speed", dim: "[L T⁻¹]", si: "m/s", form: "[M⁰ L¹ T⁻¹]" },
      7: {
        name: "Acceleration",
        dim: "[L T⁻²]",
        si: "m/s²",
        form: "[M⁰ L¹ T⁻²]",
      },
      8: { name: "Force", dim: "[M L T⁻²]", si: "N", form: "[M¹ L¹ T⁻²]" },
      9: {
        name: "Momentum",
        dim: "[M L T⁻¹]",
        si: "kg·m/s",
        form: "[M¹ L¹ T⁻¹]",
      },
      10: {
        name: "Work / Energy",
        dim: "[M L² T⁻²]",
        si: "J",
        form: "[M¹ L² T⁻²]",
      },
      11: { name: "Power", dim: "[M L² T⁻³]", si: "W", form: "[M¹ L² T⁻³]" },
      12: {
        name: "Pressure",
        dim: "[M L⁻¹ T⁻²]",
        si: "Pa",
        form: "[M¹ L⁻¹ T⁻²]",
      },
      13: {
        name: "Density",
        dim: "[M L⁻³]",
        si: "kg/m³",
        form: "[M¹ L⁻³ T⁰]",
      },
    };
    const info = DIMS_DB[q];
    return [
      { label: "Quantity", value: info.name, unit: "" },
      { label: "Dimension", value: info.dim, unit: "" },
      { label: "SI Base Unit", value: info.si, unit: "" },
      { label: "Standard Form", value: info.form, unit: "" },
      {
        label: "Base Type",
        value: q <= 3 ? "Fundamental" : "Derived",
        unit: "",
      },
      { label: "Independence", value: "Unit-Free", unit: "" },
    ];
  },
};

/* ================= 4. DIMENSIONAL ANALYSIS ================= */
const dimensionalAnalysis = {
  title: "Dimensional Analysis",
  topic: "mechanics",
  difficulty: "Intermediate",
  summary:
    "Verify equation consistency using the Principle of Dimensional Homogeneity (LHS = RHS) and explore dimensional derivations.",
  equation:
    "[\\text{LHS}] = [\\text{RHS}_1] = [\\text{RHS}_2] \\quad (\\text{Homogeneity})",
  params: [
    {
      key: "eq",
      label: "Equation to Test (1-6)",
      min: 1,
      max: 6,
      step: 1,
      default: 1,
      unit: "",
    },
    {
      key: "val",
      label: "Scale Factor",
      min: 1,
      max: 10,
      step: 1,
      default: 2,
      unit: "",
    },
  ],
  init: () => ({ t: 0, balanceAngle: 0 }),
  step: (s, dt) => {
    s.t += dt;
  },
  draw: (ctx, s, p, W, H) => {
    const eqIdx = Math.max(1, Math.min(6, Math.round(p.eq || 1)));

    const EQ_DB = {
      1: {
        title: "Displacement (Uniform Accel)",
        latex: "s = ut + 1/2 at²",
        lhsStr: "[s]",
        lhsDim: "[L]",
        rhsTerms: [
          { term: "[ut]", step: "[L T⁻¹][T]", dim: "[L]" },
          { term: "[½at²]", step: "[1][L T⁻²][T²]", dim: "[L]" },
        ],
        rhsDim: "[L]",
        valid: true,
        reason:
          "All terms evaluate to [L]. Equation is dimensionally homogeneous.",
      },
      2: {
        title: "Velocity-Displacement Relation",
        latex: "v² = u² + 2as",
        lhsStr: "[v²]",
        lhsDim: "[L² T⁻²]",
        rhsTerms: [
          { term: "[u²]", step: "[L T⁻¹]²", dim: "[L² T⁻²]" },
          { term: "[2as]", step: "[1][L T⁻²][L]", dim: "[L² T⁻²]" },
        ],
        rhsDim: "[L² T⁻²]",
        valid: true,
        reason: "All terms evaluate to [L² T⁻²]. Dimensionally consistent.",
      },
      3: {
        title: "Centripetal Force",
        latex: "F = mv²/r",
        lhsStr: "[F]",
        lhsDim: "[M L T⁻²]",
        rhsTerms: [
          { term: "[mv²/r]", step: "[M][L T⁻¹]² / [L]", dim: "[M L T⁻²]" },
        ],
        rhsDim: "[M L T⁻²]",
        valid: true,
        reason:
          "LHS [M L T⁻²] exactly matches RHS [M L T⁻²]. Valid physics law.",
      },
      4: {
        title: "Simple Pendulum Period",
        latex: "T = 2π √(l/g)",
        lhsStr: "[T]",
        lhsDim: "[T]",
        rhsTerms: [
          {
            term: "[2π√(l/g)]",
            step: "[1] · √([L] / [L T⁻²]) = √[T²]",
            dim: "[T]",
          },
        ],
        rhsDim: "[T]",
        valid: true,
        reason:
          "Dimensionless constant 2π has no dimension [1]. Net RHS is [T].",
      },
      5: {
        title: "❌ Inconsistent Equation (Error Test)",
        latex: "s = ut² + at",
        lhsStr: "[s]",
        lhsDim: "[L]",
        rhsTerms: [
          { term: "[ut²]", step: "[L T⁻¹][T²]", dim: "[L T]" },
          { term: "[at]", step: "[L T⁻²][T]", dim: "[L T⁻¹]" },
        ],
        rhsDim: "[L T] + [L T⁻¹]",
        valid: false,
        reason:
          "LHS is [L], but RHS has [L T] and [L T⁻¹]. INCONSISTENT! Equation is physically FALSE.",
      },
      6: {
        title: "Mass-Energy Equivalence",
        latex: "E = mc²",
        lhsStr: "[E]",
        lhsDim: "[M L² T⁻²]",
        rhsTerms: [{ term: "[mc²]", step: "[M][L T⁻¹]²", dim: "[M L² T⁻²]" }],
        rhsDim: "[M L² T⁻²]",
        valid: true,
        reason:
          "LHS energy [M L² T⁻²] equals RHS [M L² T⁻²]. Einstein's formula is homogeneous.",
      },
    };

    const info = EQ_DB[eqIdx];

    const tabLabels = [
      "1. s=ut+½at²",
      "2. v²=u²+2as",
      "3. F=mv²/r",
      "4. T=2π√(l/g)",
      "5. ❌ s=ut²+at",
      "6. E=mc²",
    ];
    const tabW = 112,
      tabH = 26,
      tabY = 8,
      startX = 24;
    tabLabels.forEach((label, idx) => {
      const tx = startX + idx * (tabW + 5);
      const active = idx + 1 === eqIdx;
      ctx.fillStyle = active
        ? idx === 4
          ? "#ef4444"
          : "#2563eb"
        : "#ffffff";
      ctx.strokeStyle = active
        ? idx === 4
          ? "#b91c1c"
          : "#1d4ed8"
        : "#cbd5e1";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(tx, tabY, tabW, tabH, 6)
        : ctx.rect(tx, tabY, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#ffffff" : "#475569";
      ctx.font = active
        ? "700 10.5px Outfit, sans-serif"
        : "500 10.5px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, tx + tabW / 2, tabY + 17);
    });

    const bannerY = 40,
      bannerH = 56;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, bannerY, W - 48, bannerH, 8)
      : ctx.rect(24, bannerY, W - 48, bannerH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = info.valid ? "#ecfdf5" : "#fef2f2";
    ctx.strokeStyle = info.valid ? "#10b981" : "#ef4444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(36, bannerY + 8, 210, 40, 6)
      : ctx.rect(36, bannerY + 8, 210, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = info.valid ? "#047857" : "#b91c1c";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(info.title, 36 + 105, bannerY + 23);
    ctx.font = "700 13px 'Source Code Pro', monospace";
    ctx.fillText(info.latex, 36 + 105, bannerY + 39);

    const verX = 258;
    ctx.fillStyle = info.valid ? "#dcfce7" : "#fee2e2";
    ctx.strokeStyle = info.valid ? "#16a34a" : "#dc2626";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(verX, bannerY + 8, W - 48 - verX + 12, 40, 6)
      : ctx.rect(verX, bannerY + 8, W - 48 - verX + 12, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = info.valid ? "#15803d" : "#b91c1c";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      info.valid
        ? "✓ DIMENSIONALLY HOMOGENEOUS (CONSISTENT)"
        : "✗ DIMENSIONALLY INCONSISTENT (PHYSICAL ERROR)",
      verX + (W - 48 - verX + 12) / 2,
      bannerY + 25
    );
    ctx.font = "500 10px Outfit, sans-serif";
    ctx.fillText(info.reason, verX + (W - 48 - verX + 12) / 2, bannerY + 40);

    const stageY = 104,
      stageH = 294;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, stageY, W - 48, stageH, 8)
      : ctx.rect(24, stageY, W - 48, stageH);
    ctx.fill();
    ctx.stroke();

    const colW = 310,
      colH = 175,
      colY = stageY + 25;
    ctx.fillStyle = "#eff6ff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.fillRect(48, colY, colW, colH);
    ctx.strokeRect(48, colY, colW, colH);
    ctx.fillStyle = "#1e40af";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LEFT-HAND SIDE (LHS)", 48 + colW / 2, colY + 26);
    ctx.fillStyle = "#334155";
    ctx.font = "600 13px 'Source Code Pro'";
    ctx.fillText(`Expression: ${info.lhsStr}`, 48 + colW / 2, colY + 65);
    ctx.fillStyle = "#2563eb";
    ctx.font = "700 24px 'Source Code Pro', monospace";
    ctx.fillText(info.lhsDim, 48 + colW / 2, colY + 115);
    ctx.fillStyle = "#64748b";
    ctx.font = "500 10px Outfit, sans-serif";
    ctx.fillText("Evaluated Base Dimension", 48 + colW / 2, colY + 145);

    ctx.fillStyle = info.valid ? "#16a34a" : "#dc2626";
    ctx.font = "700 28px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(info.valid ? "≡" : "≠", W / 2, colY + colH / 2 + 8);

    ctx.fillStyle = info.valid ? "#f0fdf4" : "#fef2f2";
    ctx.strokeStyle = info.valid ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.fillRect(W - 48 - colW, colY, colW, colH);
    ctx.strokeRect(W - 48 - colW, colY, colW, colH);
    ctx.fillStyle = info.valid ? "#166534" : "#991b1b";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RIGHT-HAND SIDE (RHS)", W - 48 - colW / 2, colY + 26);

    info.rhsTerms.forEach((t, i) => {
      ctx.fillStyle = "#334155";
      ctx.font = "600 12px 'Source Code Pro'";
      ctx.textAlign = "center";
      ctx.fillText(
        `${t.term} = ${t.step} → ${t.dim}`,
        W - 48 - colW / 2,
        colY + 65 + i * 28
      );
    });
    ctx.fillStyle = info.valid ? "#16a34a" : "#dc2626";
    ctx.font = "700 20px 'Source Code Pro', monospace";
    ctx.fillText(`Net RHS = ${info.rhsDim}`, W - 48 - colW / 2, colY + 145);

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.fillRect(48, stageY + 215, W - 96, 65);
    ctx.strokeRect(48, stageY + 215, W - 96, 65);
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("KEY TAKEAWAYS FOR DIMENSIONAL ANALYSIS:", 62, stageY + 233);
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(
      "1. Only physical quantities with the same dimensions can be added, subtracted, or equated.",
      62,
      stageY + 250
    );
    ctx.fillText(
      "2. Pure numbers (1/2, 2, π) and trigonometric functions (sin, cos) are strictly dimensionless [1].",
      62,
      stageY + 266
    );

    const tipY = H - 32;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, tipY, W - 48, 26, 6)
      : ctx.rect(24, tipY, W - 48, 26);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("💡 HOMOGENEITY PRINCIPLE:", 36, tipY + 17);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      "In any physically valid equation, every added term must have identical dimensions: [LHS] = [RHS].",
      205,
      tipY + 17
    );
  },
  graphPoint: (s, p) => ({ eq: p.eq || 1, valid: (p.eq || 1) !== 5 ? 1 : 0 }),
  xKey: "eq",
  xLabel: "Tested Equation (1-6)",
  series: [
    {
      key: "valid",
      label: "Consistency (1: Valid, 0: Error)",
      color: "#10b981",
    },
  ],
  stats: (s, p) => {
    const eqIdx = Math.max(1, Math.min(6, Math.round(p.eq || 1)));
    const EQ_DB = {
      1: { eq: "s = ut + ½at²", lhs: "[L]", rhs: "[L]", res: "VALID" },
      2: { eq: "v² = u² + 2as", lhs: "[L² T⁻²]", rhs: "[L² T⁻²]", res: "VALID" },
      3: { eq: "F = mv²/r", lhs: "[M L T⁻²]", rhs: "[M L T⁻²]", res: "VALID" },
      4: { eq: "T = 2π√(l/g)", lhs: "[T]", rhs: "[T]", res: "VALID" },
      5: { eq: "s = ut² + at", lhs: "[L]", rhs: "[L T]", res: "MISMATCH" },
      6: { eq: "E = mc²", lhs: "[M L² T⁻²]", rhs: "[M L² T⁻²]", res: "VALID" },
    };
    const info = EQ_DB[eqIdx];
    return [
      { label: "Tested Equation", value: info.eq, unit: "" },
      { label: "LHS Dimension", value: info.lhs, unit: "" },
      { label: "RHS Dimension", value: info.rhs, unit: "" },
      { label: "Homogeneity Status", value: info.res, unit: "" },
      { label: "Constants [k]", value: "[1] (None)", unit: "" },
      {
        label: "Physics Validity",
        value: info.res === "VALID" ? "True" : "False",
        unit: "",
      },
    ];
  },
};

/* ================= 5. SCALARS & VECTORS ================= */
const scalarsVectors = {
  title: "Scalars & Vectors",
  topic: "mechanics",
  difficulty: "Beginner",
  summary:
    "Compare scalar quantities (magnitude only) with vector quantities (magnitude and direction) and see how vectors resolve in 2D.",
  equation: "\\text{Scalar: } s = |s|, \\quad \\vec{V} = V_x\\hat{i} + V_y\\hat{j}",
  params: [
    {
      key: "qty",
      label:
        "Quantity (1:Dist/Disp, 2:Speed/Vel, 3:Mass/Force, 4:Time/Mom, 5:Temp, 6:Energy)",
      min: 1,
      max: 6,
      step: 1,
      default: 2,
      unit: "",
    },
    {
      key: "mag",
      label: "Magnitude (|V|)",
      min: 1,
      max: 20,
      step: 0.5,
      default: 10,
      unit: "",
    },
    {
      key: "angle",
      label: "Vector Angle (θ)",
      min: 0,
      max: 360,
      step: 5,
      default: 35,
      unit: "°",
    },
  ],
  init: () => ({ t: 0, pulse: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.pulse = (s.pulse + dt * 4) % (Math.PI * 2);
  },
  draw: (ctx, s, p, W, H) => {
    const q = Math.max(1, Math.min(6, Math.round(p.qty || 2)));
    const mag = Math.max(1, p.mag || 10);
    const angDeg = p.angle || 35;
    const angRad = (angDeg * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;

    const PAIRS = {
      1: {
        scalar: "Distance",
        sUnit: "m",
        vector: "Displacement",
        vUnit: "m",
        desc: "Total path length vs straight-line directed distance",
      },
      2: {
        scalar: "Speed",
        sUnit: "m/s",
        vector: "Velocity",
        vUnit: "m/s",
        desc: "Rate of distance covered vs directed rate of change of position",
      },
      3: {
        scalar: "Mass",
        sUnit: "kg",
        vector: "Force",
        vUnit: "N",
        desc: "Inertia content of matter vs directed push/pull interaction",
      },
      4: {
        scalar: "Time",
        sUnit: "s",
        vector: "Momentum",
        vUnit: "kg·m/s",
        desc: "Universal interval progress vs directed quantity of motion",
      },
      5: {
        scalar: "Temperature",
        sUnit: "K",
        vector: "Temp. Gradient",
        vUnit: "K/m",
        desc: "Average thermal kinetic state vs spatial direction of heat flux",
      },
      6: {
        scalar: "Energy / Work",
        sUnit: "J",
        vector: "Torque",
        vUnit: "N·m",
        desc: "Scalar energy capacity vs directed rotational twisting action",
      },
    };
    const info = PAIRS[q];
    const vx = mag * Math.cos(angRad);
    const vy = mag * Math.sin(angRad);

    const tabLabels = [
      "1.Dist/Disp",
      "2.Speed/Vel",
      "3.Mass/Force",
      "4.Time/Mom",
      "5.Temp",
      "6.Energy",
    ];
    const tabW = 112,
      tabH = 26,
      tabY = 8,
      startX = 24;
    tabLabels.forEach((label, idx) => {
      const tx = startX + idx * (tabW + 5);
      const active = idx + 1 === q;
      ctx.fillStyle = active ? "#2563eb" : "#ffffff";
      ctx.strokeStyle = active ? "#1d4ed8" : "#cbd5e1";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(tx, tabY, tabW, tabH, 6)
        : ctx.rect(tx, tabY, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#ffffff" : "#475569";
      ctx.font = active
        ? "600 11px Outfit, sans-serif"
        : "500 11px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, tx + tabW / 2, tabY + 17);
    });

    const bannerY = 40,
      bannerH = 56;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, bannerY, W - 48, bannerH, 8)
      : ctx.rect(24, bannerY, W - 48, bannerH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eff6ff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(36, bannerY + 8, 330, 40, 6)
      : ctx.rect(36, bannerY + 8, 330, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";
    ctx.font = "700 12px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `SCALAR: ${info.scalar} = ${mag} ${info.sUnit}`,
      36 + 165,
      bannerY + 24
    );
    ctx.font = "500 10px Outfit, sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText(
      "Magnitude ONLY • Direction has no meaning",
      36 + 165,
      bannerY + 39
    );

    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(W - 36 - 330, bannerY + 8, 330, 40, 6)
      : ctx.rect(W - 36 - 330, bannerY + 8, 330, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#065f46";
    ctx.font = "700 12px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `VECTOR: ${info.vector} = ${mag} ${info.vUnit} at ${angDeg}°`,
      W - 36 - 165,
      bannerY + 24
    );
    ctx.font = "500 10px Outfit, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText(
      `Magnitude + Direction • (${round2(vx)}î + ${round2(vy)}ĵ)`,
      W - 36 - 165,
      bannerY + 39
    );

    const stageY = 104,
      stageH = 294;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, stageY, W - 48, stageH, 8)
      : ctx.rect(24, stageY, W - 48, stageH);
    ctx.fill();
    ctx.stroke();

    const splitW = (W - 72) / 2;

    const leftX = 36,
      panH = stageH - 24,
      panY = stageY + 12;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.fillRect(leftX, panY, splitW, panH);
    ctx.strokeRect(leftX, panY, splitW, panH);

    ctx.fillStyle = "#1e40af";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Scalar: ${info.scalar}`, leftX + splitW / 2, panY + 26);

    const gaugeY = panY + 90,
      barMaxW = 200,
      barFill = (mag / 20) * barMaxW;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(leftX + (splitW - barMaxW) / 2, gaugeY, barMaxW, 26);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(leftX + (splitW - barMaxW) / 2, gaugeY, barFill, 26);
    ctx.strokeRect(leftX + (splitW - barMaxW) / 2, gaugeY, barMaxW, 26);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 20px 'Source Code Pro', monospace";
    ctx.fillText(`${mag} ${info.sUnit}`, leftX + splitW / 2, gaugeY + 60);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      "Fully defined by a single real number with unit.",
      leftX + splitW / 2,
      gaugeY + 95
    );
    ctx.fillText(
      "Does NOT change when rotated in space.",
      leftX + splitW / 2,
      gaugeY + 115
    );

    const rightX = leftX + splitW + 12;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.fillRect(rightX, panY, splitW, panH);
    ctx.strokeRect(rightX, panY, splitW, panH);

    ctx.fillStyle = "#065f46";
    ctx.font = "700 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Vector: ${info.vector}`, rightX + splitW / 2, panY + 26);

    const ox = rightX + splitW / 2 - 20,
      oy = panY + 160,
      sc = 6.5;
    const ax = ox + vx * sc,
      ay = oy - vy * sc;

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox - 90, oy);
    ctx.lineTo(ox + 120, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy + 70);
    ctx.lineTo(ox, oy - 100);
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.font = "600 10px 'Source Code Pro'";
    ctx.fillText("+x", ox + 128, oy + 4);
    ctx.fillText("+y", ox + 4, oy - 104);

    ctx.strokeStyle = "rgba(16,185,129,0.5)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, oy);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ox, ay);
    ctx.stroke();
    ctx.setLineDash([]);

    arrow(ctx, ox, oy, ax, ay, "#10b981", 3.5);
    circle(ctx, ox, oy, 4, "#0f172a");

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 28, 0, -angRad, true);
    ctx.stroke();
    ctx.fillStyle = "#b45309";
    ctx.font = "700 10px Outfit";
    ctx.fillText(
      `θ=${angDeg}°`,
      ox + 38 * Math.cos(-angRad / 2),
      oy + 38 * Math.sin(-angRad / 2)
    );

    ctx.fillStyle = "#065f46";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `|V| = ${mag} ${info.vUnit}`,
      rightX + splitW / 2,
      panY + panH - 12
    );

    const tipY = H - 32;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, tipY, W - 48, 26, 6)
      : ctx.rect(24, tipY, W - 48, 26);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("💡 VECTOR PRINCIPLE:", 36, tipY + 17);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      "Scalars require only size (5 kg). Vectors require both magnitude and direction in space (5 N North).",
      175,
      tipY + 17
    );
  },
  graphPoint: (s, p) => {
    const mag = Math.max(1, p.mag || 10);
    const angRad = ((p.angle || 35) * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;
    return {
      angle: p.angle || 35,
      vx: round2(mag * Math.cos(angRad)),
      vy: round2(mag * Math.sin(angRad)),
      mag,
    };
  },
  xKey: "angle",
  xLabel: "Vector Angle (degrees)",
  series: [
    { key: "vx", label: "Vx = V cos(θ)", color: "#2563eb" },
    { key: "vy", label: "Vy = V sin(θ)", color: "#f59e0b" },
    { key: "mag", label: "|V| Magnitude", color: "#10b981" },
  ],
  stats: (s, p) => {
    const q = Math.max(1, Math.min(6, Math.round(p.qty || 2)));
    const mag = Math.max(1, p.mag || 10);
    const angDeg = p.angle || 35;
    const angRad = (angDeg * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;
    const PAIRS = {
      1: { s: "Distance", v: "Displacement", u: "m" },
      2: { s: "Speed", v: "Velocity", u: "m/s" },
      3: { s: "Mass", v: "Force", u: "N" },
      4: { s: "Time", v: "Momentum", u: "kg·m/s" },
      5: { s: "Temperature", v: "Temp Grad", u: "K" },
      6: { s: "Energy", v: "Torque", u: "J" },
    };
    const info = PAIRS[q];
    return [
      {
        label: "Scalar Concept",
        value: `${mag} ${info.u}`,
        unit: `(${info.s})`,
      },
      {
        label: "Vector Magnitude",
        value: `${mag} ${info.u}`,
        unit: `(${info.v})`,
      },
      { label: "Direction (θ)", value: `${angDeg}`, unit: "°" },
      {
        label: "Horizontal Vx",
        value: `${round2(mag * Math.cos(angRad))}`,
        unit: info.u,
      },
      {
        label: "Vertical Vy",
        value: `${round2(mag * Math.sin(angRad))}`,
        unit: info.u,
      },
      { label: "Type Difference", value: "Mag vs Mag+Dir", unit: "" },
    ];
  },
};

/* ================= 6. VECTOR RESOLUTION ================= */
const vectorResolution = {
  title: "Vector Resolution",
  topic: "mechanics",
  difficulty: "Beginner",
  summary:
    "Decompose a 2D vector into perpendicular orthogonal components: Ax = A cos θ and Ay = A sin θ, and verify Pythagorean reconstruction.",
  equation:
    "\\vec{A} = A_x\\hat{i} + A_y\\hat{j}, \\quad A_x = A\\cos\\theta, \\quad A_y = A\\sin\\theta",
  params: [
    {
      key: "mag",
      label: "Vector Magnitude (|A|)",
      min: 1,
      max: 20,
      step: 0.5,
      default: 10,
      unit: "",
    },
    {
      key: "angle",
      label: "Vector Angle (θ)",
      min: 0,
      max: 360,
      step: 5,
      default: 30,
      unit: "°",
    },
  ],
  init: () => ({ t: 0, scan: 0 }),
  step: (s, dt) => {
    s.t += dt;
    s.scan = (s.scan + dt * 2) % (Math.PI * 2);
  },
  draw: (ctx, s, p, W, H) => {
    const mag = Math.max(1, p.mag || 10);
    const angDeg = p.angle !== undefined ? p.angle : 30;
    const angRad = (angDeg * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;

    const ax = mag * Math.cos(angRad);
    const ay = mag * Math.sin(angRad);
    const reconMag = Math.hypot(ax, ay);

    const bannerY = 8,
      bannerH = 56;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, bannerY, W - 48, bannerH, 8)
      : ctx.rect(24, bannerY, W - 48, bannerH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eff6ff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(36, bannerY + 8, 175, 40, 6)
      : ctx.rect(36, bannerY + 8, 175, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`|A| = ${mag}  (θ = ${angDeg}°)`, 36 + 87, bannerY + 24);
    ctx.font = "500 9.5px Outfit, sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("Primary Vector", 36 + 87, bannerY + 38);

    const axBoxX = 220;
    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(axBoxX, bannerY + 8, 160, 40, 6)
      : ctx.rect(axBoxX, bannerY + 8, 160, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#065f46";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.fillText(`Ax = ${round2(ax)}`, axBoxX + 80, bannerY + 24);
    ctx.font = "500 9.5px Outfit, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText("Ax = A · cos(θ)", axBoxX + 80, bannerY + 38);

    const ayBoxX = 390;
    ctx.fillStyle = "#fef3c7";
    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(ayBoxX, bannerY + 8, 160, 40, 6)
      : ctx.rect(ayBoxX, bannerY + 8, 160, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#92400e";
    ctx.font = "700 14px 'Source Code Pro', monospace";
    ctx.fillText(`Ay = ${round2(ay)}`, ayBoxX + 80, bannerY + 24);
    ctx.font = "500 9.5px Outfit, sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("Ay = A · sin(θ)", ayBoxX + 80, bannerY + 38);

    const pyBoxX = 560;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(pyBoxX, bannerY + 8, W - 48 - pyBoxX + 12, 40, 6)
      : ctx.rect(pyBoxX, bannerY + 8, W - 48 - pyBoxX + 12, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px 'Source Code Pro', monospace";
    ctx.fillText(
      `√(Ax²+Ay²) = ${round2(reconMag)}`,
      pyBoxX + (W - 48 - pyBoxX + 12) / 2,
      bannerY + 24
    );
    ctx.font = "500 9.5px Outfit, sans-serif";
    ctx.fillStyle = "#16a34a";
    ctx.fillText(
      "✓ 100% Reconstructed",
      pyBoxX + (W - 48 - pyBoxX + 12) / 2,
      bannerY + 38
    );

    const stageY = 72,
      stageH = 326;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, stageY, W - 48, stageH, 8)
      : ctx.rect(24, stageY, W - 48, stageH);
    ctx.fill();
    ctx.stroke();

    const ox = 260,
      oy = stageY + stageH / 2 + 30,
      sc = 10;
    const px = ox + ax * sc,
      py = oy - ay * sc;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let g = -20; g <= 20; g += 5) {
      ctx.beginPath();
      ctx.moveTo(ox + g * sc, stageY + 15);
      ctx.lineTo(ox + g * sc, stageY + stageH - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, oy - g * sc);
      ctx.lineTo(W - 40, oy - g * sc);
      ctx.stroke();
    }

    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, oy);
    ctx.lineTo(W - 40, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, stageY + 15);
    ctx.lineTo(ox, stageY + stageH - 15);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "700 12px 'Source Code Pro', monospace";
    ctx.fillText("+x axis", W - 75, oy - 6);
    ctx.fillText("+y axis", ox + 8, stageY + 30);

    ctx.strokeStyle = "rgba(100,116,139,0.5)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, oy);
    ctx.lineTo(px, py);
    ctx.lineTo(ox, py);
    ctx.stroke();
    ctx.setLineDash([]);

    const rSize = 12;
    const rSignX = ax >= 0 ? 1 : -1,
      rSignY = ay >= 0 ? -1 : 1;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - rSignX * rSize, oy);
    ctx.lineTo(px - rSignX * rSize, oy + rSignY * rSize);
    ctx.lineTo(px, oy + rSignY * rSize);
    ctx.stroke();

    arrow(ctx, ox, oy, px, oy, "#10b981", 3.5);
    ctx.fillStyle = "#065f46";
    ctx.font = "700 13px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `Ax = ${round2(ax)}`,
      ox + (ax * sc) / 2,
      oy + (ay >= 0 ? 20 : -10)
    );

    arrow(ctx, px, oy, px, py, "#f59e0b", 3.5);
    ctx.fillStyle = "#92400e";
    ctx.font = "700 13px 'Source Code Pro', monospace";
    ctx.textAlign = ax >= 0 ? "left" : "right";
    ctx.fillText(`Ay = ${round2(ay)}`, px + (ax >= 0 ? 10 : -10), oy - (ay * sc) / 2);

    arrow(ctx, ox, oy, px, py, "#2563eb", 4);
    circle(ctx, ox, oy, 4.5, "#0f172a");
    ctx.fillStyle = "#1e40af";
    ctx.font = "700 15px 'Source Code Pro', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `A = ${mag}`,
      (ox + px) / 2 - 12 * Math.sin(angRad),
      (oy + py) / 2 - 12 * Math.cos(angRad)
    );

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ox, oy, 32, 0, -angRad, angRad > 0);
    ctx.stroke();
    ctx.fillStyle = "#b45309";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.fillText(
      `θ = ${angDeg}°`,
      ox + 46 * Math.cos(-angRad / 2),
      oy + 46 * Math.sin(-angRad / 2)
    );

    const boxX = W - 230,
      boxY = stageY + 20,
      boxW = 200,
      boxH = 200;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(boxX, boxY, boxW, boxH, 8)
      : ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Trigonometric Relations", boxX + boxW / 2, boxY + 22);

    ctx.fillStyle = "#166534";
    ctx.font = "600 12px 'Source Code Pro'";
    ctx.textAlign = "left";
    ctx.fillText("cos θ = Adjacent / Hyp", boxX + 16, boxY + 50);
    ctx.fillText(`cos(${angDeg}°) = Ax / A`, boxX + 16, boxY + 68);
    ctx.fillText(`→ Ax = ${mag}·cos(${angDeg}°) = ${round2(ax)}`, boxX + 16, boxY + 86);

    ctx.fillStyle = "#92400e";
    ctx.fillText("sin θ = Opposite / Hyp", boxX + 16, boxY + 116);
    ctx.fillText(`sin(${angDeg}°) = Ay / A`, boxX + 16, boxY + 134);
    ctx.fillText(`→ Ay = ${mag}·sin(${angDeg}°) = ${round2(ay)}`, boxX + 16, boxY + 152);

    ctx.fillStyle = "#2563eb";
    ctx.font = "700 12px 'Source Code Pro'";
    ctx.fillText(`A² = (${round2(ax)})² + (${round2(ay)})²`, boxX + 16, boxY + 180);

    const tipY = H - 32;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(24, tipY, W - 48, 26, 6)
      : ctx.rect(24, tipY, W - 48, 26);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("💡 RESOLUTION PRINCIPLE:", 36, tipY + 17);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 11px Outfit, sans-serif";
    ctx.fillText(
      "Any 2D vector A can be resolved into orthogonal components: Ax = A cos θ (horizontal) and Ay = A sin θ (vertical).",
      200,
      tipY + 17
    );
  },
  graphPoint: (s, p) => {
    const mag = Math.max(1, p.mag || 10);
    const angDeg = p.angle !== undefined ? p.angle : 30;
    const angRad = (angDeg * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;
    return {
      angle: angDeg,
      ax: round2(mag * Math.cos(angRad)),
      ay: round2(mag * Math.sin(angRad)),
      A: mag,
    };
  },
  xKey: "angle",
  xLabel: "Vector Angle θ (degrees)",
  series: [
    { key: "ax", label: "Ax = A cos(θ)", color: "#10b981" },
    { key: "ay", label: "Ay = A sin(θ)", color: "#f59e0b" },
    { key: "A", label: "Magnitude |A|", color: "#2563eb" },
  ],
  stats: (s, p) => {
    const mag = Math.max(1, p.mag || 10);
    const angDeg = p.angle !== undefined ? p.angle : 30;
    const angRad = (angDeg * Math.PI) / 180;
    const round2 = (x) => Math.round(x * 100) / 100;
    const ax = mag * Math.cos(angRad);
    const ay = mag * Math.sin(angRad);
    return [
      { label: "Vector Magnitude |A|", value: `${mag}`, unit: "" },
      { label: "Direction Angle (θ)", value: `${angDeg}`, unit: "°" },
      { label: "Horizontal Ax", value: `${round2(ax)}`, unit: "(A cos θ)" },
      { label: "Vertical Ay", value: `${round2(ay)}`, unit: "(A sin θ)" },
      {
        label: "Reconstruction √(Ax²+Ay²)",
        value: `${round2(Math.hypot(ax, ay))}`,
        unit: "",
      },
      { label: "Resolution State", value: "Orthogonal", unit: "" },
    ];
  },
};

const kinematics1d = {
  title: "Motion & Graphs (1D)", topic: "mechanics", difficulty: "Beginner",
  summary: "Uniformly accelerated motion — watch position, velocity and acceleration graphs build live.",
  equation: "v = u + at, \\quad s = ut + \\tfrac{1}{2}at^2",
  params: [
    { key: "u", label: "Initial velocity", min: -20, max: 30, step: 1, default: 5, unit: "m/s" },
    { key: "a", label: "Acceleration", min: -8, max: 8, step: 0.5, default: 2, unit: "m/s²" },
  ],
  init: (p) => ({ x: 0, v: p.u, t: 0 }),
  step: (s, dt, p) => { s.v += p.a * dt; s.x += s.v * dt; s.t += dt; if (s.t > 12) { s.x = 0; s.v = p.u; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const roadY = H - 90; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, roadY + 26); ctx.lineTo(W - 30, roadY + 26); ctx.stroke();
    const scale = 7; let px = 60 + ((s.x * scale) % (W - 120));
    if (px < 60) px += W - 120;
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px - 22, roadY - 6, 44, 26);
    circle(ctx, px - 12, roadY + 22, 6, "#334155"); circle(ctx, px + 12, roadY + 22, 6, "#334155");
    arrow(ctx, px, roadY - 16, px + Math.max(-40, Math.min(40, s.v * 3)), roadY - 16, "#f59e0b");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), x: r2(s.x), v: r2(s.v), a: p.a }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "x", label: "Position (m)", color: "#2563eb" }, { key: "v", label: "Velocity (m/s)", color: "#f59e0b" }, { key: "a", label: "Acceleration (m/s²)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "Position", value: r2(s.x), unit: "m" }, { label: "Velocity", value: r2(s.v), unit: "m/s" },
    { label: "Acceleration", value: p.a, unit: "m/s²" }, { label: "Time", value: r2(s.t), unit: "s" }],
};

const vectors = {
  title: "Vector Addition", topic: "mechanics", difficulty: "Beginner",
  summary: "Add two vectors tip-to-tail and see the resultant and its components change instantly.",
  equation: "\\vec{R} = \\vec{A} + \\vec{B}",
  params: [
    { key: "a", label: "Vector A magnitude", min: 1, max: 10, step: 0.5, default: 6, unit: "" },
    { key: "aAng", label: "Vector A angle", min: 0, max: 360, step: 5, default: 30, unit: "°" },
    { key: "b", label: "Vector B magnitude", min: 1, max: 10, step: 0.5, default: 5, unit: "" },
    { key: "bAng", label: "Vector B angle", min: 0, max: 360, step: 5, default: 110, unit: "°" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const ox = W / 2 - 40, oy = H / 2 + 40, sc = 18;
    const ax = p.a * Math.cos(p.aAng * RAD), ay = -p.a * Math.sin(p.aAng * RAD);
    const bx = p.b * Math.cos(p.bAng * RAD), by = -p.b * Math.sin(p.bAng * RAD);
    arrow(ctx, ox, oy, ox + ax * sc, oy + ay * sc, "#2563eb", 3);
    arrow(ctx, ox + ax * sc, oy + ay * sc, ox + (ax + bx) * sc, oy + (ay + by) * sc, "#f59e0b", 3);
    arrow(ctx, ox, oy, ox + (ax + bx) * sc, oy + (ay + by) * sc, "#10b981", 3.5);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'";
    ctx.fillText("A", ox + ax * sc / 2, oy + ay * sc / 2 - 6);
    ctx.fillText("R", ox + (ax + bx) * sc / 2 + 8, oy + (ay + by) * sc / 2);
  },
  graphPoint: (s, p) => {
    const rx = p.a * Math.cos(p.aAng * RAD) + p.b * Math.cos(p.bAng * RAD);
    const ry = p.a * Math.sin(p.aAng * RAD) + p.b * Math.sin(p.bAng * RAD);
    return { t: r2(s.t), R: r2(Math.hypot(rx, ry)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "R", label: "Resultant magnitude", color: "#10b981" }],
  stats: (s, p) => {
    const rx = p.a * Math.cos(p.aAng * RAD) + p.b * Math.cos(p.bAng * RAD);
    const ry = p.a * Math.sin(p.aAng * RAD) + p.b * Math.sin(p.bAng * RAD);
    return [{ label: "Resultant |R|", value: r2(Math.hypot(rx, ry)), unit: "" },
      { label: "Angle", value: r2(((Math.atan2(ry, rx) / RAD) + 360) % 360), unit: "°" },
      { label: "Rx", value: r2(rx), unit: "" }, { label: "Ry", value: r2(ry), unit: "" }];
  },
};

const newton2 = {
  title: "Newton's Second Law", topic: "mechanics", difficulty: "Beginner",
  summary: "Apply a force to a block on a rough surface and watch F = ma play out with friction.",
  equation: "F_{net} = ma, \\quad f = \\mu m g",
  params: [
    { key: "force", label: "Applied force", min: 0, max: 60, step: 1, default: 25, unit: "N" },
    { key: "mass", label: "Mass", min: 1, max: 12, step: 0.5, default: 4, unit: "kg" },
    { key: "mu", label: "Friction (μ)", min: 0, max: 0.6, step: 0.02, default: 0.15, unit: "" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ x: 0, v: 0, t: 0 }),
  step: (s, dt, p) => {
    const f = p.mu * p.mass * p.gravity;
    let net = p.force - (s.v > 0.001 ? f : p.force > f ? f : 0);
    let a = net / p.mass; if (p.force <= f && s.v <= 0.001) a = 0;
    s.v += a * dt; if (s.v < 0) s.v = 0; s.x += s.v * dt; s.t += dt;
    if (s.x > 30) { s.x = 0; s.v = 0; s.t = 0; }
  },
  draw: (ctx, s, p, W, H) => {
    const gy = H - 80; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(W - 30, gy); ctx.stroke();
    let px = 80 + ((s.x * 20) % (W - 160)); const sz = 26 + p.mass * 3;
    ctx.fillStyle = "#2563eb"; ctx.fillRect(px, gy - sz, sz, sz);
    arrow(ctx, px + sz, gy - sz / 2, px + sz + Math.min(70, p.force * 1.6), gy - sz / 2, "#ef4444", 3);
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.fillText(p.force + "N", px + sz + 8, gy - sz / 2 - 8);
  },
  graphPoint: (s) => ({ t: r2(s.t), v: r2(s.v), x: r2(s.x) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Velocity (m/s)", color: "#f59e0b" }, { key: "x", label: "Position (m)", color: "#2563eb" }],
  stats: (s, p) => {
    const f = p.mu * p.mass * p.gravity; const a = Math.max(0, (p.force - f) / p.mass);
    return [{ label: "Acceleration", value: r2(a), unit: "m/s²" }, { label: "Friction", value: r2(f), unit: "N" },
      { label: "Weight", value: r2(p.mass * p.gravity), unit: "N" }, { label: "Velocity", value: r2(s.v), unit: "m/s" }];
  },
};

const momentum2d = {
  title: "2D Collision", topic: "mechanics", difficulty: "Advanced",
  summary: "Fire a ball at a target ball with an offset and watch 2D momentum conservation scatter them.",
  equation: "\\vec{p}_i = \\vec{p}_f",
  params: [
    { key: "speed", label: "Incoming speed", min: 2, max: 12, step: 0.5, default: 7, unit: "" },
    { key: "impact", label: "Impact offset", min: -1, max: 1, step: 0.1, default: 0.4, unit: "" },
    { key: "m1", label: "Ball 1 mass", min: 1, max: 6, step: 0.5, default: 2, unit: "" },
    { key: "m2", label: "Ball 2 mass", min: 1, max: 6, step: 0.5, default: 2, unit: "" },
  ],
  init: (p) => ({ x1: 90, y1: 220 + p.impact * 40, vx1: p.speed * 34, vy1: 0, x2: 470, y2: 220, vx2: 0, vy2: 0, t: 0, hit: false }),
  step: (s, dt, p) => {
    s.x1 += s.vx1 * dt; s.y1 += s.vy1 * dt; s.x2 += s.vx2 * dt; s.y2 += s.vy2 * dt; s.t += dt;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, d = Math.hypot(dx, dy);
    if (!s.hit && d < 40) {
      s.hit = true; const nx = dx / d, ny = dy / d;
      const p1 = s.vx1 * nx + s.vy1 * ny, p2 = s.vx2 * nx + s.vy2 * ny;
      const m1 = p.m1, m2 = p.m2;
      const v1 = ((m1 - m2) * p1 + 2 * m2 * p2) / (m1 + m2);
      const v2 = ((m2 - m1) * p2 + 2 * m1 * p1) / (m1 + m2);
      s.vx1 += (v1 - p1) * nx; s.vy1 += (v1 - p1) * ny;
      s.vx2 += (v2 - p2) * nx; s.vy2 += (v2 - p2) * ny;
    }
    if (s.x1 > 700 || s.x2 > 700 || s.t > 10) Object.assign(s, kinInit(p));
  },
  draw: (ctx, s, p, W, H) => {
    circle(ctx, s.x1, s.y1, 14 + p.m1 * 2, "#2563eb", "#1e40af");
    circle(ctx, s.x2, s.y2, 14 + p.m2 * 2, "#f59e0b", "#b45309");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), p: r2(p.m1 * Math.hypot(s.vx1, s.vy1) / 34 + p.m2 * Math.hypot(s.vx2, s.vy2) / 34) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "p", label: "Total |momentum|", color: "#2563eb" }],
  stats: (s, p) => [
    { label: "Ball 1 speed", value: r2(Math.hypot(s.vx1, s.vy1) / 34), unit: "" },
    { label: "Ball 2 speed", value: r2(Math.hypot(s.vx2, s.vy2) / 34), unit: "" },
    { label: "Status", value: s.hit ? "after impact" : "approaching", unit: "" },
    { label: "Time", value: r2(s.t), unit: "s" }],
};
function kinInit(p) { return { x1: 90, y1: 220 + p.impact * 40, vx1: p.speed * 34, vy1: 0, x2: 470, y2: 220, vx2: 0, vy2: 0, t: 0, hit: false }; }

const com = {
  title: "Centre of Mass", topic: "mechanics", difficulty: "Intermediate",
  summary: "Place two masses on a rod and find the balance point — the centre of mass.",
  equation: "x_{cm} = \\frac{m_1x_1 + m_2x_2}{m_1 + m_2}",
  params: [
    { key: "m1", label: "Mass 1", min: 1, max: 10, step: 0.5, default: 3, unit: "kg" },
    { key: "m2", label: "Mass 2", min: 1, max: 10, step: 0.5, default: 6, unit: "kg" },
    { key: "sep", label: "Separation", min: 1, max: 8, step: 0.5, default: 5, unit: "m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const y = H / 2, sc = 44, x1 = W / 2 - (p.sep * sc) / 2, x2 = W / 2 + (p.sep * sc) / 2;
    const xcm = (p.m1 * 0 + p.m2 * p.sep) / (p.m1 + p.m2); const xcmpx = x1 + xcm * sc;
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    circle(ctx, x1, y, 12 + p.m1 * 2.4, "#2563eb", "#1e40af");
    circle(ctx, x2, y, 12 + p.m2 * 2.4, "#f59e0b", "#b45309");
    ctx.fillStyle = "#10b981"; ctx.beginPath(); ctx.moveTo(xcmpx, y + 24); ctx.lineTo(xcmpx - 8, y + 40); ctx.lineTo(xcmpx + 8, y + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#334155"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center";
    ctx.fillText("CM", xcmpx, y + 54); ctx.textAlign = "left";
  },
  graphPoint: (s, p) => ({ t: r2(s.t), xcm: r2((p.m2 * p.sep) / (p.m1 + p.m2)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "xcm", label: "CM position from m₁ (m)", color: "#10b981" }],
  stats: (s, p) => [
    { label: "x_cm from m₁", value: r2((p.m2 * p.sep) / (p.m1 + p.m2)), unit: "m" },
    { label: "x_cm from m₂", value: r2((p.m1 * p.sep) / (p.m1 + p.m2)), unit: "m" },
    { label: "Total mass", value: r2(p.m1 + p.m2), unit: "kg" },
    { label: "Ratio m₁:m₂", value: r2(p.m1 / p.m2), unit: "" }],
};

const rotation = {
  title: "Torque & Rotation", topic: "mechanics", difficulty: "Intermediate",
  summary: "Apply a torque to a disk and study angular acceleration and moment of inertia.",
  equation: "\\tau = I\\alpha, \\quad I = \\tfrac{1}{2}MR^2",
  params: [
    { key: "torque", label: "Torque", min: 1, max: 40, step: 1, default: 12, unit: "N·m" },
    { key: "mass", label: "Disk mass", min: 1, max: 12, step: 0.5, default: 4, unit: "kg" },
    { key: "radius", label: "Radius", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "m" },
  ],
  init: () => ({ th: 0, om: 0, t: 0 }),
  step: (s, dt, p) => { const I = 0.5 * p.mass * p.radius * p.radius; s.om += (p.torque / I) * dt; s.th += s.om * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, R = 30 + p.radius * 34;
    circle(ctx, cx, cy, R, "#dbeafe", "#2563eb");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.th);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * Math.cos(i * Math.PI / 3), R * Math.sin(i * Math.PI / 3)); ctx.stroke(); }
    ctx.restore(); circle(ctx, cx, cy, 6, "#334155");
    arrow(ctx, cx + R + 8, cy - 20, cx + R + 8, cy + 20, "#ef4444", 3);
  },
  graphPoint: (s) => ({ t: r2(s.t), om: r2(s.om), th: r2(s.th) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "om", label: "Angular velocity (rad/s)", color: "#f59e0b" }, { key: "th", label: "Angle (rad)", color: "#2563eb" }],
  stats: (s, p) => { const I = 0.5 * p.mass * p.radius * p.radius; return [
    { label: "Moment of inertia", value: r2(I), unit: "kg·m²" }, { label: "Ang. accel", value: r2(p.torque / I), unit: "rad/s²" },
    { label: "Ang. velocity", value: r2(s.om), unit: "rad/s" }, { label: "Rot. KE", value: r2(0.5 * I * s.om * s.om), unit: "J" }]; },
};

const rolling = {
  title: "Rolling Motion", topic: "mechanics", difficulty: "Advanced",
  summary: "Roll a cylinder down an incline and see how rotational inertia slows its acceleration.",
  equation: "a = \\frac{g\\sin\\theta}{1 + I/mr^2}",
  params: [
    { key: "angle", label: "Incline angle", min: 5, max: 40, step: 1, default: 25, unit: "°" },
    { key: "gravity", label: "Gravity", min: 1, max: 25, step: 0.1, default: 9.8, unit: "m/s²" },
  ],
  init: () => ({ s: 0, v: 0, t: 0, done: false }),
  step: (st, dt, p) => { if (st.done) return; const a = (p.gravity * Math.sin(p.angle * RAD)) / 1.5; st.v += a * 20 * dt; st.s += st.v * dt; st.t += dt; if (st.s > 380) st.done = true; },
  draw: (ctx, st, p, W, H) => {
    const th = p.angle * RAD, bx = 80, by = H - 50, len = 420;
    const tx = bx + len * Math.cos(th), ty = by - len * Math.sin(th);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    const f = st.s / 380, r = 20;
    const px = tx - (len * f) * Math.cos(th) * 0.86 - r * Math.sin(th), py = ty + (len * f) * Math.sin(th) * 0.86 - r * Math.cos(th);
    ctx.save(); ctx.translate(px, py); ctx.rotate(st.s / r);
    circle(ctx, 0, 0, r, "#f59e0b", "#b45309"); ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore();
  },
  graphPoint: (st) => ({ t: r2(st.t), v: r2(st.v / 20), s: r2(st.s / 20) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "v", label: "Speed (m/s)", color: "#f59e0b" }, { key: "s", label: "Distance (m)", color: "#2563eb" }],
  stats: (st, p) => [
    { label: "Acceleration", value: r2((p.gravity * Math.sin(p.angle * RAD)) / 1.5), unit: "m/s²" },
    { label: "Slide-only a", value: r2(p.gravity * Math.sin(p.angle * RAD)), unit: "m/s²" },
    { label: "Speed", value: r2(st.v / 20), unit: "m/s" }, { label: "I factor", value: "½MR²", unit: "" }],
};

const angmom = {
  title: "Angular Momentum", topic: "mechanics", difficulty: "Advanced",
  summary: "Pull a spinning skater's arms in and watch angular velocity rise as L stays conserved.",
  equation: "L = I\\omega = \\text{const}",
  params: [
    { key: "arm", label: "Arm extension", min: 0.3, max: 2, step: 0.1, default: 1.5, unit: "m" },
    { key: "L", label: "Angular momentum", min: 2, max: 20, step: 1, default: 10, unit: "kg·m²/s" },
  ],
  init: () => ({ ph: 0, t: 0 }),
  step: (s, dt, p) => { const I = 1 + p.arm * p.arm; s.ph += (p.L / I) * dt; s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const cx = W / 2, cy = H / 2, arm = 30 + p.arm * 55;
    circle(ctx, cx, cy, 20, "#2563eb", "#1e40af");
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.ph);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.stroke();
    circle(ctx, -arm, 0, 8, "#f59e0b"); circle(ctx, arm, 0, 8, "#f59e0b"); ctx.restore();
  },
  graphPoint: (s, p) => ({ t: r2(s.t), om: r2(p.L / (1 + p.arm * p.arm)) }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "om", label: "Angular velocity (rad/s)", color: "#f59e0b" }],
  stats: (s, p) => { const I = 1 + p.arm * p.arm; return [
    { label: "Moment of inertia", value: r2(I), unit: "kg·m²" }, { label: "Angular velocity", value: r2(p.L / I), unit: "rad/s" },
    { label: "Angular momentum", value: p.L, unit: "kg·m²/s" }, { label: "Rot. KE", value: r2(0.5 * p.L * p.L / I), unit: "J" }]; },
};

const resonance = {
  title: "Resonance", topic: "mechanics", difficulty: "Advanced",
  summary: "Drive an oscillator at different frequencies and watch amplitude peak at resonance.",
  equation: "A = \\frac{F_0}{\\sqrt{(k-m\\omega^2)^2 + (c\\omega)^2}}",
  params: [
    { key: "drive", label: "Drive frequency", min: 0.2, max: 3, step: 0.05, default: 1, unit: "Hz" },
    { key: "damping", label: "Damping (c)", min: 0.2, max: 4, step: 0.1, default: 1, unit: "" },
    { key: "k", label: "Stiffness (k)", min: 10, max: 80, step: 1, default: 40, unit: "N/m" },
  ],
  init: () => ({ t: 0 }),
  step: (s, dt) => { s.t += dt; },
  draw: (ctx, s, p, W, H) => {
    const m = 1, w = 2 * Math.PI * p.drive, w0 = Math.sqrt(p.k / m);
    const A = 8 / Math.sqrt(Math.pow(p.k - m * w * w, 2) + Math.pow(p.damping * w, 2));
    const cx = W / 2, cy = H / 2; const disp = A * 40 * Math.sin(w * s.t);
    ctx.fillStyle = "#334155"; ctx.fillRect(cx - 90, cy - 60, 10, 120);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 80, cy); ctx.lineTo(cx + disp - 24, cy); ctx.stroke();
    ctx.fillStyle = w > w0 * 0.9 && w < w0 * 1.1 ? "#ef4444" : "#2563eb"; ctx.fillRect(cx + disp - 24, cy - 24, 48, 48);
    ctx.fillStyle = "#334155"; ctx.font = "600 12px 'Source Code Pro'"; ctx.fillText("f₀ = " + r2(w0 / (2 * Math.PI)) + " Hz", cx - 60, cy - 80);
  },
  graphPoint: (s, p) => {
    const w = 2 * Math.PI * p.drive; const A = 8 / Math.sqrt(Math.pow(p.k - w * w, 2) + Math.pow(p.damping * w, 2));
    return { t: r2(s.t), x: r2(A * Math.sin(w * s.t)) };
  },
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "x", label: "Displacement (m)", color: "#2563eb" }],
  stats: (s, p) => { const w = 2 * Math.PI * p.drive, w0 = Math.sqrt(p.k);
    const A = 8 / Math.sqrt(Math.pow(p.k - w * w, 2) + Math.pow(p.damping * w, 2));
    return [{ label: "Natural freq", value: r2(w0 / (2 * Math.PI)), unit: "Hz" }, { label: "Drive freq", value: p.drive, unit: "Hz" },
      { label: "Amplitude", value: r2(A), unit: "m" }, { label: "Near resonance", value: (w > w0 * 0.9 && w < w0 * 1.1) ? "YES" : "no", unit: "" }]; },
};

const relativemotion = {
  title: "Relative Motion", topic: "mechanics", difficulty: "Beginner",
  summary: "Two trains on parallel tracks — see how relative velocity depends on the observer.",
  equation: "\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B",
  params: [
    { key: "vA", label: "Train A velocity", min: -20, max: 20, step: 1, default: 12, unit: "m/s" },
    { key: "vB", label: "Train B velocity", min: -20, max: 20, step: 1, default: -6, unit: "m/s" },
  ],
  init: () => ({ xa: 0, xb: 0, t: 0 }),
  step: (s, dt, p) => { s.xa += p.vA * dt; s.xb += p.vB * dt; s.t += dt; if (Math.abs(s.xa) > 40 || Math.abs(s.xb) > 40) { s.xa = 0; s.xb = 0; s.t = 0; } },
  draw: (ctx, s, p, W, H) => {
    const sc = 7; const cx = W / 2;
    const drawTrain = (y, x, color, label) => {
      let px = cx + ((x * sc) % (W - 120)); ctx.fillStyle = color; ctx.fillRect(px - 30, y - 14, 60, 28);
      circle(ctx, px - 16, y + 16, 6, "#334155"); circle(ctx, px + 16, y + 16, 6, "#334155");
      ctx.fillStyle = "#fff"; ctx.font = "600 11px 'Source Code Pro'"; ctx.textAlign = "center"; ctx.fillText(label, px, y + 4); ctx.textAlign = "left";
    };
    drawTrain(H / 2 - 50, s.xa, "#2563eb", "A"); drawTrain(H / 2 + 50, s.xb, "#f59e0b", "B");
  },
  graphPoint: (s, p) => ({ t: r2(s.t), rel: p.vA - p.vB }),
  xKey: "t", xLabel: "Time (s)",
  series: [{ key: "rel", label: "Relative velocity of A wrt B", color: "#10b981" }],
  stats: (s, p) => [
    { label: "v of A wrt B", value: r2(p.vA - p.vB), unit: "m/s" }, { label: "v of B wrt A", value: r2(p.vB - p.vA), unit: "m/s" },
    { label: "Closing speed", value: r2(Math.abs(p.vA - p.vB)), unit: "m/s" }, { label: "Same direction", value: (p.vA * p.vB) >= 0 ? "yes" : "no", unit: "" }],
};

const simsMech = {
  physicalQuantities,
  siUnits,
  dimensions,
  dimensionalAnalysis,
  scalarsVectors,
  vectorResolution,
  kinematics1d,
  vectors,
  newton2,
  momentum2d,
  com,
  rotation,
  rolling,
  angmom,
  resonance,
  relativemotion,
};
export default simsMech;
