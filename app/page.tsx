import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { sampleBlueprints } from "@/lib/data/sample-blueprints";
import BlueprintCard from "@/components/blueprint/BlueprintCard";

export default function Home() {
  const featuredBlueprints = sampleBlueprints.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Unreal Engine 5 Blueprint Documentation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Comprehensive visual documentation covering all aspects of UE5
              blueprints
            </p>
            <p className="text-lg text-blue-50 mb-10">
              From basic concepts to advanced techniques • Complete with
              copy/paste examples
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/categories"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Browse Categories
              </Link>
              <Link
                href="/blueprints"
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
              >
                View All Blueprints
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-t-4 h-full"
                style={{ borderTopColor: category.color }}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Blueprints */}
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Featured Blueprints
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBlueprints.map((blueprint) => (
            <BlueprintCard key={blueprint.id} blueprint={blueprint} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/blueprints"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Blueprints →
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Why Use This Documentation?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Copy & Paste Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All blueprints come with ready-to-use code that you can paste
              directly into your UE5 project
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Beginner to Advanced
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive coverage from basic concepts to complex game systems
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Always Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Regular updates with the latest Unreal Engine 5 features and best
              practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
