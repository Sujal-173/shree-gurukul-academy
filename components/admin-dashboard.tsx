"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { Icon, type IconName } from "@/components/icon";
import { CmsImageField } from "@/components/cms-image-field";
import {
  CmsArrayEditor,
  type CmsArrayFieldDefinition,
} from "@/components/cms-array-editor";

type MediaItem = {
  _id?: string;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  originalName?: string;
  mimeType?: string;
  resourceType?: string;
  createdAt?: string;
};
type Inquiry = {
  _id: string;
  formType: "contact" | "admission";
  name: string;
  studentName?: string;
  parentName?: string;
  phone: string;
  email?: string;
  classApplyingFor?: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
  googleSheetsSyncStatus?: "pending" | "synced" | "failed";
};
type ContentRevision = {
  _id: string;
  version: number;
  sourceUpdatedAt: string;
  archivedAt: string;
  archivedBy: string;
};
const tabs = [
  { key: "overview", label: "Overview", icon: "layout-dashboard" },
  { key: "content", label: "Advanced editor", icon: "file-text" },
  { key: "media", label: "Media library", icon: "images" },
  { key: "reels", label: "Social creative", icon: "image" },
  { key: "inquiries", label: "Enquiries", icon: "mail" },
  { key: "history", label: "Revision history", icon: "clock" },
] as const;
type Tab = (typeof tabs)[number]["key"];
type AdminNavKey = Tab | "pages";
const adminNavGroups: { label: string; items: readonly AdminNavKey[] }[] = [
  { label: "WORKSPACE", items: ["overview"] },
  { label: "WEBSITE CONTENT", items: ["pages", "media"] },
  { label: "COMMUNICATION", items: ["inquiries"] },
  { label: "TOOLS & HISTORY", items: ["reels", "history", "content"] },
];

const heroFields: CmsArrayFieldDefinition[] = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Headline" },
  { key: "highlight", label: "Highlighted line" },
  { key: "subtitle", label: "Description", multiline: true },
  { key: "image", label: "Hero image", kind: "image" },
  { key: "alt", label: "Image alt text", multiline: true },
  { key: "primaryLabel", label: "Primary button label" },
  { key: "primaryHref", label: "Primary button link" },
  { key: "secondaryLabel", label: "Secondary button label" },
  { key: "secondaryHref", label: "Secondary button link" },
];
const sectionFields: CmsArrayFieldDefinition[] = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description", multiline: true },
  { key: "image", label: "Section image", kind: "image" },
  { key: "alt", label: "Image alt text", multiline: true },
  { key: "tag", label: "Tag / category" },
  { key: "href", label: "Link / route" },
  { key: "items", label: "Bullet points", kind: "string-array" },
];
const leaderFields: CmsArrayFieldDefinition[] = [
  { key: "role", label: "Profile title / role" },
  { key: "name", label: "Name" },
  { key: "designation", label: "Designation" },
  { key: "quote", label: "Highlighted quote (optional)", multiline: true },
  { key: "message", label: "Message", multiline: true },
  { key: "portrait", label: "Portrait image", kind: "image" },
  { key: "alt", label: "Portrait alt text", multiline: true },
  { key: "active", label: "Published on public site", kind: "toggle" },
];
const noticeFields: CmsArrayFieldDefinition[] = [
  { key: "category", label: "Category" },
  { key: "title", label: "Notice title" },
  { key: "date", label: "Date / date label" },
  { key: "description", label: "Description", multiline: true },
  { key: "imageUrl", label: "Notice image / poster", kind: "image" },
  { key: "imageAlt", label: "Image description (alt text)" },
  { key: "attachmentUrl", label: "Circular / PDF attachment", kind: "attachment" },
  { key: "active", label: "Published on public site", kind: "toggle" },
];
const linkFields: CmsArrayFieldDefinition[] = [
  { key: "label", label: "Label" },
  { key: "description", label: "Short description", multiline: true },
  { key: "href", label: "Link / route" },
  { key: "icon", label: "Icon name" },
];
const navFields: CmsArrayFieldDefinition[] = [
  { key: "label", label: "Menu label" },
  { key: "href", label: "Route / URL" },
];
const statFields: CmsArrayFieldDefinition[] = [
  { key: "value", label: "Display value" },
  { key: "label", label: "Caption" },
];
const faqFields: CmsArrayFieldDefinition[] = [
  { key: "question", label: "Question" },
  { key: "answer", label: "Answer", multiline: true },
];
const stepFields: CmsArrayFieldDefinition[] = [
  { key: "number", label: "Step number" },
  { key: "title", label: "Step title" },
  { key: "description", label: "Description", multiline: true },
];
const levelFields: CmsArrayFieldDefinition[] = [
  { key: "range", label: "Class range" },
  { key: "title", label: "Stage title" },
  { key: "description", label: "Description", multiline: true },
];
const documentFields: CmsArrayFieldDefinition[] = [
  { key: "title", label: "Document title" },
  { key: "description", label: "Description", multiline: true },
  { key: "url", label: "Document URL" },
  { key: "updatedAt", label: "Last updated" },
];

function setAtPath(node: unknown, path: string[], value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(node)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index > 500) return node;
    const copy = [...node];
    copy[index] = setAtPath(copy[index], rest, value);
    return copy;
  }
  const object =
    node && typeof node === "object" ? (node as Record<string, unknown>) : {};
  return { ...object, [head]: setAtPath(object[head], rest, value) };
}

function CmsField({
  label,
  value,
  path,
  update,
  multiline = false,
}: {
  label: string;
  value: unknown;
  path: string[];
  update: (path: string[], value: unknown) => void;
  multiline?: boolean;
}) {
  const text = typeof value === "string" ? value : "";
  const id = `cms-${path.join("-").replace(/[^a-z0-9-]/gi, "")}`;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={text}
          onChange={(event) => update(path, event.target.value)}
        />
      ) : (
        <input
          id={id}
          value={text}
          onChange={(event) => update(path, event.target.value)}
        />
      )}
    </div>
  );
}

