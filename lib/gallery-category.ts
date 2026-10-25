import type { ContentSection } from "@/lib/types";

export function getGalleryCategory(photo: ContentSection): string {
  if (photo.tag?.trim()) return photo.tag.trim();
  const content = `${photo.title} ${photo.description}`.toLowerCase();
  if (/award|achievement|prize|competition|certificate/.test(content)) return "Achievements";
  if (/campus|sport|team|outdoor|play/.test(content)) return "Campus";
  if (/event|assembly|celebrat|festival|visit|performance/.test(content)) return "Events";
  if (/class|read|learn|science|laboratory/.test(content)) return "Classrooms";
  return "School life";
}
