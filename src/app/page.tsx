"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#202020] border border-[#303030] rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-7 bg-[#FF0000] rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">▶</span>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">YouTube Studio</span>
          </div>

          <h2 className="text-center text-gray-400 text-sm mb-6">アカウントにサインイン</h2>

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

            {error && <p className="text-[#FF4444] text-xs text-center">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#FF0000] hover:bg-[#cc0000] disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? "サインイン中..." : "サインイン"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/admin" className="text-[#555] hover:text-[#777] text-xs transition-colors">
            管理者ログイン
          </a>
        </div>
      </div>
    </div>
  );
}
