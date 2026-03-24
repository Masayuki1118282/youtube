"use client";
import { Channel } from "@/types";
import BarChart from "./BarChart";

type Props = { channel: Channel };

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export default function OverviewTab({ channel }: Props) {
  const revenues = channel.monthly_revenue ?? [];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const revenueData = months.map((m) => {
    const r = revenues.find((r) => r.year === 2026 && r.month === m);
    return r ? r.revenue : 0;
  });
  const labels = months.map((m) => `${m}月`);
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-white mb-6">チャンネルの概要</h1>

      {/* Channel header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#202020] border border-[#303030] rounded-xl">
        {channel.thumbnail_url ? (
          <img src={channel.thumbnail_url} alt={channel.channel_name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-xl font-bold">
            {channel.channel_name[0]}
          </div>
        )}
        <div>
          <h2 className="text-white font-semibold text-lg">{channel.channel_name}</h2>
          {channel.handle && <p className="text-gray-400 text-sm">{channel.handle}</p>}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">登録者数</p>
          <p className="text-2xl font-bold text-[#60a5fa]">{fmt(channel.subscribers)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">総再生数</p>
          <p className="text-2xl font-bold text-[#34d399]">{fmt(channel.total_views)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">2026年 累計収益</p>
          <p className="text-2xl font-bold text-[#facc15]">¥{totalRevenue.toLocaleString("ja-JP")}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-4">2026年 月別収益</p>
        {totalRevenue > 0 ? (
          <BarChart data={revenueData} labels={labels} />
        ) : (
          <p className="text-gray-600 text-sm text-center py-8">収益データがまだ登録されていません</p>
        )}
      </div>
    </div>
  );
}
