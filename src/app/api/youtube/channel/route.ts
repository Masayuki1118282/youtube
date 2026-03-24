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
