# YouTube Studio ダミーサイト v2 - Claude Code 実装指示書

## 何を作るか
顧客に「自分のYouTubeチャンネルの収益ダッシュボード」を見せるための管理ツール。
- 管理者がチャンネルURLを入力 → YouTube Data APIで動画・登録者数・再生数を自動取得
- 収益は管理者が月別（2026年1〜12月）で手入力
- 顧客はメール・パスワードでログイン → 自分専用のダッシュボードを閲覧

---

## 技術スタック
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase（認証 + DB）
- YouTube Data API v3
- Vercel（デプロイ）

---

## STEP 1: 事前準備の確認

```bash
node -v       # v18以上
gh auth status  # Masayuki1118282でログイン済み確認
vercel whoami   # ログイン済み確認
```

---

## STEP 2: Supabaseプロジェクト作成

ブラウザで https://supabase.com にアクセスして以下を実行：

1. 新規プロジェクト作成（名前: `youtube-studio`）
2. パスワードを設定してメモしておく
3. 作成完了後、以下をメモ：
   - Project URL: `https://xxx.supabase.co`
   - anon public key: `eyJxxx...`

---

## STEP 3: プロジェクト作成

```bash
cd ~/Documents  # 任意のディレクトリ

npx create-next-app@latest youtube \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd youtube

# 必要パッケージインストール
npm install @supabase/supabase-js @supabase/ssr
```

---

## STEP 4: 環境変数の設定

`.env.local` を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon key
YOUTUBE_API_KEY=あなたのYouTube Data API v3キー
```

※ YouTube API キーの取得方法：
1. https://console.cloud.google.com にアクセス
2. 新規プロジェクト作成 → 「YouTube Data API v3」を有効化
3. 認証情報 → APIキーを作成
4. 上記の `YOUTUBE_API_KEY` に設定

---

## STEP 5: Supabaseテーブル設計

Supabaseのダッシュボード → SQL Editor で以下を実行：

```sql
-- 顧客テーブル（Supabase Authと連携）
-- auth.usersは自動で存在するためprofilesを作成

create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text not null,
  email text not null,
  created_at timestamp with time zone default now()
);

-- チャンネルテーブル
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  youtube_channel_id text not null,   -- UC... 形式のID
  channel_name text not null,
  handle text,                         -- @xxx
  thumbnail_url text,
  subscribers bigint default 0,
  total_views bigint default 0,
  created_at timestamp with time zone default now()
);

-- 月別収益テーブル
create table public.monthly_revenue (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) on delete cascade,
  year int not null,
  month int not null,                  -- 1〜12
  revenue bigint not null default 0,  -- 円
  created_at timestamp with time zone default now(),
  unique(channel_id, year, month)
);

-- RLS（Row Level Security）の設定
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.monthly_revenue enable row level security;

-- profilesのポリシー
create policy "自分のprofileのみ閲覧可" on public.profiles
  for select using (auth.uid() = id);

-- channelsのポリシー（自分のチャンネルのみ）
create policy "自分のチャンネルのみ閲覧可" on public.channels
  for select using (auth.uid() = user_id);

-- monthly_revenueのポリシー（自分のチャンネルのみ）
create policy "自分の収益のみ閲覧可" on public.monthly_revenue
  for select using (
    exists (
      select 1 from public.channels
      where channels.id = monthly_revenue.channel_id
      and channels.user_id = auth.uid()
    )
  );

-- 管理者用：全データ閲覧・編集（service_roleで操作するためRLSはbypass）
```

---

## STEP 6: ファイル構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← ログイン画面
│   ├── dashboard/
│   │   └── page.tsx                ← 顧客ダッシュボード
│   └── admin/
│       └── page.tsx                ← 管理者画面
├── components/
│   ├── LoginPage.tsx
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx     ← サイドバー + ヘッダー
│   │   ├── ChannelSelector.tsx     ← チャンネル切り替え
│   │   ├── OverviewTab.tsx         ← 概要タブ
│   │   ├── RevenueTab.tsx          ← 収益タブ
│   │   └── VideosTab.tsx           ← 動画タブ
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── CustomerManager.tsx     ← 顧客管理
│       └── ChannelManager.tsx      ← チャンネル管理
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← クライアントサイド用
│   │   └── server.ts               ← サーバーサイド用
│   └── youtube.ts                  ← YouTube API呼び出し
└── types/
    └── index.ts
```

---

## STEP 7: 型定義 `src/types/index.ts`

```typescript
export type Profile = {
  id: string;
  name: string;
  email: string;
};

export type Channel = {
  id: string;
  user_id: string;
  youtube_channel_id: string;
  channel_name: string;
  handle: string | null;
  thumbnail_url: string | null;
  subscribers: number;
  total_views: number;
};

export type MonthlyRevenue = {
  id: string;
  channel_id: string;
  year: number;
  month: number;
  revenue: number;
};

export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
};
```

---

## STEP 8: Supabaseクライアント設定

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};
```

---

## STEP 9: YouTube API `src/lib/youtube.ts`

```typescript
const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE = "https://www.googleapis.com/youtube/v3";

