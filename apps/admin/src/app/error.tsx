"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-loss/30 bg-loss-soft p-6">
      <h1 className="text-lg font-bold text-loss">Something went wrong</h1>
      <p className="mt-1 text-sm">{error.digest ? `Error ${error.digest}. ` : ""}Check the admin server logs for details.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold">
        Try again
      </button>
    </div>
  );
}
