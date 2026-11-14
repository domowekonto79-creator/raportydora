import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LandingAnalytics, PrivacySettingsButton } from "./Analytics";

const key = "ss_lp_statistics_v1";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  document.getElementById("secureside-ga4")?.remove();
  vi.unstubAllEnvs();
});

describe("Statistics consent", () => {
  it("loads GA only after consent on a production host and reloads after withdrawal", () => {
    const originalLocation = Object.getOwnPropertyDescriptor(window, "location")!;
    const reload = vi.fn();
    vi.stubEnv("PROD", true);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname: "dora.secureside.pl", href: "https://dora.secureside.pl/", reload },
    });
    try {
      render(
        <>
          <LandingAnalytics />
          <PrivacySettingsButton />
        </>,
      );
      expect(document.getElementById("secureside-ga4")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Zezwól" }));
      expect(document.querySelector<HTMLScriptElement>("#secureside-ga4")?.src).toBe(
        "https://www.googletagmanager.com/gtag/js?id=G-LGMQ448HRY",
      );
      fireEvent.click(screen.getByRole("button", { name: "Ustawienia statystyk" }));
      fireEvent.click(screen.getByRole("button", { name: "Odrzuć" }));
      expect(reload).toHaveBeenCalledOnce();
      expect(JSON.parse(localStorage.getItem(key)!).choice).toBe("no");
    } finally {
      Object.defineProperty(window, "location", originalLocation);
    }
  });
  it("offers a discreet choice without loading Google before consent", () => {
    render(<LandingAnalytics />);
    expect(screen.getByRole("heading", { name: "Statystyki" })).toBeInTheDocument();
    expect(screen.queryByText(/Google Analytics/)).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });
  it("remembers acceptance but never loads the production tag on local/preview", () => {
    render(<LandingAnalytics />);
    fireEvent.click(screen.getByRole("button", { name: "Zezwól" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(key)!).choice).toBe("yes");
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });
  it("allows reopening and refusing previously accepted statistics", () => {
    render(
      <>
        <LandingAnalytics />
        <PrivacySettingsButton />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zezwól" }));
    fireEvent.click(screen.getByRole("button", { name: "Ustawienia statystyk" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Odrzuć" }));
    expect(JSON.parse(localStorage.getItem(key)!).choice).toBe("no");
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });
  it("does not ask again after a valid saved refusal", () => {
    localStorage.setItem(key, JSON.stringify({ choice: "no", expires: Date.now() + 86400000 }));
    render(<LandingAnalytics />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });
});
