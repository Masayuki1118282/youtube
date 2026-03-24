import { YoutubeVideo } from "@/types";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE = "https://www.googleapis.com/youtube/v3";

export function extractChannelId(url: string): string | null {
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (channelMatch) return channelMatch[1];

  const handleMatch = url.match(/youtube\.com\/@([\w-]+)/);
  if (handleMatch) return `@${handleMatch[1]}`;

  return null;
}

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

export async function fetchChannelVideos(channelId: string): Promise<YoutubeVideo[]> {
  const searchRes = await fetch(
    `${BASE}/search?part=snippet&channelId=${channelId}&order=date&maxResults=12&type=video&key=${API_KEY}`
  );
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) return [];

  const videoIds = searchData.items.map((i: { id: { videoId: string } }) => i.id.videoId).join(",");

  const videoRes = await fetch(
    `${BASE}/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`
  );
  const videoData = await videoRes.json();

  return (videoData.items || []).map((v: {
    id: string;
    snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string };
    statistics: { viewCount: string; likeCount: string };
  }) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url || "",
    publishedAt: v.snippet.publishedAt,
    viewCount: parseInt(v.statistics.viewCount || "0"),
    likeCount: parseInt(v.statistics.likeCount || "0"),
  }));
}
