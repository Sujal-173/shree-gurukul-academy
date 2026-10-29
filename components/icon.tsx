import type { ReactNode } from "react";

export type IconName =
  | "home" | "menu" | "close" | "whatsapp" | "arrow-up-right" | "arrow-right" | "arrow-left" | "chevron-right" | "chevron-down" | "chevron-up" | "plus" | "inbox"
  | "book-open" | "book-marked" | "graduation-cap" | "calendar-days" | "calendar-check" | "bell" | "image" | "images"
  | "map-pin" | "phone" | "mail" | "instagram" | "message-circle" | "facebook" | "youtube" | "globe"
  | "sparkles" | "check" | "check-circle" | "file-text" | "monitor" | "microscope" | "dumbbell" | "library"
  | "shield-check" | "target" | "eye" | "users" | "clock" | "award" | "compass" | "send" | "upload"
  | "external-link" | "log-out" | "layout-dashboard" | "pen-line" | "folder-open" | "smartphone" | "user-round" | "alert-circle" | "paperclip"
  | "clipboard-list" | "clipboard-check" | "camera" | "quote" | "heart-handshake" | "handshake" | "file-check"
  | "building" | "book-copy" | "lightbulb" | "palette" | "sun" | "settings" | "search" | "download" | "trash" | "copy" | "refresh-cw" | "zoom-in" | "zoom-out" | "maximize";

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  whatsapp: <><path d="M20.5 3.5A11.9 11.9 0 0 0 3.6 20.3L2.5 22l3.9-1a11.9 11.9 0 1 0 14.1-17.5Z"/><path d="M8.2 7.4c-.3-.6-.7-.6-1-.6H6.4c-.3 0-.8.1-1.2.6S3.7 8.7 3.7 10.5s1.5 3.6 1.7 3.9 2.8 4.4 6.8 5.9c3.3 1.3 4 .9 4.7.8s2.4-1 2.7-2 .3-1.8.2-2-.4-.3-.9-.5l-2.8-1.4c-.4-.2-.7-.2-1 .2l-1.3 1.5c-.3.3-.6.4-1 .2a10.5 10.5 0 0 1-3.2-2 12.3 12.3 0 0 1-2.2-2.8c-.2-.4 0-.7.2-.9l.9-1c.2-.3.3-.5.4-.8s0-.6-.1-.8Z"/></>,
  "arrow-up-right": <><path d="M7 17 17 7M7 7h10v10"/></>,
  "arrow-right": <><path d="M5 12h14M12 5l7 7-7 7"/></>,
  "arrow-left": <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
  "chevron-right": <><path d="m9 18 6-6-6-6"/></>,
  "chevron-down": <><path d="m6 9 6 6 6-6"/></>,
  "chevron-up": <><path d="m6 15 6-6 6 6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  inbox: <><path d="M4 4h16l2 11v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4L4 4Z"/><path d="M2 15h5l2 3h6l2-3h5"/></>,
  "book-open": <><path d="M12 7v14"/><path d="M3 18V5a1 1 0 0 1 1-1h3a5 5 0 0 1 5 5 5 5 0 0 1 5-5h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4a4 4 0 0 0-4 2 4 4 0 0 0-4-2H4a1 1 0 0 1-1-1Z"/></>,
  "book-marked": <><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H20v19H8.5A2.5 2.5 0 0 1 6 18.5z"/><path d="M6 18.5A2.5 2.5 0 0 0 3.5 16H3V4h3M12 2v8l3-2 3 2V2"/></>,
  "graduation-cap": <><path d="m2 10 10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/></>,
  "calendar-days": <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>,
  "calendar-check": <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m3 2-4 4-2-2"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  images: <><rect x="3" y="3" width="15" height="15" rx="2"/><path d="M7 21h12a2 2 0 0 0 2-2V7M3 14l4-4 5 5"/></>,
  "map-pin": <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.6a2 2 0 0 1-.6 1.9L7.2 10a16 16 0 0 0 6 6l1.8-1.8a2 2 0 0 1 1.9-.6l2.6.5a2 2 0 0 1 1.5 2.8Z"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
  "message-circle": <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
  facebook: <><path d="M15 21v-8h3l.5-4H15V7c0-1.2.4-2 2-2h2V2.2C18.4 2.1 17.4 2 16.4 2 13.4 2 11 3.8 11 7.1V9H8v4h3v8"/></>,
  youtube: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></>,
  sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/><path d="m5 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  "check-circle": <><circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/></>,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  microscope: <><path d="m6 18 6-6M9 3l6 6M8 8l4-4 5 5-4 4M4 21h16M8 21v-3a5 5 0 0 1 10 0v3M12 13l-2-2"/></>,
  dumbbell: <><path d="m6.5 6.5 11 11M4 8l4-4m8 16 4-4M2 10l2-2m14 8 2-2M4 14l6-6m4 10 6-6"/></>,
  library: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"/></>,
  "shield-check": <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
  target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  award: <><circle cx="12" cy="8" r="6"/><path d="m8.2 13-1.3 8L12 18l5.1 3-1.3-8"/></>,
  compass: <><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.8 5.6-5.6 2.8 2.8-5.6z"/></>,
  send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
  "external-link": <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  "log-out": <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
  "layout-dashboard": <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  "pen-line": <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  "folder-open": <><path d="m3 7 6 0 2 2h10l-2 10H4L2 5a2 2 0 0 1 2-2h5l2 2h6"/></>,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>,
  "user-round": <><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
  "clipboard-list": <><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4.5h6a1.5 1.5 0 0 0-3-3h0a1.5 1.5 0 0 0-3 3ZM9 11h6M9 15h6M9 19h3"/></>,
  "clipboard-check": <><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4h6a1.5 1.5 0 0 0-3-3 1.5 1.5 0 0 0-3 3ZM8 14l2.5 2.5L16 11"/></>,
  camera: <><path d="M14 4h-4l-2 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z"/><circle cx="12" cy="13" r="3"/></>,
  quote: <><path d="M3 21c3 0 5-2 5-5V9H2v7h3M14 21c3 0 5-2 5-5V9h-6v7h3"/></>,
  "heart-handshake": <><path d="M19.5 12.6 12 20l-7.5-7.4a4.8 4.8 0 0 1 6.8-6.8l.7.7.7-.7a4.8 4.8 0 0 1 6.8 6.8Z"/><path d="m8 13 2.2-1.5a2 2 0 0 1 2.3 0l1.4 1-2 2M14 13l2.5-1.5L19 13"/></>,
  handshake: <><path d="m11 17-4-4-3 3 5 5 5-5M13 7l-2-2-5 5 5 5 2-2M13 7l2-2 5 5-5 5-2-2M7 10l-3-3M17 10l3-3"/></>,
  "file-check": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 14l2 2 5-5"/></>,
  building: <><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 21V9h6v12M7 7h.01M12 5h.01M17 7h.01M7 11h.01M17 11h.01M7 15h.01M17 15h.01"/></>,
  "book-copy": <><path d="M8 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11M8 2h11a2 2 0 0 1 2 2v14H8zM12 7h5M12 11h5"/></>,
  lightbulb: <><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.8.7-1 1.4-1 2H9c0-.6-.2-1.3-1-2Z"/></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 1.7 1.7 0 0 1 1.4-2.8h1.2A3.6 3.6 0 0 0 21 11.4 8.5 8.5 0 0 0 12 3Z"/><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 17l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 11H1.5a2 2 0 1 1 0-4h.2A2 2 0 0 0 3 3.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 0h.3a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.3a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.8 3.2Z"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  "refresh-cw": <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.6-2.6L20 12M4 12l2.9 5.6A7 7 0 0 0 18.5 15"/></>,
  "zoom-in": <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M10.5 7v7M7 10.5h7"/></>,
  "zoom-out": <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M7 10.5h7"/></>,
  maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></>,
  "alert-circle": <><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></>,
  paperclip: <><path d="m21.4 11.5-8.9 8.9a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.9 1.9 0 0 1-2.6-2.6l8.1-8.1"/></>,
};

export function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }: { name: IconName; size?: number; strokeWidth?: number; className?: string }) {
  return <svg className={`ui-icon ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
