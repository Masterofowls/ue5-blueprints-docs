"use client";

import { useSearchParams } from "next/navigation";
import BlueprintDetailClient from "@/components/blueprint/BlueprintDetailClient";

export default function StoredBlueprintNoteClient() {
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get("id") ?? "";

  return (
    <BlueprintDetailClient blueprintId={blueprintId} initialBlueprint={null} />
  );
}
