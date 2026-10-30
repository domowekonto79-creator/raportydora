import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SITE } from "@/lib/site";

const TITLE = "Polityka prywatności – DORA as a Service";
const DESCRIPTION = "Informacje o przetwarzaniu danych osobowych przesłanych przez formularz kontaktowy.";

export const Route = createFileRoute("/polityka-prywatnosci")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const admin =
    [SITE.companyName, SITE.companyAddress].filter(Boolean).join(", ") ||
    "[nazwa i adres firmy – do uzupełnienia]";
  const contact = SITE.email || "[adres e-mail – do uzupełnienia]";

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal hover:underline">
        <ArrowLeft className="size-4" /> Strona główna
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Polityka prywatności</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Administrator danych:</strong> {admin}. Kontakt w
          sprawie danych: {contact}.
        </p>
        <p>
          <strong className="text-foreground">Jakie dane zbieramy:</strong> imię i nazwisko, nazwę
          instytucji, adres e-mail, opcjonalnie numer telefonu, rodzaj podmiotu, wybrany zakres
          usług i treść wiadomości przesłane przez formularz kontaktowy. Zapisujemy także informację
          o kampanii reklamowej, z której trafiłeś na stronę (np. parametry UTM).
        </p>
        <p>
          <strong className="text-foreground">Cel:</strong> odpowiedź na zapytanie i przygotowanie
          oferty usługi DORA as a Service, na podstawie Twojej zgody.
        </p>
        <p>
          <strong className="text-foreground">Twoje prawa:</strong> możesz w każdej chwili cofnąć
          zgodę, zażądać dostępu do danych, ich poprawienia lub usunięcia, pisząc na adres podany
          powyżej. Przysługuje Ci też skarga do Prezesa UODO.
        </p>
      </div>
    </main>
  );
}
