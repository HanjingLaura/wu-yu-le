import { redirect } from "next/navigation";

export default function MePage() {
  redirect("/?view=me");
}
