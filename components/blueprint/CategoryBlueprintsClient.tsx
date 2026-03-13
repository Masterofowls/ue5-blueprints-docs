"use client";

import BlueprintCard from "@/components/blueprint/BlueprintCard";
import type { BlueprintCategory, CategoryInfo } from "@/lib/types/blueprint";
import { useBlueprintLibrary } from "@/components/blueprint/useBlueprintLibrary";

interface CategoryBlueprintsClientProps {
  category: CategoryInfo;
  categoryId: BlueprintCategory;
}

export default function CategoryBlueprintsClient({
  category,
  categoryId,
}: CategoryBlueprintsClientProps) {
  const blueprints = useBlueprintLibrary({ category: categoryId });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {blueprints.length}{" "}
          {blueprints.length === 1 ? "Blueprint" : "Blueprints"}
        </h2>
      </div>

      {blueprints.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((blueprint) => (
            <BlueprintCard key={blueprint.id} blueprint={blueprint} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white py-20 text-center dark:bg-gray-800">
          <div className="mb-4 text-6xl">{category.icon}</div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            No Notes In This Category Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create a blueprint note in {category.name} to populate this
            category.
          </p>
        </div>
      )}
    </>
  );
}
