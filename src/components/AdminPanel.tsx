"use client";
import { useState } from "react";
import { User, Channel } from "@/types";
import { MOCK_USERS, MOCK_CHANNELS } from "@/lib/mockData";
import { fmt, fmtYen } from "@/lib/utils";

type Props = { onLogout: () => void };
type AdminTab = "customers" | "channels";

export default function AdminPanel({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("customers");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [toast, setToast] = useState("");

  // User form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Channel form
  const [chName, setChName] = useState("");
  const [chHandle, setChHandle] = useState("");
  const [chSubs, setChSubs] = useState("");
  const [chViews, setChViews] = useState("");
  const [chRevenue, setChRevenue] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const addUser = () => {
    if (!newName || !newEmail || !newPassword) return;
    setUsers([...users, { id: Date.now(), email: newEmail, password: newPassword, name: newName, channelId: null }]);
    setNewName(""); setNewEmail(""); setNewPassword("");
    showToast("顧客を追加しました");
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    showToast("顧客を削除しました");
  };

  const addChannel = () => {
    if (!chName || !chHandle) return;
    const newCh: Channel = {
      id: Date.now(),
      name: chName,
      handle: chHandle,
      avatar: chName[0]?.toUpperCase() ?? "C",
      avatarColor: "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0"),
      subscribers: Number(chSubs) || 0,
      totalViews: Number(chViews) || 0,
      revenue: Number(chRevenue) || 0,
      joinDate: "2025年",
      videos: [],
      analytics: { daily: [], labels: [] },
    };
    setChannels([...channels, newCh]);
    setChName(""); setChHandle(""); setChSubs(""); setChViews(""); setChRevenue("");
    showToast("チャンネルを追加しました");
  };

  const deleteChannel = (id: number) => {
    setChannels(channels.filter((c) => c.id !== id));
    showToast("チャンネルを削除しました");
  };

  const getChannelName = (channelId: number | null) => {
    if (!channelId) return "未設定";
    return channels.find((c) => c.id === channelId)?.name ?? "未設定";
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-[#272727] border border-[#404040] text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50 transition-all">
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
          onClick={onLogout}
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

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            {/* Add form */}
            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">顧客を追加</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  placeholder="氏名"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 min-w-32 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="メールアドレス"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 min-w-40 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="パスワード"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 min-w-32 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <button
                  onClick={addUser}
                  className="bg-[#FF0000] hover:bg-[#cc0000] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  追加
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#202020] border border-[#303030] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#303030]">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">氏名</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">メール</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">チャンネル</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-3 text-white">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 text-gray-400">{getChannelName(u.channelId)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-xs text-gray-500 hover:text-[#FF4444] transition-colors"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === "channels" && (
          <div>
            {/* Add form */}
            <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">チャンネルを追加</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  placeholder="チャンネル名"
                  value={chName}
                  onChange={(e) => setChName(e.target.value)}
                  className="flex-1 min-w-36 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="ハンドル (@xxx)"
                  value={chHandle}
                  onChange={(e) => setChHandle(e.target.value)}
                  className="flex-1 min-w-36 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="登録者数"
                  type="number"
                  value={chSubs}
                  onChange={(e) => setChSubs(e.target.value)}
                  className="w-28 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="視聴回数"
                  type="number"
                  value={chViews}
                  onChange={(e) => setChViews(e.target.value)}
                  className="w-28 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <input
                  placeholder="収益 (円)"
                  type="number"
                  value={chRevenue}
                  onChange={(e) => setChRevenue(e.target.value)}
                  className="w-28 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
                />
                <button
                  onClick={addChannel}
                  className="bg-[#FF0000] hover:bg-[#cc0000] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  追加
                </button>
              </div>
            </div>

            {/* Channel cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {channels.map((ch) => (
                <div key={ch.id} className="bg-[#202020] border border-[#303030] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: ch.avatarColor }}
                      >
                        {ch.avatar}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{ch.name}</p>
                        <p className="text-gray-500 text-xs">{ch.handle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChannel(ch.id)}
                      className="text-xs text-gray-500 hover:text-[#FF4444] transition-colors"
                    >
                      削除
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">登録者</p>
                      <p className="text-sm font-bold text-[#60a5fa]">{fmt(ch.subscribers)}</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">視聴回数</p>
                      <p className="text-sm font-bold text-[#34d399]">{fmt(ch.totalViews)}</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">収益</p>
                      <p className="text-sm font-bold text-[#facc15]">{fmtYen(ch.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
