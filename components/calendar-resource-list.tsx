import Image from "next/image";
import type { CalendarResource } from "@/lib/types";
import { Icon } from "@/components/icon";
import { isPublicCalendarResource, sortCalendarResources } from "@/lib/calendar";

function resourceTypeLabel(kind: CalendarResource["kind"]): string {
  return kind === "exam-timetable" ? "Examination timetable" : "School calendar";
}

export function CalendarResourceList({
  resources,
  kind,
  title = "School calendars and timetables",
  subtitle = "Download the latest school-approved calendar and examination documents.",
}: {
  resources: CalendarResource[];
  kind?: CalendarResource["kind"];
  title?: string;
  subtitle?: string;
}) {
  const visible = sortCalendarResources(resources.filter(isPublicCalendarResource).filter((resource) => !kind || resource.kind === kind));
  if (!visible.length) return null;
  return <section className="calendar-resource-section" aria-labelledby="calendar-resource-list-title">
    <div className="calendar-resource-heading"><span className="eyebrow">OFFICIAL DOWNLOADS</span><h2 id="calendar-resource-list-title">{title}</h2><p>{subtitle}</p></div>
    <div className={`calendar-resource-grid${visible.length === 1 ? " is-single" : ""}`}>
      {visible.map((resource) => {
        const isImage = Boolean(resource.documentType?.startsWith("image/"));
        const isPdf = resource.documentType === "application/pdf" || /\.pdf(?:[?#].*)?$/i.test(resource.documentUrl);
        return <article className="calendar-resource-card" key={resource.id}>
          {isImage && <a className="calendar-resource-preview" href={resource.documentUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${resource.title}`}><Image src={resource.documentUrl} alt={resource.title} width={1000} height={640} unoptimized sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 480px" /></a>}
          <div className="calendar-resource-card-content">
            <span className="calendar-resource-type"><Icon name={isPdf ? "file-text" : isImage ? "image" : "calendar-days"} size={14}/>{resourceTypeLabel(resource.kind)}{resource.academicYear ? ` · ${resource.academicYear}` : ""}</span>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            {resource.className && <span className="calendar-resource-class"><Icon name="graduation-cap" size={14}/>{resource.className}</span>}
            <a className="button button-outline calendar-resource-download" href={resource.documentUrl} target="_blank" rel="noopener noreferrer"><Icon name={isImage ? "image" : "download"} size={15}/>{isImage ? "View notice image" : "Open / download document"}<Icon name="arrow-up-right" size={14}/></a>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
