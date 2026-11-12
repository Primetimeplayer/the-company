// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MobileMenu } from "./mobile-menu";

afterEach(cleanup);

describe("MobileMenu", () => {
  it("starts closed and toggles the navigation links", () => {
    render(<MobileMenu />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("How it works")).toBeNull();

    fireEvent.click(toggle);

    expect(
      screen.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(screen.getByText("Product")).toBeTruthy();
    expect(screen.getByText("How it works")).toBeTruthy();
    expect(screen.getByText("Pricing")).toBeTruthy();
  });

  it("closes when a link is chosen", () => {
    render(<MobileMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByText("Pricing"));

    expect(screen.queryByText("How it works")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
