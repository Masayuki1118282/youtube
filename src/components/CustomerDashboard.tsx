"use client";
import { useState } from "react";
import { User, Channel } from "@/types";
import { MOCK_CHANNELS } from "@/lib/mockData";
import { fmt, fmtYen } from "@/lib/utils";
import BarChart from "./BarChart";

type Props = {
  user: User;
  onLogout: () => void;
};

type Tab = "dashboard" | "content" | "analytics" | "revenue";

export default function CustomerDashboard({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const channel: Channel = MOCK_CHANNELS.find((c) => c.id === user.channelId) ?? MOCK_CHANNELS[0];

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "ダッシュボード", icon: "📊" },
    { id: "content", label: "コンテンツ", icon: "🎬" },
    { id: "analytics", label: "アナリティクス", icon: "📈" },
    { id: "revenue", label: "収益", icon: "💴" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <div
        className="flex flex-col border-r border-[#303030] transition-all duration-300 flex-shrink-0"
        style={{ width: collapsed ? 72 : 220 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-[#303030]">
          <div className="w-8 h-6 bg-[#FF0000] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">▶</span>
          </div>
          {!collapsed && <span className="text-white text-sm font-semibold truncate">YouTube Studio</span>}
        </div>

        {/* Channel info */}
        <div className={`px-3 py-4 border-b border-[#303030] ${collapsed ? "flex justify-center" : ""}`}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: channel.avatarColor }}
          >
            {channel.avatar}
          </div>
          {!collapsed && (
            <div className="mt-2">
              <p className="text-white text-xs font-medium truncate">{channel.name}</p>
              <p className="text-gray-500 text-xs truncate">{channel.handle}</p>
              <p className="text-gray-400 text-xs mt-1">{fmt(channel.subscribers)} 登録者</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-[#272727] text-white"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse + Logout */}
        <div className="py-2 border-t border-[#303030]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-sm transition-colors"
          >
            <span className="flex-shrink-0">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>折りたたむ</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-sm transition-colors"
          >
            <span className="flex-shrink-0">🚪</span>
            {!collapsed && <span>ログアウト</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="p-6">
            <h1 className="text-xl font-semibold text-white mb-6">チャンネルの概要</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">登録者数</p>
                <p className="text-2xl font-bold" style={{ color: "#60a5fa" }}>{fmt(channel.subscribers)}</p>
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">総視聴回数</p>
                <p className="text-2xl font-bold" style={{ color: "#34d399" }}>{fmt(channel.totalViews)}</p>
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">収益</p>
                <p className="text-2xl font-bold" style={{ color: "#facc15" }}>{fmtYen(channel.revenue)}</p>
              </div>
            </div>

            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">過去14日間の視聴回数</p>
              <BarChart data={channel.analytics.daily} labels={channel.analytics.labels} />
            </div>

            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-3">最新の動画</p>
              <div className="flex flex-col gap-3">
                {channel.videos.slice(0, 3).map((v) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <div
                      className="w-16 h-9 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0"
                      style={{ backgroundColor: v.thumbnail }}
                    >
                      {v.duration}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{v.title}</p>
                      <p className="text-xs text-gray-500">{v.date} · {fmt(v.views)} 回視聴</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="p-6">
            <h1 className="text-xl font-semibold text-white mb-6">コンテンツ</h1>
            <div className="bg-[#202020] border border-[#303030] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#303030]">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">動画</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">日付</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">視聴回数</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">高評価</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">コメント</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">収益</th>
                  </tr>
                </thead>
                <tbody>
                  {channel.videos.map((v) => (
                    <tr key={v.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-8 rounded flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0"
                            style={{ backgroundColor: v.thumbnail }}
                          >
                            {v.duration}
                          </div>
                          <span className="text-white truncate max-w-xs">{v.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">{v.date}</td>
                      <td className="px-4 py-3 text-right text-[#34d399]">{fmt(v.views)}</td>
                      <td className="px-4 py-3 text-right text-[#60a5fa]">{fmt(v.likes)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{v.comments}</td>
                      <td className="px-4 py-3 text-right text-[#facc15]">{fmtYen(v.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="p-6">
            <h1 className="text-xl font-semibold text-white mb-6">アナリティクス</h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">インプレッション数</p>
                <p className="text-2xl font-bold text-white">{fmt(channel.totalViews * 3)}</p>
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">クリック率 (CTR)</p>
                <p className="text-2xl font-bold text-[#60a5fa]">4.8%</p>
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">平均視聴時間</p>
                <p className="text-2xl font-bold text-[#34d399]">8:42</p>
              </div>
              <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">新規登録者 (14日間)</p>
                <p className="text-2xl font-bold text-[#facc15]">+{fmt(Math.floor(channel.subscribers * 0.02))}</p>
              </div>
            </div>
            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-3">視聴回数推移</p>
              <BarChart data={channel.analytics.daily} labels={channel.analytics.labels} />
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="p-6">
            <h1 className="text-xl font-semibold text-white mb-6">収益</h1>
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] border border-[#303030] rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-400 mb-1">今月の収益</p>
              <p className="text-4xl font-bold text-[#facc15]">{fmtYen(channel.revenue)}</p>
              <p className="text-xs text-gray-500 mt-2">チャンネル開設: {channel.joinDate}</p>
            </div>
            <div className="bg-[#202020] border border-[#303030] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#303030]">
                <p className="text-sm text-gray-400">動画別収益</p>
              </div>
              {channel.videos.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-3 border-b border-[#252525] hover:bg-[#252525] transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-7 rounded flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0"
                      style={{ backgroundColor: v.thumbnail }}
                    >
                      ▶
                    </div>
                    <span className="text-sm text-white truncate max-w-xs">{v.title}</span>
                  </div>
                  <span className="text-[#facc15] font-medium whitespace-nowrap ml-4">{fmtYen(v.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
