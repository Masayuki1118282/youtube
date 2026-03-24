"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Channel } from "@/types";
import { createClient } from "@/lib/supabase/client";
import OverviewTab from "./OverviewTab";
import VideosTab from "./VideosTab";
import RevenueTab from "./RevenueTab";

type Tab = "overview" | "videos" | "revenue";
type Props = { channels: Channel[]; userId: string };

export default function DashboardLayout({ channels, userId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState(false);

  const channel = channels.find((c) => c.id === selectedChannelId) ?? channels[0];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "概要", icon: "📊" },
    { id: "videos", label: "動画", icon: "🎬" },
    { id: "revenue", label: "収益", icon: "💴" },
  ];

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">チャンネルが登録されていません</p>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-white">ログアウト</button>
        </div>
      </div>
    );
  }

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

        {/* Channel selector */}
        {channels.length > 1 && !collapsed && (
          <div className="px-3 py-3 border-b border-[#303030]">
            <p className="text-xs text-gray-600 mb-1 px-1">チャンネル</p>
            <select
              value={selectedChannelId}
              onChange={(e) => { setSelectedChannelId(e.target.value); setActiveTab("overview"); }}
              className="w-full bg-[#1a1a1a] border border-[#303030] text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-[#FF0000]"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>{c.channel_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Channel info */}
        <div className={`px-3 py-4 border-b border-[#303030] ${collapsed ? "flex justify-center" : ""}`}>
          {channel.thumbnail_url ? (
            <img src={channel.thumbnail_url} alt={channel.channel_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {channel.channel_name[0]}
            </div>
          )}
          {!collapsed && (
            <div className="mt-2">
              <p className="text-white text-xs font-medium truncate">{channel.channel_name}</p>
              {channel.handle && <p className="text-gray-500 text-xs truncate">{channel.handle}</p>}
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
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-sm transition-colors"
          >
            <span className="flex-shrink-0">🚪</span>
            {!collapsed && <span>ログアウト</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && <OverviewTab channel={channel} />}
        {activeTab === "videos" && <VideosTab channel={channel} />}
        {activeTab === "revenue" && <RevenueTab channel={channel} />}
      </div>
    </div>
  );
}
