export type ContactSection =
  "header" | "hero" | "scope" | "process" | "contact" | "footer" | "sticky" | "related";
export interface AnalyticsEnvironment {
  hostname: string;
  href: string;
  referrer: string;
  enabled?: boolean;
  send: (...args: unknown[]) => void;
  load: (measurementId: string) => void;
}
export interface LandingTracker {
  mode: "production" | "preview";
  setConsent: (allowed: boolean) => void;
  track: (
    name: string,
    params?: {
      section?: ContactSection;
      method?: "phone" | "email" | "external_form" | "onsite_form";
    },
  ) => void;
  recordLeadAcknowledged: (result?: {
    accepted?: boolean;
    demo?: boolean;
    submissionId?: string;
  }) => void;
}
export function createAnalytics(environment: AnalyticsEnvironment): LandingTracker;
