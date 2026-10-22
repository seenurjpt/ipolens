import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-bold">Not found</h1>
      <p className="mt-2 text-sm text-muted">That IPO or report does not exist.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
        Back to the dashboard
      </Link>
    </div>
  );
}
