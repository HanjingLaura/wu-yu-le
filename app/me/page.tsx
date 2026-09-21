import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect("/?view=me");
}
