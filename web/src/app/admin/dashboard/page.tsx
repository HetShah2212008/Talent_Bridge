import { AdminAnalyticsView } from "@/components/admin/AdminAnalyticsView";
import { getAdminStats } from "@/lib/admin/stats";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  return <AdminAnalyticsView stats={stats} />;
}
