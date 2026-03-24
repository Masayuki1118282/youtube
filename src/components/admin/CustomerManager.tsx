"use client";
import { useState, useEffect } from "react";

type Customer = {
  id: string;
  email: string;
  name: string;
  channelCount: number;
};

type Props = { onToast: (msg: string) => void };

export default function CustomerManager({ onToast }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    const data = await res.json();
    const profiles: { id: string; name: string; email: string }[] = data.profiles ?? [];
    const channels: { user_id: string }[] = await fetch("/api/admin/channels")
      .then((r) => r.json())
      .catch(() => []);

    setCustomers(
      profiles.map((p) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        channelCount: channels.filter((c) => c.user_id === p.id).length,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!name || !email || !password) return;
    setAdding(true);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      setName(""); setEmail(""); setPassword("");
      onToast("顧客を追加しました");
      await load();
    } else {
      const data = await res.json();
      onToast(`エラー: ${data.error}`);
    }
    setAdding(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("この顧客を削除しますか？")) return;
    await fetch("/api/admin/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    onToast("顧客を削除しました");
    await load();
  };

  return (
    <div>
      {/* Add form */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-400 mb-3">顧客を追加</p>
        <div className="flex gap-3 flex-wrap">
          <input
            placeholder="氏名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-32 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
          />
          <input
            placeholder="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-44 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
          />
          <input
            placeholder="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 min-w-32 bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000]"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-[#FF0000] hover:bg-[#cc0000] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {adding ? "追加中..." : "追加"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#202020] border border-[#303030] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#303030]">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">氏名</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">メール</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">チャンネル数</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-600">顧客がいません</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-3 text-white">{c.name}</td>
                    <td className="px-4 py-3 text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{c.channelCount}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-500 hover:text-[#FF4444] transition-colors">削除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
