"use client";

import { useState, type FormEvent } from "react";
import type { CalendarResource } from "@/lib/types";
import { Icon } from "@/components/icon";

type ResourceKind = CalendarResource["kind"];
const kinds: Array<{ value: ResourceKind; label: string; detail: string }> = [
  { value: "school-calendar", label: "School calendar", detail: "Annual or term-wise school dates, vacations and important days." },
  { value: "exam-timetable", label: "Exam timetable", detail: "Class-wise examination dates, subjects and reporting instructions." },
];

function newResource(kind: ResourceKind): CalendarResource {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `resource-${Date.now()}`,
    kind,
    title: "",
    description: "",
    className: "",
    academicYear: "",
    documentUrl: "",
    documentName: "",
    documentType: "",
    updatedAt: new Date().toISOString().slice(0, 10),
    active: false,
  };
}

function kindLabel(kind: ResourceKind): string {
  return kinds.find((item) => item.value === kind)?.label || "School document";
}

function isCalendarResourceDraft(value: unknown): value is CalendarResource {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && Boolean(item.id.trim()) &&
    (item.kind === "school-calendar" || item.kind === "exam-timetable") &&
    typeof item.title === "string" && typeof item.description === "string" &&
    typeof item.documentUrl === "string" && typeof item.active === "boolean" &&
    (item.className === undefined || typeof item.className === "string") &&
    (item.academicYear === undefined || typeof item.academicYear === "string") &&
    (item.documentName === undefined || typeof item.documentName === "string") &&
    (item.documentType === undefined || typeof item.documentType === "string") &&
    (item.updatedAt === undefined || typeof item.updatedAt === "string");
}

function isHttpUrl(value: string): boolean {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}

