"use client";
import { useState } from "react";
import { User } from "@/types";
import { MOCK_USERS } from "@/lib/mockData";

type Props = {
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
};

export default function LoginPage({ onLogin, onAdminLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("メールアドレスまたはパスワードが正しくありません");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202020] border border-[#303030] rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-7 bg-[#FF0000] rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">▶</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">YouTube Studio</span>
        </div>

        <h2 className="text-center text-gray-400 text-sm mb-6">アカウントにサインイン</h2>

        {/* Demo accounts */}
        <div className="mb-6 p-3 bg-[#2a2a2a] rounded-lg">
          <p className="text-xs text-gray-500 mb-2">デモアカウント（クリックで自動入力）</p>
          <div className="flex flex-col gap-1">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => { setEmail(u.email); setPassword(u.password); setError(""); }}
                className="text-left text-xs text-[#aaaaaa] hover:text-white hover:bg-[#333333] px-2 py-1 rounded transition-colors"
              >
                {u.name} — {u.email} / {u.password}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000] transition-colors"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF0000] transition-colors"
          />

          {error && (
            <p className="text-[#FF4444] text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-[#FF0000] hover:bg-[#cc0000] text-white font-medium py-3 rounded-lg transition-colors"
          >
            サインイン
          </button>

          <button
            onClick={onAdminLogin}
            className="w-full border border-[#303030] hover:border-[#555] text-gray-400 hover:text-white font-medium py-3 rounded-lg transition-colors text-sm"
          >
            管理者としてログイン
          </button>
        </div>
      </div>
    </div>
  );
}
