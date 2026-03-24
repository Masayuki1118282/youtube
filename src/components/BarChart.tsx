"use client";
type Props = { data: number[]; labels: string[] };

export default function BarChart({ data, labels }: Props) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-32 px-2">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm min-h-1 transition-all duration-500"
            style={{
              height: `${(v / max) * 100}%`,
              background: "linear-gradient(to top, #FF0000, #FF6B6B)",
            }}
          />
          {i % 2 === 0 && (
            <span className="text-[9px] text-gray-500 whitespace-nowrap">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
