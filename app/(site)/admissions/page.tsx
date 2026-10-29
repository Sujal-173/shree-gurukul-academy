import { Icon, type IconName } from "@/components/icon";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { getSiteContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

function processIcon(title: string): IconName {
  const text = title.toLowerCase();
  if (text.includes("enquir") || text.includes("tour")) return "message-circle";
  if (text.includes("form") || text.includes("registration")) return "file-text";
  if (text.includes("student") || text.includes("interaction")) return "users";
  if (text.includes("document") || text.includes("payment")) return "clipboard-check";
  return "graduation-cap";
}

export async function generateMetadata() {
  return pageMetadata("admissions");
}

export default async function AdmissionsPage() {
  const content = await getSiteContent();
  const page = content.pages.admissions;

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} />
      <PageIntro page={page} />

      <section className="section-pad">
        <div className="wrap">
          <SectionHeading
            eyebrow={String(page.stepsEyebrow || "YOUR NEXT STEPS")}
            title={String(page.stepsTitle || "A simple enquiry-to-admission journey")}
            subtitle={String(page.stepsSubtitle || "Confirm each step, availability and requirements with the school office.")}
          />

          <div className="process-list process-grid" aria-label="Admission process steps">
            {(page.steps || []).map((step, index) => (
              <ScrollReveal
                className={`process-step ${index % 2 ? "process-right" : ""}`}
                direction={index % 2 ? "right" : "left"}
                delay={(index % 2) * 110 + Math.floor(index / 2) * 90}
                key={step.number}
              >
                <span className="process-number" aria-hidden="true" />
                <article className="process-card">
                  <div className="process-card-kicker">
                    <span className="process-card-icon" aria-hidden="true">
                      <Icon name={processIcon(step.title)} size={17} />
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

      <section className="section-pad section-soft">
        <div className="wrap admission-info-grid">
          <article className="info-card">
            <span className="eyebrow">{String(page.eligibilityEyebrow || "BE PREPARED")}</span>
            <h2><Icon name="clipboard-list" size={22} /> {String(page.eligibilityTitle || "Documents & eligibility")}</h2>
            <p>{String(page.eligibilityBody || "Required documents and age/class criteria are set by the school. Please request the current official list before visiting or applying.")}</p>
            <ul className="check-list">
              {String(page.eligibilityPoints || "Ask for the current admission form.\nConfirm the class and seat availability.\nCheck the official document and fee list.\nAsk about school timings and next steps.").split(/\r?\n/).filter(Boolean).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
            </ul>
          </article>

          <article className="info-card">
            <span className="eyebrow">{String(page.contactEyebrow || "QUESTIONS?")}</span>
            <h2><Icon name="phone" size={22} /> {String(page.contactTitle || "Talk with the school team")}</h2>
            <p>{String(page.contactBody || "Call the academy before making a journey if you need to confirm hours, dates, eligibility or required documents.")}</p>
            <a className="button button-primary" href={`tel:${content.brand.phone}`}>
              Call {content.brand.phone} <Icon name="phone" size={15} />
            </a>
          </article>
        </div>
      </section>

      <section className="section-pad" id="enquiry">
        <div className="wrap form-wrap">
          <InquiryForm formType="admission" introEyebrow={String(page.formEyebrow || "ADMISSION ENQUIRY")} introTitle={String(page.formTitle || "Tell us a little about your child")} introDescription={String(page.formBody || "Submit the form and the school team can follow up with you.")}/>
        </div>
      </section>

      {page.faqs?.length ? (
        <section className="section-pad section-soft">
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
    </>
  );
}
