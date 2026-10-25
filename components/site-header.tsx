"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";

export function SiteHeader({ name, subtitle, logoUrl, navigation, enquiryLabel = "Enquiry Now", enquiryHref = "/admission#enquiry" }: { name: string; subtitle: string; logoUrl: string; navigation: { label: string; href: string }[]; enquiryLabel?: string; enquiryHref?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link href="/" className="brand-lockup" aria-label={`${name} home`} onClick={() => setOpen(false)}>
          <Image src={logoUrl || "/images/crest.svg"} alt={`${name} emblem`} width={52} height={58} className="brand-crest" priority />
          <span className="brand-text"><strong>{name}</strong><small>{subtitle}</small></span>
        </Link>
        <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
        <nav id="primary-nav" className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          {navigation.map(({ label, href }, index) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={`${href}-${index}`} href={href || "/"} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>;
          })}
          <Link className="button button-primary nav-cta" href={enquiryHref || "/admission#enquiry"} onClick={() => setOpen(false)}>{enquiryLabel || "Enquiry Now"} <Icon name="arrow-up-right" size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}
