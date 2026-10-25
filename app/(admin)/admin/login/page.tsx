import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/auth";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <main className="admin-login-page"><Link href="/" className="login-back"><Icon name="arrow-left" size={15}/> Back to website</Link><section className="login-card"><Image src="/images/crest.svg" alt="Shri Gurukul Academy crest" width={72} height={80}/><span className="eyebrow">CONTENT MANAGEMENT</span><h1>Admin sign in</h1><p>Sign in to manage the academy website, media and enquiries.</p><AdminLoginForm/></section><p className="login-footnote">Secure administrator access · Public registration is disabled</p></main>;
}
