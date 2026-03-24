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
      <div className="w-full md:max-w-[400px] bg-[#212121] rounded-xl p-6 md:p-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-6 bg-[#FF0000] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold leading-none">▶</span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">Studio</span>
          </div>
          <h1 className="text-white text-[20px] font-normal">アカウントにサインイン</h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaaaaa] font-medium">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#121212] border border-[#303030] rounded-md px-4 py-3.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#3ea6ff] transition-colors"
              placeholder="example@gmail.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#aaaaaa] font-medium">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-[#121212] border border-[#303030] rounded-md px-4 py-3.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#3ea6ff] transition-colors"
              placeholder="パスワードを入力"
            />
          </div>

          {error && <p className="text-[#f28b82] text-xs">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-[#3ea6ff] hover:bg-[#2d96ef] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm py-3 rounded-md transition-colors mt-1"
          >
            {loading ? "サインイン中..." : "サインイン"}
          </button>

          <div className="flex justify-end">
            <a href="/admin" className="text-xs text-[#717171] hover:text-[#aaaaaa] transition-colors">
              管理者ログイン
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
