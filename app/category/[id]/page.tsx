import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryById } from "@/lib/data/categories";
import { getBlueprintsByCategory } from "@/lib/data/sample-blueprints";
import BlueprintCard from "@/components/blueprint/BlueprintCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = getCategoryById(id);

  if (!category) {
    notFound();
  }

  const blueprints = getBlueprintsByCategory(id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className="text-white py-16"
        style={{
          background: `linear-gradient(135deg, ${category.color} 0%, #667eea 100%)`,
        }}
      >
        <div className="container mx-auto px-4">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm opacity-90">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold">{category.name}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{category.icon}</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {category.name}
              </h1>
            </div>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">{category.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {blueprints.length}{" "}
            {blueprints.length === 1 ? "Blueprint" : "Blueprints"}
          </h2>
        </div>

        {blueprints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint) => (
              <BlueprintCard key={blueprint.id} blueprint={blueprint} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Blueprints for this category are being prepared
            </p>
            <Link
              href="/categories"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Other Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
