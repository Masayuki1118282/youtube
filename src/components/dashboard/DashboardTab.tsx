"use client";
import { Channel } from "@/types";
import { getAnalytics, formatK } from "@/lib/analytics";

type Props = { channel: Channel };

export default function DashboardTab({ channel }: Props) {
  const revenues = channel.monthly_revenue ?? [];
  const totalRevenue = revenues.reduce((a, r) => a + r.revenue, 0);
  const analytics = getAnalytics(channel.youtube_channel_id);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-white mb-6">チャンネルダッシュボード</h1>

      {/* Channel card */}
      <div className="flex items-center gap-4 mb-8 p-4 md:p-5 bg-[#202020] border border-[#303030] rounded-2xl">
        {channel.thumbnail_url ? (
          <img src={channel.thumbnail_url} alt={channel.channel_name}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {channel.channel_name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-semibold text-white truncate">{channel.channel_name}</h2>
          {channel.handle && <p className="text-sm text-[#aaaaaa]">{channel.handle}</p>}
        </div>
        <a href={`https://youtube.com/${channel.handle ?? `channel/${channel.youtube_channel_id}`}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs text-[#3ea6ff] hover:underline whitespace-nowrap flex-shrink-0 hidden sm:block">
          チャンネルを表示 →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">チャンネル登録者数</p>
          <p className="text-3xl font-semibold text-[#60a5fa]">{formatK(analytics.subscribers)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5">
          <p className="text-xs text-[#aaaaaa] mb-2">総再生回数</p>
          <p className="text-3xl font-semibold text-[#34d399]">{formatK(analytics.lifetimeViews)}</p>
        </div>
        <div className="bg-[#202020] border border-[#303030] rounded-xl p-5 md:col-span-2">
          <p className="text-xs text-[#aaaaaa] mb-2">2026年 累計収益</p>
          <p className="text-3xl font-semibold text-[#facc15]">¥{totalRevenue.toLocaleString("ja-JP")}</p>
        </div>
      </div>

      {/* News/tips */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 md:p-5">
        <p className="text-sm font-medium text-white mb-3">最新情報</p>
        <div className="space-y-3 text-sm text-[#aaaaaa]">
          {[
            "アナリティクスタブで詳細な視聴データを確認できます",
            "動画タブで最新の投稿動画一覧を確認できます",
            "収益化タブで月別の収益明細を確認できます",
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-[#3ea6ff] mt-0.5">•</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
