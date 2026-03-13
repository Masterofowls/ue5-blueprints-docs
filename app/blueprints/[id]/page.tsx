import { getBlueprintById } from "@/lib/data/sample-blueprints";
import BlueprintDetailClient from "@/components/blueprint/BlueprintDetailClient";

export default async function BlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <BlueprintDetailClient
      blueprintId={id}
      initialBlueprint={getBlueprintById(id) ?? null}
    />
  );
}
