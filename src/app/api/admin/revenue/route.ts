import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { channel_id, revenues } = await req.json();

  const { error } = await supabaseAdmin.from("monthly_revenue").upsert(
    revenues.map((r: { year: number; month: number; revenue: number }) => ({ channel_id, ...r })),
    { onConflict: "channel_id,year,month" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
