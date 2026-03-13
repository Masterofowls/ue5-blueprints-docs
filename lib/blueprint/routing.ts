import { sampleBlueprints } from "@/lib/data/sample-blueprints";

const bundledBlueprintIds = new Set(
  sampleBlueprints.map((blueprint) => blueprint.id),
);

export function isBundledBlueprintId(id: string) {
  return bundledBlueprintIds.has(id);
}

export function getBlueprintHref(id: string) {
  if (isBundledBlueprintId(id)) {
    return `/blueprints/${id}`;
  }

  return `/blueprints/note?id=${encodeURIComponent(id)}`;
}

export function getAssetPath(path: string | undefined) {
  if (!path) {
    return undefined;
  }

  if (/^(https?:)?\/\//.test(path)) {
    return path;
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}
