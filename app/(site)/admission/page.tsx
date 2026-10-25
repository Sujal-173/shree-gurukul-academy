import { Icon } from "@/components/icon";
import { AdmissionEligibilityChecker } from "@/components/admission-eligibility-checker";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHero } from "@/components/page-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { getSiteContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const preparationDocuments = [
  "Student's birth certificate",
  "Transfer certificate, if applicable",
  "Previous class report card, if applicable",
  "Student and parent/guardian identity details",
  "Recent student photographs, if requested",
];

export async function generateMetadata() {
  return pageMetadata("admission");
}

export default async function AdmissionPage() {
  const content = await getSiteContent();
  const page = content.pages.admissions;
  const steps = page.steps || [];

  return (
    <>
      <PageHero
        title={page.title || "Admissions"}
        subtitle={page.subtitle || "Speak with Shri Gurukul Academy to confirm class availability and the current admission process."}
      />

      <section className="admission-reference-process section-pad">
        <div className="wrap">
          <SectionHeading
            eyebrow={String(page.stepsEyebrow || "YOUR NEXT STEPS")}
            title="Our Admission Process"
            subtitle="A simple, step-by-step path to help your family understand what comes next."
          />

          <ol className="admission-reference-timeline" aria-label="Admission process steps">
            {steps.map((step, index) => (
              <li className="admission-reference-step" key={`${step.number}-${step.title}`}>
                <ScrollReveal
                  className="admission-reference-step-card"
                  direction={index % 2 ? "right" : "left"}
                  delay={index * 70}
                >
                  <span className="admission-reference-step-label">STEP {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </ScrollReveal>
                <span className="admission-reference-step-dot" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="admission-reference-details section-pad section-soft">
        <div className="wrap admission-reference-details-grid">
          <article className="admission-reference-card">
            <span className="admission-reference-card-heading">
              <Icon name="clipboard-list" size={20} />
              <h2>Class Range & Eligibility</h2>
            </span>
            <p>
              The academy lists classes 1–10. Age cut-offs, seat availability and
              entry requirements can vary by class and session, so please confirm
              the current criteria with the school office.
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
              *Indicative reference only. Confirm the current age requirement,
              class placement and available seats with the academy.
            </p>
            <AdmissionEligibilityChecker />
          </article>

          <article className="admission-reference-card">
            <span className="admission-reference-card-heading">
              <Icon name="file-text" size={20} />
              <h2>Documents to Ask About</h2>
            </span>
            <p>
              These are common items schools may request. Please get the academy&apos;s
              current official checklist before preparing or submitting documents.
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
              Please do not upload or send identity documents through this website enquiry form. Do not submit a date of birth here; the eligibility checker runs in your browser.
            </p>
          </article>
        </div>
      </section>

      <section className="admission-reference-form-section section-pad" id="enquiry">
        <div className="wrap admission-reference-form-wrap">
          <InquiryForm
            className="admission-reference-form"
            formType="admission"
            introEyebrow="ADMISSION ENQUIRY"
            introTitle="Start your admission enquiry"
            introDescription="Share a few details and the school team can get in touch to discuss the next steps."
          />
        </div>
      </section>
    </>
  );
}
