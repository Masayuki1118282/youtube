"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Channel } from "@/types";
import { createClient } from "@/lib/supabase/client";
import DashboardTab from "./DashboardTab";
import VideosTab from "./VideosTab";
import AnalyticsTab from "./AnalyticsTab";
import RevenueTab from "./RevenueTab";

type Tab = "dashboard" | "content" | "analytics" | "revenue";
type Props = { channels: Channel[]; userId: string };

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13 9V3h8v6h-8zM3 13V3h8v10H3zm10 8V11h8v10h-8zM3 21v-6h8v6H3z" />
      </svg>
    ),
  },
  {
    id: "content",
    label: "コンテンツ",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "アナリティクス",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
      </svg>
    ),
  },
  {
    id: "revenue",
    label: "収益化",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ channels }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const channel = channels.find((c) => c.id === selectedChannelId) ?? channels[0];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#aaaaaa] mb-4">チャンネルが登録されていません</p>
          <button onClick={handleLogout} className="text-sm text-[#3ea6ff] hover:underline">ログアウト</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center h-14 px-3 md:px-4 bg-[#202020] border-b border-[#303030] flex-shrink-0 z-40">
        {/* Left */}
        <div className="flex items-center gap-2 md:gap-4 md:w-60 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 hidden md:flex items-center justify-center rounded-full hover:bg-[#303030] transition-colors text-[#aaaaaa] hover:text-white text-lg"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-5 bg-[#FF0000] rounded-sm flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">▶</span>
            </div>
            <span className="text-white text-sm font-medium tracking-tight">YouTube</span>
            <span className="text-[#aaaaaa] text-[11px] font-light -ml-1 mt-2">Studio</span>
          </div>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="flex-1 hidden md:flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="チャンネル内で検索"
              className="w-full bg-[#121212] border border-[#303030] rounded-full px-4 py-2 text-sm text-white placeholder-[#717171] focus:outline-none focus:border-[#3ea6ff] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] text-sm">🔍</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto flex-shrink-0">
          <button className="w-9 h-9 hidden md:flex items-center justify-center rounded-full hover:bg-[#303030] transition-colors text-[#aaaaaa] hover:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
          </button>
          <button className="w-9 h-9 hidden md:flex items-center justify-center rounded-full hover:bg-[#303030] transition-colors text-[#aaaaaa] hover:text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
          <button className="hidden md:flex items-center gap-2 bg-[#303030] hover:bg-[#404040] text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">
            <span className="text-base leading-none">+</span>
            <span>作成</span>
          </button>
          {/* Channel selector (mobile) */}
          {channels.length > 1 && (
            <select
              value={selectedChannelId}
              onChange={(e) => { setSelectedChannelId(e.target.value); setActiveTab("dashboard"); }}
              className="md:hidden bg-[#121212] border border-[#303030] text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>{c.channel_name}</option>
              ))}
            </select>
          )}
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: "#FF0000" }}
            onClick={handleLogout}
            title="ログアウト"
          >
            {channel.channel_name[0]}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (hidden on mobile) */}
        <aside
          className="hidden md:flex flex-col bg-[#202020] border-r border-[#303030] flex-shrink-0 overflow-y-auto transition-all duration-200"
          style={{ width: sidebarOpen ? 240 : 72 }}
        >
          {/* Channel info */}
          <div className={`flex flex-col items-center py-6 px-3 border-b border-[#303030]`}>
            {channel.thumbnail_url ? (
              <img src={channel.thumbnail_url} alt={channel.channel_name}
                className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-2xl font-bold">
                {channel.channel_name[0]}
              </div>
            )}
            {sidebarOpen && (
              <>
                <p className="text-white text-sm font-medium mt-3 text-center truncate w-full px-2">{channel.channel_name}</p>
                {channel.handle && <p className="text-[#aaaaaa] text-xs mt-0.5">{channel.handle}</p>}
                <a
                  href={`https://youtube.com/${channel.handle ?? `channel/${channel.youtube_channel_id}`}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#3ea6ff] text-xs mt-2 hover:underline"
                >
                  チャンネルを表示
                </a>
                {channels.length > 1 && (
                  <select
                    value={selectedChannelId}
                    onChange={(e) => { setSelectedChannelId(e.target.value); setActiveTab("dashboard"); }}
                    className="mt-3 w-full bg-[#121212] border border-[#303030] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#3ea6ff]"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>{c.channel_name}</option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-2">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-colors relative ${
                    active ? "text-white bg-[#272727]" : "text-[#aaaaaa] hover:bg-[#272727] hover:text-white"
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {active && <span className="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full" />}
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="py-2 border-t border-[#303030]">
            {[
              {
                label: "設定",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" /></svg>,
              },
              {
                label: "フィードバック",
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" /></svg>,
              },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-4 py-3 text-[#aaaaaa] hover:bg-[#272727] hover:text-white text-sm transition-colors"
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#0f0f0f] pb-14 md:pb-0">
          {activeTab === "dashboard" && <DashboardTab channel={channel} />}
          {activeTab === "content" && <VideosTab channel={channel} />}
          {activeTab === "analytics" && <AnalyticsTab channel={channel} />}
          {activeTab === "revenue" && <RevenueTab channel={channel} />}
        </main>
      </div>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#202020] border-t border-[#303030] flex items-center z-50">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? "text-white" : "text-[#717171]"
              }`}
            >
              {item.icon}
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
