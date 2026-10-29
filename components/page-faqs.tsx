import type { FAQ } from "@/lib/types";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { serializeJsonLd } from "@/lib/jsonld";

export function PageFaqs({
  faqs,
  title = "Questions families ask",
  subtitle = "Clear answers to common questions. For a time-sensitive detail, contact the school office.",
  eyebrow = "QUICK ANSWERS",
}: {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  if (!faqs?.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <section className="section-pad section-soft page-faq-section">
        <div className="wrap page-faq-wrap">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <div className="faq-list">
            {faqs.map((faq, index) => (
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
    </>
  );
}
