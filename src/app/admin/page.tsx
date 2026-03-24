"use client";
import { useState } from "react";
import CustomerManager from "@/components/admin/CustomerManager";
import ChannelManager from "@/components/admin/ChannelManager";

type Tab = "customers" | "channels";

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_authed") === "1";
    }
    return false;
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("customers");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAuth = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: input }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    } else {
      setError("パスワードが違います");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#202020] border border-[#303030] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-7 bg-[#FF0000] rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">▶</span>
            </div>
            <span className="text-white text-xl font-semibold">YouTube Studio</span>
          </div>
          <p className="text-center text-gray-400 text-sm mb-6">管理者ログイン</p>
          <div className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="管理者パスワード"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
            />
            {error && <p className="text-[#FF4444] text-xs text-center">{error}</p>}
            <button
              onClick={handleAuth}
              className="w-full bg-[#FF0000] hover:bg-[#cc0000] text-white font-medium py-3 rounded-lg transition-colors"
            >
              ログイン
            </button>
          </div>
          <div className="mt-4 text-center">
            <a href="/" className="text-[#555] hover:text-[#777] text-xs transition-colors">← 顧客ログインへ</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-[#272727] border border-[#404040] text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-6 bg-[#FF0000] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">▶</span>
          </div>
          <span className="text-white font-semibold">YouTube Studio</span>
          <span className="bg-[#FF0000] text-white text-xs px-2 py-0.5 rounded-full">管理者</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
          className="text-gray-400 hover:text-white text-sm border border-[#303030] hover:border-[#555] px-4 py-2 rounded-lg transition-colors"
        >
          ログアウト
        </button>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "customers" ? "bg-[#FF0000] text-white" : "bg-[#202020] text-gray-400 hover:text-white"
            }`}
          >
            👥 顧客管理
          </button>
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "channels" ? "bg-[#FF0000] text-white" : "bg-[#202020] text-gray-400 hover:text-white"
            }`}
          >
            📺 チャンネル管理
          </button>
        </div>

        {activeTab === "customers" && <CustomerManager onToast={showToast} />}
        {activeTab === "channels" && <ChannelManager onToast={showToast} />}
      </div>
    </div>
  );
}