export function AdminDashboard({
  initialContent,
  adminEmail,
}: {
  initialContent: SiteContent;
  adminEmail: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState(JSON.stringify(initialContent, null, 2));
  const [savedDraft, setSavedDraft] = useState(JSON.stringify(initialContent, null, 2));
  const hasUnsavedChanges = draft !== savedDraft;
  const [notice, setNotice] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [syncingInquiryId, setSyncingInquiryId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const mediaLoaded = useRef(false);
  const inquiriesLoaded = useRef(false);
  const historyLoaded = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reelTitle, setReelTitle] = useState(
    "Learning today. Leading tomorrow.",
  );
  const [reelSubtitle, setReelSubtitle] = useState(
    "ADMISSIONS OPEN · CLASSES 1–10",
  );
  const [reelImageUrl, setReelImageUrl] = useState(
    "/images/learning-together.webp",
  );
  const reelCanvas = useRef<HTMLCanvasElement>(null);
  const parsed = useMemo(() => {
    try {
      return JSON.parse(draft) as SiteContent;
    } catch {
      return null;
    }
  }, [draft]);

  const loadMedia = useCallback(async (force = false) => {
    if (mediaLoaded.current && !force) return;
    mediaLoaded.current = true;
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await response.json()) as {
        media?: MediaItem[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Could not load media.");
      setMedia(data.media || []);
    } catch (error) {
      mediaLoaded.current = false;
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Could not load media.",
      });
    }
  }, []);
  const loadInquiries = useCallback(async (force = false) => {
    if (inquiriesLoaded.current && !force) return;
    inquiriesLoaded.current = true;
    setLoadingInquiries(true);
    try {
      const response = await fetch("/api/admin/inquiries", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        inquiries?: Inquiry[];
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "Could not load enquiries.");
      setInquiries(data.inquiries || []);
    } catch (error) {
      inquiriesLoaded.current = false;
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Could not load enquiries.",
      });
    } finally {
      setLoadingInquiries(false);
    }
  }, []);
  const loadHistory = useCallback(async (force = false) => {
    if (historyLoaded.current && !force) return;
    historyLoaded.current = true;
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/admin/content-history", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        revisions?: ContentRevision[];
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "Could not load content history.");
      setRevisions(data.revisions || []);
    } catch (error) {
      historyLoaded.current = false;
      setNotice({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not load content history.",
      });
    } finally {
      setLoadingHistory(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      if (tab === "media" || tab === "reels" || tab === "content")
        void loadMedia();
      if (tab === "inquiries") void loadInquiries();
      if (tab === "history") void loadHistory();
    });
    return () => {
      active = false;
    };
  }, [tab, loadMedia, loadInquiries, loadHistory]);
  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const canvas = reelCanvas.current;
    if (!canvas || tab !== "reels") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width,
      height = canvas.height;
    const draw = () => {
      ctx.fillStyle = "#721c24";
      ctx.fillRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "rgba(7,24,42,.96)");
      bg.addColorStop(1, "rgba(114,28,36,.76)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(243,212,125,.35)";
      ctx.lineWidth = 3;
      for (let radius = 170; radius < 560; radius += 75) {
        ctx.beginPath();
        ctx.arc(width + 30, 250, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#f3d47d";
      ctx.fillRect(74, 105, 72, 8);
      ctx.fillStyle = "#fffaf1";
      ctx.font = "800 34px Arial, sans-serif";
      ctx.fillText("SHRI GURUKUL ACADEMY", 74, 165);
      ctx.fillStyle = "#f3d47d";
      ctx.font = "700 25px Arial, sans-serif";
      ctx.fillText("NEW LEPA  ·  MADHYA PRADESH", 74, 207);
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const scale = Math.max(width / image.width, height / image.height),
          w = image.width * scale,
          h = image.height * scale;
        ctx.save();
        ctx.globalAlpha = 0.54;
        ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
        ctx.restore();
        const overlay = ctx.createLinearGradient(0, 260, 0, height);
        overlay.addColorStop(0, "rgba(7,24,42,.13)");
        overlay.addColorStop(0.4, "rgba(7,24,42,.72)");
        overlay.addColorStop(1, "rgba(7,24,42,.98)");
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 250, width, height - 250);
        ctx.fillStyle = "#f3d47d";
        ctx.fillRect(74, 900, 115, 7);
        ctx.fillStyle = "#fffaf1";
        ctx.font = "700 31px Arial, sans-serif";
        ctx.fillText("A GOOD PLACE TO", 74, 1005);
        ctx.font = "900 70px Arial, sans-serif";
        const words = reelTitle.trim().split(/\s+/);
        let line = "",
          y = 1110;
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > 930 && line) {
            ctx.fillText(line, 74, y);
            line = word;
            y += 88;
          } else line = test;
        }
        if (line && y < 1470) ctx.fillText(line, 74, y);
        ctx.fillStyle = "#f3d47d";
        ctx.font = "800 29px Arial, sans-serif";
        const sub = reelSubtitle.slice(0, 42);
        ctx.fillText(sub, 74, 1560);
        ctx.fillStyle = "rgba(255,250,241,.86)";
        ctx.font = "500 24px Arial, sans-serif";
        ctx.fillText("LEARN  ·  GROW  ·  ACHIEVE", 74, 1635);
        ctx.strokeStyle = "rgba(243,212,125,.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(42, 42, width - 84, height - 84);
        ctx.fillStyle = "#f3d47d";
        ctx.fillRect(74, 1720, 932, 2);
        ctx.fillStyle = "#fffaf1";
        ctx.font = "700 22px Arial, sans-serif";
        ctx.fillText("ENQUIRIES  ·  7247371421", 74, 1780);
      };
      image.onerror = () => {
        ctx.fillStyle = "#fffaf1";
        ctx.font = "48px Arial";
        ctx.fillText("GURUKUL ACADEMY", 74, 400);
      };
      image.src = reelImageUrl;
    };
    draw();
  }, [reelTitle, reelSubtitle, reelImageUrl, tab]);

  function updateDraftField(path: string[], value: unknown) {
    try {
      const current = JSON.parse(draft) as unknown;
      setDraft(JSON.stringify(setAtPath(current, path, value), null, 2));
    } catch {
      setNotice({
        kind: "error",
        text: "Fix the JSON syntax error in Advanced JSON mode before using the visual editor.",
      });
    }
  }

  async function saveContent() {
    setNotice(null);
    let content: unknown;
    try {
      content = JSON.parse(draft);
    } catch {
      setNotice({
        kind: "error",
        text: "Your JSON has a syntax error. Fix it before saving.",
      });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = (await response.json()) as {
        error?: string;
        savedAt?: string;
      };
      if (!response.ok)
        throw new Error(result.error || "Could not save content.");
      const normalizedDraft = JSON.stringify(content, null, 2);
      setSavedDraft(normalizedDraft);
      setDraft(normalizedDraft);
      setNotice({
        kind: "success",
        text: `Website content saved at ${new Date(result.savedAt || Date.now()).toLocaleTimeString()}. Your changes are now live on the public site.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Could not save content.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(
    fileToUpload: File | null = file,
    applyToPath?: string[],
  ) {
    if (!fileToUpload) {
      setNotice({ kind: "error", text: "Choose an image first." });
      return;
    }
    setUploading(true);
    setNotice(null);
    const form = new FormData();
    form.append("file", fileToUpload);
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        media?: MediaItem;
        error?: string;
      };
      if (!response.ok || !data.media)
        throw new Error(data.error || "Upload failed.");
      setMedia((current) => [
        data.media!,
        ...current.filter((item) => item.url !== data.media!.url),
      ]);
      if (applyToPath) updateDraftField(applyToPath, data.media.url);
      if (fileToUpload === file) setFile(null);
      setNotice({
        kind: "success",
        text: applyToPath
          ? "Image uploaded to Cloudinary and linked to this field. Save website content to publish it."
          : "Image uploaded to Cloudinary. Choose it in any image field or copy its URL.",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function uploadAttachment(fileToUpload: File, path: string[]) {
    setUploading(true);
    setNotice(null);
    const form = new FormData();
    form.append("file", fileToUpload);
    form.append("purpose", "attachment");
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = (await response.json()) as { media?: MediaItem & { mimeType?: string }; error?: string };
      if (!response.ok || !result.media) throw new Error(result.error || "Attachment upload failed.");
      if (path.length) {
        updateDraftField(path, result.media.url);
        const base = path.slice(0, -1);
        const isDocumentField = path[path.length - 1] === "documentUrl";
        updateDraftField([...base, isDocumentField ? "documentName" : "attachmentName"], result.media.originalName || fileToUpload.name);
        updateDraftField([...base, isDocumentField ? "documentType" : "attachmentType"], result.media.mimeType || fileToUpload.type);
      }
      setNotice({ kind: "success", text: "Attachment uploaded and linked. Save website content to publish it." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Attachment upload failed." });
    } finally {
      setUploading(false);
    }
  }

  function changeArray(
    path: string[],
    mutate: (items: unknown[]) => unknown[],
  ) {
    try {
      const root = JSON.parse(draft) as unknown;
      const updateAt = (node: unknown, rest: string[]): unknown => {
        if (rest.length === 0) return mutate(Array.isArray(node) ? node : []);
        const [head, ...tail] = rest;
        if (Array.isArray(node)) {
          const index = Number(head);
          if (!Number.isInteger(index) || index < 0 || index >= node.length)
            return node;
          const copy = [...node];
          copy[index] = updateAt(copy[index], tail);
          return copy;
        }
        const object =
          node && typeof node === "object"
            ? (node as Record<string, unknown>)
            : {};
        return { ...object, [head]: updateAt(object[head], tail) };
      };
      setDraft(JSON.stringify(updateAt(root, path), null, 2));
    } catch {
      setNotice({
        kind: "error",
        text: "Fix the JSON syntax error before editing structured content.",
      });
    }
  }

  function addArrayItem(path: string[], value: unknown) {
    changeArray(path, (items) => [...items, value]);
  }
  function removeArrayItem(path: string[], index: number) {
    changeArray(path, (items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }
  function moveArrayItem(path: string[], index: number, delta: number) {
    changeArray(path, (items) => {
      const destination = index + delta;
      if (destination < 0 || destination >= items.length) return items;
      const copy = [...items];
      [copy[index], copy[destination]] = [copy[destination], copy[index]];
      return copy;
    });
  }

  async function reviewRevision(id: string) {
    try {
      const response = await fetch(
        `/api/admin/content-history?id=${encodeURIComponent(id)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        revision?: { content?: unknown; version?: number };
        error?: string;
      };
      if (!response.ok || !data.revision?.content)
        throw new Error(data.error || "Could not load this revision.");
      setDraft(JSON.stringify(data.revision.content, null, 2));
      setTab("content");
      setNotice({
        kind: "info",
        text: `Revision ${data.revision.version} loaded as an unsaved draft. Review it before selecting “Save website content”.`,
      });
      setShowAdvanced(false);
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not restore revision.",
      });
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(data.error || "Could not update enquiry.");
      setInquiries((current) =>
        current.map((item) => (item._id === id ? { ...item, status } : item)),
      );
      setNotice({ kind: "success", text: "Enquiry status updated." });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Could not update enquiry.",
      });
    }
  }

  async function syncInquiryToGoogleSheets(id: string) {
    setSyncingInquiryId(id);
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not sync enquiry.");
      setInquiries((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, googleSheetsSyncStatus: "synced" }
            : item,
        ),
      );
      setNotice({ kind: "success", text: "Enquiry synced to Google Sheets." });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not sync enquiry to Google Sheets.",
      });
    } finally {
      setSyncingInquiryId(null);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <Image src="/images/crest.webp" alt="" width={45} height={50} />
          <span>
            <strong>Gurukul Academy</strong>
            <small>WEBSITE CMS</small>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Admin sections">
          {adminNavGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <span className="admin-nav-label">{group.label}</span>
              {group.items.map((itemKey) => {
                if (itemKey === "pages") {
                  return (
                    <Link href="/admin/pages" className="admin-tab admin-tab-link" key="pages">
                      <span><Icon name="folder-open" size={18} /></span>
                      Website pages
                    </Link>
                  );
                }
                const item = tabs.find((entry) => entry.key === itemKey);
                if (!item) return null;
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={tab === item.key ? "admin-tab active" : "admin-tab"}
                    aria-current={tab === item.key ? "page" : undefined}
                    onClick={() => {
                      setTab(item.key);
                      setNotice(null);
                    }}
                  >
                    <span><Icon name={item.icon as IconName} size={18} /></span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-avatar">
            {adminEmail.slice(0, 1).toUpperCase()}
          </span>
          <span className="admin-user">
            <strong>Administrator</strong>
            <small>{adminEmail}</small>
          </span>
          <button
            type="button"
            className="logout-button"
            onClick={logout}
            aria-label="Sign out"
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <span className="eyebrow">SHRI GURUKUL ACADEMY · NEW LEPA</span>
            <h1>{tabs.find((item) => item.key === tab)?.label}</h1>
          </div>
          <Link href="/" target="_blank" className="button button-outline">
            View website <Icon name="external-link" size={15} />
          </Link>
        </div>
        {notice && (
          <div className={`admin-notice ${notice.kind}`} role="status">
            {notice.text}
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {tab === "overview" && (
          <section className="admin-panel-content">
            <div className="admin-welcome">
              <div>
                <span className="eyebrow">CONTENT CONTROL CENTRE</span>
                <h2>Welcome back.</h2>
                <p>
                  Manage one task at a time: update a specific page, review uploaded media,
                  respond to enquiries, or restore an earlier content revision. Each workflow
                  has its own focused workspace.
                </p>
              </div>
              <div className="admin-welcome-mark">
                <Icon name="sparkles" size={34} />
              </div>
            </div>
            <div className="admin-quick-actions" aria-label="Common publishing tasks">
              <Link href="/admin/pages/calendar">
                <span className="admin-quick-icon"><Icon name="calendar-days" size={18} /></span>
                <span><strong>Publish calendar update</strong><small>Events, holidays and examinations</small></span>
                <Icon name="arrow-up-right" size={16} />
              </Link>
              <Link href="/admin/pages/notices">
                <span className="admin-quick-icon"><Icon name="bell" size={18} /></span>
                <span><strong>Publish a notice</strong><small>Announcements and circulars</small></span>
                <Icon name="arrow-up-right" size={16} />
              </Link>
              <Link href="/admin/pages/admission">
                <span className="admin-quick-icon"><Icon name="graduation-cap" size={18} /></span>
                <span><strong>Update admissions page</strong><small>Process, FAQs and enquiry content</small></span>
                <Icon name="arrow-up-right" size={16} />
              </Link>
            </div>
            <div className="admin-stats">
              <article>
                <span>01</span>
                <strong>Content CMS</strong>
                <p>
                  Navigation, homepage, page copy, FAQs, notices, SEO and
                  contact details.
                </p>
                <Link className="text-button" href="/admin/pages">
                  Open page editors <Icon name="arrow-up-right" size={14} />
                </Link>
              </article>
              <article>
                <span>02</span>
                <strong>Media library</strong>
                <p>
                  Upload images once, then choose them directly from any image
                  field across the website.
                </p>
                <button className="text-button" onClick={() => setTab("media")}>
                  Manage media <Icon name="images" size={14} />
                </button>
              </article>
              <article>
                <span>03</span>
                <strong>Enquiry inbox</strong>
                <p>
                  Review admission and contact forms stored by the site backend.
                </p>
                <button
                  className="text-button"
                  onClick={() => setTab("inquiries")}
                >
                  Open enquiries <Icon name="mail" size={14} />
                </button>
              </article>
            </div>
            <details className="admin-help">
              <summary>Before publishing checklist</summary>
              <ul>
                <li>Upload the academy’s real crest and school photographs.</li>
                <li>
                  Verify official names, programme details, dates and
                  disclosures.
                </li>
                <li>Save a backup of the JSON content before major edits.</li>
                <li>Confirm MongoDB, Cloudinary and HTTPS are configured.</li>
              </ul>
            </details>
          </section>
        )}
        {tab === "content" && (
          <section className="admin-panel-content">
            <div className="cms-intro">
              <div>
                <h2>Advanced full-site editor</h2>
                <p>
                  This editor is retained for technical administrators and
                  full-content backups. For normal work, use the dedicated
                  page-by-page editors to avoid editing an unnecessarily large
                  form.
                </p>
                <Link className="button button-outline" href="/admin/pages">
                  <Icon name="folder-open" size={15} /> Open dedicated page
                  editors
                </Link>
              </div>
              <span
                className={
                  parsed
                    ? hasUnsavedChanges
                      ? "json-state invalid"
                      : "json-state valid"
                    : "json-state invalid"
                }
              >
                {!parsed ? (
                  <>JSON error</>
                ) : hasUnsavedChanges ? (
                  <>
                    <Icon name="clock" size={15} /> Unsaved changes
                  </>
                ) : (
                  <>
                    <Icon name="check-circle" size={15} /> Saved
                  </>
                )}
              </span>
            </div>
            {parsed &&
            parsed.brand &&
            parsed.home &&
            parsed.pages &&
            parsed.seo ? (
              <div className="cms-visual-editor">
                <section className="cms-form-section">
                  <div className="cms-section-title">
                    <h3>Academy profile</h3>
                    <p>
                      Update academy identity, contact details, logo and
                      location across the site.
                    </p>
                  </div>
                  <div className="cms-field-grid">
                    <CmsField
                      label="Full school name"
                      value={parsed.brand.name}
                      path={["brand", "name"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Short brand name"
                      value={parsed.brand.shortName}
                      path={["brand", "shortName"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Subtitle / campus name"
                      value={parsed.brand.subtitle}
                      path={["brand", "subtitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Tagline"
                      value={parsed.brand.tagline}
                      path={["brand", "tagline"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Grade range"
                      value={parsed.brand.gradeRange}
                      path={["brand", "gradeRange"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="School phone"
                      value={parsed.brand.phone}
                      path={["brand", "phone"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="WhatsApp number (country code, digits only)"
                      value={parsed.brand.whatsapp}
                      path={["brand", "whatsapp"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="School email"
                      value={parsed.brand.email}
                      path={["brand", "email"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Address"
                      value={parsed.brand.address}
                      path={["brand", "address"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Instagram URL"
                      value={parsed.brand.instagram}
                      path={["brand", "instagram"]}
                      update={updateDraftField}
                    />
                    <CmsImageField
                      label="School crest / logo"
                      value={parsed.brand.logoUrl}
                      path={["brand", "logoUrl"]}
                      update={updateDraftField}
                      media={media}
                      onUpload={(imageFile, imagePath) =>
                        uploadImage(imageFile, imagePath)
                      }
                    />
                    <CmsField
                      label="Map search text"
                      value={parsed.brand.mapQuery}
                      path={["brand", "mapQuery"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Header enquiry button label"
                      value={parsed.brand.enquiryLabel}
                      path={["brand", "enquiryLabel"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Header enquiry button link"
                      value={parsed.brand.enquiryHref}
                      path={["brand", "enquiryHref"]}
                      update={updateDraftField}
                    />
                  </div>
                </section>

                <CmsArrayEditor
                  title="Homepage hero slideshow"
                  description="Create, replace, reorder or remove hero slides. Each slide has its own optimized image, text and buttons."
                  path={["home", "hero"]}
                  items={parsed.home.hero}
                  fields={heroFields}
                  itemLabel="title"
                  template={{
                    eyebrow: "SHRI GURUKUL ACADEMY · NEW LEPA",
                    title: "A strong foundation",
                    highlight: "for a brighter future.",
                    subtitle: "Add a short, verified message for families.",
                    image: "/images/campus-illustration.webp",
                    alt: "Illustrative academy campus image",
                    primaryLabel: "Enquire for Admission",
                    primaryHref: "/admission#enquiry",
                    secondaryLabel: "Discover Our Academy",
                    secondaryHref: "/about",
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  minItems={1}
                  addLabel="Add hero slide"
                />

                <section className="cms-form-section">
                  <div className="cms-section-title">
                    <h3>Homepage introduction & sections</h3>
                    <p>
                      Control the About introduction, headings, descriptions and
                      admission call to action.
                    </p>
                  </div>
                  <div className="cms-field-grid">
                    <CmsField
                      label="Intro eyebrow"
                      value={parsed.home.introEyebrow}
                      path={["home", "introEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Intro title"
                      value={parsed.home.introTitle}
                      path={["home", "introTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Intro description"
                      value={parsed.home.introBody}
                      path={["home", "introBody"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Intro bullet points (one per line)"
                      value={parsed.home.introPoints}
                      path={["home", "introPoints"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Intro button label"
                      value={parsed.home.introButtonLabel}
                      path={["home", "introButtonLabel"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Intro button link"
                      value={parsed.home.introButtonHref}
                      path={["home", "introButtonHref"]}
                      update={updateDraftField}
                    />
                    <CmsImageField
                      label="Intro image"
                      value={parsed.home.introImage}
                      path={["home", "introImage"]}
                      update={updateDraftField}
                      media={media}
                      onUpload={(imageFile, imagePath) =>
                        uploadImage(imageFile, imagePath)
                      }
                    />
                    <CmsField
                      label="Intro image alt text"
                      value={parsed.home.introAlt}
                      path={["home", "introAlt"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Hero caption title"
                      value={parsed.home.heroCaptionTitle}
                      path={["home", "heroCaptionTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Hero caption subtitle"
                      value={parsed.home.heroCaptionSubtitle}
                      path={["home", "heroCaptionSubtitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Hero location label"
                      value={parsed.home.heroLocationLabel}
                      path={["home", "heroLocationLabel"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Highlights eyebrow"
                      value={parsed.home.highlightsEyebrow}
                      path={["home", "highlightsEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Highlights heading"
                      value={parsed.home.highlightsTitle}
                      path={["home", "highlightsTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Highlights description"
                      value={parsed.home.highlightsSubtitle}
                      path={["home", "highlightsSubtitle"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Values eyebrow"
                      value={parsed.home.valuesEyebrow}
                      path={["home", "valuesEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Values heading"
                      value={parsed.home.valuesTitle}
                      path={["home", "valuesTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Values description"
                      value={parsed.home.valuesSubtitle}
                      path={["home", "valuesSubtitle"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Leadership eyebrow"
                      value={parsed.home.leadersEyebrow}
                      path={["home", "leadersEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Leadership heading"
                      value={parsed.home.leadersTitle}
                      path={["home", "leadersTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Leadership description"
                      value={parsed.home.leadersSubtitle}
                      path={["home", "leadersSubtitle"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Notices eyebrow"
                      value={parsed.home.noticesEyebrow}
                      path={["home", "noticesEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Notices heading"
                      value={parsed.home.noticesTitle}
                      path={["home", "noticesTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Notices introduction"
                      value={parsed.home.noticesSubtitle}
                      path={["home", "noticesSubtitle"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Admissions CTA eyebrow"
                      value={parsed.home.ctaEyebrow}
                      path={["home", "ctaEyebrow"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Admissions CTA title"
                      value={parsed.home.ctaTitle}
                      path={["home", "ctaTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Admissions CTA description"
                      value={parsed.home.ctaBody}
                      path={["home", "ctaBody"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Admissions CTA button"
                      value={parsed.home.ctaLabel}
                      path={["home", "ctaLabel"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Admissions CTA secondary button label"
                      value={parsed.home.ctaSecondaryLabel}
                      path={["home", "ctaSecondaryLabel"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Admissions CTA secondary link"
                      value={parsed.home.ctaSecondaryHref}
                      path={["home", "ctaSecondaryHref"]}
                      update={updateDraftField}
                    />
                  </div>
                </section>

                <CmsArrayEditor
                  title="Homepage quick links"
                  description="The shortcut cards under the hero."
                  path={["home", "quickLinks"]}
                  items={parsed.home.quickLinks}
                  fields={linkFields}
                  itemLabel="label"
                  template={{
                    label: "New link",
                    description: "Short explanation",
                    href: "/about",
                    icon: "book-open",
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add quick link"
                />
                <CmsArrayEditor
                  title="Homepage highlights / school life cards"
                  description="Manage the cards that describe learning, activities and strengths. Image uploads can be selected directly from each item."
                  path={["home", "highlights"]}
                  items={parsed.home.highlights}
                  fields={sectionFields}
                  itemLabel="title"
                  template={{
                    eyebrow: "",
                    title: "New highlight",
                    description: "Add verified details here.",
                    image: "/images/learning-together.webp",
                    alt: "Illustrative school learning image",
                    tag: "",
                    href: "",
                    items: [],
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add highlight"
                />
                <CmsArrayEditor
                  title="School values"
                  description="Edit values cards shown on the homepage."
                  path={["home", "values"]}
                  items={parsed.home.values}
                  fields={sectionFields}
                  itemLabel="title"
                  template={{
                    eyebrow: "",
                    title: "New value",
                    description: "Describe this value.",
                    image: "",
                    alt: "",
                    tag: "",
                    href: "",
                    items: [],
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add value"
                />
                <CmsArrayEditor
                  title="Homepage statistics"
                  description="Use verified figures only. Remove stats you cannot substantiate."
                  path={["home", "stats"]}
                  items={parsed.home.stats}
                  fields={statFields}
                  itemLabel="label"
                  template={{ value: "", label: "New statistic" }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add statistic"
                />
                <CmsArrayEditor
                  title="Director, principal & leadership profiles"
                  description="Complete the role, name and approved portrait, then enable Published to show a profile publicly."
                  path={["home", "leaders"]}
                  items={parsed.home.leaders}
                  fields={leaderFields}
                  itemLabel="role"
                  template={{
                    role: "School leader",
                    name: "",
                    designation: "",
                    quote: "",
                    message: "",
                    portrait: "",
                    alt: "Portrait of school leader",
                    active: false,
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add leadership profile"
                />
                <CmsArrayEditor
                  title="Homepage notices"
                  description="Publish, unpublish, reorder or remove homepage announcements."
                  path={["home", "notices"]}
                  items={parsed.home.notices}
                  fields={noticeFields}
                  itemLabel="title"
                  template={{
                    id: "notice-new",
                    category: "General",
                    title: "New notice",
                    date: "",
                    description: "",
                    imageUrl: "",
                    imageAlt: "",
                    attachmentUrl: "",
                    attachmentName: "",
                    attachmentType: "",
                    active: false,
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  onUploadAttachment={(fileToUpload, path) => uploadAttachment(fileToUpload, path)}
                  addLabel="Add notice"
                />

                <section className="cms-form-section">
                  <div className="cms-section-title">
                    <h3>All public pages</h3>
                    <p>
                      Edit page title, banner, main copy, image, image
                      description and every structured section from this panel.
                      Changes remain a draft until saved.
                    </p>
                  </div>
                  {Object.entries(parsed.pages || {}).map(([slug, rawPage]) => {
                    const page =
                      rawPage && typeof rawPage === "object"
                        ? (rawPage as unknown as Record<string, unknown>)
                        : {};
                    return (
                      <div className="cms-page-editor" key={slug}>
                        <div className="cms-page-editor-title">
                          <div>
                            <span className="card-eyebrow">
                              PAGE /{slug.toLowerCase()}
                            </span>
                            <h4>
                              {slug
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (match) => match.toUpperCase())}
                            </h4>
                          </div>
                        </div>
                        <div className="cms-field-grid">
                          <CmsField
                            label="Page title"
                            value={page.title}
                            path={["pages", slug, "title"]}
                            update={updateDraftField}
                          />
                          <CmsField
                            label="Page banner subtitle"
                            value={page.subtitle}
                            path={["pages", slug, "subtitle"]}
                            update={updateDraftField}
                            multiline
                          />
                          <CmsField
                            label="Main heading"
                            value={page.heading}
                            path={["pages", slug, "heading"]}
                            update={updateDraftField}
                          />
                          <CmsField
                            label="Main body text"
                            value={page.body}
                            path={["pages", slug, "body"]}
                            update={updateDraftField}
                            multiline
                          />
                          {("image" in page || "imageAlt" in page) && (
                            <CmsImageField
                              label="Page main image"
                              value={page.image}
                              path={["pages", slug, "image"]}
                              update={updateDraftField}
                              media={media}
                              onUpload={(imageFile, imagePath) =>
                                uploadImage(imageFile, imagePath)
                              }
                            />
                          )}
                          {("imageAlt" in page || "image" in page) && (
                            <CmsField
                              label="Main image alt text"
                              value={page.imageAlt}
                              path={["pages", slug, "imageAlt"]}
                              update={updateDraftField}
                              multiline
                            />
                          )}
                          {Object.entries(page)
                            .filter(
                              ([key, value]) =>
                                typeof value === "string" &&
                                ![
                                  "title",
                                  "subtitle",
                                  "heading",
                                  "body",
                                  "image",
                                  "imageAlt",
                                ].includes(key),
                            )
                            .map(([key, value]) => (
                              <CmsField
                                key={key}
                                label={key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (match) =>
                                    match.toUpperCase(),
                                  )}
                                value={value}
                                path={["pages", slug, key]}
                                update={updateDraftField}
                                multiline={/(body|subtitle|description|disclaimer|points|empty|note|copy)/i.test(
                                  key,
                                )}
                              />
                            ))}
                        </div>
                        {slug !== "notices" && (
                          <CmsArrayEditor
                            title={`${String(page.title || slug)} — sections`}
                            description="Section cards and page content. Add an image when the layout supports one."
                            path={["pages", slug, "sections"]}
                            items={page.sections}
                            fields={sectionFields}
                            itemLabel="title"
                            template={{
                              eyebrow: "",
                              title: "New section",
                              description: "Add verified page content.",
                              image: "",
                              alt: "",
                              tag: "",
                              href: "",
                              items: [],
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            addLabel="Add page section"
                          />
                        )}
                        {Array.isArray(page.faqs) && (
                          <CmsArrayEditor
                            title="Admission FAQs"
                            description="Edit the questions and answers shown on the admissions page."
                            path={["pages", slug, "faqs"]}
                            items={page.faqs}
                            fields={faqFields}
                            itemLabel="question"
                            template={{
                              question: "New question",
                              answer: "Add the verified answer.",
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            addLabel="Add FAQ"
                          />
                        )}
                        {Array.isArray(page.steps) && (
                          <CmsArrayEditor
                            title="Admission process steps"
                            description="Manage each step and its copy. Reorder steps with Move up / Move down."
                            path={["pages", slug, "steps"]}
                            items={page.steps}
                            fields={stepFields}
                            itemLabel="title"
                            template={{
                              number: "05",
                              title: "New admission step",
                              description: "Explain what a family should do.",
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            addLabel="Add process step"
                          />
                        )}
                        {Array.isArray(page.levels) && (
                          <CmsArrayEditor
                            title="Academic levels"
                            description="Edit class ranges and academic-stage copy."
                            path={["pages", slug, "levels"]}
                            items={page.levels}
                            fields={levelFields}
                            itemLabel="title"
                            template={{
                              range: "Classes",
                              title: "New stage",
                              description: "Add details for this stage.",
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            addLabel="Add academic level"
                          />
                        )}
                        {Array.isArray(page.notices) && (
                          <CmsArrayEditor
                            title="Notice board items"
                            description="Manage notice-page announcements and publication status."
                            path={["pages", slug, "notices"]}
                            items={page.notices}
                            fields={noticeFields}
                            itemLabel="title"
                            template={{
                              id: "notice-new",
                              category: "General",
                              title: "New notice",
                              date: "",
                              description: "",
                              imageUrl: "",
                              imageAlt: "",
                              attachmentUrl: "",
                              attachmentName: "",
                              attachmentType: "",
                              active: false,
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            onUploadAttachment={(fileToUpload, path) => uploadAttachment(fileToUpload, path)}
                            addLabel="Add notice"
                          />
                        )}
                        {Array.isArray(page.documents) && (
                          <CmsArrayEditor
                            title="Disclosure documents"
                            description="Add official approved documents and their public URLs. Do not upload confidential student records."
                            path={["pages", slug, "documents"]}
                            items={page.documents}
                            fields={documentFields}
                            itemLabel="title"
                            template={{
                              title: "New document",
                              description: "Describe the approved document.",
                              url: "",
                              updatedAt: "",
                            }}
                            media={media}
                            update={updateDraftField}
                            onAdd={addArrayItem}
                            onRemove={removeArrayItem}
                            onMove={moveArrayItem}
                            onUpload={(imageFile, imagePath) =>
                              uploadImage(imageFile, imagePath)
                            }
                            addLabel="Add document"
                          />
                        )}
                      </div>
                    );
                  })}
                </section>

                <CmsArrayEditor
                  title="Main navigation"
                  description="Manage the top navigation links. Keep paths aligned with real public routes."
                  path={["navigation"]}
                  items={parsed.navigation}
                  fields={navFields}
                  itemLabel="label"
                  template={{ label: "New page", href: "/about" }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  minItems={1}
                  addLabel="Add navigation link"
                />
                <CmsArrayEditor
                  title="Footer quick links"
                  path={["footer", "quickLinks"]}
                  items={parsed.footer.quickLinks}
                  fields={navFields}
                  itemLabel="label"
                  template={{ label: "New link", href: "/about" }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add footer link"
                />
                <CmsArrayEditor
                  title="Footer information links"
                  path={["footer", "informationLinks"]}
                  items={parsed.footer.informationLinks}
                  fields={navFields}
                  itemLabel="label"
                  template={{
                    label: "New information link",
                    href: "/disclosure",
                  }}
                  media={media}
                  update={updateDraftField}
                  onAdd={addArrayItem}
                  onRemove={removeArrayItem}
                  onMove={moveArrayItem}
                  onUpload={(imageFile, imagePath) =>
                    uploadImage(imageFile, imagePath)
                  }
                  addLabel="Add information link"
                />

                <section className="cms-form-section">
                  <div className="cms-section-title">
                    <h3>Footer & search preview</h3>
                    <p>
                      Keep the footer and search/social-sharing metadata
                      current.
                    </p>
                  </div>
                  <div className="cms-field-grid">
                    <CmsField
                      label="Footer description"
                      value={parsed.footer.description}
                      path={["footer", "description"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsField
                      label="Footer quick-links heading"
                      value={parsed.footer.quickLinksTitle}
                      path={["footer", "quickLinksTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Footer information heading"
                      value={parsed.footer.informationLinksTitle}
                      path={["footer", "informationLinksTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="Footer contact heading"
                      value={parsed.footer.contactTitle}
                      path={["footer", "contactTitle"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="SEO title"
                      value={parsed.seo.title}
                      path={["seo", "title"]}
                      update={updateDraftField}
                    />
                    <CmsField
                      label="SEO description"
                      value={parsed.seo.description}
                      path={["seo", "description"]}
                      update={updateDraftField}
                      multiline
                    />
                    <CmsImageField
                      label="Social preview image"
                      value={parsed.seo.socialImage}
                      path={["seo", "socialImage"]}
                      update={updateDraftField}
                      media={media}
                      onUpload={(imageFile, imagePath) =>
                        uploadImage(imageFile, imagePath)
                      }
                    />
                    <div className="form-field">
                      <label htmlFor="cms-seo-keywords">
                        SEO keywords (one per line)
                      </label>
                      <textarea
                        id="cms-seo-keywords"
                        rows={4}
                        value={
                          Array.isArray(parsed.seo.keywords)
                            ? parsed.seo.keywords.join("\n")
                            : ""
                        }
                        onChange={(event) =>
                          updateDraftField(
                            ["seo", "keywords"],
                            event.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="admin-notice error">
                Current content JSON is invalid. Open Advanced JSON mode and fix
                the syntax before saving.
              </div>
            )}
            <div className="cms-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide advanced JSON" : "Advanced JSON mode"}
              </button>
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  const blob = new Blob([draft], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "gurukul-site-content.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Icon name="download" size={15} /> Download backup
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={saveContent}
                disabled={saving || !parsed}
              >
                {saving ? "Saving…" : "Save website content"}{" "}
                <Icon name="check-circle" size={16} />
              </button>
            </div>
            {showAdvanced && (
              <textarea
                className="json-editor"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
                aria-label="Edit website content JSON"
              />
            )}
            <p className="form-note">
              {hasUnsavedChanges
                ? "You have unsaved edits. Save your changes before leaving this page; the browser will warn before an accidental tab close."
                : "All current edits are saved. Review the public result using View website."}{" "}
              Image uploads are stored in Cloudinary immediately, but
              assignments only publish when you save website content.
            </p>
          </section>
        )}
        {tab === "media" && (
          <section className="admin-panel-content">
            <div className="cms-intro">
              <div>
                <h2>Media library</h2>
                <p>
                  Upload JPG, PNG, WebP or AVIF artwork (maximum 8 MB). Files
                  are stored in Cloudinary and optimized on delivery.
                </p>
              </div>
            </div>
            <div className="upload-card">
              <div className="form-field">
                <label htmlFor="media-upload">Choose image</label>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                {file && (
                  <p className="form-note">
                    {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void uploadImage()}
                disabled={!file || uploading}
              >
                {uploading ? "Uploading…" : "Upload to Cloudinary"}{" "}
                <Icon name="upload" size={16} />
              </button>
            </div>
            <div className="media-grid">
              {media.map((item, i) => (
                <article
                  className="media-item"
                  key={item._id || item.publicId || item.url}
                >
                  <div className="media-preview">
                    <Image
                      src={item.url}
                      alt={item.originalName || `Uploaded image ${i + 1}`}
                      fill
                      sizes="(max-width: 700px) 50vw, 250px"
                    />
                  </div>
                  <div className="media-item-body">
                    <strong>
                      {item.originalName || item.publicId || "Uploaded image"}
                    </strong>
                    <small>
                      {item.width && item.height
                        ? `${item.width} × ${item.height} · `
                        : ""}
                      {item.format?.toUpperCase() || "IMAGE"}
                    </small>
                    <button
                      type="button"
                      className="text-button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.url);
                          setNotice({
                            kind: "success",
                            text: "Secure image URL copied. Paste it into the matching image field in Website content.",
                          });
                        } catch {
                          setNotice({ kind: "info", text: item.url });
                        }
                      }}
                    >
                      {"Copy image URL "}
                      <Icon name="copy" size={14} />
                    </button>
                    <button
                      type="button"
                      className="media-delete-button"
                      onClick={async () => {
                        if (
                          !item._id ||
                          !window.confirm(
                            "Delete this image from Cloudinary? Images still used on a website page cannot be deleted.",
                          )
                        )
                          return;
                        try {
                          const response = await fetch("/api/admin/media", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item._id }),
                          });
                          const data = (await response.json()) as {
                            error?: string;
                          };
                          if (!response.ok)
                            throw new Error(
                              data.error || "Could not delete media.",
                            );
                          setMedia((current) =>
                            current.filter((entry) => entry._id !== item._id),
                          );
                          setNotice({
                            kind: "success",
                            text: "Image deleted from the media library.",
                          });
                        } catch (error) {
                          setNotice({
                            kind: "error",
                            text:
                              error instanceof Error
                                ? error.message
                                : "Could not delete media.",
                          });
                        }
                      }}
                    >
                      <Icon name="trash" size={14} /> Delete image
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!media.length && (
              <div className="empty-state">
                <Icon name="images" size={29} />
                <p>
                  No uploaded images are shown yet. Configure Cloudinary, then
                  upload an image to begin your media library.
                </p>
              </div>
            )}
          </section>
        )}
        {tab === "reels" && (
          <section className="admin-panel-content">
            <div className="cms-intro">
              <div>
                <h2>Instagram Reel cover designer</h2>
                <p>
                  Create a branded 9:16 vertical PNG. Customize the cover text
                  and background visual, then download the artwork for
                  Instagram. Review exact spelling before publishing.
                </p>
              </div>
            </div>
            <div className="reel-designer">
              <div className="reel-controls">
                <div className="form-field">
                  <label htmlFor="reel-title">Main headline</label>
                  <textarea
                    id="reel-title"
                    value={reelTitle}
                    onChange={(event) =>
                      setReelTitle(event.target.value.slice(0, 100))
                    }
                    rows={3}
                    maxLength={100}
                  />
                  <small>{reelTitle.length}/100 characters</small>
                </div>
                <div className="form-field">
                  <label htmlFor="reel-subtitle">Subtitle / callout</label>
                  <input
                    id="reel-subtitle"
                    value={reelSubtitle}
                    onChange={(event) =>
                      setReelSubtitle(event.target.value.slice(0, 42))
                    }
                    maxLength={42}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="reel-image">Background visual</label>
                  <select
                    id="reel-image"
                    value={reelImageUrl}
                    onChange={(event) => setReelImageUrl(event.target.value)}
                  >
                    <option value="/images/campus-illustration.webp">
                      Campus illustration
                    </option>
                    <option value="/images/learning-together.webp">
                      Learning together
                    </option>
                    <option value="/images/science-activity.webp">
                      Science activity
                    </option>
                    <option value="/images/sports-activity.webp">
                      Sports activity
                    </option>
                    <option value="/images/library-reading.webp">
                      Library reading
                    </option>
                    <option value="/images/classroom-teaching.webp">
                      Classroom teaching
                    </option>
                    <option value="/images/creative-arts.webp">
                      Creative arts
                    </option>
                    <option value="/images/school-assembly.webp">
                      School assembly
                    </option>
                    {media.map((item) => (
                      <option key={item.publicId || item.url} value={item.url}>
                        {item.originalName || item.publicId || "Uploaded image"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    const canvas = reelCanvas.current;
                    if (!canvas) return;
                    try {
                      const link = document.createElement("a");
                      link.download =
                        "gurukul-academy-instagram-reel-cover.png";
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                      setNotice({
                        kind: "success",
                        text: "Reel cover exported as a 1080 × 1920 PNG.",
                      });
                    } catch {
                      setNotice({
                        kind: "error",
                        text: "The selected image does not permit PNG export. Choose a local visual or upload the image to your configured Cloudinary account.",
                      });
                    }
                  }}
                >
                  Download 9:16 PNG <Icon name="download" size={16} />
                </button>
                <p className="form-note">
                  Export size: 1080 × 1920 pixels. Generated artwork is a design
                  aid; review school details and ensure images are approved
                  before publishing.
                </p>
              </div>
              <div className="reel-preview-wrap">
                <span className="card-eyebrow">LIVE PREVIEW · 9:16</span>
                <canvas
                  ref={reelCanvas}
                  width={1080}
                  height={1920}
                  className="reel-canvas"
                  aria-label="Instagram Reel cover preview"
                />
                <small>Text and preview redraw as you edit.</small>
              </div>
            </div>
          </section>
        )}
        {tab === "inquiries" && (
          <section className="admin-panel-content">
            <div className="cms-intro">
              <div>
                <h2>Enquiry inbox</h2>
                <p>
                  Latest 100 admission and contact submissions. Mark each
                  enquiry as new, in progress or resolved.
                </p>
              </div>
              <button
                type="button"
                className="button button-outline"
                onClick={() => void loadInquiries(true)}
                disabled={loadingInquiries}
              >
                {loadingInquiries ? "Refreshing…" : "Refresh"}{" "}
                <Icon name="refresh-cw" size={15} />
              </button>
            </div>
            {loadingInquiries && !inquiries.length ? (
              <div className="empty-state">Loading enquiries…</div>
            ) : inquiries.length ? (
              <div className="inquiry-list">
                {inquiries.map((item) => (
                  <article className="inquiry-item" key={item._id}>
                    <div className="inquiry-item-top">
                      <div>
                        <span className="card-eyebrow">
                          {item.formType === "admission"
                            ? "ADMISSION ENQUIRY"
                            : "CONTACT ENQUIRY"}{" "}
                          · {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <h3>{item.name}</h3>
                      </div>
                      <select
                        aria-label={`Status for ${item.name}`}
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item._id, event.target.value)
                        }
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <p>
                      <b>Google Sheets:</b>{" "}
                      {item.googleSheetsSyncStatus === "synced"
                        ? "Synced"
                        : item.googleSheetsSyncStatus === "pending"
                          ? "Pending"
                          : "Not synced"}
                      {item.googleSheetsSyncStatus !== "synced" && (
                        <>
                          {" "}
                          <button
                            type="button"
                            className="button button-outline"
                            onClick={() => void syncInquiryToGoogleSheets(item._id)}
                            disabled={syncingInquiryId === item._id}
                          >
                            {syncingInquiryId === item._id
                              ? "Syncing…"
                              : "Retry spreadsheet sync"}
                          </button>
                        </>
                      )}
                    </p>
                    {item.studentName && (
                      <p>
                        <b>Student:</b> {item.studentName} · <b>Parent:</b>{" "}
                        {item.parentName || "Not provided"}
                      </p>
                    )}
                    {item.classApplyingFor && (
                      <p>
                        <b>Class:</b> {item.classApplyingFor}
                      </p>
                    )}
                    <p>
                      <b>Phone:</b>{" "}
                      <a href={`tel:${item.phone}`}>{item.phone}</a>
                      {item.email && (
                        <>
                          {" "}
                          · <b>Email:</b>{" "}
                          <a href={`mailto:${item.email}`}>{item.email}</a>
                        </>
                      )}
                    </p>
                    {item.subject && (
                      <p>
                        <b>Subject:</b> {item.subject}
                      </p>
                    )}
                    <p className="inquiry-message">{item.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="mail" size={29} />
                <p>
                  No enquiries found. Form submissions will appear here when
                  MongoDB is configured.
                </p>
              </div>
            )}
          </section>
        )}
        {tab === "history" && (
          <section className="admin-panel-content">
            <div className="cms-intro">
              <div>
                <h2>Content history</h2>
                <p>
                  The last 25 previously saved versions are retained in MongoDB.
                  Loading a revision puts it into the Website content editor as
                  an unsaved draft; it never publishes automatically.
                </p>
              </div>
              <button
                type="button"
                className="button button-outline"
                onClick={() => void loadHistory(true)}
                disabled={loadingHistory}
              >
                {loadingHistory ? "Refreshing…" : "Refresh history"}{" "}
                <Icon name="refresh-cw" size={15} />
              </button>
            </div>
            {loadingHistory && !revisions.length ? (
              <div className="empty-state">Loading content history…</div>
            ) : revisions.length ? (
              <div className="revision-list">
                {revisions.map((revision) => (
                  <article className="revision-card" key={revision._id}>
                    <div className="revision-icon">
                      <Icon name="clock" size={20} />
                    </div>
                    <div className="revision-copy">
                      <span className="card-eyebrow">
                        REVISION {revision.version}
                      </span>
                      <h3>
                        {revision.sourceUpdatedAt
                          ? new Date(revision.sourceUpdatedAt).toLocaleString()
                          : new Date(revision.archivedAt).toLocaleString()}
                      </h3>
                      <p>
                        Archived{" "}
                        {revision.archivedAt
                          ? new Date(revision.archivedAt).toLocaleString()
                          : "at save time"}{" "}
                        · {revision.archivedBy || "Administrator"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button button-outline button-small"
                      onClick={() => void reviewRevision(revision._id)}
                    >
                      <Icon name="file-text" size={14} /> Review as draft
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="clock" size={29} />
                <p>
                  No previous content revisions yet. The first revision will
                  appear after you change and save the website content.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
