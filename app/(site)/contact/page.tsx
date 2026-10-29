import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { InquiryForm } from "@/components/inquiry-form";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
import { PageFaqs } from "@/components/page-faqs";
export async function generateMetadata() {
  return pageMetadata("contact");
}
export default async function ContactPage() {
  const { brand, pages } = await getSiteContent();
  const page = pages.contact;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.mapQuery || brand.address)}`;
  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} path="/contact" />
      <section className="section-pad contact-page-section">
        <div className="wrap contact-layout">
          <aside className="contact-info-card">
            <span className="eyebrow">
              {String(page.contactInfoEyebrow || "WE’RE HERE TO HELP")}
            </span>
            <h2>{page.heading}</h2>
            <p>{page.body}</p>
            <div className="contact-info-list">
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <Icon name="map-pin" size={21} />
                </span>
                <div>
                  <strong>School address</strong>
                  <p>{brand.address}</p>
                </div>
              </div>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <Icon name="phone" size={20} />
                </span>
                <div>
                  <strong>Phone / WhatsApp</strong>
                  <p>
                    <a href={`tel:${brand.phone}`}>{brand.phone}</a>
                  </p>
                  <a
                    className="contact-inline-link"
                    href={`https://wa.me/${brand.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Message on WhatsApp <Icon name="arrow-up-right" size={14} />
                  </a>
                </div>
              </div>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <Icon name="mail" size={20} />
                </span>
                <div>
                  <strong>Email address</strong>
                  <p>
                    <a href={`mailto:${brand.email}`}>{brand.email}</a>
                  </p>
                </div>
              </div>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <Icon name="instagram" size={20} />
                </span>
                <div>
                  <strong>Instagram</strong>
                  <p>
                    <a href={brand.instagram} target="_blank" rel="noreferrer">
                      Follow the academy <Icon name="external-link" size={14} />
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/admission#enquiry"
              className="button button-gold contact-admission-link"
            >
              Admission enquiry <Icon name="arrow-up-right" size={15} />
            </Link>
          </aside>
          <div className="contact-form-card">
            <div className="contact-form-heading">
              <span className="eyebrow">
                {String(page.contactFormEyebrow || "SEND A MESSAGE")}
              </span>
              <h2>{String(page.contactFormTitle || "Send us a message")}</h2>
              <p>
                {String(
                  page.contactFormDescription ||
                    "Have a question? Fill in the details below and the school team can get back to you.",
                )}
              </p>
            </div>
            <InquiryForm formType="contact" />
          </div>
        </div>
      </section>
      <section className="location-section">
        <div className="wrap location-inner">
          <div>
            <span className="eyebrow">
              {String(page.mapEyebrow || "FIND THE SCHOOL")}
            </span>
            <h2>{String(page.mapTitle || "Visit or contact us")}</h2>
            <p>{brand.address}</p>
          </div>
          <div className="map-placeholder">
            <div className="map-pin">
              <Icon name="map-pin" size={29} />
            </div>
            <span>{brand.name}</span>
            <small>{brand.address}</small>
            <a
              className="button button-primary"
              href={mapHref}
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps <Icon name="arrow-up-right" size={15} />
            </a>
          </div>
        </div>
      </section>
      <PageFaqs faqs={page.faqs || []} title="Contact details at a glance" subtitle="Check these details before travelling or sending important correspondence."/>
    </>
  );
}
