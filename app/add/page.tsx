import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AddPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect("/?view=add");
}
