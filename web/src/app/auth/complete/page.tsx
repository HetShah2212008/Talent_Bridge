import { redirect } from "next/navigation";

/** Legacy post-auth URL — forwards to centralized /dashboard router. */
export default function AuthCompletePage() {
  redirect("/dashboard");
}
