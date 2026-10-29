import type { CalendarEntry } from "@/lib/types";
import { safeHref } from "@/lib/sanitize-content";
import { Icon } from "@/components/icon";
import { PublicFileAttachment } from "@/components/public-file-attachment";

function formatDate(value?: string): string {
  if (!value) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T12:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function entryDateLabel(entry: CalendarEntry): string {
  const start = formatDate(entry.date);
  const end = formatDate(entry.endDate);
  if (start && end && entry.date !== entry.endDate) return `${start} – ${end}`;
  return start || "Date to be confirmed by the school";
}

export function CalendarEntryList({
  entries,
  showCategory = false,
  emptyText = "No confirmed dates are published here right now. Please check back for the next school update.",
}: {
  entries: CalendarEntry[];
  showCategory?: boolean;
  emptyText?: string;
}) {
  if (!entries.length) {
    return (
      <div className="calendar-entry-empty">
        <Icon name="calendar-days" size={24} />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`calendar-entry-grid${entries.length === 1 ? " is-single" : ""}`}>
      {entries.map((entry, index) => {
        const documentUrl = safeHref(entry.documentUrl, "");
        return (
          <article className="calendar-entry-card" key={entry.id || `${entry.category}-${entry.title}-${entry.date}-${index}`}>
            <div className="calendar-entry-topline">
              <span className="calendar-entry-date"><Icon name="calendar-days" size={15} />{entryDateLabel(entry)}</span>
              {showCategory && <span className="calendar-entry-category">{entry.category}</span>}
            </div>
            <h3>{entry.title || entry.category || "School update"}</h3>
            {entry.description?.trim() && <p className="calendar-entry-description">{entry.description}</p>}
            {(entry.time?.trim() || entry.location?.trim() || entry.className?.trim() || entry.subject?.trim()) && (
              <div className="calendar-entry-details">
                {entry.time?.trim() && <span><Icon name="clock" size={14} />{entry.time}</span>}
                {entry.location?.trim() && <span><Icon name="map-pin" size={14} />{entry.location}</span>}
                {entry.className?.trim() && <span><Icon name="graduation-cap" size={14} />{entry.className}</span>}
                {entry.subject?.trim() && <span><Icon name="book-open" size={14} />{entry.subject}</span>}
              </div>
            )}
            {documentUrl && <PublicFileAttachment url={documentUrl} name={entry.documentName} mimeType={entry.documentType} alt={entry.title} label="View supporting document" />}
          </article>
        );
      })}
    </div>
  );
}
