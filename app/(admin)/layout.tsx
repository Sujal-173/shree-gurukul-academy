import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "School Admin", template: "%s | Shri Gurukul Academy Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRouteGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
