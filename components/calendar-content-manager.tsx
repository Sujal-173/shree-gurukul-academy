"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { CalendarEntry } from "@/lib/types";
import { calendarCategoryKey, isRealCalendarDate } from "@/lib/calendar";
import { Icon } from "@/components/icon";

type CalendarCategory = "Events & Celebrations" | "Holidays" | "Examinations";
type Draft = CalendarEntry;

const categoryConfig: Array<{
  value: CalendarCategory;
  label: string;
  singular: string;
  description: string;
  titleLabel: string;
  dateLabel: string;
}> = [
  {
    value: "Events & Celebrations",
    label: "Events & celebrations",
    singular: "event",
    description: "Add school functions, celebrations, activity days and parent meetings.",
    titleLabel: "Event name",
    dateLabel: "Event start date",
  },
  {
    value: "Holidays",
    label: "Holidays",
    singular: "holiday",
    description: "Publish confirmed school holidays, vacation periods and school closures.",
    titleLabel: "Holiday or break name",
    dateLabel: "First day of holiday",
  },
  {
    value: "Examinations",
    label: "Examinations",
    singular: "exam",
    description: "Publish assessment dates, class/grade, subject or paper, and relevant instructions.",
    titleLabel: "Examination or test name",
    dateLabel: "Examination start date",
  },
];

function normalizeCategory(value: unknown): CalendarCategory | null {
  const key = calendarCategoryKey(value);
  if (key === "holidays") return "Holidays";
  if (key === "exams") return "Examinations";
  if (key === "events") return "Events & Celebrations";
  return null;
}

function isCalendarEntryDraft(value: unknown): value is CalendarEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const optionalStrings = ["endDate", "time", "location", "className", "subject", "description", "documentUrl", "documentName", "documentType"];
  return typeof item.category === "string" && typeof item.title === "string" &&
    typeof item.date === "string" && typeof item.active === "boolean" &&
    (item.id === undefined || typeof item.id === "string") &&
    optionalStrings.every((key) => item[key] === undefined || typeof item[key] === "string");
}

