import { sampleBlueprints } from "@/lib/data/sample-blueprints";
import BlueprintCard from "@/components/blueprint/BlueprintCard";

export default function BlueprintsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All Blueprints
          </h1>
          <p className="text-xl text-blue-50">
            Browse all available blueprint examples and documentation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBlueprints.map((blueprint) => (
            <BlueprintCard key={blueprint.id} blueprint={blueprint} />
          ))}
        </div>

        {sampleBlueprints.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Blueprints Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for more blueprint examples
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
