import Link from "next/link";
import { categories } from "@/lib/data/categories";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blueprint Categories
          </h1>
          <p className="text-xl text-blue-50">
            Explore blueprints organized by topic and functionality
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-all border-t-4 h-full"
                style={{ borderTopColor: category.color }}
              >
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
