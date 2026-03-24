import { User, Channel } from "@/types";

export const MOCK_USERS: User[] = [
  { id: 1, email: "tanaka@example.com", password: "pass123", name: "田中 太郎", channelId: 1 },
  { id: 2, email: "sato@example.com", password: "pass456", name: "佐藤 花子", channelId: 2 },
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 1,
    name: "田中チャンネル【公式】",
    handle: "@tanaka_official",
    avatar: "T",
    avatarColor: "#FF0000",
    subscribers: 128400,
    totalViews: 4820000,
    revenue: 184200,
    joinDate: "2021年3月",
    videos: [
      { id: 1, title: "【完全解説】Next.jsで作る最強のWebアプリ", views: 84200, likes: 3100, comments: 412, date: "2025-03-15", thumbnail: "#1a1a2e", duration: "32:14", revenue: 12400 },
      { id: 2, title: "AI時代のWebエンジニアが学ぶべきこと", views: 62100, likes: 2800, comments: 334, date: "2025-03-08", thumbnail: "#16213e", duration: "24:51", revenue: 9800 },
      { id: 3, title: "Supabaseで爆速バックエンド構築", views: 41800, likes: 1900, comments: 221, date: "2025-02-28", thumbnail: "#0f3460", duration: "18:32", revenue: 7200 },
      { id: 4, title: "Claude APIを使ったAIアプリ開発入門", views: 38900, likes: 1750, comments: 198, date: "2025-02-20", thumbnail: "#1a1a2e", duration: "28:05", revenue: 6400 },
    ],
    analytics: {
      daily: [12000, 14500, 11200, 18900, 22100, 19800, 24300, 21000, 28400, 31200, 27800, 35100, 38900, 42300],
      labels: ["3/11","3/12","3/13","3/14","3/15","3/16","3/17","3/18","3/19","3/20","3/21","3/22","3/23","3/24"],
    },
  },
  {
    id: 2,
    name: "さとうはなこvlog",
    handle: "@hanako_vlog",
    avatar: "H",
    avatarColor: "#FF69B4",
    subscribers: 45200,
    totalViews: 1240000,
    revenue: 58900,
    joinDate: "2022年8月",
    videos: [
      { id: 1, title: "岐阜の隠れスポット巡り🌸春の絶景10選", views: 28400, likes: 1800, comments: 312, date: "2025-03-18", thumbnail: "#2d1b69", duration: "15:44", revenue: 4200 },
      { id: 2, title: "一人暮らし1ヶ月の食費節約術", views: 19800, likes: 1200, comments: 198, date: "2025-03-10", thumbnail: "#11998e", duration: "12:08", revenue: 3100 },
    ],
    analytics: {
      daily: [3200, 4100, 3800, 5200, 6100, 4800, 7200, 6800, 8100, 7400, 9200, 8800, 10400, 11200],
      labels: ["3/11","3/12","3/13","3/14","3/15","3/16","3/17","3/18","3/19","3/20","3/21","3/22","3/23","3/24"],
    },
  },
];
