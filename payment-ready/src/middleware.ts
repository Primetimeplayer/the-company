import { NextResponse, type NextRequest } from "next/server";

const REALM = 'Basic realm="Payment Ready demo", charset="UTF-8"';

/**
 * Constant-time comparison so the demo password cannot be guessed by timing.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

/**
 * Checks an `Authorization: Basic ...` header against the demo credentials.
 */
export function hasValidCredentials(
  header: string | null,
  user: string,
  password: string,
): boolean {
  if (!header) return false;

  const [scheme, encoded] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "basic" || !encoded) return false;

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  const suppliedUser = decoded.slice(0, separator);
  const suppliedPassword = decoded.slice(separator + 1);

  // Evaluate both comparisons so a wrong user costs the same time as a wrong password.
  const userMatches = safeEqual(suppliedUser, user);
  const passwordMatches = safeEqual(suppliedPassword, password);
  return userMatches && passwordMatches;
}

/**
 * HTTP Basic Auth for the deployed demo. Without DEMO_USER and DEMO_PASSWORD
 * (local development) every request is allowed through.
 */
export function middleware(request: NextRequest) {
  const user = process.env.DEMO_USER;
  const password = process.env.DEMO_PASSWORD;

  if (!user || !password) {
    return NextResponse.next();
  }

  if (hasValidCredentials(request.headers.get("authorization"), user, password)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Everything except Next's build output, the favicon and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
