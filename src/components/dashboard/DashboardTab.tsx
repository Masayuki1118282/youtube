"use client";
import { Channel } from "@/types";

type Props = { channel: Channel };

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export default function DashboardTab({ channel }: Props) {
  const revenues = channel.monthly_revenue ?? [];
  const totalRevenue = revenues.reduce((a, r) => a + r.revenue, 0);
  const latestRevenue = revenues
    .filter((r) => r.year === 2026)
    .sort((a, b) => b.month - a.month)[0];

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-white mb-6">チャンネルダッシュボード</h1>

      {/* Channel card */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-[#202020] border border-[#303030] rounded-2xl">
        {channel.thumbnail_url ? (
          <img src={channel.thumbnail_url} alt={channel.channel_name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {channel.channel_name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{channel.channel_name}</h2>
          {channel.handle && <p className="text-sm text-[#aaaaaa]">{channel.handle}</p>}
        </div>
        <a href={`https://youtube.com/${channel.handle ?? `channel/${channel.youtube_channel_id}`}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs text-[#3ea6ff] hover:underline whitespace-nowrap flex-shrink-0">
          チャンネルを表示 →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">チャンネル登録者数</p>
          <p className="text-3xl font-semibold text-[#60a5fa]">{fmt(channel.subscribers)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">総再生回数</p>
          <p className="text-3xl font-semibold text-[#34d399]">{fmt(channel.total_views)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">2026年 累計収益</p>
          <p className="text-3xl font-semibold text-[#facc15]">¥{totalRevenue.toLocaleString("ja-JP")}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">直近月収益</p>
          <p className="text-3xl font-semibold text-[#facc15]">
            {latestRevenue ? `¥${latestRevenue.revenue.toLocaleString("ja-JP")}` : "未設定"}
          </p>
          {latestRevenue && <p className="text-xs text-[#717171] mt-1">2026年 {latestRevenue.month}月</p>}
        </div>
      </div>

      {/* News/tips */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
        <p className="text-sm font-medium text-white mb-3">最新情報</p>
        <div className="space-y-3 text-sm text-[#aaaaaa]">
          <div className="flex items-start gap-3">
            <span className="text-[#3ea6ff] mt-0.5">•</span>
            <p>アナリティクスタブで詳細な視聴データを確認できます</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#3ea6ff] mt-0.5">•</span>
            <p>動画タブで最新の投稿動画一覧を確認できます</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#3ea6ff] mt-0.5">•</span>
            <p>収益化タブで月別の収益明細を確認できます</p>
          </div>
        </div>
      </div>
    </div>
  );
}
