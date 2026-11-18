import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LandingAnalytics, PrivacySettingsButton } from "./Analytics";

beforeEach(() => {
  localStorage.clear();
  document.cookie = "ss_privacy_v2=; Max-Age=0; Path=/";
});
afterEach(cleanup);

describe("Privacy settings", () => {
  it("starts with a single opener and opens the preferences without granting consent", () => {
    render(<LandingAnalytics />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const opener = screen.getByRole("button", { name: "Ustawienia prywatności" });
    fireEvent.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zapisz wybór" })).toBeDisabled();
    expect(document.cookie).not.toContain("ss_privacy_v2=");
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Zezwól na statystyki" }));
    fireEvent.click(screen.getByRole("button", { name: "Zamknij ustawienia prywatności" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
    fireEvent.click(opener);
    expect(screen.getByRole("button", { name: "Zezwól na statystyki" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps the footer entry available after saving independent choices", () => {
    render(
      <>
        <LandingAnalytics />
        <footer>
          <PrivacySettingsButton />
        </footer>
      </>,
    );
    const footer = screen.getByRole("contentinfo");
    const footerButton = footer.querySelector("button")!;
    fireEvent.click(footerButton);
    fireEvent.click(screen.getByRole("button", { name: "Odrzuć statystyki" }));
    fireEvent.click(screen.getByRole("button", { name: "Zezwól na pomiar reklam" }));
    fireEvent.click(screen.getByRole("button", { name: "Zapisz wybór" }));
    expect(document.cookie).toContain("ss_privacy_v2=s0a1");
    expect(screen.getAllByRole("button", { name: "Ustawienia prywatności" })).toEqual([
      footerButton,
    ]);
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    fireEvent.click(footerButton);
    expect(screen.getByRole("button", { name: "Odrzuć statystyki" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
