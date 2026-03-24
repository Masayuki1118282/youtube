"use client";
import { useState, useEffect } from "react";
import { Channel, MonthlyRevenue } from "@/types";

type CustomerOption = { id: string; name: string; email: string };
type ChannelWithProfile = Channel & { profiles?: { name: string; email: string } };

type Props = { onToast: (msg: string) => void };

export default function ChannelManager({ onToast }: Props) {
  const [channels, setChannels] = useState<ChannelWithProfile[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [preview, setPreview] = useState<Partial<Channel> | null>(null);
  const [fetching, setFetching] = useState(false);
  const [adding, setAdding] = useState(false);

  // Revenue modal
  const [revenueChannel, setRevenueChannel] = useState<ChannelWithProfile | null>(null);
  const [revenueValues, setRevenueValues] = useState<Record<number, string>>({});
  const [savingRevenue, setSavingRevenue] = useState(false);

  const load = async () => {
    setLoading(true);
    const [chRes, cuRes] = await Promise.all([
      fetch("/api/admin/channels"),
      fetch("/api/admin/customers"),
    ]);
    const chData: ChannelWithProfile[] = await chRes.json();
    const cuData = await cuRes.json();

    setChannels(chData);
    const profiles: CustomerOption[] = (cuData.profiles ?? []).map((p: { id: string; name: string; email: string }) => ({
      id: p.id, name: p.name, email: p.email,
    }));
    setCustomers(profiles);
    if (profiles.length > 0 && !selectedUserId) setSelectedUserId(profiles[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFetch = async () => {
    if (!youtubeUrl) return;
    setFetching(true);
    setPreview(null);
    const res = await fetch("/api/youtube/channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      setPreview(data);
    } else {
      const data = await res.json();
      onToast(`エラー: ${data.error}`);
    }
    setFetching(false);
  };

  const handleAdd = async () => {
    if (!preview || !selectedUserId) return;
    setAdding(true);
    const res = await fetch("/api/admin/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId, ...preview }),
    });
    if (res.ok) {
      setYoutubeUrl(""); setPreview(null);
      onToast("チャンネルを登録しました");
      await load();
    } else {
      const data = await res.json();
      onToast(`エラー: ${data.error}`);
    }
    setAdding(false);
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm("このチャンネルを削除しますか？")) return;
    await fetch("/api/admin/channels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    });
    onToast("チャンネルを削除しました");
    await load();
  };

  const openRevenue = (ch: ChannelWithProfile) => {
    setRevenueChannel(ch);
    const vals: Record<number, string> = {};
    for (let m = 1; m <= 12; m++) {
      const r = (ch.monthly_revenue as MonthlyRevenue[] | undefined)?.find((r) => r.year === 2026 && r.month === m);
      vals[m] = r ? String(r.revenue) : "";
    }
    setRevenueValues(vals);
  };

  const handleSaveRevenue = async () => {
    if (!revenueChannel) return;
    setSavingRevenue(true);
    const revenues = Array.from({ length: 12 }, (_, i) => ({
      year: 2026,
      month: i + 1,
      revenue: parseInt(revenueValues[i + 1] || "0"),
    }));
    const res = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel_id: revenueChannel.id, revenues }),
    });
    if (res.ok) {
      onToast("収益を保存しました");
      setRevenueChannel(null);
      await load();
    } else {
      onToast("保存に失敗しました");
    }
    setSavingRevenue(false);
  };

  const totalRevenue = Object.values(revenueValues).reduce((a, v) => a + (parseInt(v) || 0), 0);

  return (
    <div>
      {/* Add form */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-400 mb-3">チャンネルを追加</p>
        <div className="flex flex-col gap-3">
          {/* Customer select */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF0000]"
          >
            <option value="">顧客を選択...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>

          {/* YouTube URL + fetch */}
          <div className="flex gap-3">
            <input
              placeholder="https://www.youtube.com/@channel または /channel/UCxxx"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
            />
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="bg-[#303030] hover:bg-[#404040] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {fetching ? "取得中..." : "取得"}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#404040]">
              {preview.thumbnail_url ? (
                <img src={preview.thumbnail_url} alt={preview.channel_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {preview.channel_name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{preview.channel_name}</p>
                {preview.handle && <p className="text-gray-400 text-xs">{preview.handle}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  登録者: {(preview.subscribers ?? 0).toLocaleString()} / 総再生数: {(preview.total_views ?? 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleAdd}
                disabled={adding || !selectedUserId}
                className="bg-[#FF0000] hover:bg-[#cc0000] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {adding ? "登録中..." : "登録"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Channel list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : channels.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-8">チャンネルがありません</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((ch) => (
            <div key={ch.id} className="bg-[#202020] border border-[#303030] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {ch.thumbnail_url ? (
                    <img src={ch.thumbnail_url} alt={ch.channel_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {ch.channel_name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ch.channel_name}</p>
                    <p className="text-gray-500 text-xs">{ch.profiles?.name ?? "未設定"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openRevenue(ch)}
                    className="text-xs text-[#60a5fa] hover:text-white border border-[#404040] hover:border-[#60a5fa] px-2 py-1 rounded transition-colors"
                  >
                    収益設定
                  </button>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="text-xs text-gray-500 hover:text-[#FF4444] transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">登録者</p>
                  <p className="text-sm font-bold text-[#60a5fa]">{ch.subscribers.toLocaleString()}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">総再生数</p>
                  <p className="text-sm font-bold text-[#34d399]">{ch.total_views.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue modal */}
      {revenueChannel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">{revenueChannel.channel_name}</h3>
            <p className="text-gray-400 text-xs mb-4">2026年 月別収益設定</p>

            <div className="flex flex-col gap-2 mb-4 max-h-72 overflow-y-auto">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <div key={m} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-8 flex-shrink-0">{m}月</span>
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-gray-500 text-sm">¥</span>
                    <input
                      type="number"
                      min="0"
                      value={revenueValues[m] ?? ""}
                      onChange={(e) => setRevenueValues({ ...revenueValues, [m]: e.target.value })}
                      placeholder="0"
                      className="flex-1 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF0000]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-[#303030] mb-4">
              <span className="text-gray-400 text-sm">合計</span>
              <span className="text-[#facc15] font-bold">¥{totalRevenue.toLocaleString("ja-JP")}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveRevenue}
                disabled={savingRevenue}
                className="flex-1 bg-[#FF0000] hover:bg-[#cc0000] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {savingRevenue ? "保存中..." : "保存"}
              </button>
              <button
                onClick={() => setRevenueChannel(null)}
                className="flex-1 border border-[#303030] hover:border-[#555] text-gray-400 hover:text-white py-2 rounded-lg text-sm transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
