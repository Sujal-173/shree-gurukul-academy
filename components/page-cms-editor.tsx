"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/types";
import { getGalleryCategory } from "@/lib/gallery-category";
import type { CmsPageDefinition } from "@/lib/cms-page-map";
import { Icon } from "@/components/icon";
import { CmsImageField } from "@/components/cms-image-field";
import {
  CmsArrayEditor,
  type CmsArrayFieldDefinition,
} from "@/components/cms-array-editor";
import { CmsPageSwitcher } from "@/components/cms-page-switcher";
import { CalendarContentManager } from "@/components/calendar-content-manager";
import { CalendarResourceManager } from "@/components/calendar-resource-manager";
import { isRealCalendarDate } from "@/lib/calendar";

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
type Notice = { kind: "success" | "error" | "info"; text: string };
type ArrayConfig = {
  key: string;
  title: string;
  description: string;
  fields: CmsArrayFieldDefinition[];
  itemLabel?: string;
  template: Record<string, unknown>;
  minItems?: number;
  addLabel?: string;
};

const fieldPresets: Record<string, ArrayConfig> = {
  hero: {
    key: "hero",
    title: "Hero slides",
    description:
      "Edit slides shown at the top of the homepage. Each slide supports its own image, alt text and call-to-action links.",
    fields: [
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
    ],
    itemLabel: "title",
    template: {
      eyebrow: "SHRI GURUKUL ACADEMY · NEW LEPA",
      title: "A strong foundation",
      highlight: "for a brighter future.",
      subtitle: "Add a verified message for families.",
      image: "/images/campus-illustration.webp",
      alt: "Illustrative academy campus image",
      primaryLabel: "Enquire for Admission",
      primaryHref: "/admission#enquiry",
      secondaryLabel: "Discover Our Academy",
      secondaryHref: "/about",
    },
    minItems: 1,
    addLabel: "Add hero slide",
  },
  quickLinks: {
    key: "quickLinks",
    title: "Quick links",
    description: "Manage shortcut cards and their destinations.",
    fields: [
      { key: "label", label: "Label" },
      { key: "description", label: "Description", multiline: true },
      { key: "href", label: "Destination route" },
      { key: "icon", label: "Icon name" },
    ],
    itemLabel: "label",
    template: {
      label: "New quick link",
      description: "Short description",
      href: "/about",
      icon: "book-open",
    },
    addLabel: "Add quick link",
  },
  highlights: {
    key: "highlights",
    title: "Highlights",
    description:
      "Manage homepage highlights, school-life cards or featured content.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
      { key: "image", label: "Image", kind: "image" },
      { key: "alt", label: "Image alt text", multiline: true },
      { key: "tag", label: "Tag" },
      { key: "href", label: "Destination route" },
      {
        key: "items",
        label: "Bullet points (one per line)",
        kind: "string-array",
      },
    ],
    itemLabel: "title",
    template: {
      eyebrow: "",
      title: "New highlight",
      description: "Add approved content.",
      image: "/images/learning-together.webp",
      alt: "Illustrative learning image",
      tag: "",
      href: "",
      items: [],
    },
    addLabel: "Add highlight",
  },
  values: {
    key: "values",
    title: "Values",
    description: "Manage value cards and their descriptions.",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
      { key: "image", label: "Image", kind: "image" },
      { key: "alt", label: "Image alt text", multiline: true },
      { key: "tag", label: "Tag" },
    ],
    itemLabel: "title",
    template: {
      title: "New value",
      description: "Describe this value.",
      image: "",
      alt: "",
      tag: "",
    },
    addLabel: "Add value",
  },
  stats: {
    key: "stats",
    title: "Homepage statistics",
    description:
      "Only publish figures that the school has verified. Qualitative statements can be used instead of unverified numbers.",
    fields: [
      { key: "value", label: "Display value" },
      { key: "label", label: "Caption" },
    ],
    itemLabel: "label",
    template: { value: "", label: "New statistic" },
    addLabel: "Add statistic",
  },
  leaders: {
    key: "leaders",
    title: "Leadership profiles",
    description:
      "Add approved profiles for the homepage and About page. Complete the role, name and portrait, then enable Published to display a profile publicly.",
    fields: [
      { key: "role", label: "Profile title" },
      { key: "name", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "quote", label: "Highlighted quote (optional)", multiline: true },
      { key: "message", label: "Message", multiline: true },
      { key: "portrait", label: "Portrait image", kind: "image" },
      { key: "alt", label: "Portrait alt text", multiline: true },
      { key: "active", label: "Published on public site", kind: "toggle" },
    ],
    itemLabel: "role",
    template: {
      role: "School leader",
      name: "",
      designation: "",
      quote: "",
      message: "",
      portrait: "",
      alt: "Portrait of school leader",
      active: false,
    },
    addLabel: "Add profile",
  },
  notices: {
    key: "notices",
    title: "Homepage announcements",
    description:
      "Manage the notices shown in the homepage Important Announcements section. Add, edit, reorder, or unpublish each notice here; published changes appear on the public site after saving.",
    fields: [
      { key: "category", label: "Category" },
      { key: "title", label: "Notice title" },
      { key: "date", label: "Date (optional, e.g. 15 Jul or 2026-07-15)" },
      { key: "description", label: "Description", multiline: true },
      { key: "imageUrl", label: "Notice image / poster", kind: "image" },
      { key: "imageAlt", label: "Image description (alt text)" },
      { key: "attachmentUrl", label: "Circular / PDF attachment", kind: "attachment" },
      { key: "active", label: "Published", kind: "toggle" },
    ],
    itemLabel: "title",
    template: {
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
    },
    addLabel: "Add homepage announcement",
  },
  sections: {
    key: "sections",
    title: "Page sections",
    description: "Manage section cards and image/content blocks on this page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
      { key: "image", label: "Image", kind: "image" },
      { key: "alt", label: "Image alt text", multiline: true },
      { key: "tag", label: "Tag / category" },
      { key: "href", label: "Link / route" },
      {
        key: "items",
        label: "Bullet points (one per line)",
        kind: "string-array",
      },
    ],
    itemLabel: "title",
    template: {
      eyebrow: "",
      title: "New section",
      description: "Add approved content.",
      image: "",
      alt: "",
      tag: "",
      href: "",
      items: [],
    },
    addLabel: "Add section",
  },
  faqs: {
    key: "faqs",
    title: "Frequently asked questions",
    description:
      "Edit the question and answer pairs displayed on the admissions page.",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", multiline: true },
    ],
    itemLabel: "question",
    template: { question: "New question", answer: "Add the verified answer." },
    addLabel: "Add FAQ",
  },
  steps: {
    key: "steps",
    title: "Admission process steps",
    description: "Describe the admission journey in order.",
    fields: [
      { key: "number", label: "Step number" },
      { key: "title", label: "Step title" },
      { key: "description", label: "Description", multiline: true },
    ],
    itemLabel: "title",
    template: {
      number: "05",
      title: "New step",
      description: "Explain what the family should do.",
    },
    addLabel: "Add step",
  },
  levels: {
    key: "levels",
    title: "Academic levels",
    description: "Manage the class ranges and explanatory copy.",
    fields: [
      { key: "range", label: "Class range" },
      { key: "title", label: "Stage title" },
      { key: "description", label: "Description", multiline: true },
    ],
    itemLabel: "title",
    template: {
      range: "Classes 1–10",
      title: "New stage",
      description: "Add verified academic information.",
    },
    addLabel: "Add academic level",
  },
  documents: {
    key: "documents",
    title: "Disclosure documents",
    description: "Add only current, school-approved documents and public URLs.",
    fields: [
      { key: "title", label: "Document title" },
      { key: "description", label: "Description", multiline: true },
      { key: "url", label: "Document URL" },
      { key: "updatedAt", label: "Last updated" },
    ],
    itemLabel: "title",
    template: {
      title: "New document",
      description: "Describe the approved document.",
      url: "",
      updatedAt: "",
    },
    addLabel: "Add document",
  },
  navigation: {
    key: "navigation",
    title: "Navigation menu",
    description: "Arrange the public menu links.",
    fields: [
      { key: "label", label: "Menu label" },
      { key: "href", label: "Route / URL" },
    ],
    itemLabel: "label",
    template: { label: "New menu item", href: "/" },
    addLabel: "Add menu item",
  },
  quickFooterLinks: {
    key: "quickLinks",
    title: "Footer quick links",
    description: "Manage the quick links shown in the site footer.",
    fields: [
      { key: "label", label: "Label" },
      { key: "href", label: "Route / URL" },
    ],
    itemLabel: "label",
    template: { label: "New footer link", href: "/" },
    addLabel: "Add footer link",
  },
  infoFooterLinks: {
    key: "informationLinks",
    title: "Footer information links",
    description: "Manage policy, contact and information links in the footer.",
    fields: [
      { key: "label", label: "Label" },
      { key: "href", label: "Route / URL" },
    ],
    itemLabel: "label",
    template: { label: "New information link", href: "/" },
    addLabel: "Add information link",
  },
};

