import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="t-eyebrow text-primary">404</p>
        <h1 className="t-heading-1 mt-3">This page isn&apos;t here.</h1>
        <p className="mt-3 text-ink-muted">It may have moved, or the link may be wrong.</p>
        <Link href="/" className="btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </div>
  );
}
