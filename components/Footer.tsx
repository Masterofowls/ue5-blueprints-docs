export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">UE5 Blueprint Docs</h3>
            <p className="text-sm">
              Comprehensive visual documentation for Unreal Engine 5 blueprints
              with copy/paste support.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/blueprints"
                  className="hover:text-white transition-colors"
                >
                  All Blueprints
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="hover:text-white transition-colors"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/search"
                  className="hover:text-white transition-colors"
                >
                  Search
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.unrealengine.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  UE5 Official Docs
                </a>
              </li>
              <li>
                <a
                  href="https://blueprintue.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  BlueprintUE
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>
            © 2026 UE5 Blueprint Documentation. Built with Next.js • For
            educational purposes
          </p>
        </div>
      </div>
    </footer>
  );
}
