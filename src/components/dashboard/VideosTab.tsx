"use client";
import { useState, useEffect } from "react";
import { Channel, YoutubeVideo } from "@/types";

type Props = { channel: Channel };

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M"
  : n >= 1_000 ? (n / 1_000).toFixed(1) + "K"
  : String(n);

export default function VideosTab({ channel }: Props) {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/youtube/videos?channelId=${channel.youtube_channel_id}`);
        if (!res.ok) throw new Error("動画の取得に失敗しました");
        const data = await res.json();
        setVideos(data);
      } catch {
        setError("動画の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [channel.youtube_channel_id]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-white mb-6">動画</h1>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-[#FF4444] text-sm text-center py-8">{error}</p>
      )}

      {!loading && !error && videos.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">動画が見つかりません</p>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid gap-3">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 bg-[#202020] border border-[#303030] rounded-xl p-3 hover:bg-[#252525] transition-colors">
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-32 h-18 rounded-lg object-cover flex-shrink-0"
                style={{ aspectRatio: "16/9", height: "72px" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate mb-1">{v.title}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(v.publishedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <div className="flex gap-4 flex-shrink-0 text-right">
                <div>
                  <p className="text-xs text-gray-500">再生数</p>
                  <p className="text-sm font-medium text-[#34d399]">{fmt(v.viewCount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">高評価</p>
                  <p className="text-sm font-medium text-[#60a5fa]">{fmt(v.likeCount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
