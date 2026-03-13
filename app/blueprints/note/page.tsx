import { Suspense } from "react";
import StoredBlueprintNoteClient from "@/components/blueprint/StoredBlueprintNoteClient";

export default function StoredBlueprintNotePage() {
  return (
    <Suspense fallback={null}>
      <StoredBlueprintNoteClient />
    </Suspense>
  );
}
