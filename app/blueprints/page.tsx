"use client";

import Link from "next/link";
import BlueprintCard from "@/components/blueprint/BlueprintCard";
import { useBlueprintLibrary } from "@/components/blueprint/useBlueprintLibrary";

export default function BlueprintsPage() {
  const blueprints = useBlueprintLibrary();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                All Blueprints
              </h1>
              <p className="text-xl text-blue-50">
                Browse sample blueprints and your locally saved blueprint notes
              </p>
            </div>
            <Link
              href="/blueprints/new"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Post New Note
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint) => (
            <BlueprintCard key={blueprint.id} blueprint={blueprint} />
          ))}
        </div>

        {blueprints.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Blueprints Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first local blueprint note to populate this library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
