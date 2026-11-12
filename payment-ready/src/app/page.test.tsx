// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WALKTHROUGH_URL } from "@/lib/config";
import LandingPage from "./page";

afterEach(cleanup);

describe("landing page walkthrough CTAs", () => {
  it("sends every booking link to the walkthrough URL in a new tab", () => {
    render(<LandingPage />);

    const links = screen.getAllByRole("link", { name: /book a walkthrough/i });
    expect(links).toHaveLength(2);

    for (const link of links) {
      expect(link.getAttribute("href")).toBe(WALKTHROUGH_URL);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });
});
