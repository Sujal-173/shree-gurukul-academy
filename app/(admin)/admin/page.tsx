import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getSiteContent } from "@/lib/content";
import { getAdminSession } from "@/lib/auth";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };
export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const content = await getSiteContent();
  return <AdminDashboard initialContent={content} adminEmail={session.email}/>;
}
