"use client";

type Props = {
  data: number[];
  labels: string[];
  color?: string;
};

export default function LineChart({ data, labels, color = "#3ea6ff" }: Props) {
  if (data.length === 0) return null;

  const W = 600;
  const H = 180;
  const pad = { top: 12, right: 16, bottom: 28, left: 48 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * cw,
    y: pad.top + (1 - (v - min) / range) * ch,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = [
    `M ${pts[0].x.toFixed(1)} ${(pad.top + ch).toFixed(1)}`,
    ...pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.top + ch).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: pad.top + (1 - t) * ch,
    val: Math.round(min + t * range),
  }));

  // X-axis: show ~7 labels
  const xStep = Math.ceil(data.length / 7);
  const xLabels = labels.filter((_, i) => i % xStep === 0 || i === data.length - 1);
  const xPositions = labels
    .map((_, i) => i)
    .filter((i) => i % xStep === 0 || i === data.length - 1);

  const fmt = (n: number) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? (n / 1_000).toFixed(0) + "K"
    : String(n);

  const gradId = `lg-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.left} y1={t.y} x2={pad.left + cw} y2={t.y}
          stroke="#2a2a2a" strokeWidth="1" />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text key={i} x={pad.left - 6} y={t.y + 4} textAnchor="end"
          fontSize="10" fill="#717171">{fmt(t.val)}</text>
      ))}

      {/* Area */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots at endpoints */}
      <circle cx={pts[0].x} cy={pts[0].y} r="3" fill={color} />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />

      {/* X-axis labels */}
      {xPositions.map((pos, i) => (
        <text key={i}
          x={pad.left + (pos / (data.length - 1)) * cw}
          y={H - 4}
          textAnchor="middle" fontSize="10" fill="#717171">
          {xLabels[i]}
        </text>
      ))}
    </svg>
  );
}
