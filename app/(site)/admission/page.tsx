import { Icon } from "@/components/icon";
import { AdmissionEligibilityChecker } from "@/components/admission-eligibility-checker";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { getSiteContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/jsonld";

export async function generateMetadata() {
  return pageMetadata("admission");
}

export default async function AdmissionPage() {
  const content = await getSiteContent();
  const page = content.pages.admissions;
  const steps = page.steps || [];
  const preparationDocuments = String(
    page.eligibilityPoints ||
      "Student's birth certificate\nTransfer certificate, if applicable\nPrevious class report card, if applicable\nStudent and parent/guardian identity details\nRecent student photographs, if requested",
  )
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const phone = content.brand.phone.replace(/[^+\d]/g, "");

  return (
    <>
      <PageHero
        title={page.title || "Admissions"}
        subtitle={page.subtitle || "Speak with Shri Gurukul Academy to confirm class availability and the current admission process."}
        path="/admission"
      />

      <PageIntro page={page} />

      <section className="section-pad admission-process-section">
        <div className="wrap">
          <SectionHeading
            eyebrow={String(page.stepsEyebrow || "YOUR NEXT STEPS")}
            title={String(page.stepsTitle || "Our Admission Process")}
            subtitle={String(page.stepsSubtitle || "A simple, step-by-step path to help your family understand what comes next.")}
          />

          <div className="process-list process-grid" aria-label="Admission process steps">
            {steps.map((step, index) => (
              <ScrollReveal
                className={`process-step ${index % 2 ? "process-right" : ""}`}
                direction={index % 2 ? "right" : "left"}
                delay={(index % 2) * 90 + Math.floor(index / 2) * 70}
                key={`${step.number}-${step.title}`}
              >
                <span className="process-number" aria-hidden="true" />
                <article className="process-card">
                  <div className="process-card-kicker">
                    <span className="process-card-icon" aria-hidden="true">
                      <Icon name={index === 0 ? "message-circle" : index === 1 ? "file-text" : index === 2 ? "users" : "graduation-cap"} size={17} />
                    </span>
                    <span className="card-eyebrow">STEP {step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-soft admission-details-section">
        <div className="wrap admission-reference-details-grid">
          <article className="admission-reference-card">
            <span className="admission-reference-card-heading">
              <Icon name="clipboard-list" size={20} />
              <h2>Class Range &amp; Eligibility</h2>
            </span>
            <p>
              The academy lists Classes 1–10. Age cut-offs, seat availability and
              entry requirements can vary by class and session, so confirm the
              current criteria with the school office before applying.
            </p>
            <table className="admission-reference-class-table">
              <caption className="visually-hidden">Indicative class age and entry guidance</caption>
              <thead>
                <tr>
                  <th scope="col">Class</th>
                  <th scope="col">Indicative age / entry basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Class 1</th>
                  <td>6 years or older on 31 March of the entry year*</td>
                </tr>
                <tr>
                  <th scope="row">Classes 2–10</th>
                  <td>Previous class completion; transfer certificate and marksheet</td>
                </tr>
              </tbody>
            </table>
            <p className="admission-reference-table-note">
              *Indicative reference only. The checker is guidance, not an admission
              decision. Confirm official age rules, class placement and available
              seats with the academy.
            </p>
            <AdmissionEligibilityChecker />
          </article>

          <article className="admission-reference-card">
            <span className="admission-reference-card-heading">
              <Icon name="file-text" size={20} />
              <h2>{String(page.eligibilityTitle || "Documents to Ask About")}</h2>
            </span>
            <p>
              {String(page.eligibilityBody || "These are common items schools may request. Please get the academy’s current official checklist before preparing or submitting documents.")}
            </p>
            <ul className="admission-reference-document-list">
              {preparationDocuments.map((document) => (
                <li key={document}>
                  <Icon name="check-circle" size={15} />
                  <span>{document}</span>
                </li>
              ))}
            </ul>
            <p className="admission-reference-note">
              Do not upload identity documents or sensitive records through this
              website enquiry form. The date-of-birth checker runs in your browser
              and does not submit the date to the school.
            </p>
          </article>
        </div>

        <div className="wrap admission-contact-strip">
          <div>
            <span className="eyebrow">{String(page.contactEyebrow || "QUESTIONS?")}</span>
            <h2>{String(page.contactTitle || "Talk with the school team")}</h2>
            <p>{String(page.contactBody || "Contact the academy before making a journey to confirm hours, dates, eligibility or required documents.")}</p>
          </div>
          <a className="button button-primary" href={`tel:${phone}`}>
            Call {content.brand.phone} <Icon name="phone" size={15} />
          </a>
        </div>
      </section>

      <section className="section-pad admission-reference-form-section" id="enquiry">
        <div className="wrap admission-reference-form-wrap">
          <InquiryForm
            className="admission-reference-form"
            formType="admission"
            introEyebrow={String(page.formEyebrow || "ADMISSION ENQUIRY")}
            introTitle={String(page.formTitle || "Start your admission enquiry")}
            introDescription={String(page.formBody || "Share a few details and the school team can get in touch to discuss the next steps.")}
          />
        </div>
      </section>

      {page.faqs?.length ? (
        <section className="section-pad section-soft admission-faq-section">
          <div className="wrap">
            <SectionHeading
              eyebrow={String(page.faqEyebrow || "COMMON QUESTIONS")}
              title={String(page.faqTitle || "Admissions FAQs")}
              subtitle={String(page.faqSubtitle || "For details specific to your child, contact the school office.")}
            />
            <div className="faq-list">
              {page.faqs.map((faq, index) => (
                <details className="faq-item" key={faq.question} open={index === 0}>
                  <summary>
                    {faq.question}
                    <span aria-hidden="true"><Icon name="chevron-down" size={18} /></span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {page.faqs?.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: page.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            }),
          }}
        />
      ) : null}
    </>
  );
}
