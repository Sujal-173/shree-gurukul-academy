import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-page-map";
import { PageCmsEditor } from "@/components/page-cms-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Page Content Editor | Gurukul CMS", robots: { index: false, follow: false } };

export default async function CmsPageEditorRoute({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { slug } = await params;
  const page = getCmsPage(slug);
  if (!page) notFound();
  const content = await getSiteContent();
  return <PageCmsEditor initialContent={content} adminEmail={session.email} page={page}/>;
}
