import { notFound } from "next/navigation";
import {
  getBlueprintById,
  sampleBlueprints,
} from "@/lib/data/sample-blueprints";
import BlueprintDetailClient from "@/components/blueprint/BlueprintDetailClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return sampleBlueprints.map((blueprint) => ({ id: blueprint.id }));
}

export default async function BlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blueprint = getBlueprintById(id);

  if (!blueprint) {
    notFound();
  }

  return (
    <BlueprintDetailClient blueprintId={id} initialBlueprint={blueprint} />
  );
}
