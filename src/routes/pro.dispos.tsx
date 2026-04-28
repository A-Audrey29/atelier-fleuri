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
const PROVIDER_ID = "p1";

const DOW_LABELS = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface RecurringRange { start: string; end: string }
interface RecurringDay { enabled: boolean; ranges: RecurringRange[] }

const initialRecurring: RecurringDay[] = [
  { enabled: true, ranges: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { enabled: true, ranges: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { enabled: true, ranges: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { enabled: true, ranges: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { enabled: true, ranges: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { enabled: false, ranges: [] },
  { enabled: false, ranges: [] },
];

function DisposPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeekISO(todayISO()));
  const [monthCursor, setMonthCursor] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"recurring" | "exceptions">("recurring");
  const [recurring, setRecurring] = useState<RecurringDay[]>(initialRecurring);
  const [exceptions, setExceptions] = useState<Array<{ date: string; type: "blocked" | "extra"; ranges?: RecurringRange[] }>>([]);

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

  function isAvail(dayISO: string, hour: number) {
    const ex = exceptions.find((e) => e.date === dayISO);
    if (ex?.type === "blocked") return false;
    if (ex?.type === "extra" && ex.ranges) {
      return ex.ranges.some((r) => +r.start.split(":")[0] <= hour && +r.end.split(":")[0] > hour);
    }
    const realDow = getDate(dayISO).dow;
    const matrixDow = realDow === 0 ? 6 : realDow - 1;
    const day = recurring[matrixDow];
    if (!day.enabled) return false;
    return day.ranges.some((r) => +r.start.split(":")[0] <= hour && +r.end.split(":")[0] > hour);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1300px] mx-auto">
      <header className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Mes disponibilités</h1>
          <p className="text-[13px] text-ink-500 mt-1">Vos créneaux disponibles et vos interventions confirmées.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-ink-200 bg-card overflow-hidden">
            {(["week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 h-8 text-[12px] font-medium ${view === v ? "bg-ink-900 text-paper" : "text-ink-500 hover:bg-ink-50"}`}>
                {v === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditorOpen(true)}
            className="h-8 px-3 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-700"
          >
            + Modifier mes disponibilités
          </button>
        </div>
      </header>

      {view === "week" ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
            <button onClick={() => setWeekStart(startOfWeekISO(todayISO()))} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Cette semaine</button>
            <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
            <span className="text-[12px] text-ink-500 ml-2">{fmtDayShort(days[0])} → {fmtDayShort(days[6])}</span>
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
              {days.map((d) => {
                const events = bookingsForDay(d);
                return (
                  <div key={d} className="relative border-r border-ink-150 last:border-r-0">
                    {HOURS.map((h) => {
                      const avail = isAvail(d, h);
                      return (
                        <div
                          key={h}
                          className={`w-full block border-b border-ink-150 ${avail ? "bg-s-confirmed-bg/60" : "bg-ink-50/30"}`}
                          style={{ height: SLOT_H }}
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
        </>
      ) : (
        <MonthView
          y={monthCursor.y} m={monthCursor.m}
          onPrev={() => setMonthCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))}
          onNext={() => setMonthCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))}
          onToday={() => { const d = new Date(); setMonthCursor({ y: d.getFullYear(), m: d.getMonth() }); }}
          isAvail={isAvail}
          bookings={bookings}
          onBookingClick={setSelected}
        />
      )}

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        subtitle={selectedBooking ? "Intervention confirmée" : undefined}
        title={selectedBooking ? selectedBooking.workshop.name : undefined}
        footer={
          selectedBooking ? (
            <div className="flex gap-2">
              <button className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">Voir l'itinéraire</button>
              <button className="h-9 px-3 rounded-md border border-ink-200 text-[13px] text-ink-500 hover:bg-ink-50">Signaler un empêchement</button>
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
              <Detail term="Session" def={selectedBooking.session.groupLabel} />
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
            <CommentsThread seanceId={selectedBooking.seance.id} currentRole="provider" currentName="Marie-Laure Cadet" />
          </div>
        )}
      </SideDrawer>

      {/* Editor modal — Calendly-like */}
      <SideDrawer
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        subtitle="Planning"
        title="Modifier mes disponibilités"
        width={460}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setEditorOpen(false)} className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
              Enregistrer
            </button>
            <button onClick={() => setEditorOpen(false)} className="h-9 px-3 rounded-md border border-ink-200 text-[13px] text-ink-500 hover:bg-ink-50">
              Annuler
            </button>
          </div>
        }
      >
        <div className="flex gap-1 mb-4 border-b border-ink-150">
          {(["recurring", "exceptions"] as const).map((t) => (
            <button key={t} onClick={() => setEditorTab(t)}
              className={`relative px-3 py-2 text-[13px] font-medium ${editorTab === t ? "text-ink-900" : "text-ink-400 hover:text-ink-700"}`}>
              {t === "recurring" ? "Récurrent" : "Exceptions"}
              {editorTab === t && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink-900" />}
            </button>
          ))}
        </div>

        {editorTab === "recurring" && (
          <div className="space-y-3">
            <p className="text-[12px] text-ink-500">
              Définissez vos plages horaires habituelles pour chaque jour de la semaine.
            </p>
            {recurring.map((day, idx) => (
              <div key={idx} className="rounded-lg border border-ink-150 bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="inline-flex items-center gap-2 text-[13px] font-medium">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(e) => setRecurring((r) => r.map((d, i) => i === idx ? { ...d, enabled: e.target.checked, ranges: e.target.checked && d.ranges.length === 0 ? [{ start: "09:00", end: "17:00" }] : d.ranges } : d))}
                    />
                    {DOW_LABELS[idx]}
                  </label>
                  {day.enabled && (
                    <button
                      onClick={() => setRecurring((r) => r.map((d, i) => i === idx ? { ...d, ranges: [...d.ranges, { start: "14:00", end: "17:00" }] } : d))}
                      className="text-[12px] text-accent-ink hover:underline"
                    >+ Plage</button>
                  )}
                </div>
                {day.enabled ? (
                  <div className="space-y-1.5">
                    {day.ranges.map((r, ri) => (
                      <div key={ri} className="flex items-center gap-2">
                        <input type="time" value={r.start}
                          onChange={(e) => setRecurring((rr) => rr.map((d, i) => i === idx ? { ...d, ranges: d.ranges.map((rg, rgi) => rgi === ri ? { ...rg, start: e.target.value } : rg) } : d))}
                          className="h-8 w-24 rounded-md border border-ink-200 bg-card px-2 text-[13px]" />
                        <span className="text-ink-400">→</span>
                        <input type="time" value={r.end}
                          onChange={(e) => setRecurring((rr) => rr.map((d, i) => i === idx ? { ...d, ranges: d.ranges.map((rg, rgi) => rgi === ri ? { ...rg, end: e.target.value } : rg) } : d))}
                          className="h-8 w-24 rounded-md border border-ink-200 bg-card px-2 text-[13px]" />
                        <button
                          onClick={() => setRecurring((rr) => rr.map((d, i) => i === idx ? { ...d, ranges: d.ranges.filter((_, rgi) => rgi !== ri) } : d))}
                          className="h-7 w-7 grid place-items-center text-ink-400 hover:text-ink-900"
                          aria-label="Supprimer"
                        >×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-ink-400">Indisponible</p>
                )}
              </div>
            ))}
          </div>
        )}

        {editorTab === "exceptions" && (
          <div className="space-y-3">
            <p className="text-[12px] text-ink-500">
              Bloquez ou ajoutez une disponibilité ponctuelle sur une date précise.
            </p>
            <button
              onClick={() => setExceptions((e) => [...e, { date: todayISO(), type: "blocked" }])}
              className="w-full h-9 rounded-md border border-dashed border-ink-300 text-[13px] text-ink-700 hover:bg-ink-50"
            >+ Ajouter une exception</button>
            {exceptions.map((ex, idx) => (
              <div key={idx} className="rounded-lg border border-ink-150 bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input type="date" value={ex.date}
                    onChange={(e) => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, date: e.target.value } : x))}
                    className="flex-1 h-8 rounded-md border border-ink-200 bg-card px-2 text-[13px]" />
                  <select value={ex.type}
                    onChange={(e) => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, type: e.target.value as "blocked" | "extra", ranges: e.target.value === "extra" ? [{ start: "09:00", end: "12:00" }] : undefined } : x))}
                    className="h-8 rounded-md border border-ink-200 bg-card px-2 text-[13px]">
                    <option value="blocked">Indisponible</option>
                    <option value="extra">Disponible</option>
                  </select>
                  <button onClick={() => setExceptions((arr) => arr.filter((_, i) => i !== idx))}
                    className="h-7 w-7 grid place-items-center text-ink-400 hover:text-ink-900">×</button>
                </div>
                {ex.type === "extra" && ex.ranges && (
                  <div className="space-y-1.5 pl-2">
                    {ex.ranges.map((r, ri) => (
                      <div key={ri} className="flex items-center gap-2">
                        <input type="time" value={r.start}
                          onChange={(e) => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, ranges: x.ranges!.map((rg, rgi) => rgi === ri ? { ...rg, start: e.target.value } : rg) } : x))}
                          className="h-8 w-24 rounded-md border border-ink-200 bg-card px-2 text-[13px]" />
                        <span className="text-ink-400">→</span>
                        <input type="time" value={r.end}
                          onChange={(e) => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, ranges: x.ranges!.map((rg, rgi) => rgi === ri ? { ...rg, end: e.target.value } : rg) } : x))}
                          className="h-8 w-24 rounded-md border border-ink-200 bg-card px-2 text-[13px]" />
                        <button
                          onClick={() => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, ranges: x.ranges!.filter((_, rgi) => rgi !== ri) } : x))}
                          className="h-7 w-7 grid place-items-center text-ink-400 hover:text-ink-900"
                          aria-label="Supprimer"
                        >×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setExceptions((arr) => arr.map((x, i) => i === idx ? { ...x, ranges: [...(x.ranges ?? []), { start: "14:00", end: "17:00" }] } : x))}
                      className="text-[12px] text-accent-ink hover:underline"
                    >+ Plage horaire</button>
                  </div>
                )}
              </div>
            ))}
            {exceptions.length === 0 && (
              <p className="text-[12px] text-ink-400 text-center py-4">Aucune exception définie.</p>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

function MonthView({
  y, m, onPrev, onNext, onToday, isAvail, bookings, onBookingClick,
}: {
  y: number; m: number;
  onPrev: () => void; onNext: () => void; onToday: () => void;
  isAvail: (dayISO: string, hour: number) => boolean;
  bookings: ReturnType<typeof bookingsForProvider>;
  onBookingClick: (id: string) => void;
}) {
  const monthName = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][m];
  const first = new Date(Date.UTC(y, m, 1));
  const firstDow = first.getUTCDay() === 0 ? 7 : first.getUTCDay();
  const offset = firstDow - 1;
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: Array<{ date?: string; d?: number }> = [];
  for (let i = 0; i < offset; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: iso, d });
  }
  while (cells.length % 7 !== 0) cells.push({});

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onPrev} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
        <button onClick={onToday} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Aujourd'hui</button>
        <button onClick={onNext} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
        <span className="text-[14px] font-semibold ml-2 capitalize">{monthName} {y}</span>
      </div>

      <div className="rounded-xl border border-ink-150 bg-card overflow-hidden">
        <div className="grid grid-cols-7 bg-ink-50/40 border-b border-ink-150">
          {DOW_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-ink-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            if (!c.date) return <div key={i} className="border-r border-b border-ink-150 bg-ink-50/30 min-h-[96px] last:border-r-0" />;
            const isToday = c.date === todayISO();
            const dayBookings = bookings.filter((b) => b.seance.start.startsWith(c.date!));
            const availCount = HOURS.filter((h) => isAvail(c.date!, h)).length;
            return (
              <div key={i} className={`border-r border-b border-ink-150 min-h-[96px] p-1.5 last:border-r-0 ${isToday ? "bg-accent-soft/30" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[12px] font-medium ${isToday ? "text-accent-ink" : "text-ink-900"}`}>{c.d}</span>
                  {availCount > 0 && (
                    <span className="text-[10px] text-s-confirmed-ink bg-s-confirmed-bg border border-s-confirmed-border rounded-full px-1.5">{availCount}h</span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayBookings.map((b) => (
                    <button
                      key={b.seance.id}
                      onClick={() => onBookingClick(b.seance.id)}
                      className="w-full text-left rounded-sm bg-accent-soft border border-accent px-1.5 py-0.5 text-[10px] truncate hover:shadow-sm"
                      style={{ color: "var(--accent-ink)" }}
                    >
                      {fmtTime(b.seance.start)} {b.workshop.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
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

// Avoid double-importing getCenter from above (kept for usage parity)
void getCenter;
