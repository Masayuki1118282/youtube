import { NextRequest, NextResponse } from "next/server";
import { fetchChannelVideos } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const videos = await fetchChannelVideos(channelId);
  return NextResponse.json(videos);
}