function isHttpUrl(value: string): boolean {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `calendar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readableDate(value?: string): string {
  if (!value) return "Date not set";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(`${value}T12:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

function freshDraft(category: CalendarCategory): Draft {
  return {
    id: newId(),
    category,
    title: "",
    date: "",
    endDate: "",
    time: "",
    location: "",
    className: "",
    subject: "",
    description: "",
    documentUrl: "",
    documentName: "",
    documentType: "",
    active: false,
  };
}

export function CalendarContentManager({
  entries,
  onChange,
}: {
  entries: CalendarEntry[];
  onChange: (entries: CalendarEntry[]) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<CalendarCategory>("Events & Celebrations");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const category = categoryConfig.find((item) => item.value === activeCategory)!;

  const grouped = useMemo(() => {
    const records = entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => isCalendarEntryDraft(entry) && normalizeCategory(entry.category) === activeCategory);
    return records.sort((a, b) => {
      const aDate = a.entry.date || "9999-12-31";
      const bDate = b.entry.date || "9999-12-31";
      return aDate.localeCompare(bDate) || (a.entry.title || "").localeCompare(b.entry.title || "");
    });
  }, [entries, activeCategory]);

  function chooseCategory(value: CalendarCategory) {
    if (draft) return;
    setActiveCategory(value);
    setError("");
    setSuccess("");
  }

  function startNew() {
    setDraft(freshDraft(activeCategory));
    setEditingIndex(null);
    setError("");
    setSuccess("");
  }

  function startEdit(entry: CalendarEntry, originalIndex: number) {
    setDraft({
      ...freshDraft(activeCategory),
      ...entry,
      category: activeCategory,
      title: entry.title || "",
      date: entry.date || "",
      endDate: entry.endDate || "",
      time: entry.time || "",
      location: entry.location || "",
      className: entry.className || "",
      subject: entry.subject || "",
      description: entry.description || "",
      documentUrl: entry.documentUrl || "",
      active: Boolean(entry.active),
    });
    setEditingIndex(originalIndex);
    setError("");
    setSuccess("");
  }

  function closeDraft() {
    if (uploadingAttachment) return;
    setDraft(null);
    setEditingIndex(null);
    setError("");
  }

  function setDraftField<Key extends keyof Draft>(key: Key, value: Draft[Key]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setError("");
  }

  async function uploadSupportingFile(file?: File) {
    if (!file || !draft) return;
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", "attachment");
    setUploadingAttachment(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json() as { media?: { url: string; originalName?: string; mimeType?: string }; error?: string };
      if (!response.ok || !result.media?.url) throw new Error(result.error || "Could not upload the supporting file.");
      setDraft((current) => current ? { ...current, documentUrl: result.media!.url, documentName: result.media!.originalName || file.name, documentType: result.media!.mimeType || file.type } : current);
      setSuccess("File uploaded. Save this record, then use Save changes to publish it to the website.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not upload the supporting file.");
    } finally {
      setUploadingAttachment(false);
    }
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const cleanTitle = draft.title.trim();
    if (!cleanTitle) {
      setError("Add a title before saving this record.");
      return;
    }
    if (draft.active && !isRealCalendarDate(draft.date)) {
      setError("A valid start date is required before publishing.");
      return;
    }
    if (draft.endDate && draft.date && draft.endDate < draft.date) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }
    if (draft.active && !draft.description?.trim()) {
      setError("Add the details families need to know before publishing.");
      return;
    }
    if (draft.documentUrl?.trim()) {
      try {
        const url = new URL(draft.documentUrl.trim());
        if (!(["https:", "http:"].includes(url.protocol))) throw new Error("invalid");
      } catch {
        setError("The supporting link must be a valid http or https URL.");
        return;
      }
    }

    const cleaned: CalendarEntry = {
      ...draft,
      category: activeCategory,
      title: cleanTitle,
      date: draft.date.trim(),
      endDate: draft.endDate?.trim() || "",
      time: draft.time?.trim() || "",
      location: draft.location?.trim() || "",
      className: activeCategory === "Examinations" ? draft.className?.trim() || "" : "",
      subject: activeCategory === "Examinations" ? draft.subject?.trim() || "" : "",
      description: draft.description?.trim() || "",
      documentUrl: draft.documentUrl?.trim() || "",
      documentName: draft.documentName?.trim() || "",
      documentType: draft.documentType?.trim() || "",
      active: Boolean(draft.active),
    };
    const next = [...entries];
    if (editingIndex === null) next.push(cleaned);
    else next[editingIndex] = cleaned;
    onChange(next);
    setDraft(null);
    setEditingIndex(null);
    setError("");
    setSuccess(cleaned.active ? "Published record updated. Select Save changes at the top to publish it to the website." : "Draft saved in this editor. Select Save changes at the top to store it.");
  }

  function togglePublished(entry: CalendarEntry, index: number) {
    const hasValidAttachment = !entry.documentUrl?.trim() || isHttpUrl(entry.documentUrl.trim());
    const isValid = Boolean(entry.title.trim() && isRealCalendarDate(entry.date) && (!entry.endDate || (isRealCalendarDate(entry.endDate) && entry.endDate >= entry.date)) && entry.description?.trim() && hasValidAttachment && (!entry.documentType || ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/avif"].includes(entry.documentType)));
    if (!entry.active && !isValid) {
      setError("This record needs a title, valid dates, family-facing details and a valid image/PDF link before it can be published. Edit it to complete those fields.");
      setSuccess("");
      return;
    }
    const next = [...entries];
    next[index] = { ...entry, category: activeCategory, active: !entry.active };
    onChange(next);
    setError("");
    setSuccess(`${entry.title || category.singular} marked ${entry.active ? "as draft" : "published"}. Select Save changes at the top to commit it.`);
  }

  function removeEntry(entry: CalendarEntry, index: number) {
    if (typeof window !== "undefined" && !window.confirm(`Remove “${entry.title || category.singular}” from the calendar?`)) return;
    onChange(entries.filter((_, currentIndex) => currentIndex !== index));
    setError("");
    setSuccess("Record removed from this editor. Select Save changes at the top to commit it.");
  }

  return (
    <section className="cms-form-section calendar-manager" aria-labelledby="calendar-manager-title">
      <div className="cms-section-title calendar-manager-heading">
        <div>
          <span className="eyebrow">PUBLISHING WORKSPACE</span>
          <h3 id="calendar-manager-title">Events, holidays & examinations</h3>
          <p>Create and manage date-based records. There is no planner-image upload area; each public card is generated from the details entered here.</p>
        </div>
        <span className="calendar-manager-total"><strong>{entries.length}</strong><small>Total records</small></span>
      </div>

      <div className="calendar-manager-tabs" role="tablist" aria-label="Calendar record types">
        {categoryConfig.map((item) => {
          const count = entries.filter((entry) => normalizeCategory(entry.category) === item.value).length;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === item.value}
              className={`calendar-manager-tab ${activeCategory === item.value ? "is-active" : ""}`}
              key={item.value}
              disabled={Boolean(draft)}
              onClick={() => chooseCategory(item.value)}
            >
              <span>{item.label}</span><strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className="calendar-manager-category-intro">
        <div>
          <h4>{category.label}</h4>
          <p>{category.description}</p>
        </div>
        {!draft && <button type="button" className="button button-primary button-small" onClick={startNew}><Icon name="plus" size={15}/><span>Add {category.singular}</span></button>}
      </div>

      {success && <p className="calendar-manager-message success" role="status"><Icon name="check-circle" size={16}/>{success}</p>}
      {error && <p className="calendar-manager-message error" role="alert"><Icon name="bell" size={16}/>{error}</p>}

      {draft && (
        <form className="calendar-manager-form" onSubmit={saveDraft}>
          <div className="calendar-manager-form-heading">
            <div><span className="eyebrow">{editingIndex === null ? "NEW RECORD" : "EDIT RECORD"}</span><h4>{editingIndex === null ? `Add ${category.singular}` : `Edit ${category.singular}`}</h4></div>
            <button type="button" className="button button-outline button-small" onClick={closeDraft} disabled={uploadingAttachment}>Cancel</button>
          </div>
          <div className="calendar-manager-fields">
            <div className="form-field calendar-manager-field-wide">
              <label htmlFor="calendar-record-title">{category.titleLabel} <span aria-hidden="true">*</span></label>
              <input id="calendar-record-title" value={draft.title} onChange={(event) => setDraftField("title", event.target.value)} placeholder={category.singular === "exam" ? "e.g. Half-yearly examination" : category.singular === "holiday" ? "e.g. Diwali vacation" : "e.g. Annual Day celebration"} required />
            </div>
            <div className="form-field">
              <label htmlFor="calendar-record-start">{category.dateLabel} {draft.active && <span aria-hidden="true">*</span>}</label>
              <input id="calendar-record-start" type="date" value={draft.date} onChange={(event) => setDraftField("date", event.target.value)} required={draft.active} />
            </div>
            <div className="form-field">
              <label htmlFor="calendar-record-end">End date (optional)</label>
              <input id="calendar-record-end" type="date" min={draft.date || undefined} value={draft.endDate || ""} onChange={(event) => setDraftField("endDate", event.target.value)} />
            </div>
            {(activeCategory === "Events & Celebrations" || activeCategory === "Examinations") && (
              <div className="form-field">
                <label htmlFor="calendar-record-time">Start time (optional)</label>
                <input id="calendar-record-time" type="time" value={draft.time || ""} onChange={(event) => setDraftField("time", event.target.value)} />
              </div>
            )}
            {activeCategory === "Events & Celebrations" && (
              <div className="form-field">
                <label htmlFor="calendar-record-location">Venue / location (optional)</label>
                <input id="calendar-record-location" value={draft.location || ""} onChange={(event) => setDraftField("location", event.target.value)} placeholder="e.g. School campus" />
              </div>
            )}
            {activeCategory === "Examinations" && <>
              <div className="form-field">
                <label htmlFor="calendar-record-class">Class / grade (optional)</label>
                <input id="calendar-record-class" value={draft.className || ""} onChange={(event) => setDraftField("className", event.target.value)} placeholder="e.g. Classes 6–8 or Class 10" />
              </div>
              <div className="form-field">
                <label htmlFor="calendar-record-subject">Subject / paper (optional)</label>
                <input id="calendar-record-subject" value={draft.subject || ""} onChange={(event) => setDraftField("subject", event.target.value)} placeholder="e.g. Mathematics" />
              </div>
            </>}
            <div className="form-field calendar-manager-field-wide">
              <label htmlFor="calendar-record-description">Details for families {draft.active && <span aria-hidden="true">*</span>}</label>
              <textarea id="calendar-record-description" rows={4} value={draft.description || ""} onChange={(event) => setDraftField("description", event.target.value)} placeholder={activeCategory === "Holidays" ? "Explain which school days are closed and when classes resume." : activeCategory === "Examinations" ? "Add reporting time, instructions, syllabus notes or timetable details." : "Explain the purpose, schedule and any information families should know."} required={draft.active} />
            </div>
            <div className="form-field calendar-manager-field-wide calendar-attachment-field">
              <label htmlFor="calendar-record-file">Notice image, circular or timetable (optional)</label>
              {draft.documentUrl && draft.documentType?.startsWith("image/") && <div className="calendar-attachment-image-preview"><Image src={draft.documentUrl} alt={draft.documentName || "Uploaded calendar attachment"} width={960} height={560} unoptimized sizes="(max-width: 700px) 100vw, 600px" /></div>}
              {draft.documentUrl && <div className="calendar-attachment-current"><Icon name={draft.documentType?.startsWith("image/") ? "image" : "file-text"} size={18}/><span><strong>{draft.documentName || "Attached file"}</strong><small>{draft.documentType || "Uploaded file or public link"}</small></span><a href={draft.documentUrl} target="_blank" rel="noopener noreferrer" className="button button-outline button-small">Preview <Icon name="external-link" size={13}/></a><button type="button" className="button button-danger button-small" onClick={() => { setDraftField("documentUrl", ""); setDraftField("documentName", ""); setDraftField("documentType", ""); }} disabled={uploadingAttachment}>Remove file</button></div>}
              <input id="calendar-record-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,.pdf" disabled={uploadingAttachment} onChange={(event) => { void uploadSupportingFile(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
              <small className="form-note">Upload JPG, PNG, WebP, AVIF or PDF up to 12 MB. For a pre-existing public circular, you may paste its HTTPS URL below.</small>
              <label htmlFor="calendar-record-link">Or paste a public URL</label>
              <input id="calendar-record-link" type="url" value={draft.documentUrl || ""} disabled={uploadingAttachment} onChange={(event) => setDraft((current) => current ? { ...current, documentUrl: event.target.value, documentName: "", documentType: "" } : current)} placeholder="https://…" />
            </div>
            <div className="form-field calendar-manager-field-wide calendar-manager-publish">
              <label htmlFor="calendar-record-published">Publication status</label>
              <label className="cms-active-toggle"><input id="calendar-record-published" type="checkbox" checked={Boolean(draft.active)} onChange={(event) => setDraftField("active", event.target.checked)} /><span>{draft.active ? "Published when page changes are saved" : "Draft — hidden from public visitors"}</span></label>
            </div>
          </div>
          <div className="calendar-manager-form-actions">
            <button type="button" className="button button-outline" onClick={closeDraft} disabled={uploadingAttachment}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={uploadingAttachment}><Icon name="check" size={15}/>{uploadingAttachment ? "Uploading…" : editingIndex === null ? "Add record to editor" : "Update record"}</button>
          </div>
        </form>
      )}

      {!draft && grouped.length === 0 && (
        <div className="calendar-manager-empty"><Icon name="calendar-days" size={26}/><strong>No {category.singular} records yet</strong><p>Add a record with verified dates and details. Drafts stay hidden from the public website until published.</p><button type="button" className="button button-outline button-small" onClick={startNew}><Icon name="plus" size={14}/>Add first {category.singular}</button></div>
      )}

      {!draft && grouped.length > 0 && (
        <div className="calendar-manager-records">
          {grouped.map(({ entry, index }) => (
            <article className="calendar-manager-record" key={entry.id || `${entry.category}-${entry.title}-${index}`}>
              <div className="calendar-manager-record-main">
                <span className={`calendar-manager-status ${entry.active ? "is-published" : "is-draft"}`}><span aria-hidden="true"/> {entry.active ? "Published" : "Draft"}</span>
                <h5>{entry.title?.trim() || "Untitled record"}</h5>
                <p className="calendar-manager-record-date"><Icon name="calendar-days" size={14}/>{readableDate(entry.date)}{entry.endDate && entry.endDate !== entry.date ? ` – ${readableDate(entry.endDate)}` : ""}{entry.time ? ` · ${entry.time}` : ""}</p>
                {activeCategory === "Examinations" && (entry.className || entry.subject) && <p className="calendar-manager-record-meta">{[entry.className, entry.subject].filter(Boolean).join(" · ")}</p>}
                {entry.description?.trim() && <p className="calendar-manager-record-description">{entry.description}</p>}
                {entry.documentUrl && <a className="calendar-manager-record-attachment" href={entry.documentUrl} target="_blank" rel="noopener noreferrer"><Icon name={entry.documentType?.startsWith("image/") ? "image" : "file-text"} size={14}/>{entry.documentName || "View supporting image or document"}<Icon name="external-link" size={13}/></a>}
              </div>
              <div className="calendar-manager-record-actions">
                <button type="button" className="button button-outline button-small" onClick={() => startEdit(entry, index)}><Icon name="pen-line" size={14}/>Edit</button>
                <button type="button" className="button button-outline button-small" onClick={() => togglePublished(entry, index)}><Icon name={entry.active ? "eye" : "check-circle"} size={14}/>{entry.active ? "Unpublish" : "Publish"}</button>
                <button type="button" className="button button-danger button-small" onClick={() => removeEntry(entry, index)} aria-label={`Remove ${entry.title || category.singular}`}><Icon name="trash" size={14}/>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="calendar-manager-footnote"><Icon name="book-open" size={15}/>Changes made here are staged in the page editor. Use the main <strong>Save changes</strong> action to write them to the database and refresh the public website.</p>
    </section>
  );
}
