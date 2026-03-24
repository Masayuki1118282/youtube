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
