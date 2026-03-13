import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 self-start">
            <div className="text-2xl sm:text-3xl">🎮</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                UE5 Blueprints
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Visual Documentation
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
            <Link
              href="/blueprints/new"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Post Note
            </Link>
            <Link
              href="/blueprints"
              className="min-h-10 px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:text-base"
            >
              All Blueprints
            </Link>
            <Link
              href="/categories"
              className="min-h-10 px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:text-base"
            >
              Categories
            </Link>
            <Link
              href="/search"
              className="min-h-10 px-1 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 sm:text-base"
            >
              Search
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
