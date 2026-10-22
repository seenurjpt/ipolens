import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// HTTP Basic auth in front of the whole panel (ADMIN_USER / ADMIN_PASSWORD).
// Production refuses to serve without them; development runs unprotected with a banner
// (see app/layout.tsx).

const digest = (s: string) => createHash("sha256").update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

function credentials(header: string | null): [string, string] | null {
  if (!header?.startsWith("Basic ")) return null;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const colon = decoded.indexOf(":");
  return colon < 0 ? null : [decoded.slice(0, colon), decoded.slice(colon + 1)];
}

export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Admin login is not configured (set ADMIN_USER and ADMIN_PASSWORD).", { status: 503 });
    }
    return NextResponse.next();
  }

  const given = credentials(request.headers.get("authorization"));
  // Evaluate both comparisons so timing does not reveal which part was wrong.
  const userOk = same(given?.[0] ?? "", user);
  const passwordOk = same(given?.[1] ?? "", password);
  if (given && userOk && passwordOk) return NextResponse.next();

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="IPOLens admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