// チャンネルURLからチャンネルIDを解析
export function extractChannelId(url: string): string | null {
  // https://www.youtube.com/channel/UCxxxxxx
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (channelMatch) return channelMatch[1];

  // https://www.youtube.com/@handle
  const handleMatch = url.match(/youtube\.com\/@([\w-]+)/);
  if (handleMatch) return `@${handleMatch[1]}`;

  return null;
}

// チャンネル情報を取得
export async function fetchChannelInfo(channelIdOrHandle: string) {
  let params: Record<string, string>;

  if (channelIdOrHandle.startsWith("@")) {
    params = {
      part: "snippet,statistics",
      forHandle: channelIdOrHandle.replace("@", ""),
      key: API_KEY,
    };
  } else {
    params = {
      part: "snippet,statistics",
      id: channelIdOrHandle,
      key: API_KEY,
    };
  }

  const query = new URLSearchParams(params);
  const res = await fetch(`${BASE}/channels?${query}`);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;

  const item = data.items[0];
  return {
    youtube_channel_id: item.id,
    channel_name: item.snippet.title,
    handle: item.snippet.customUrl || null,
    thumbnail_url: item.snippet.thumbnails?.high?.url || null,
    subscribers: parseInt(item.statistics.subscriberCount || "0"),
    total_views: parseInt(item.statistics.viewCount || "0"),
  };
}

// 最新動画を取得（最大12件）
export async function fetchChannelVideos(channelId: string): Promise<YoutubeVideo[]> {
  // まず最新動画のIDリストを取得
  const searchRes = await fetch(
    `${BASE}/search?part=snippet&channelId=${channelId}&order=date&maxResults=12&type=video&key=${API_KEY}`
  );
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) return [];

  const videoIds = searchData.items.map((i: any) => i.id.videoId).join(",");

  // 統計情報を取得
  const videoRes = await fetch(
    `${BASE}/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`
  );
  const videoData = await videoRes.json();

  return (videoData.items || []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url || "",
    publishedAt: v.snippet.publishedAt,
    viewCount: parseInt(v.statistics.viewCount || "0"),
    likeCount: parseInt(v.statistics.likeCount || "0"),
  }));
}

// 型を再エクスポート
export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
};
```

---

## STEP 10: APIルートの作成

### `src/app/api/youtube/channel/route.ts`
チャンネルURL → チャンネル情報取得

```typescript
import { NextRequest, NextResponse } from "next/server";
import { extractChannelId, fetchChannelInfo } from "@/lib/youtube";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const channelId = extractChannelId(url);
  if (!channelId) {
    return NextResponse.json({ error: "無効なYouTube URLです" }, { status: 400 });
  }

  const info = await fetchChannelInfo(channelId);
  if (!info) {
    return NextResponse.json({ error: "チャンネルが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(info);
}
```

### `src/app/api/youtube/videos/route.ts`
チャンネルIDから動画一覧取得

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchChannelVideos } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const videos = await fetchChannelVideos(channelId);
  return NextResponse.json(videos);
}
```

### `src/app/api/admin/customers/route.ts`
管理者：顧客一覧取得 & 新規作成

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// service_roleキーで操作（RLSをbypass）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const { data: profiles } = await supabaseAdmin.from("profiles").select("*");

  return NextResponse.json({ users: users?.users || [], profiles: profiles || [] });
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  // Supabase Authにユーザー作成
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message }, { status: 400 });
  }

  // profilesテーブルに追加
  await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    name,
    email,
  });

  return NextResponse.json({ success: true, userId: authData.user.id });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await req.json();
  await supabaseAdmin.auth.admin.deleteUser(userId);
  return NextResponse.json({ success: true });
}
```

### `src/app/api/admin/channels/route.ts`
管理者：チャンネル管理

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabaseAdmin
    .from("channels")
    .select("*, profiles(name, email), monthly_revenue(*)")
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { user_id, youtube_channel_id, channel_name, handle, thumbnail_url, subscribers, total_views } = await req.json();

  const { data, error } = await supabaseAdmin.from("channels").insert({
    user_id, youtube_channel_id, channel_name, handle, thumbnail_url, subscribers, total_views,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { channelId } = await req.json();
  await supabaseAdmin.from("channels").delete().eq("id", channelId);
  return NextResponse.json({ success: true });
}
```

