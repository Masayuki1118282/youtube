"use client";
import { useState, useEffect } from "react";
import { Channel, YoutubeVideo } from "@/types";
import LineChart from "./LineChart";
import { getAnalyticsForRange } from "@/lib/analytics";

type Props = { channel: Channel };
type SubTab = "overview" | "content" | "audience";

function genRealtimeLabels(): string[] {
  return Array.from({ length: 12 }, (_, i) => `${i * 4}h`);
}

function genRealtimeTrend(base: number, channelSeed: number): number[] {
  // simple deterministic trend for the small realtime mini-chart
  return Array.from({ length: 12 }, (_, i) => {
    const x = Math.sin(channelSeed * 9301 + i * 49297 + 233) * 10000;
    const noise = x - Math.floor(x);
    return Math.max(1, Math.round(base * (0.6 + noise * 0.8)));
  });
}

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export default function AnalyticsTab({ channel }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("overview");
  const [range, setRange] = useState(28);
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState("");

  useEffect(() => {
    if (subTab !== "content") return;
    if (videos.length > 0) return;
    setVideosLoading(true);
    setVideosError("");
    fetch(`/api/youtube/videos?channelId=${channel.youtube_channel_id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setVideos(data))
      .catch(() => setVideosError("動画の取得に失敗しました"))
      .finally(() => setVideosLoading(false));
  }, [subTab, channel.youtube_channel_id, videos.length]);

  const data = getAnalyticsForRange(channel.youtube_channel_id, range);
  const {
    viewData, watchData, subData, labels,
    totalViews, totalWatchHours,
    viewGrowthPercent, watchGrowthPercent, subGrowthPercent,
    currentSubscribers, realtimeViewers, lifetimeViews,
  } = data;

  const channelSeed = channel.youtube_channel_id
    .split("").reduce((a, c) => a + c.charCodeAt(0), 0);

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
    { label: "視聴回数", value: fmt(totalViews), growth: Math.round(viewGrowthPercent), data: viewData },
    { label: "総再生時間（時間）", value: fmt(totalWatchHours), growth: Math.round(watchGrowthPercent), data: watchData },
    { label: "チャンネル登録者", value: fmt(currentSubscribers), growth: Math.round(subGrowthPercent), data: subData },
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
          <div>
            {videosLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {videosError && (
              <p className="text-[#FF4444] text-sm text-center py-8">{videosError}</p>
            )}
            {!videosLoading && !videosError && videos.length === 0 && (
              <p className="text-[#717171] text-sm text-center py-12">動画が見つかりません</p>
            )}
            {!videosLoading && videos.length > 0 && (
              <div>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_80px_80px] gap-3 px-3 pb-2 text-xs text-[#717171] border-b border-[#303030] mb-1">
                  <span>動画</span>
                  <span className="text-right">再生回数</span>
                  <span className="text-right">高評価</span>
                  <span className="text-right">公開日</span>
                </div>
                <div className="flex flex-col gap-1">
                  {[...videos]
                    .sort((a, b) => b.viewCount - a.viewCount)
                    .map((v) => (
                      <div
                        key={v.id}
                        className="grid grid-cols-[1fr_100px_80px_80px] gap-3 items-center px-3 py-2 rounded-lg hover:bg-[#272727] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            className="w-20 rounded flex-shrink-0 object-cover"
                            style={{ aspectRatio: "16/9", height: "45px" }}
                          />
                          <p className="text-sm text-white truncate">{v.title}</p>
                        </div>
                        <p className="text-sm font-medium text-[#34d399] text-right">{fmt(v.viewCount)}</p>
                        <p className="text-sm text-[#60a5fa] text-right">{fmt(v.likeCount)}</p>
                        <p className="text-xs text-[#717171] text-right">
                          {new Date(v.publishedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", year: "2-digit" })}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
              data={genRealtimeTrend(realtimeViewers, channelSeed)}
              labels={genRealtimeLabels()}
              color="#FF0000"
            />
          </div>
        </div>

        {/* Subscribers */}
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-3">
          <p className="text-sm font-medium text-white mb-3">登録者数</p>
          <p className="text-3xl font-semibold text-white mb-1">{fmt(currentSubscribers)}</p>
          <div className={`flex items-center gap-1 text-xs ${subGrowthPercent >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
            <span>{subGrowthPercent >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(Math.round(subGrowthPercent))}%</span>
            <span className="text-[#717171]">過去{range}日間</span>
          </div>
        </div>

        {/* Channel info */}
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">チャンネル情報</p>
          <div className="space-y-3 text-xs text-[#aaaaaa]">
            <div className="flex justify-between">
              <span>総再生数</span>
              <span className="text-white">{fmt(lifetimeViews)}</span>
            </div>
            <div className="flex justify-between">
              <span>登録者数</span>
              <span className="text-white">{fmt(currentSubscribers)}</span>
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
