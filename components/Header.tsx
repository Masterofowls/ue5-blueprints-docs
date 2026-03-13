import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-3xl">🎮</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                UE5 Blueprints
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Visual Documentation
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/blueprints/new"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Post Note
            </Link>
            <Link
              href="/blueprints"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              All Blueprints
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/search"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Search
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
