import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message }, { status: 400 });
  }

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
