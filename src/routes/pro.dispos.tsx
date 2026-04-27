import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { bookingsForProvider, getCenter } from "@/data/seed";
import { fmtDayShort, fmtTime, addDaysISO, startOfWeekISO, fmtTimeRange, getDate } from "@/lib/format";
import { SideDrawer } from "@/components/SideDrawer";
import { CommentsThread } from "@/components/CommentsThread";

export const Route = createFileRoute("/pro/dispos")({
  component: DisposPage,
});

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_H = 56;
const PROVIDER_ID = "p1"; // Marie-Laure Cadet, démo

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DisposPage() {
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeekISO(todayISO()));
  const [tab, setTab] = useState<"recurring" | "exceptions">("recurring");
  const [selected, setSelected] = useState<string | null>(null);
  // Récurrent: matrix [dow 0..6][hour 8..18] = available
  const [matrix, setMatrix] = useState<boolean[][]>(() =>
    Array.from({ length: 7 }, (_, dow) =>
      Array.from({ length: HOURS.length }, () => dow >= 1 && dow <= 5),
    ),
  );

  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const bookings = useMemo(() => bookingsForProvider(PROVIDER_ID), []);
  const selectedBooking = bookings.find((b) => b.seance.id === selected);

  function bookingsForDay(dayISO: string) {
    return bookings
      .filter((b) => b.seance.start.startsWith(dayISO))
      .map((b) => {
        const m = b.seance.start.match(/T(\d{2}):(\d{2})/)!;
        const startH = +m[1] + +m[2] / 60;
        return { ...b, startH };
      });
  }

  function toggleCell(dow: number, hourIdx: number) {
    setMatrix((m) => {
      const c = m.map((r) => [...r]);
      c[dow][hourIdx] = !c[dow][hourIdx];
      return c;
    });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1300px] mx-auto">
      <header className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Mes disponibilités</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Vos créneaux disponibles et vos interventions confirmées.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
          <button onClick={() => setWeekStart(startOfWeekISO(todayISO()))} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Cette semaine</button>
          <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
        </div>
      </header>

      <div className="flex gap-1 mb-4 border-b border-ink-150">
        {(["recurring", "exceptions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "relative px-3 py-2 text-[13px] font-medium transition-colors",
              tab === t ? "text-ink-900" : "text-ink-400 hover:text-ink-700",
            ].join(" ")}
          >
            {t === "recurring" ? "Récurrent" : "Exceptions"}
            {tab === t && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink-900" />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-ink-500 mb-3">
        <Legend swatch="bg-ink-50 border-ink-200" label="Indisponible" />
        <Legend swatch="bg-s-confirmed-bg border-s-confirmed-border" label="Disponible" />
        <Legend swatch="bg-accent-soft border-accent" label="Booking confirmé" />
      </div>

      <div className="rounded-xl border border-ink-150 bg-card overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div className="border-b border-r border-ink-150 bg-ink-50/40 h-12" />
          {days.map((d) => {
            const p = getDate(d);
            const isToday = d === todayISO();
            return (
              <div key={d} className={`border-b border-r border-ink-150 px-2 py-2 text-center last:border-r-0 ${isToday ? "bg-accent-soft/40" : "bg-ink-50/40"}`}>
                <div className="text-[11px] uppercase tracking-wider text-ink-400">{fmtDayShort(d).split(" ")[0]}</div>
                <div className={`text-[14px] font-semibold ${isToday ? "text-accent-ink" : "text-ink-900"}`}>{p.d}</div>
              </div>
            );
          })}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="text-right pr-2 border-r border-b border-ink-150 text-[10px] text-ink-400" style={{ height: SLOT_H }}>
                <span className="-mt-1.5 inline-block">{h}h</span>
              </div>
            ))}
          </div>
          {days.map((d, di) => {
            // dow: 0=dim, 1=lun ... ; matrix indexé 0=lun, 6=dim
            const realDow = getDate(d).dow; // 0..6 (0=dim)
            const matrixDow = realDow === 0 ? 6 : realDow - 1;
            const events = bookingsForDay(d);
            return (
              <div key={d} className="relative border-r border-ink-150 last:border-r-0">
                {HOURS.map((h, hi) => {
                  const avail = matrix[matrixDow][hi];
                  return (
                    <button
                      key={h}
                      onClick={() => tab === "recurring" && toggleCell(matrixDow, hi)}
                      className={[
                        "w-full block border-b border-ink-150 transition-colors",
                        avail ? "bg-s-confirmed-bg/60 hover:bg-s-confirmed-bg" : "bg-ink-50/30 hover:bg-ink-50",
                      ].join(" ")}
                      style={{ height: SLOT_H }}
                      aria-label={`${avail ? "Disponible" : "Indisponible"} ${h}h ${fmtDayShort(d)}`}
                    />
                  );
                })}
                {events.map(({ seance, session, center, workshop, startH }) => {
                  const top = (startH - 8) * SLOT_H;
                  const height = (seance.durationMin / 60) * SLOT_H;
                  return (
                    <button
                      key={seance.id}
                      onClick={() => setSelected(seance.id)}
                      className="absolute left-1 right-1 rounded-md border-2 px-2 py-1.5 text-left overflow-hidden hover:shadow-md transition-shadow bg-accent-soft border-accent"
                      style={{ top, height, color: "var(--accent-ink)" }}
                    >
                      <div className="text-[11px] font-semibold truncate">{workshop.name}</div>
                      <div className="text-[10px] truncate opacity-90">{center.name}</div>
                      <div className="text-[10px] mt-0.5 opacity-75">{fmtTime(seance.start)} · S{seance.index} · {session.groupLabel}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        subtitle={selectedBooking ? "Intervention confirmée" : undefined}
        title={selectedBooking ? selectedBooking.workshop.name : undefined}
        footer={
          selectedBooking ? (
            <div className="flex gap-2">
              <button className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
                Voir l'itinéraire
              </button>
              <button className="h-9 px-3 rounded-md border border-ink-200 text-[13px] text-ink-500 hover:bg-ink-50">
                Signaler un empêchement
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedBooking && (
          <div className="space-y-5 text-[13px]">
            <Section label="Quand">
              <div className="text-ink-900 font-medium">{fmtDayShort(selectedBooking.seance.start)}</div>
              <div className="text-ink-500">{fmtTimeRange(selectedBooking.seance.start, selectedBooking.seance.durationMin)}</div>
            </Section>

            <Section label="Centre social">
              <div className="text-ink-900 font-medium">{selectedBooking.center.name}</div>
              <div className="text-ink-500">{selectedBooking.center.address}</div>
              <div className="mt-2 pt-2 border-t border-ink-150">
                <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Référent famille</div>
                <div className="text-ink-900">{selectedBooking.center.contactName}</div>
                <a href={`tel:${selectedBooking.center.contactPhone.replace(/\s/g, "")}`} className="text-accent-ink hover:underline">
                  {selectedBooking.center.contactPhone}
                </a>
              </div>
            </Section>

            <Section label="Détails séance">
              <Detail term="Atelier" def={selectedBooking.workshop.name} />
              <Detail term="Session" def={`${selectedBooking.session.groupLabel}`} />
              <Detail term="Séance" def={`n°${selectedBooking.seance.index}`} />
              <Detail term="Salle" def={selectedBooking.session.room ?? "—"} />
              <Detail term="Public" def={selectedBooking.session.audience ?? "—"} />
              {selectedBooking.session.notes && (
                <div className="mt-2 pt-2 border-t border-ink-150">
                  <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Notes du référent</div>
                  <p className="text-ink-700 leading-relaxed">{selectedBooking.session.notes}</p>
                </div>
              )}
            </Section>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink-150 bg-card p-3.5">
      <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-2">{label}</div>
      {children}
    </section>
  );
}

function Detail({ term, def }: { term: string; def: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-[13px]">
      <dt className="text-ink-500">{term}</dt>
      <dd className="text-ink-900 font-medium text-right">{def}</dd>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-4 rounded-sm border ${swatch}`} />
      {label}
    </span>
  );
}
