"use client";

import { useEffect, useState } from "react";
import { sampleBlueprints } from "@/lib/data/sample-blueprints";
import type { Blueprint, BlueprintCategory } from "@/lib/types/blueprint";
import {
  getStoredBlueprintNotes,
  USER_BLUEPRINTS_UPDATED_EVENT,
} from "@/lib/blueprint/user-blueprints";

export function useBlueprintLibrary(filters?: {
  category?: BlueprintCategory;
  searchTerm?: string;
}) {
  const [userBlueprints, setUserBlueprints] = useState<Blueprint[]>([]);

  useEffect(() => {
    const sync = () => {
      setUserBlueprints(getStoredBlueprintNotes());
    };

    sync();
    window.addEventListener(USER_BLUEPRINTS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(USER_BLUEPRINTS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return filterBlueprints([...userBlueprints, ...sampleBlueprints], filters);
}

function filterBlueprints(
  blueprints: Blueprint[],
  filters?: {
    category?: BlueprintCategory;
    searchTerm?: string;
  },
) {
  const normalizedSearch = filters?.searchTerm?.trim().toLowerCase() ?? "";

  return blueprints.filter((blueprint) => {
    if (filters?.category && blueprint.category !== filters.category) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      blueprint.title.toLowerCase().includes(normalizedSearch) ||
      blueprint.description.toLowerCase().includes(normalizedSearch) ||
      blueprint.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedSearch),
      ) ||
      blueprint.author.toLowerCase().includes(normalizedSearch)
    );
  });
}
