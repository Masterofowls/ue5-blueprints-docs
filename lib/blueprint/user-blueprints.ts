import { sampleBlueprints } from "@/lib/data/sample-blueprints";
import type { Blueprint } from "@/lib/types/blueprint";

const USER_BLUEPRINTS_STORAGE_KEY = "ue5-blueprint-notes";
export const USER_BLUEPRINTS_UPDATED_EVENT = "ue5-blueprint-notes-updated";

export function getStoredBlueprintNotes(): Blueprint[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(USER_BLUEPRINTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Blueprint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllBlueprintNotes(): Blueprint[] {
  return [...getStoredBlueprintNotes(), ...sampleBlueprints];
}

export function getStoredBlueprintById(id: string) {
  return getStoredBlueprintNotes().find((blueprint) => blueprint.id === id);
}

export function saveBlueprintNote(blueprint: Blueprint) {
  const existing = getStoredBlueprintNotes();
  const next = [
    blueprint,
    ...existing.filter((item) => item.id !== blueprint.id),
  ];

  window.localStorage.setItem(
    USER_BLUEPRINTS_STORAGE_KEY,
    JSON.stringify(next),
  );
  window.dispatchEvent(new Event(USER_BLUEPRINTS_UPDATED_EVENT));
}

export function createBlueprintNoteId(title: string) {
  const baseSlug = slugify(title) || "blueprint-note";
  const existingIds = new Set(
    getAllBlueprintNotes().map((blueprint) => blueprint.id),
  );

  if (!existingIds.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingIds.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
