import { CheckCircle2, FileSpreadsheet } from "lucide-react";

const COLS = ["A", "B", "C", "D"];
const ROWS = [
  ["Dostawca ICT", "Identyfikator", "Funkcja", "Status"],
  ["Dostawca chmury", "LEI ••••••", "Krytyczna", "ok"],
  ["Centrum danych", "LEI ••••••", "Istotna", "ok"],
  ["System core", "LEI ••••••", "Krytyczna", "ok"],
  ["Usługi SOC", "LEI ••••••", "Wspierająca", "ok"],
];

/** Illustrative spreadsheet card — shows the kind of work behind the service. */
export function SheetMockup() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl bg-sheet text-foreground shadow-float">
        <div className="flex items-center gap-2 border-b border-sheet-line bg-sheet-header px-4 py-3">
          <FileSpreadsheet className="size-4 text-success" aria-hidden />
          <span className="truncate font-mono text-xs text-muted-foreground">
            SPR-PF-18_rejestr_informacji.xlsx
          </span>
        </div>

        <div className="grid grid-cols-[2rem_repeat(4,minmax(0,1fr))] font-mono text-[11px] sm:text-xs">
          <div className="border-b border-r border-sheet-line bg-sheet-header" />
          {COLS.map((c) => (
            <div
              key={c}
              className="border-b border-r border-sheet-line bg-sheet-header py-1 text-center text-muted-foreground last:border-r-0"
            >
              {c}
            </div>
          ))}
          {ROWS.map((row, i) => (
            <div key={i} className="contents">
              <div className="border-b border-r border-sheet-line bg-sheet-header py-2 text-center text-muted-foreground">
                {i + 1}
              </div>
              {row.map((cell, j) => (
                <div
                  key={j}
                  className={`truncate border-b border-r border-sheet-line px-2 py-2 last:border-r-0 ${
                    i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {i > 0 && j === 3 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-success-soft px-1.5 py-0.5 text-success">
                      <CheckCircle2 className="size-3" aria-hidden /> OK
                    </span>
                  ) : (
                    cell
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-hidden border-t border-sheet-line bg-sheet-header px-2 pt-1 font-mono text-[11px]">
          {["B_01.01", "B_02.01", "B_05.01", "B_06.01"].map((t, i) => (
            <span
              key={t}
              className={`rounded-t px-2.5 py-1 ${
                i === 2 ? "bg-sheet font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-float sm:-left-8">
        <span className="flex size-8 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 className="size-4 text-success" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Walidacja zakończona</p>
          <p className="font-mono text-[11px] text-muted-foreground">0 błędów · gotowe do wysyłki</p>
        </div>
      </div>
    </div>
  );
}
