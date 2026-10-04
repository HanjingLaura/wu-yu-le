import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/?view=friends")}`);
  redirect("/?view=friends");
}
