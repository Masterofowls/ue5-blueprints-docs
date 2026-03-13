import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Offline Mode
        </p>
        <h1 className="mb-4 text-3xl font-bold">Connection unavailable</h1>
        <p className="mb-8 text-sm leading-6 text-slate-300 sm:text-base">
          The blueprint docs shell is installed, but this page was not cached
          yet. Reconnect to refresh the latest documentation or return to a
          cached page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-cyan-500 px-5 py-3 text-center font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Go Home
          </Link>
          <Link
            href="/blueprints"
            className="rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            Browse Cached Blueprints
          </Link>
        </div>
      </div>
    </div>
  );
}
