import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlueprintById } from "@/lib/data/sample-blueprints";
import { getCategoryById } from "@/lib/data/categories";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";

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
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
        style={
          category
            ? {
                background: `linear-gradient(135deg, ${category.color} 0%, #667eea 100%)`,
              }
            : {}
        }
      >
        <div className="container mx-auto px-4">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-blue-100">
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
              {category && (
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
              )}
            </ol>
          </nav>

          <div className="flex items-start gap-6">
            <div className="flex-grow">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {blueprint.title}
              </h1>
              <p className="text-xl text-blue-50 mb-6">
                {blueprint.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${difficultyColor}`}
                >
                  {blueprint.difficulty.charAt(0).toUpperCase() +
                    blueprint.difficulty.slice(1)}
                </span>
                {category && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                    {category.icon} {category.name}
                  </span>
                )}
                <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                  UE {blueprint.ueVersion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <BlueprintViewer blueprint={blueprint} />

          {/* Tags */}
          {blueprint.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blueprint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Author
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {blueprint.author}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Created
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {new Date(blueprint.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Updated
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {new Date(blueprint.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
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
