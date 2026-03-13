"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import { getCategoryById } from "@/lib/data/categories";
import type { Blueprint } from "@/lib/types/blueprint";
import {
  getStoredBlueprintById,
  USER_BLUEPRINTS_UPDATED_EVENT,
} from "@/lib/blueprint/user-blueprints";

interface BlueprintDetailClientProps {
  blueprintId: string;
  initialBlueprint: Blueprint | null;
}

export default function BlueprintDetailClient({
  blueprintId,
  initialBlueprint,
}: BlueprintDetailClientProps) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(
    initialBlueprint,
  );
  const [resolved, setResolved] = useState(Boolean(initialBlueprint));

  useEffect(() => {
    if (initialBlueprint) {
      setResolved(true);
      return;
    }

    const sync = () => {
      setBlueprint(getStoredBlueprintById(blueprintId) ?? null);
      setResolved(true);
    };

    sync();
    window.addEventListener(USER_BLUEPRINTS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(USER_BLUEPRINTS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [blueprintId, initialBlueprint]);

  if (!resolved) {
    return <BlueprintDetailSkeleton />;
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              Blueprint Note Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              The note may have been removed from this browser or never saved on
              this device.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/blueprints"
                className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Browse Blueprints
              </Link>
              <Link
                href="/blueprints/new"
                className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Create New Note
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const category = getCategoryById(blueprint.category);
  const difficultyColor = {
    beginner:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }[blueprint.difficulty];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 text-white sm:py-16"
        style={
          category
            ? {
                background: `linear-gradient(135deg, ${category.color} 0%, #667eea 100%)`,
              }
            : undefined
        }
      >
        <div className="container mx-auto px-4">
          <nav className="mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-blue-100">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blueprints" className="hover:text-white">
                  Blueprints
                </Link>
              </li>
              {category ? (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      href={`/category/${category.id}`}
                      className="hover:text-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              ) : null}
            </ol>
          </nav>

          <div className="flex items-start gap-6">
            <div className="flex-grow">
              <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                {blueprint.title}
              </h1>
              <p className="mb-6 text-base text-blue-50 sm:text-lg md:text-xl">
                {blueprint.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${difficultyColor}`}
                >
                  {blueprint.difficulty.charAt(0).toUpperCase() +
                    blueprint.difficulty.slice(1)}
                </span>
                {category ? (
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {category.icon} {category.name}
                  </span>
                ) : null}
                <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
                  UE {blueprint.ueVersion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <BlueprintViewer blueprint={blueprint} />

          {blueprint.tags.length > 0 ? (
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blueprint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow sm:p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Author
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {blueprint.author}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Created
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {new Date(blueprint.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Updated
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {new Date(blueprint.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Category
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {category?.name || blueprint.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlueprintDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="animate-pulse rounded-3xl bg-white p-10 shadow dark:bg-gray-800">
          <div className="mb-4 h-10 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
