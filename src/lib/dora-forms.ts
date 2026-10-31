/**
 * DORA reporting forms as listed in the KNF overview
 * "Zestawienie obowiązków i formularzy sprawozdawczych".
 */
export const KNF_FORMS_SOURCE_URL =
  "https://www.knf.gov.pl/knf/pl/komponenty/img/Zestawienie_obowiazkow_i_formularzy_sprawozdawczych_91844.pdf";

export type DoraForm = {
  code: string;
  name: string;
  obligation: "Obligatoryjnie" | "Na żądanie" | "Dobrowolnie";
  when: string;
};

export const FORM_GROUPS: { title: string; forms: DoraForm[] }[] = [
  {
    title: "Kluczowe wskaźniki ryzyka ICT (KRI)",
    forms: [
      { code: "SPR-PF-26", name: "Ankieta KRI kwartalna — pełne ramy zarządzania ryzykiem ICT", obligation: "Obligatoryjnie", when: "Kwartalnie" },
      { code: "SPR-PF-27", name: "Ankieta KRI roczna — pełne ramy zarządzania ryzykiem ICT", obligation: "Obligatoryjnie", when: "Corocznie" },
      { code: "SPR-PF-30", name: "Ankieta KRI roczna — uproszczone ramy zarządzania ryzykiem ICT", obligation: "Obligatoryjnie", when: "Corocznie" },
    ],
  },
  {
    title: "Rejestr informacji i dostawcy ICT",
    forms: [
      { code: "SPR-PF-17", name: "Roczne sprawozdanie o nowych ustaleniach dotyczących usług ICT", obligation: "Obligatoryjnie", when: "Raz w roku, w terminie ESA" },
      { code: "SPR-PF-18", name: "Pełny rejestr informacji lub inny zakres wskazany w żądaniu", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-19", name: "Planowane umowy ICT wspierające funkcje krytyczne lub istotne", obligation: "Obligatoryjnie", when: "14 dni przed zawarciem umowy" },
      { code: "SPR-PF-20", name: "Umowy ICT dla funkcji, które stały się krytyczne lub istotne", obligation: "Obligatoryjnie", when: "14 dni od zmiany funkcji" },
      { code: "SPR-PF-21", name: "Ryzyko dostawców z uwzględnieniem zaleceń dla CTPP", obligation: "Na żądanie", when: "W terminie z żądania" },
    ],
  },
  {
    title: "Ramy zarządzania ryzykiem ICT",
    forms: [
      { code: "SPR-PF-00", name: "Podstawowe informacje o podmiocie finansowym", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-01", name: "Informacje o ryzyku ICT oraz ramach zarządzania ryzykiem ICT", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-02", name: "Przegląd ram zarządzania ryzykiem ICT", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-06", name: "Przegląd uproszczonych ram zarządzania ryzykiem ICT", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-03", name: "Wyniki testów ciągłości działania ICT (CDPW)", obligation: "Obligatoryjnie", when: "Po zajściu zdarzenia" },
    ],
  },
  {
    title: "Incydenty i cyberzagrożenia",
    forms: [
      { code: "SPR-PF-07", name: "Wstępne powiadomienie o poważnym incydencie ICT", obligation: "Obligatoryjnie", when: "4 h od klasyfikacji, maks. 24 h" },
      { code: "SPR-PF-08", name: "Sprawozdanie śródokresowe o poważnym incydencie ICT", obligation: "Obligatoryjnie", when: "72 h od powiadomienia" },
      { code: "SPR-PF-09", name: "Sprawozdanie końcowe o poważnym incydencie ICT", obligation: "Obligatoryjnie", when: "Miesiąc po śródokresowym" },
      { code: "SPR-PF-04", name: "Roczne koszty i straty z poważnych incydentów ICT", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-05", name: "Zmiany wprowadzone po przeglądzie poważnego incydentu", obligation: "Na żądanie", when: "W terminie z żądania" },
      { code: "SPR-PF-10", name: "Powiadomienie o znaczącym cyberzagrożeniu", obligation: "Dobrowolnie", when: "Po wystąpieniu zagrożenia" },
      { code: "SPR-PF-22", name: "Przystąpienie do wymiany informacji o cyberzagrożeniach lub jej opuszczenie", obligation: "Obligatoryjnie", when: "Po zmianie członkostwa" },
    ],
  },
];