function setAtPath<T>(source: T, path: string[], value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(source)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= source.length)
      return source;
    const copy = [...source];
    copy[index] = setAtPath(copy[index], rest, value);
    return copy as T;
  }
  const object =
    source && typeof source === "object"
      ? (source as Record<string, unknown>)
      : {};
  return { ...object, [head]: setAtPath(object[head], rest, value) } as T;
}
function labelFor(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (match) => match.toUpperCase());
}
function isImageKey(key: string) {
  return (
    /(image|portrait|logo|thumbnail|cover|photo)(url)?$/i.test(key) &&
    !/(alt|caption|description)$/i.test(key)
  );
}
function isLongText(key: string) {
  return (
    /(subtitle|description|body|message|disclaimer|note|points|intro|emptyText|implementationNote|quote|statement|address|tagline)/i.test(
      key,
    ) || key === "answer"
  );
}

type TextFieldProps = {
  label: string;
  value: unknown;
  path: string[];
  update: (path: string[], value: unknown) => void;
  multiline?: boolean;
  type?: string;
};
function TextField({
  label,
  value,
  path,
  update,
  multiline = false,
  type = "text",
}: TextFieldProps) {
  const id = `cms-field-${path.join("-").replace(/[^a-z0-9-]/gi, "")}`;
  const text =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={text}
          onChange={(event) => update(path, event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={text}
          onChange={(event) =>
            update(
              path,
              type === "number"
                ? Number(event.target.value)
                : event.target.value,
            )
          }
        />
      )}
    </div>
  );
}
function StringListField({
  label,
  value,
  path,
  update,
}: {
  label: string;
  value: unknown;
  path: string[];
  update: (path: string[], value: unknown) => void;
}) {
  const id = `cms-list-${path.join("-").replace(/[^a-z0-9-]/gi, "")}`;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={4}
        value={Array.isArray(value) ? value.map(String).join("\n") : ""}
        onChange={(event) =>
          update(
            path,
            event.target.value
              .split("\n")
              .map((part) => part.trim())
              .filter(Boolean),
          )
        }
      />
      <small className="form-note">Enter one value per line.</small>
    </div>
  );
}
function getArrayConfig(
  key: string,
  object: Record<string, unknown>,
): ArrayConfig | null {
  const preset = fieldPresets[key];
  if (preset) return preset;
  const rows = Array.isArray(object[key]) ? (object[key] as unknown[]) : [];
  const first = rows.find(
    (item) => item && typeof item === "object" && !Array.isArray(item),
  ) as Record<string, unknown> | undefined;
  if (!first) return null;
  const fields: CmsArrayFieldDefinition[] = Object.entries(first).map(
    ([fieldKey, fieldValue]) => ({
      key: fieldKey,
      label: labelFor(fieldKey),
      kind: isImageKey(fieldKey)
        ? "image"
        : typeof fieldValue === "boolean"
          ? "toggle"
          : Array.isArray(fieldValue)
            ? "string-array"
            : undefined,
      multiline: typeof fieldValue === "string" && isLongText(fieldKey),
    }),
  );
  const itemLabel = ["title", "label", "name", "question", "role"].find(
    (candidate) => candidate in first,
  );
  return {
    key,
    title: labelFor(key),
    description: `Manage the ${labelFor(key).toLowerCase()} items displayed on this page.`,
    fields,
    itemLabel,
    template: structuredClone(first),
    addLabel: `Add ${labelFor(key).toLowerCase()} item`,
  };
}

