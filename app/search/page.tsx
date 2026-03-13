"use client";

import { useState } from "react";
import { categories } from "@/lib/data/categories";
import BlueprintCard from "@/components/blueprint/BlueprintCard";
import { useBlueprintLibrary } from "@/components/blueprint/useBlueprintLibrary";
import type { BlueprintCategory } from "@/lib/types/blueprint";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const results = useBlueprintLibrary({
    searchTerm,
    category:
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as BlueprintCategory),
  });

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const onCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Search Blueprints
          </h1>
          <p className="text-xl text-blue-50 mb-8">
            Find the perfect blueprint for your project
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl">
            <div className="flex gap-3">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by title, description, or tags..."
                  className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:ring-4 focus:ring-blue-300 outline-none"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Search blueprints</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Filter by Category
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {results.length} {results.length === 1 ? "Result" : "Results"}
          </h2>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((blueprint) => (
              <BlueprintCard key={blueprint.id} blueprint={blueprint} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
