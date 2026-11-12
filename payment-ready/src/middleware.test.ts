import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, hasValidCredentials, middleware } from "./middleware";

const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;

function request(path = "https://demo.test/app", authorization?: string) {
  return new NextRequest(path, {
    headers: authorization ? { authorization } : undefined,
  });
}

const isPassThrough = (response: Response) =>
  response.headers.get("x-middleware-next") === "1";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo basic auth middleware", () => {
  it("lets everything through when no credentials are configured", () => {
    vi.stubEnv("DEMO_USER", "");
    vi.stubEnv("DEMO_PASSWORD", "");

    expect(isPassThrough(middleware(request()))).toBe(true);
    expect(isPassThrough(middleware(request("https://demo.test/")))).toBe(true);
  });

  it("challenges an anonymous request when credentials are configured", () => {
    vi.stubEnv("DEMO_USER", "demo");
    vi.stubEnv("DEMO_PASSWORD", "secret");

    const response = middleware(request());

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic realm=");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects wrong passwords and malformed headers", () => {
    vi.stubEnv("DEMO_USER", "demo");
    vi.stubEnv("DEMO_PASSWORD", "secret");

    expect(middleware(request("https://demo.test/app", basic("demo", "nope"))).status).toBe(401);
    expect(middleware(request("https://demo.test/app", basic("other", "secret"))).status).toBe(401);
    expect(middleware(request("https://demo.test/app", "Bearer token")).status).toBe(401);
    expect(middleware(request("https://demo.test/app", "Basic !!!")).status).toBe(401);
    expect(middleware(request("https://demo.test/app", "Basic bm9jb2xvbg==")).status).toBe(401);
  });

  it("lets a request with the right credentials through", () => {
    vi.stubEnv("DEMO_USER", "demo");
    vi.stubEnv("DEMO_PASSWORD", "secret");

    const response = middleware(request("https://demo.test/app", basic("demo", "secret")));
    expect(isPassThrough(response)).toBe(true);

    expect(
      hasValidCredentials(basic("demo", "secret"), "demo", "secret"),
    ).toBe(true);
    expect(hasValidCredentials(basic("demo", "secret"), "demo", "Secret")).toBe(false);
    expect(hasValidCredentials(null, "demo", "secret")).toBe(false);
  });

  it("never intercepts Next internals, the favicon or static assets", () => {
    const matches = new RegExp(`^${config.matcher[0]}$`);

    expect(matches.test("/_next/static/chunks/main-app.js")).toBe(false);
    expect(matches.test("/_next/image")).toBe(false);
    expect(matches.test("/favicon.ico")).toBe(false);
    expect(matches.test("/logo.svg")).toBe(false);
    expect(matches.test("/fonts/inter.woff2")).toBe(false);

    expect(matches.test("/")).toBe(true);
    expect(matches.test("/app")).toBe(true);
  });
});
