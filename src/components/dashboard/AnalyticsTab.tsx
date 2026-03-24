"use client";
import { useState } from "react";
import { Channel } from "@/types";
import LineChart from "./LineChart";

type Props = { channel: Channel };
type SubTab = "overview" | "content" | "audience";

// Deterministic pseudo-random based on seed
function seededRand(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000;
  return x - Math.floor(x);
}

function generateTrend(base: number, days: number, seed: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const trend = 1 + (i / days) * 0.15;
    const noise = 0.75 + seededRand(seed, i) * 0.5;
    return Math.max(1, Math.floor(base * trend * noise));
  });
}

function genDateLabels(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
}

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export default function AnalyticsTab({ channel }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [range, setRange] = useState(28);

  const seed = channel.youtube_channel_id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const dailyViews = Math.floor(channel.total_views / 365);
  const viewData = generateTrend(dailyViews, range, seed);
  const watchData = generateTrend(Math.floor(dailyViews * 3.5), range, seed + 1);
  const subData = generateTrend(Math.floor(channel.subscribers / 100), range, seed + 2);
  const labels = genDateLabels(range);

  const totalViews = viewData.reduce((a, b) => a + b, 0);
  const totalWatch = watchData.reduce((a, b) => a + b, 0);
  const prevViews = Math.floor(totalViews * (0.7 + seededRand(seed, 99) * 0.4));
  const prevWatch = Math.floor(totalWatch * (0.7 + seededRand(seed, 98) * 0.4));
  const prevSubs = Math.floor(channel.subscribers * (0.85 + seededRand(seed, 97) * 0.2));

  const viewGrowth = Math.round(((totalViews - prevViews) / prevViews) * 100);
  const watchGrowth = Math.round(((totalWatch - prevWatch) / prevWatch) * 100);
  const subGrowth = Math.round(((channel.subscribers - prevSubs) / prevSubs) * 100);

  const realtimeViewers = Math.floor(5 + seededRand(seed, 50) * 45);

  const subTabs: { id: SubTab; label: string }[] = [
    { id: "overview", label: "概要" },
    { id: "content", label: "コンテンツ" },
    { id: "audience", label: "視聴者" },
  ];

  const ranges = [
    { v: 7, l: "7日間" },
    { v: 28, l: "28日間" },
    { v: 90, l: "90日間" },
    { v: 365, l: "365日間" },
  ];

  const kpis = [
    { label: "視聴回数", value: fmt(totalViews), growth: viewGrowth, data: viewData },
    { label: "総再生時間（時間）", value: fmt(Math.floor(totalWatch / 60)), growth: watchGrowth, data: watchData },
    { label: "チャンネル登録者", value: fmt(channel.subscribers), growth: subGrowth, data: subData },
  ];

  const [activeKpi, setActiveKpi] = useState(0);

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 p-4 md:p-6 overflow-auto">
        <h1 className="text-xl font-semibold text-white mb-4">チャンネルアナリティクス</h1>

        {/* Sub-tabs */}
        <div className="flex gap-0 border-b border-[#303030] mb-6">
          {subTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                subTab === t.id
                  ? "text-white border-white"
                  : "text-[#aaaaaa] border-transparent hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {subTab === "overview" && (
          <>
            {/* Range selector */}
            <div className="flex gap-1 mb-6">
              {ranges.map((r) => (
                <button
                  key={r.v}
                  onClick={() => setRange(r.v)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    range === r.v
                      ? "bg-white text-[#0f0f0f] font-medium"
                      : "text-[#aaaaaa] hover:bg-[#272727] hover:text-white"
                  }`}
                >
                  {r.l}
                </button>
              ))}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {kpis.map((kpi, i) => (
                <button
                  key={i}
                  onClick={() => setActiveKpi(i)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    activeKpi === i
                      ? "bg-[#272727] border-[#3ea6ff]"
                      : "bg-[#202020] border-[#303030] hover:bg-[#252525]"
                  }`}
                >
                  <p className="text-xs text-[#aaaaaa] mb-2">{kpi.label}</p>
                  <p className="text-2xl font-semibold text-white mb-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs ${kpi.growth >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                    <span>{kpi.growth >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(kpi.growth)}%</span>
                    <span className="text-[#717171]">過去{range}日間比</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Line chart */}
            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
              <p className="text-sm text-[#aaaaaa] mb-4">{kpis[activeKpi].label}</p>
              <LineChart data={kpis[activeKpi].data} labels={labels} color="#3ea6ff" />
            </div>
          </>
        )}

        {subTab === "content" && (
          <div className="text-center py-12 text-[#717171]">
            <p className="text-4xl mb-3">🎬</p>
            <p>コンテンツ別アナリティクスは「動画」タブでご確認いただけます</p>
          </div>
        )}

        {subTab === "audience" && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-[#aaaaaa] mb-2">登録者の年齢層（推定）</p>
                {[["18〜24歳", 32], ["25〜34歳", 41], ["35〜44歳", 18], ["45〜54歳", 6], ["55歳以上", 3]].map(([label, pct]) => (
                  <div key={label as string} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#aaaaaa] w-20">{label}</span>
                    <div className="flex-1 h-1.5 bg-[#303030] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3ea6ff] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-[#aaaaaa] mb-2">視聴デバイス（推定）</p>
                {[["スマートフォン", 58], ["パソコン", 28], ["タブレット", 9], ["テレビ", 5]].map(([label, pct]) => (
                  <div key={label as string} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#aaaaaa] w-24">{label}</span>
                    <div className="flex-1 h-1.5 bg-[#303030] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3ea6ff] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-full md:w-72 flex-shrink-0 border-t md:border-t-0 md:border-l border-[#303030] p-4 overflow-auto">
        {/* Realtime */}
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">リアルタイム</p>
            <span className="w-2 h-2 bg-[#FF0000] rounded-full animate-pulse" />
          </div>
          <p className="text-3xl font-semibold text-white mb-1">{realtimeViewers}</p>
          <p className="text-xs text-[#aaaaaa]">過去48時間の視聴者数</p>
          <div className="mt-3">
            <LineChart
              data={generateTrend(realtimeViewers, 12, seed + 5)}
              labels={Array.from({ length: 12 }, (_, i) => `${i * 4}h`)}
              color="#FF0000"
            />
          </div>
        </div>

        {/* Subscribers */}
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-3">
          <p className="text-sm font-medium text-white mb-3">登録者数</p>
          <p className="text-3xl font-semibold text-white mb-1">{fmt(channel.subscribers)}</p>
          <div className="flex items-center gap-1 text-xs text-[#4ade80]">
            <span>↑</span>
            <span>{subGrowth}%</span>
            <span className="text-[#717171]">過去{range}日間</span>
          </div>
        </div>

        {/* Top content */}
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">チャンネル情報</p>
          <div className="space-y-3 text-xs text-[#aaaaaa]">
            <div className="flex justify-between">
              <span>総再生数</span>
              <span className="text-white">{fmt(channel.total_views)}</span>
            </div>
            <div className="flex justify-between">
              <span>登録者数</span>
              <span className="text-white">{fmt(channel.subscribers)}</span>
            </div>
            {channel.handle && (
              <div className="flex justify-between">
                <span>ハンドル</span>
                <span className="text-[#3ea6ff]">{channel.handle}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
