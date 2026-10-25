export function SectionHeading({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return <div className={`section-heading ${align === "left" ? "text-left" : "text-center"}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2><span className="title-rule" aria-hidden="true"/>{subtitle && <p>{subtitle}</p>}</div>;
}