### `src/app/api/admin/revenue/route.ts`
管理者：月別収益の保存

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { channel_id, revenues } = await req.json();
  // revenues: [{ year, month, revenue }, ...]

  // upsert（既存あれば上書き）
  const { error } = await supabaseAdmin.from("monthly_revenue").upsert(
    revenues.map((r: any) => ({ channel_id, ...r })),
    { onConflict: "channel_id,year,month" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
```

---

## STEP 11: 環境変数にSERVICE_ROLE_KEYを追加

`.env.local` に追記：

```env
SUPABASE_SERVICE_ROLE_KEY=SupabaseダッシュボードのSettings > API > service_role key
ADMIN_PASSWORD=管理者画面のパスワード（任意の文字列）
```

---

## STEP 12: 各画面の実装

### `src/app/page.tsx` - ログイン画面

以下の仕様で実装：
- YouTube Studioそっくりのダークデザイン（背景 `#0f0f0f`）
- YouTube Studioロゴ（赤い▶ + "YouTube Studio" テキスト）
- メールアドレス・パスワード入力
- サインインボタン（赤）
- 右下に小さく管理者リンク（目立たせない）
- Supabase Auth でログイン処理
- ログイン成功 → `/dashboard` にリダイレクト

```typescript
// Supabaseログイン処理の核心部分
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (!error) router.push("/dashboard");
```

### `src/app/dashboard/page.tsx` - 顧客ダッシュボード

サーバーコンポーネントで認証チェック後、クライアントコンポーネントに渡す：

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // 自分のチャンネル一覧取得
  const { data: channels } = await supabase
    .from("channels")
    .select("*, monthly_revenue(*)")
    .eq("user_id", user.id);

  return <DashboardClient channels={channels || []} userId={user.id} />;
}
```

DashboardClientの仕様：
- 左サイドバー: YouTube Studio風ダークデザイン
  - ロゴ
  - チャンネル切り替えセレクター（複数チャンネル対応）
  - ナビゲーション: 概要 / 動画 / 収益
- 概要タブ:
  - チャンネルアイコン・名前・ハンドル
  - 登録者数・総再生数のKPIカード
  - 月別収益棒グラフ（2026年1〜12月）
- 動画タブ:
  - YouTube APIから取得した実際の動画サムネイル・タイトル・再生回数
  - YouTubeのサムネイルURLをimgタグで表示
- 収益タブ:
  - 2026年1〜12月の月別収益テーブル
  - 累計収益表示
  - 棒グラフ表示

### `src/app/admin/page.tsx` - 管理者画面

パスワード認証（Supabase Authとは別の簡易認証）：
- 環境変数 `ADMIN_PASSWORD` と照合
- セッションストレージで認証状態を保持

管理者画面の仕様：

**タブ1: 顧客管理**
- 顧客追加フォーム（名前・メール・パスワード）
- Supabase Authにユーザー作成
- 顧客一覧テーブル（名前・メール・紐付きチャンネル数・削除）

**タブ2: チャンネル管理**
- チャンネル追加フォーム:
  1. 顧客を選択（プルダウン）
  2. YouTube URLを入力
  3. 「取得」ボタン → API叩いてチャンネル名・登録者数・再生数を自動取得・プレビュー表示
  4. 確認して「登録」ボタン
- チャンネル一覧:
  - チャンネルサムネイル・名前・紐付き顧客名
  - 「収益設定」ボタン → モーダルで2026年1〜12月の収益を月別入力
  - 削除ボタン

**収益入力モーダルの仕様:**
```
チャンネル名: 田中チャンネル【公式】

2026年 月別収益設定
┌─────┬──────────────┐
│ 1月 │ ¥ [入力欄]  │
│ 2月 │ ¥ [入力欄]  │
│ 3月 │ ¥ [入力欄]  │
│ ... │              │
│12月 │ ¥ [入力欄]  │
├─────┴──────────────┤
│ 合計: ¥xxx,xxx     │
└────────────────────┘
[保存]  [キャンセル]
```

---

## STEP 13: layout.tsx

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Studio",
  description: "YouTube Studio",
  icons: {
    icon: "https://www.youtube.com/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0f0f0f] text-white antialiased">{children}</body>
    </html>
  );
}
```

---

## STEP 14: globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
}
::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 3px;
}
```

---

## STEP 15: ビルド確認 & デプロイ

```bash
# ビルド確認
npm run build

# エラーがなければGitHubへ
git add -A
git commit -m "feat: youtube studio dummy dashboard v2 with supabase + youtube api"
gh repo create youtube --private --source=. --remote=origin --push

# Vercelデプロイ
vercel

# 環境変数をVercelに設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add YOUTUBE_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD

# 本番デプロイ
vercel --prod
```

---

## 完成後の使い方フロー

1. `/admin` にアクセス → ADMIN_PASSWORDでログイン
2. 顧客管理タブ → 顧客を追加（名前・メール・パスワードを設定）
3. チャンネル管理タブ → チャンネルを追加
   - 顧客を選択
   - YouTubeのチャンネルURLを入力して「取得」
   - 登録
4. チャンネルの「収益設定」→ 2026年1〜12月の収益を入力して保存
5. 顧客にURLとメール・パスワードを伝える
6. 顧客が `/` でログイン → 自分のチャンネルダッシュボードが表示される

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| YouTube API 403エラー | Google Cloud ConsoleでYouTube Data API v3が有効か確認 |
| YouTube API quota exceeded | 1日10,000unitまで。チャンネル取得1unit、動画検索100unit |
| Supabase RLSエラー | SQL EditorでRLSポリシーを再確認 |
| 管理者APIが401 | SUPABASE_SERVICE_ROLE_KEYが正しくセットされているか確認 |
| Vercelで環境変数が効かない | vercel env addで追加後に再デプロイ |
