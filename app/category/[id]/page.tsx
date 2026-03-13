import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryById } from "@/lib/data/categories";
import CategoryBlueprintsClient from "@/components/blueprint/CategoryBlueprintsClient";

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
        <CategoryBlueprintsClient
          category={category}
          categoryId={category.id}
        />
      </div>
    </div>
  );
}