export function PageCmsEditor({
  initialContent,
  adminEmail,
  page,
}: {
  initialContent: SiteContent;
  adminEmail: string;
  page: CmsPageDefinition;
}) {
  const [content, setContent] = useState<SiteContent>(() =>
    structuredClone(initialContent),
  );
  const [savedContent, setSavedContent] = useState(JSON.stringify(initialContent));
  const hasChanges = JSON.stringify(content) !== savedContent;
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advancedJson, setAdvancedJson] = useState("");

  const loadMedia = useCallback(async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await response.json()) as {
        media?: MediaItem[];
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error || "Could not load media library.");
      setMedia(data.media || []);
    } catch (error) {
      setNotice({
        kind: "info",
        text:
          error instanceof Error
            ? `${error.message} You can still edit text, but uploading/selecting stored media requires database and Cloudinary configuration.`
            : "Media library unavailable.",
      });
    } finally {
      setLoadingMedia(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadMedia();
    });
    return () => {
      active = false;
    };
  }, [loadMedia]);
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const update = useCallback(
    (path: string[], value: unknown) =>
      setContent((current) => setAtPath(current, path, value)),
    [],
  );
  const updateArray = useCallback(
    (path: string[], mutator: (items: unknown[]) => unknown[]) => {
      setContent((current) => {
        const existing = path.reduce<unknown>(
          (node, key) =>
            Array.isArray(node)
              ? node[Number(key)]
              : node && typeof node === "object"
                ? (node as Record<string, unknown>)[key]
                : undefined,
          current,
        );
        return setAtPath(
          current,
          path,
          mutator(Array.isArray(existing) ? existing : []),
        );
      });
    },
    [],
  );
  const add = useCallback(
    (path: string[], item: unknown) =>
      updateArray(path, (items) => [...items, structuredClone(item)]),
    [updateArray],
  );
  const remove = useCallback(
    (path: string[], index: number) =>
      updateArray(path, (items) =>
        items.filter((_, currentIndex) => index !== currentIndex),
      ),
    [updateArray],
  );
  const move = useCallback(
    (path: string[], index: number, delta: number) =>
      updateArray(path, (items) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return items;
        const copy = [...items];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        return copy;
      }),
    [updateArray],
  );

  async function uploadImage(file: File, path: string[]) {
    const form = new FormData();
    form.append("file", file);
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
      update(path, data.media.url);
      setNotice({
        kind: "success",
        text: "Image uploaded and attached to this field. Save changes to publish the image assignment.",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Image upload failed.",
      });
    }
  }

  async function uploadAttachment(file: File, path: string[]) {
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", "attachment");
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await response.json()) as { media?: MediaItem & { mimeType?: string }; error?: string };
      if (!response.ok || !data.media) throw new Error(data.error || "Attachment upload failed.");
      update(path, data.media.url);
      const base = path.slice(0, -1);
      const isDocumentField = path[path.length - 1] === "documentUrl";
      update([...base, isDocumentField ? "documentName" : "attachmentName"], data.media.originalName || file.name);
      update([...base, isDocumentField ? "documentType" : "attachmentType"], data.media.mimeType || file.type);
      setNotice({ kind: "success", text: "File uploaded and linked. Save this page to publish the attachment." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Attachment upload failed." });
    }
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      if (page.slug === "calendar") {
        const records = (content.pages.calendar.calendarEntries || []) as Array<{
          active?: boolean; title?: string; date?: string; endDate?: string; description?: string;
        }>;
        const invalidPublished = records.find((record) => record.active && (
          !record.title?.trim() ||
          !isRealCalendarDate(record.date) ||
          !record.description?.trim() ||
          Boolean(record.endDate && record.date && record.endDate < record.date)
        ));
        if (invalidPublished) {
          throw new Error(`Cannot publish “${invalidPublished.title || "Untitled record"}”. Published calendar records need a title, valid start date, details, and an end date no earlier than the start date.`);
        }
        const resources = (content.pages.calendar.calendarResources || []) as Array<{ active?: boolean; title?: string; description?: string; documentUrl?: string; kind?: string; className?: string }>;
        const invalidResource = resources.find((resource) => resource.active && (!resource.title?.trim() || !resource.description?.trim() || !resource.documentUrl?.trim() || !["school-calendar", "exam-timetable"].includes(resource.kind || "") || (resource.kind === "exam-timetable" && !resource.className?.trim())));
        if (invalidResource) throw new Error(`Cannot publish “${invalidResource.title || "Untitled document"}”. Published resources need a title, details, an attachment, and a class/grade for exam timetables.`);
      }
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, scope: page.slug }),
      });
      const result = (await response.json()) as {
        error?: string;
        savedAt?: string;
        version?: number;
      };
      if (!response.ok)
        throw new Error(result.error || "Could not save this page.");
      setSavedContent(JSON.stringify(content));
      setNotice({
        kind: "success",
        text: `Saved successfully${result.version ? ` · content version ${result.version}` : ""}. The public page now uses the saved CMS content.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Save failed. Check database configuration and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  const editorData = useMemo(
    () =>
      page.slug === "site-settings"
        ? null
        : page.key === "home"
          ? (content.home as unknown as Record<string, unknown>)
          : (content.pages[page.key] as Record<string, unknown>),
    [content, page],
  );
  const scalarFields = (
    object: Record<string, unknown>,
    path: string[],
    omit: string[] = [],
  ) =>
    Object.entries(object)
      .filter(
        ([key, value]) =>
          !omit.includes(key) &&
          (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            (Array.isArray(value) &&
              value.every((item) => typeof item === "string"))),
      )
      .map(([key, value]) => {
        const fieldPath = [...path, key];
        if (isImageKey(key))
          return (
            <CmsImageField
              key={key}
              label={labelFor(key)}
              value={value}
              path={fieldPath}
              update={update}
              media={media}
              onUpload={uploadImage}
            />
          );
        if (Array.isArray(value))
          return (
            <StringListField
              key={key}
              label={labelFor(key)}
              value={value}
              path={fieldPath}
              update={update}
            />
          );
        if (typeof value === "boolean")
          return (
            <div className="form-field" key={key}>
              <label htmlFor={`cms-${fieldPath.join("-")}`}>
                {labelFor(key)}
              </label>
              <label className="cms-active-toggle">
                <input
                  id={`cms-${fieldPath.join("-")}`}
                  type="checkbox"
                  checked={value}
                  onChange={(event) => update(fieldPath, event.target.checked)}
                />
                <span>{value ? "Enabled" : "Disabled"}</span>
              </label>
            </div>
          );
        return (
          <TextField
            key={key}
            label={labelFor(key)}
            value={value}
            path={fieldPath}
            update={update}
            multiline={typeof value === "string" && isLongText(key)}
            type={typeof value === "number" ? "number" : "text"}
          />
        );
      });
  const renderArray = (
    key: string,
    object: Record<string, unknown>,
    path: string[],
  ) => {
    const baseConfig = getArrayConfig(key, object);
    const config =
      page.slug === "gallery" && key === "sections" && baseConfig
        ? {
            ...baseConfig,
            title: "Gallery photos",
            description:
              "Add approved school photos, write an accurate caption and alt text, assign a category used by the public gallery filters, and reorder photos for display.",
            addLabel: "Add gallery photo",
          }
        : baseConfig;
    if (!config)
      return (
        <section className="cms-form-section" key={key}>
          <h3>{labelFor(key)}</h3>
          <p>
            This list is empty and has no schema to infer. Add a first item
            using advanced data, then return to the visual editor.
          </p>
        </section>
      );
    return (
      <CmsArrayEditor
        key={`${path.join("-")}-${key}`}
        title={config.title}
        description={config.description}
        path={[...path, key]}
        items={object[key]}
        fields={config.fields}
        itemLabel={config.itemLabel}
        template={config.template}
        media={media}
        update={update}
        onAdd={add}
        onRemove={remove}
        onMove={move}
        onUpload={uploadImage}
        onUploadAttachment={uploadAttachment}
        minItems={config.minItems}
        addLabel={config.addLabel}
      />
    );
  };

  function loadAdvancedJson() {
    try {
      const candidate = JSON.parse(advancedJson) as SiteContent;
      if (
        !candidate ||
        !candidate.brand ||
        !candidate.home ||
        !candidate.pages ||
        !candidate.seo
      )
        throw new Error(
          "JSON must contain brand, home, pages and seo objects.",
        );
      setContent(candidate);
      setNotice({
        kind: "info",
        text: "JSON loaded as an unsaved draft. Review and save it to publish.",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Invalid JSON.",
      });
    }
  }

  let mainContent: ReactNode;
  if (page.slug === "site-settings") {
    mainContent = (
      <div className="cms-visual-editor">
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Academy identity and contact details</h3>
            <p>
              Used throughout the header, footer, contact page and admissions
              actions.
            </p>
          </div>
          <div className="cms-field-grid">
            {scalarFields(content.brand as unknown as Record<string, unknown>, [
              "brand",
            ])}
          </div>
        </section>
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Public navigation</h3>
            <p>Reorder menu links and edit labels or route paths.</p>
          </div>
          {renderArray("navigation", { navigation: content.navigation }, [])}
        </section>
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Footer content</h3>
            <p>Manage footer introduction, section headings and links.</p>
          </div>
          <div className="cms-field-grid">
            {scalarFields(
              content.footer as unknown as Record<string, unknown>,
              ["footer"],
              ["quickLinks", "informationLinks"],
            )}
          </div>
          <CmsArrayEditor
            title="Quick links"
            path={["footer", "quickLinks"]}
            items={content.footer.quickLinks}
            fields={fieldPresets.quickFooterLinks.fields}
            itemLabel="label"
            template={fieldPresets.quickFooterLinks.template}
            media={media}
            update={update}
            onAdd={add}
            onRemove={remove}
            onMove={move}
            onUpload={uploadImage}
            addLabel="Add quick link"
          />
          <CmsArrayEditor
            title="Information links"
            path={["footer", "informationLinks"]}
            items={content.footer.informationLinks}
            fields={fieldPresets.infoFooterLinks.fields}
            itemLabel="label"
            template={fieldPresets.infoFooterLinks.template}
            media={media}
            update={update}
            onAdd={add}
            onRemove={remove}
            onMove={move}
            onUpload={uploadImage}
            addLabel="Add information link"
          />
        </section>
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Search and social sharing</h3>
            <p>
              Manage titles, search descriptions, keywords and social preview
              artwork.
            </p>
          </div>
          <div className="cms-field-grid">
            {scalarFields(content.seo as unknown as Record<string, unknown>, [
              "seo",
            ])}
          </div>
        </section>
      </div>
    );
  } else if (page.slug === "home") {
    const home = content.home as unknown as Record<string, unknown>;
    const knownArrayKeys = [
      "hero",
      "quickLinks",
      "highlights",
      "values",
      "stats",
      "leaders",
      "notices",
    ];
    const arrays = Object.keys(home).filter(
      (key) =>
        Array.isArray(home[key]) &&
        (knownArrayKeys.includes(key) ||
          (home[key] as unknown[]).some(
            (item) => item && typeof item === "object",
          )),
    );
    const scalarOmit = arrays;
    mainContent = (
      <div className="cms-visual-editor">
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Homepage text and imagery</h3>
            <p>
              Edit all scalar content fields, images, headings, descriptions and
              call-to-action links.
            </p>
          </div>
          <div className="cms-field-grid">
            {scalarFields(home, ["home"], scalarOmit)}
          </div>
        </section>
        {arrays.map((key, index) => (
          <details className="cms-array-details" key={key} open={index === 0}>
            <summary><span>{labelFor(key)}</span><Icon name="chevron-down" size={16} /></summary>
            {renderArray(key, home, ["home"])}
          </details>
        ))}
      </div>
    );
  } else {
    const pageData = editorData ?? {};
    const knownPageArrays = [
      "sections",
      "faqs",
      "steps",
      "levels",
      "notices",
      "documents",
      "events",
      "galleryItems",
    ];
    const objectArrays = Object.keys(pageData).filter(
      (key) =>
        !(page.slug === "calendar" && ["sections", "calendarPlanners", "calendarEntries", "calendarResources"].includes(key)) &&
        Array.isArray(pageData[key]) &&
        (knownPageArrays.includes(key) ||
          (pageData[key] as unknown[]).some(
            (item) => item && typeof item === "object",
          )),
    );
    const primaryKeys = (
      page.slug === "calendar"
        ? ["title", "subtitle"]
        : ["title", "subtitle", "heading", "body", "image", "imageAlt"]
    ).filter((key) => key in pageData);
    const primary = Object.fromEntries(
      primaryKeys.map((key) => [key, pageData[key]]),
    );
    const secondary = Object.fromEntries(
      Object.entries(pageData).filter(
        ([key, value]) =>
          !(
            page.slug === "calendar" &&
            ["heading", "body", "sections"].includes(key)
          ) &&
          !primaryKeys.includes(key) &&
          !objectArrays.includes(key) &&
          !(page.slug === "calendar" && ["calendarBlockEyebrow", "calendarBlockTitle", "calendarBlockDescription", "calendarSession", "calendarPostedBy", "calendarEmptyText", "calendarPlanners", "calendarResources"].includes(key)) &&
          (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            (Array.isArray(value) &&
              value.every((item) => typeof item === "string"))),
      ),
    );
    mainContent = (
      <div className="cms-visual-editor">
        <section className="cms-form-section">
          <div className="cms-section-title">
            <h3>Page title and introduction</h3>
            <p>
              These fields populate the page banner and main introduction. Use
              verified academy details.
            </p>
          </div>
          <div className="cms-field-grid">
            {scalarFields(primary, ["pages", page.key])}
          </div>
        </section>
        {Object.keys(secondary).length > 0 && (
          <section className="cms-form-section">
            <div className="cms-section-title">
              <h3>Section headings, descriptions and imagery</h3>
              <p>
                Additional text fields used by page sections, buttons,
                disclaimers and empty states.
              </p>
            </div>
            <div className="cms-field-grid">
              {scalarFields(secondary, ["pages", page.key])}
            </div>
          </section>
        )}
        {page.slug === "calendar" && <>
          <CalendarContentManager
            entries={Array.isArray(pageData.calendarEntries) ? pageData.calendarEntries as import("@/lib/types").CalendarEntry[] : []}
            onChange={(entries) => update(["pages", page.key, "calendarEntries"], entries)}
          />
          <CalendarResourceManager
            resources={Array.isArray(pageData.calendarResources) ? pageData.calendarResources as import("@/lib/types").CalendarResource[] : []}
            onChange={(resources) => update(["pages", page.key, "calendarResources"], resources)}
          />
        </>}
        {objectArrays.map((key, index) => (
          <details className="cms-array-details" key={key} open={index === 0}>
            <summary><span>{labelFor(key)}</span><Icon name="chevron-down" size={16} /></summary>
            {renderArray(key, pageData, ["pages", page.key])}
          </details>
        ))}
      </div>
    );
  }

  const structuredCount =
    page.slug === "site-settings"
      ? content.navigation.length +
        content.footer.quickLinks.length +
        content.footer.informationLinks.length
      : page.slug === "home"
        ? content.home.hero.length +
          content.home.highlights.length +
          content.home.values.length +
          content.home.leaders.length +
          content.home.notices.length
        : Object.values(editorData ?? {}).filter((value) =>
            Array.isArray(value),
          ).length;
  const galleryPhotos =
    page.slug === "gallery"
      ? (content.pages.gallery.sections || []).filter((item) => item.image)
      : [];
  const galleryCategories =
    page.slug === "gallery"
      ? new Set(galleryPhotos.map(getGalleryCategory))
      : new Set<string>();
  const galleryMissingDetails =
    page.slug === "gallery"
      ? galleryPhotos.filter((item) => !item.alt?.trim()).length
      : 0;

  return (
    <div className="admin-shell cms-pages-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <Image src="/images/crest.webp" alt="" width={45} height={50} />
          <span>
            <strong>Gurukul Academy</strong>
            <small>WEBSITE CMS</small>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Administration">
          <Link href="/admin" className="admin-tab">
            <span>
              <Icon name="layout-dashboard" size={18} />
            </span>
            Overview & tools
          </Link>
          <Link href="/admin/pages" className="admin-tab active">
            <span>
              <Icon name="folder-open" size={18} />
            </span>
            Page editors
          </Link>
          <Link href={page.publicPath} target="_blank" className="admin-tab">
            <span>
              <Icon name="external-link" size={18} />
            </span>
            View this page
          </Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-avatar">
            {adminEmail.slice(0, 1).toUpperCase()}
          </span>
          <span className="admin-user">
            <strong>Administrator</strong>
            <small>{adminEmail}</small>
          </span>
        </div>
      </aside>
      <main className="admin-main cms-editor-main">
        <div className="admin-topbar">
          <div>
            <Link href="/admin/pages" className="cms-back-link">
              <Icon name="arrow-left" size={14} /> All page editors
            </Link>
            <span className="eyebrow">PAGE-SPECIFIC CONTENT EDITOR</span>
            <h1>{page.label}</h1>
          </div>
          <Link
            href={page.publicPath}
            target="_blank"
            className="button button-outline"
          >
            Preview page <Icon name="external-link" size={15} />
          </Link>
        </div>
        <CmsPageSwitcher
          currentSlug={page.slug}
          hasUnsavedChanges={hasChanges}
        />
        <div className="cms-editor-summary">
          <span className="cms-editor-page-icon">
            <Icon name={page.icon} size={24} />
          </span>
          <div>
            <h2>{page.label} content</h2>
            <p>{page.description}</p>
          </div>
          <span className={`json-state ${hasChanges ? "invalid" : "valid"}`}>
            {hasChanges ? (
              <>
                <Icon name="clock" size={14} /> Unsaved changes
              </>
            ) : (
              <>
                <Icon name="check-circle" size={14} /> Saved
              </>
            )}
          </span>
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
        {loadingMedia && (
          <p className="cms-media-loading">
            <Icon name="images" size={15} /> Loading image library…
          </p>
        )}
        {page.slug === "gallery" && (
          <section
            className="cms-gallery-workspace"
            aria-label="Gallery management overview"
          >
            <div className="cms-gallery-workspace-heading">
              <div>
                <span className="eyebrow">GALLERY WORKSPACE</span>
                <h2>Prepare photos for the public gallery</h2>
                <p>
                  Use the photo cards below to upload or select images, write
                  captions and alt text, assign filter categories and adjust
                  their order.
                </p>
              </div>
              <Link
                href={page.publicPath}
                target="_blank"
                className="button button-outline button-small"
              >
                Preview public gallery <Icon name="external-link" size={14} />
              </Link>
            </div>
            <div className="cms-gallery-workspace-stats">
              <div>
                <strong>{galleryPhotos.length}</strong>
                <span>Photos ready</span>
              </div>
              <div>
                <strong>{galleryCategories.size}</strong>
                <span>Public categories</span>
              </div>
              <div className={galleryMissingDetails ? "needs-attention" : ""}>
                <strong>{galleryMissingDetails}</strong>
                <span>Missing alt text</span>
              </div>
            </div>
            <p className="cms-gallery-category-note">
              Photos without a category tag are automatically grouped from their
              title and caption. Add a tag in the photo editor to choose an
              exact category.
            </p>
            {galleryPhotos.length > 0 ? (
              <div className="cms-gallery-preview-grid">
                {galleryPhotos.slice(0, 6).map((photo, index) => (
                  <article
                    className="cms-gallery-preview-card"
                    key={`${photo.title}-${index}`}
                  >
                    <div className="cms-gallery-preview-image">
                      <Image
                        alt={photo.alt || ""}
                        fill
                        sizes="(max-width: 760px) 40vw, 180px"
                        src={photo.image!}
                      />
                    </div>
                    <div>
                      <strong>{photo.title || `Photo ${index + 1}`}</strong>
                      <span>{getGalleryCategory(photo)}</span>
                      {!photo.alt?.trim() && <small>Alt text missing</small>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="cms-gallery-empty">
                No gallery photos added yet. Add your first approved photo
                below.
              </p>
            )}
          </section>
        )}
        {mainContent}
        <section className="cms-publish-bar">
          <div>
            <strong>
              {hasChanges
                ? "You have unpublished edits"
                : "All changes are saved"}
            </strong>
            <small>
              {hasChanges
                ? "Save changes to publish them to the public website."
                : `${structuredCount} structured lists or items available in this editor.`}
            </small>
          </div>
          <div className="cms-publish-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                if (
                  window.confirm("Discard all unsaved changes on this page?")
                ) {
                  setContent(JSON.parse(savedContent) as SiteContent);
                  setNotice({ kind: "info", text: "Unsaved edits discarded." });
                }
              }}
              disabled={!hasChanges || saving}
            >
              Discard changes
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => void save()}
              disabled={!hasChanges || saving}
            >
              {saving ? "Saving…" : "Save changes"}{" "}
              <Icon name="check-circle" size={16} />
            </button>
          </div>
        </section>
        <details className="cms-advanced-data">
          <summary>
            <Icon name="settings" size={15} /> Advanced content backup / import
          </summary>
          <p>
            Use only if you need to restore a complete exported SiteContent JSON
            backup.
          </p>
          <textarea
            className="json-editor"
            value={advancedJson}
            onChange={(event) => setAdvancedJson(event.target.value)}
            placeholder="Paste a previously exported SiteContent JSON document here…"
            spellCheck={false}
          />
          <div className="cms-advanced-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setAdvancedJson(JSON.stringify(content, null, 2))}
            >
              Export current content into editor
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={loadAdvancedJson}
            >
              Load JSON as draft
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(content, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "gurukul-site-content-backup.json";
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download backup
            </button>
          </div>
        </details>
      </main>
    </div>
  );
}
