import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: channels } = await supabase
    .from("channels")
    .select("*, monthly_revenue(*)")
    .eq("user_id", user.id);

  return <DashboardLayout channels={channels ?? []} userId={user.id} />;
}
