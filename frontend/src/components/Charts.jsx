function buildPath(points) {
  if (!points.length) return "";
  return points.map((p, i) => (i === 0 ? "M" : "L") + " " + p[0] + " " + p[1]).join(" ");
}

function smoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export function Sparkline({ data, color = "var(--acid)", width = 120, height = 30 }) {
  if (!data?.length) return null;
  const pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (width - pad * 2),
    height - pad - ((v - min) / range) * (height - pad * 2),
  ]);
  const path = smoothPath(pts);
  const area = `${path} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={area} fill={color} opacity="0.16" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function LineChart({ data, height = 240, color = "var(--acid)", xLabels, yFormatter = v => v }) {
  if (!data?.length) return null;
  const width = 720;
  const padL = 48, padR = 22, padT = 12, padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(...data, 1);
  const niceMax = Math.ceil(max / 100) * 100;
  const ticks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  const pts = data.map((v, i) => [
    padL + (i / (data.length - 1)) * innerW,
    padT + (1 - v / niceMax) * innerH,
  ]);
  const path = buildPath(pts);
  const areaPath = `${path} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block" }}>
      {ticks.map((t, i) => {
        const y = padT + (1 - t / niceMax) * innerH;
        return (
          <g key={"y" + i}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="var(--line-1)" strokeWidth="1" strokeDasharray={i === 0 ? "" : "1 4"} />
            <text x={padL - 10} y={y + 3} fontSize="10" fill="var(--paper-4)" textAnchor="end" fontFamily="var(--font-mono)">{yFormatter(t)}</text>
          </g>
        );
      })}
      {pts.map((p, i) => (
        <line key={"v" + i} x1={p[0]} x2={p[0]} y1={padT + innerH} y2={padT + innerH + 4} stroke="var(--line-2)" strokeWidth="1" />
      ))}
      <line x1={padL} x2={width - padR} y1={padT + innerH} y2={padT + innerH} stroke="var(--line-3)" strokeWidth="1" />
      <path d={areaPath} fill={color} opacity="0.10" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      {pts.map((p, i) => (
        <rect key={"d" + i} x={p[0] - 2} y={p[1] - 2} width="4" height="4" fill={color} />
      ))}
      {xLabels && xLabels.map((lbl, i) => {
        if (!lbl) return null;
        const x = padL + (i / (xLabels.length - 1)) * innerW;
        return (
          <text key={"x" + i} x={x} y={height - 10} fontSize="10" fill="var(--paper-4)" textAnchor="middle" fontFamily="var(--font-mono)">{lbl}</text>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 220, thickness = 14, centerLabel, centerSub }) {
  const radius = size / 2;
  const inner = radius - thickness;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -Math.PI / 2;

  const paths = segments.map((seg, i) => {
    const a = (seg.value / total) * Math.PI * 2;
    const x1 = radius + radius * Math.cos(angle);
    const y1 = radius + radius * Math.sin(angle);
    const x2 = radius + radius * Math.cos(angle + a);
    const y2 = radius + radius * Math.sin(angle + a);
    const x3 = radius + inner * Math.cos(angle + a);
    const y3 = radius + inner * Math.sin(angle + a);
    const x4 = radius + inner * Math.cos(angle);
    const y4 = radius + inner * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    const d = [`M ${x1} ${y1}`, `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`, `L ${x3} ${y3}`, `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`, "Z"].join(" ");
    angle += a;
    return <path key={i} d={d} fill={seg.color} />;
  });

  const tickMarks = Array.from({ length: 36 }, (_, i) => {
    const t = (i / 36) * Math.PI * 2 - Math.PI / 2;
    const r1 = radius + 4;
    const r2 = radius + (i % 9 === 0 ? 10 : 7);
    return (
      <line key={i}
        x1={radius + r1 * Math.cos(t)} y1={radius + r1 * Math.sin(t)}
        x2={radius + r2 * Math.cos(t)} y2={radius + r2 * Math.sin(t)}
        stroke={i % 9 === 0 ? "var(--paper-3)" : "var(--line-3)"} strokeWidth="1"
      />
    );
  });

  return (
    <div style={{ position: "relative", width: size + 22, height: size + 22, margin: "0 auto" }}>
      <svg width={size + 22} height={size + 22} style={{ display: "block" }}>
        <g transform="translate(11, 11)">
          {tickMarks}
          {paths}
          <circle cx={radius} cy={radius} r={inner} fill="none" stroke="var(--line-2)" strokeWidth="1" />
        </g>
      </svg>
      {(centerLabel || centerSub) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center" }}>
          {centerSub && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--paper-3)" }}>{centerSub}</div>}
          {centerLabel && <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 32, letterSpacing: "-0.02em", marginTop: 4, color: "var(--paper)", paddingBottom: "0.04em" }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}
