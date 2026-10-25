import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { cmsPageDefinitions } from "@/lib/cms-page-map";
import { Icon } from "@/components/icon";
import { CmsPageSwitcher } from "@/components/cms-page-switcher";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Page Editors | Gurukul CMS", robots: { index: false, follow: false } };

export default async function AdminPagesIndex() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const content = await getSiteContent();
  const groups = ["Main pages", "Information pages", "Settings"] as const;

  return <div className="admin-shell cms-pages-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><Image src="/images/crest.svg" alt="" width={45} height={50}/><span><strong>Gurukul Academy</strong><small>WEBSITE CMS</small></span></Link>
      <nav className="admin-nav" aria-label="Administration">
        <Link href="/admin" className="admin-tab"><span><Icon name="layout-dashboard" size={18}/></span>Overview & tools</Link>
        <Link href="/admin/pages" className="admin-tab active"><span><Icon name="folder-open" size={18}/></span>Page editors</Link>
      </nav>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">{session.email.slice(0, 1).toUpperCase()}</span><span className="admin-user"><strong>Administrator</strong><small>{session.email}</small></span></div>
    </aside>
    <main className="admin-main">
      <div className="admin-topbar"><div><span className="eyebrow">SHRI GURUKUL ACADEMY · NEW LEPA</span><h1>Page editors</h1></div><Link href="/" target="_blank" className="button button-outline">View website <Icon name="external-link" size={15}/></Link></div>
      <section className="cms-pages-welcome"><div className="cms-pages-welcome-mark"><Icon name="layout-dashboard" size={30}/></div><div><span className="eyebrow">CONTENT MANAGEMENT</span><h2>Choose a page to edit</h2><p>Each page has its own focused editor. Changes are saved to the website content database and will appear on the public site after saving.</p></div><div className="cms-pages-welcome-actions"><Link className="button button-primary" href="/admin/pages/home"><Icon name="pen-line" size={15}/> Edit homepage</Link><Link className="button button-outline" href="/admin"><Icon name="settings" size={15}/> Open CMS tools</Link></div></section>
      <CmsPageSwitcher />
      {groups.map((group) => <section className="cms-pages-group" key={group}><div className="cms-pages-group-heading"><h2>{group}</h2><span>{cmsPageDefinitions.filter((page) => page.group === group).length} editors</span></div><div className="cms-page-cards">{cmsPageDefinitions.filter((page) => page.group === group).map((page) => {
        const pageData = page.key === "home" ? content.home : page.key === "site-settings" ? content.brand : content.pages[page.key];
        const filledFields = pageData && typeof pageData === "object" ? Object.keys(pageData).length : 0;
        return <Link href={`/admin/pages/${page.slug}`} className="cms-page-card" key={page.slug}><span className="cms-page-card-icon"><Icon name={page.icon} size={22}/></span><span className="cms-page-card-copy"><strong>{page.label}</strong><small>{page.description}</small><em>{filledFields} editable fields or sections</em></span><span className="cms-page-card-arrow"><Icon name="arrow-up-right" size={17}/></span></Link>;
      })}</div></section>)}
      <section className="cms-pages-note"><Icon name="shield-check" size={20}/><p><strong>Safe publishing workflow</strong><br/>Only authenticated administrators can save content. Uploads and saved content use the existing API authorization checks. Verify school facts and image permissions before publishing.</p></section>
    </main>
  </div>;
}
