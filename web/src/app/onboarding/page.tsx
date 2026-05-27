import { redirect } from "next/navigation";

/** Legacy route — forwards to centralized dashboard router */
export default function OnboardingPage() {
  redirect("/dashboard");
}
