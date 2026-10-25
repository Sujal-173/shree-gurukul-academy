import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { Icon } from "@/components/icon";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export function SiteFooter({ content }: { content: SiteContent }) {
  const { brand } = content;
  const groups = [
    {
      title: content.footer.quickLinksTitle || "Quick Links",
      items: content.footer.quickLinks,
    },
    {
      title: content.footer.informationLinksTitle || "Information",
      items: content.footer.informationLinks,
    },
  ];
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-about">
          <Link href="/" className="footer-brand">
            <Image
              src={brand.logoUrl || "/images/crest.svg"}
              width={34}
              height={38}
              alt=""
            />
            <span>
              {brand.name}
              <small>{brand.subtitle}</small>
            </span>
          </Link>
          <p>{content.footer.description || brand.tagline}</p>
          <div className="social-row">
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram profile"
            >
              <Icon name="instagram" size={16} />
            </a>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" size={16} />
            </a>
            <a href={`mailto:${brand.email}`} aria-label="Email the school">
              <Icon name="mail" size={16} />
            </a>
          </div>
        </div>
        {groups.map((group) => (
          <div className="footer-links" key={group.title}>
            <h3>{group.title}</h3>
            <span className="gold-line" />
            <ul>
              {group.items.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href || "/"}>
                    <Icon name="chevron-right" size={13} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="footer-contact">
          <h3>{content.footer.contactTitle || "Contact Details"}</h3>
          <span className="gold-line" />
          <ul>
            <li>
              <span className="contact-symbol">
                <Icon name="map-pin" size={17} />
              </span>
              <span>{brand.address}</span>
            </li>
            <li>
              <span className="contact-symbol">
                <Icon name="phone" size={16} />
              </span>
              <a href={`tel:${brand.phone}`}>{brand.phone}</a>
            </li>
            <li>
              <span className="contact-symbol">
                <Icon name="mail" size={16} />
              </span>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <p>
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className="footer-credit">
        <span>Design and Developed by</span>
        <a href="https://aventracreative.in/" target="_blank" rel="noreferrer">
          Sujal Patidar (Aventra Creative) Indore
        </a>
      </div>
      <div className="floating-contact" aria-label="Contact the school">
        <a
          className="float-call"
          href={`tel:${brand.phone}`}
          aria-label="Call school"
        >
          <Icon name="phone" size={20} />
        </a>
        <WhatsAppFloat phone={brand.whatsapp} />
      </div>
    </footer>
  );
}