export function CalendarResourceManager({ resources, onChange }: { resources: CalendarResource[]; onChange: (next: CalendarResource[]) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CalendarResource | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const safeResources = resources.filter(isCalendarResourceDraft);

  async function upload(file?: File) {
    if (!file || !draft) return;
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", "attachment");
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json() as { media?: { url: string; originalName?: string; mimeType?: string }; error?: string };
      if (!response.ok || !result.media?.url) throw new Error(result.error || "Upload failed.");
      setDraft((current) => current ? { ...current, documentUrl: result.media!.url, documentName: result.media!.originalName || file.name, documentType: result.media!.mimeType || file.type, updatedAt: new Date().toISOString().slice(0, 10) } : current);
      setStatus("File uploaded. Save this record, then save the page to publish the attachment.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the file.");
    } finally {
      setBusy(false);
    }
  }

  function startNew(kind: ResourceKind) {
    setDraft(newResource(kind));
    setEditingId(null);
    setOpen(true);
    setError("");
    setStatus("");
  }

  function startEdit(resource: CalendarResource) {
    setDraft({ ...resource });
    setEditingId(resource.id);
    setOpen(true);
    setError("");
    setStatus("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) return setError("Enter a document title.");
    if (!draft.description.trim()) return setError("Add a short explanation so families know what the file contains.");
    if (!draft.documentUrl.trim()) return setError("Upload the school calendar or timetable before saving the record.");
    try {
      const url = new URL(draft.documentUrl);
      if (!(["http:", "https:"].includes(url.protocol))) throw new Error();
    } catch { return setError("The attachment URL must be a valid HTTP or HTTPS URL."); }
    if (draft.kind === "exam-timetable" && !(draft.className || "").trim()) return setError("Enter the class or grade covered by this timetable.");
    const cleaned = { ...draft, title: draft.title.trim(), description: draft.description.trim(), className: draft.className?.trim() || "", academicYear: draft.academicYear?.trim() || "", documentUrl: draft.documentUrl.trim(), documentName: draft.documentName?.trim() || "", documentType: draft.documentType?.trim() || "", active: Boolean(draft.active) };
    onChange(editingId ? safeResources.map((item) => item.id === editingId ? cleaned : item) : [...safeResources, cleaned]);
    setDraft(null);
    setOpen(false);
    setEditingId(null);
    setError("");
    setStatus(cleaned.active ? "Resource staged for publishing. Use the page-level Save changes button to make it live." : "Draft staged. Use the page-level Save changes button to store it.");
  }

  function toggle(resource: CalendarResource) {
    if (!resource.active && (!resource.title.trim() || !resource.description.trim() || !resource.documentUrl.trim() || !isHttpUrl(resource.documentUrl.trim()) || (resource.documentType && !["application/pdf", "image/jpeg", "image/png", "image/webp", "image/avif"].includes(resource.documentType)) || (resource.kind === "exam-timetable" && !resource.className?.trim()))) {
      setError(`Complete the title, description, attachment${resource.kind === "exam-timetable" ? ", and class/grade" : ""} before publishing “${resource.title || kindLabel(resource.kind)}”.`);
      return;
    }
    onChange(safeResources.map((item) => item.id === resource.id ? { ...item, active: !item.active } : item));
    setError("");
    setStatus(`${resource.title} marked ${resource.active ? "as draft" : "published"}. Save the page to commit this change.`);
  }

  function remove(resource: CalendarResource) {
    if (typeof window !== "undefined" && !window.confirm(`Remove “${resource.title}” from school documents?`)) return;
    onChange(safeResources.filter((item) => item.id !== resource.id));
    setStatus("Resource removed from the editor. Save the page to commit this change.");
  }

  return <section className="cms-form-section calendar-resource-manager" aria-labelledby="calendar-resource-manager-title">
    <div className="cms-section-title calendar-resource-manager-heading">
      <div><span className="eyebrow">DOCUMENT LIBRARY</span><h3 id="calendar-resource-manager-title">School calendar & exam timetables</h3><p>Upload an image notice or PDF. These files are shown on the public calendar, and exam timetables also appear under Examinations.</p></div>
      <span className="calendar-manager-total"><strong>{safeResources.length}</strong><small>Files / records</small></span>
    </div>
    {status && <p className="calendar-manager-message success" role="status"><Icon name="check-circle" size={15}/>{status}</p>}
    {error && <p className="calendar-manager-message error" role="alert"><Icon name="alert-circle" size={15}/>{error}</p>}
    {!open && <div className="calendar-resource-add-actions">{kinds.map((kind) => <button type="button" className="button button-outline" key={kind.value} onClick={() => startNew(kind.value)}><Icon name="plus" size={14}/> Add {kind.label.toLowerCase()}</button>)}</div>}
    {open && draft && <form className="calendar-manager-form" onSubmit={save}>
      <div className="calendar-manager-form-heading"><div><span className="eyebrow">{editingId ? "EDIT FILE RECORD" : "NEW FILE RECORD"}</span><h4>{editingId ? "Update school resource" : `Add ${kindLabel(draft.kind).toLowerCase()}`}</h4></div><button type="button" className="button button-outline button-small" onClick={() => { setOpen(false); setDraft(null); setEditingId(null); setError(""); }} disabled={busy}>Cancel</button></div>
      <div className="calendar-manager-fields">
        <div className="form-field"><label htmlFor="resource-kind">Resource type</label><select id="resource-kind" value={draft.kind} onChange={(event) => setDraft((current) => current ? { ...current, kind: event.target.value as ResourceKind } : current)}>{kinds.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><small className="form-note">{kinds.find((item) => item.value === draft.kind)?.detail}</small></div>
        <div className="form-field"><label htmlFor="resource-year">Academic year (optional)</label><input id="resource-year" value={draft.academicYear || ""} onChange={(event) => setDraft((current) => current ? { ...current, academicYear: event.target.value } : current)} placeholder="e.g. 2026–27" /></div>
        <div className="form-field calendar-manager-field-wide"><label htmlFor="resource-title">Title <span aria-hidden="true">*</span></label><input id="resource-title" value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} required placeholder={draft.kind === "exam-timetable" ? "e.g. Term I examination timetable" : "e.g. School calendar 2026–27"}/></div>
        {draft.kind === "exam-timetable" && <div className="form-field"><label htmlFor="resource-class">Class / grade covered <span aria-hidden="true">*</span></label><input id="resource-class" value={draft.className || ""} onChange={(event) => setDraft((current) => current ? { ...current, className: event.target.value } : current)} required placeholder="e.g. Classes 6–10"/></div>}
        <div className="form-field calendar-manager-field-wide"><label htmlFor="resource-description">Details for families <span aria-hidden="true">*</span></label><textarea id="resource-description" rows={3} value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} required placeholder="Explain the term, exam, classes or important instructions."/></div>
        <div className="form-field calendar-manager-field-wide"><label htmlFor="resource-file">Image notice or PDF file <span aria-hidden="true">*</span></label>{draft.documentUrl && <div className="calendar-resource-file-current"><Icon name={draft.documentType?.startsWith("image/") ? "image" : "file-text"} size={22}/><span><strong>{draft.documentName || "Uploaded school document"}</strong><small>{draft.documentType || "File"}</small></span><a href={draft.documentUrl} target="_blank" rel="noopener noreferrer" className="button button-outline button-small">Preview <Icon name="external-link" size={13}/></a><button type="button" className="button button-danger button-small" onClick={() => setDraft((current) => current ? { ...current, documentUrl: "", documentName: "", documentType: "" } : current)} disabled={busy}>Remove file</button></div>}<input id="resource-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,.pdf" disabled={busy} onChange={(event) => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }}/><small className="form-note">JPG, PNG, WebP, AVIF or PDF, up to 12 MB. Files are stored using the configured Cloudinary account.</small></div>
        <div className="form-field calendar-manager-field-wide"><label htmlFor="resource-published">Publication status</label><label className="cms-active-toggle"><input id="resource-published" type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => current ? { ...current, active: event.target.checked } : current)}/><span>{draft.active ? "Publish when page changes are saved" : "Draft — hidden from public visitors"}</span></label></div>
      </div>
      <div className="calendar-manager-form-actions"><button type="button" className="button button-outline" onClick={() => { setOpen(false); setDraft(null); setEditingId(null); }} disabled={busy}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}><Icon name="check" size={14}/>{busy ? "Uploading…" : editingId ? "Update resource" : "Add resource to editor"}</button></div>
    </form>}
    {safeResources.length === 0 && !open && <div className="calendar-manager-empty"><Icon name="file-text" size={25}/><strong>No calendar files yet</strong><p>Upload the current school calendar or exam timetable, add a short description and publish it after checking the information.</p></div>}
    {safeResources.length > 0 && !open && <div className="calendar-resource-records">{safeResources.map((resource) => <article key={resource.id} className="calendar-manager-record"><div className="calendar-manager-record-main"><span className={`calendar-manager-status ${resource.active ? "is-published" : "is-draft"}`}><span aria-hidden="true"/>{resource.active ? "Published" : "Draft"}</span><h5>{resource.title}</h5><p className="calendar-manager-record-date"><Icon name="file-text" size={14}/>{kindLabel(resource.kind)}{resource.academicYear ? ` · ${resource.academicYear}` : ""}{resource.className ? ` · ${resource.className}` : ""}</p><p className="calendar-manager-record-description">{resource.description}</p><small>{resource.documentName || "Attachment linked"}</small></div><div className="calendar-manager-record-actions"><button type="button" className="button button-outline button-small" onClick={() => startEdit(resource)}><Icon name="pen-line" size={14}/> Edit</button><button type="button" className="button button-outline button-small" onClick={() => toggle(resource)}><Icon name={resource.active ? "eye" : "check-circle"} size={14}/>{resource.active ? "Unpublish" : "Publish"}</button><button type="button" className="button button-danger button-small" onClick={() => remove(resource)}><Icon name="trash" size={14}/> Remove</button></div></article>)}</div>}
    <p className="calendar-manager-footnote"><Icon name="shield-check" size={15}/>Only published records are visible publicly. Uploading a file does not publish it until you save the record and then save the page.</p>
  </section>;
}
