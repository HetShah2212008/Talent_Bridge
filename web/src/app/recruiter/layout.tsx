import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/get-user";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNav } from "@/components/shared/TopNav";
import { Role } from "@prisma/client";
import { recruiterNavItems } from "@/config/navigation";

export default async function RecruiterLayout({ children }: { children: ReactNode }) {
  const user = await requireRole([Role.RECRUITER]);
  const session = { email: user.email, role: user.role };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        title="Recruiter Portal"
        items={recruiterNavItems}
        session={session}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNav title="Recruiter" items={recruiterNavItems} session={session} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
