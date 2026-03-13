"use client";

import Link from "next/link";
import type { Blueprint } from "@/lib/types/blueprint";
import { getCategoryColor } from "@/lib/data/categories";

interface BlueprintCardProps {
  blueprint: Blueprint;
}

export default function BlueprintCard({ blueprint }: BlueprintCardProps) {
  const difficultyColor = {
    beginner:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }[blueprint.difficulty];

  return (
    <Link href={`/blueprints/${blueprint.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        {/* Thumbnail/Visual Preview */}
        <div
          className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden"
          style={{
            borderBottom: `4px solid ${getCategoryColor(blueprint.category)}`,
          }}
        >
          {blueprint.thumbnail ? (
            <img
              src={blueprint.thumbnail}
              alt={blueprint.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-6xl opacity-50">🎮</div>
            </div>
          )}
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}
            >
              {blueprint.difficulty.charAt(0).toUpperCase() +
                blueprint.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {blueprint.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {blueprint.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blueprint.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {blueprint.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                +{blueprint.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {blueprint.author}
            </span>
            <span className="text-xs">UE {blueprint.ueVersion}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
