import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sessions, seances, getWorkshop, getCenter, seanceStatus, colorForSession } from "@/data/seed";
import { fmtDayShort, fmtTime, addDaysISO, startOfWeekISO } from "@/lib/format";
import { SideDrawer } from "@/components/SideDrawer";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
});

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 8h..18h
const SLOT_H = 56; // px per hour

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CalendarPage() {
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeekISO(todayISO()));
  const [selected, setSelected] = useState<string | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));

  const eventsByDay = days.map((dayISO) => {
    return seances
      .filter((se) => se.start.startsWith(dayISO))
      .map((se) => {
        const sess = sessions.find((s) => s.id === se.sessionId)!;
        const ws = getWorkshop(sess.workshopId);
        const center = getCenter(sess.centerId);
        const status = seanceStatus(se.id);
        const m = se.start.match(/T(\d{2}):(\d{2})/)!;
        const startH = +m[1] + +m[2] / 60;
        return { se, sess, ws, center, status, startH };
      });
  });

  const selectedSeance = seances.find((s) => s.id === selected);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1300px] mx-auto">
      <header className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Calendrier</h1>
          <p className="text-[13px] text-ink-500 mt-1">Vue semaine — {fmtDayShort(days[0])} au {fmtDayShort(days[6])}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
          <button onClick={() => setWeekStart(startOfWeekISO(todayISO()))} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Aujourd'hui</button>
          <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
        </div>
      </header>

      <div className="rounded-xl border border-ink-150 bg-card overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div className="border-b border-r border-ink-150 bg-ink-50/40 h-12" />
          {days.map((d) => (
            <div key={d} className="border-b border-r border-ink-150 bg-ink-50/40 px-2 py-2 text-center last:border-r-0">
              <div className="text-[11px] uppercase tracking-wider text-ink-400">{fmtDayShort(d).split(" ")[0]}</div>
              <div className="text-[14px] font-semibold text-ink-900">{fmtDayShort(d).split(" ").slice(1).join(" ")}</div>
            </div>
          ))}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="text-right pr-2 border-r border-b border-ink-150 text-[10px] text-ink-400" style={{ height: SLOT_H }}>
                <span className="-mt-1.5 inline-block">{h}h</span>
              </div>
            ))}
          </div>
          {eventsByDay.map((events, di) => (
            <div key={di} className="relative border-r border-ink-150 last:border-r-0">
              {HOURS.map((h) => (
                <div key={h} className="border-b border-ink-150" style={{ height: SLOT_H }} />
              ))}
              {events.map(({ se, sess, ws, center, status, startH }) => {
                const top = (startH - 8) * SLOT_H;
                const height = (se.durationMin / 60) * SLOT_H;
                const color = colorForSession(sess.id);
                return (
                  <button
                    key={se.id}
                    onClick={() => setSelected(se.id)}
                    className="absolute left-1 right-1 rounded-md border px-2 py-1.5 text-left overflow-hidden hover:shadow-sm transition-shadow"
                    style={{
                      top, height,
                      backgroundColor: color.bg,
                      borderColor: color.border,
                      color: color.ink,
                    }}
                  >
                    <div className="text-[11px] font-semibold truncate">{ws.name}</div>
                    <div className="text-[10px] truncate opacity-80">{center.city} · S{se.index}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{fmtTime(se.start)} · {status}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        subtitle={selectedSeance ? "Séance" : undefined}
        title={selectedSeance ? `${getWorkshop(sessions.find((s) => s.id === selectedSeance.sessionId)!.workshopId).name}` : undefined}
      >
        {selectedSeance && (() => {
          const sess = sessions.find((s) => s.id === selectedSeance.sessionId)!;
          const center = getCenter(sess.centerId);
          return (
            <div className="space-y-4 text-[13px]">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Quand</div>
                <div className="text-ink-900">{fmtDayShort(selectedSeance.start)} · {fmtTime(selectedSeance.start)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Lieu</div>
                <div className="text-ink-900">{center.name}</div>
                <div className="text-ink-500">{center.address}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Groupe</div>
                <div className="text-ink-900">{sess.groupLabel} · Séance {selectedSeance.index}</div>
              </div>
            </div>
          );
        })()}
      </SideDrawer>
    </div>
  );
}
