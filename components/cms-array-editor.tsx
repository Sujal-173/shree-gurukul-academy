"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { CmsImageField } from "@/components/cms-image-field";

type MediaItem = { _id?: string; url: string; publicId?: string; width?: number; height?: number; format?: string; originalName?: string };
export type CmsArrayFieldDefinition = { key: string; label: string; kind?: "image" | "string-array" | "toggle"; multiline?: boolean };
type Props = {
  title: string;
  description?: string;
  path: string[];
  items: unknown;
  fields: CmsArrayFieldDefinition[];
  itemLabel?: string;
  template: Record<string, unknown>;
  media: MediaItem[];
  update: (path: string[], value: unknown) => void;
  onAdd: (path: string[], value: unknown) => void;
  onRemove: (path: string[], index: number) => void;
  onMove: (path: string[], index: number, delta: number) => void;
  onUpload: (file: File, path: string[]) => Promise<void>;
  minItems?: number;
  addLabel?: string;
};

function CmsTextField({ label, value, path, update, multiline = false }: { label: string; value: unknown; path: string[]; update: (path: string[], value: unknown) => void; multiline?: boolean }) {
  const text = typeof value === "string" ? value : "";
  const id = `cms-array-${path.join("-").replace(/[^a-z0-9-]/gi, "")}`;
  return <div className="form-field"><label htmlFor={id}>{label}</label>{multiline ? <textarea id={id} rows={3} value={text} onChange={(event) => update(path, event.target.value)} /> : <input id={id} value={text} onChange={(event) => update(path, event.target.value)} />}</div>;
}

function CmsStringArrayField({ label, value, path, update }: { label: string; value: unknown; path: string[]; update: (path: string[], value: unknown) => void }) {
  const id = `cms-array-${path.join("-").replace(/[^a-z0-9-]/gi, "")}`;
  const text = Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
  return <div className="form-field"><label htmlFor={id}>{label}</label><textarea id={id} rows={4} value={text} onChange={(event) => update(path, event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))} /><small className="form-note">Enter one item per line.</small></div>;
}

function getItemTitle(item: unknown, key?: string, index = 0): string {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const object = item as Record<string, unknown>;
    for (const field of [key, "title", "role", "label", "question", "name", "range", "category"]) {
      if (field && typeof object[field] === "string" && (object[field] as string).trim()) return (object[field] as string).slice(0, 64);
    }
  }
  return `Item ${String(index + 1).padStart(2, "0")}`;
}

export function CmsArrayEditor({ title, description, path, items, fields, itemLabel, template, media, update, onAdd, onRemove, onMove, onUpload, minItems = 0, addLabel }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const rows = Array.isArray(items) ? items : [];
  return <section className="cms-form-section cms-array-editor">
    <div className="cms-section-title cms-array-editor-heading">
      <div><h3>{title} <span className="cms-count">{rows.length}</span></h3>{description && <p>{description}</p>}</div>
      <button type="button" className="button button-outline button-small" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed}>{collapsed ? "Expand" : "Collapse"} <Icon name={collapsed ? "chevron-down" : "chevron-up"} size={14}/></button>
    </div>
    {!collapsed && <>
      {rows.length === 0 && <div className="cms-array-empty"><Icon name="inbox" size={20}/><span>No items yet. Use “Add item” to create the first one.</span></div>}
      <div className="cms-array-list">
        {rows.map((rawItem, index) => {
          const item = rawItem && typeof rawItem === "object" && !Array.isArray(rawItem) ? rawItem as Record<string, unknown> : {};
          const itemPath = [...path, String(index)];
          return <article className="cms-array-item" key={`${path.join("-")}-${index}`}>
            <div className="cms-array-item-top"><strong>{getItemTitle(item, itemLabel, index)}</strong><span className="cms-array-item-number">{String(index + 1).padStart(2, "0")}</span></div>
            <div className="cms-field-grid">
              {fields.map((field) => {
                const fieldPath = [...itemPath, field.key];
                if (field.kind === "image") return <CmsImageField key={field.key} label={field.label} value={item[field.key]} path={fieldPath} update={update} media={media} onUpload={onUpload}/>;
                if (field.kind === "string-array") return <CmsStringArrayField key={field.key} label={field.label} value={item[field.key]} path={fieldPath} update={update}/>;
                if (field.kind === "toggle") return <div key={field.key} className="form-field cms-toggle-field"><label htmlFor={`cms-toggle-${fieldPath.join("-")}`}>{field.label}</label><label className="cms-active-toggle"><input id={`cms-toggle-${fieldPath.join("-")}`} type="checkbox" checked={Boolean(item[field.key])} onChange={(event) => update(fieldPath, event.target.checked)}/><span>{item[field.key] ? "Enabled" : "Disabled"}</span></label></div>;
                return <CmsTextField key={field.key} label={field.label} value={item[field.key]} path={fieldPath} update={update} multiline={Boolean(field.multiline)}/>;
              })}
            </div>
            <div className="cms-array-item-actions">
              <button type="button" className="button button-outline button-small" onClick={() => onMove(path, index, -1)} disabled={index === 0} aria-label={`Move ${getItemTitle(item, itemLabel, index)} up`}><Icon name="chevron-up" size={14}/> Move up</button>
              <button type="button" className="button button-outline button-small" onClick={() => onMove(path, index, 1)} disabled={index === rows.length - 1} aria-label={`Move ${getItemTitle(item, itemLabel, index)} down`}><Icon name="chevron-down" size={14}/> Move down</button>
              <button type="button" className="button button-danger button-small" onClick={() => onRemove(path, index)} disabled={rows.length <= minItems}><Icon name="trash" size={14}/> Remove</button>
            </div>
          </article>;
        })}
      </div>
      <button type="button" className="button button-outline cms-add-item" onClick={() => { const next = structuredClone(template); if (typeof next.id === "string") next.id = `${next.id}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`; onAdd(path, next); }}><Icon name="plus" size={15}/>{addLabel || "Add item"}</button>
    </>}
  </section>;
}
