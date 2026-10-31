import { z } from "zod";

export const REPORT_OPTIONS = [
  { id: "spr-pf-26", label: "SPR-PF-26 – ankieta KRI kwartalna" },
  { id: "spr-pf-27", label: "SPR-PF-27 – ankieta KRI roczna" },
  { id: "spr-pf-30", label: "SPR-PF-30 – KRI roczna (uproszczone ramy)" },
  { id: "spr-pf-18", label: "SPR-PF-18 – rejestr informacji" },
  { id: "spr-pf-01", label: "SPR-PF-01 – ryzyko i ramy ICT" },
  { id: "procedury", label: "Czynności z polityk i procedur" },
  { id: "inne", label: "Inne sprawozdania DORA" },
] as const;

export const REPORT_IDS = REPORT_OPTIONS.map((r) => r.id) as [
  (typeof REPORT_OPTIONS)[number]["id"],
  ...(typeof REPORT_OPTIONS)[number]["id"][],
];

export const ENTITY_TYPES = [
  "Bank / bank spółdzielczy",
  "Firma inwestycyjna / dom maklerski",
  "TFI / zarządzający funduszami",
  "Instytucja płatnicza / pieniądza elektronicznego",
  "Zakład ubezpieczeń / pośrednik",
  "Inny podmiot finansowy",
] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const tracking = z.string().trim().max(200).optional();

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Podaj imię i nazwisko")
    .max(120, "Maksymalnie 120 znaków"),
  company: z
    .string()
    .trim()
    .min(2, "Podaj nazwę instytucji")
    .max(160, "Maksymalnie 160 znaków"),
  email: z
    .string()
    .trim()
    .email("Podaj poprawny adres e-mail")
    .max(255, "Maksymalnie 255 znaków"),
  phone: z
    .string()
    .trim()
    .max(40, "Maksymalnie 40 znaków")
    .regex(/^[0-9+()\s-]*$/, "Podaj poprawny numer telefonu")
    .optional()
    .or(z.literal("")),
  entityType: optionalText(80),
  reports: z.array(z.enum(REPORT_IDS)).max(12).default([]),
  message: optionalText(2000),
  consent: z.boolean().refine((v) => v === true, {
    message: "Zgoda jest potrzebna, abyśmy mogli odpowiedzieć",
  }),
  // Honeypot: real visitors never fill this hidden field.
  website: z.string().max(200).optional(),
  attribution: z
    .object({
      utm_source: tracking,
      utm_medium: tracking,
      utm_campaign: tracking,
      utm_term: tracking,
      gclid: z.string().trim().max(300).optional(),
      landing_path: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
