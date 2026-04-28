import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { providers, availabilities } from "@/data/seed";
import type { RoleName } from "@/data/types";
import { fmtDayShort, addDaysISO, startOfWeekISO, getDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/app/availability")({
  component: AvailabilityPage,
});

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_H = 48;

const ALL_ROLES: (RoleName | "all")[] = [
  "all", "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AvailabilityPage() {
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeekISO(todayISO()));
  const [role, setRole] = useState<RoleName | "all">("all");
  const [picked, setPicked] = useState<{ providerId: string; dayISO: string; hour: number } | null>(null);

  const visibleProviders = providers.filter((p) => role === "all" || p.roles.includes(role));
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));

  function isAvail(providerId: string, dayISO: string, hour: number) {
    const av = availabilities.find((a) => a.providerId === providerId);
    if (!av) return false;
    if (av.blockedDates.includes(dayISO)) return false;
    const realDow = getDate(dayISO).dow;
    const dow = realDow === 0 ? 7 : realDow;
    const day = av.recurring.find((r) => r.dow === dow);
    if (!day) return false;
    return day.ranges.some((r) => {
      const [a, b] = r.split("-").map((s) => +s.split(":")[0]);
      return hour >= a && hour < b;
    });
  }

  // Compte agrégé : nombre de prestataires dispos par cellule
  const matrix = useMemo(() => {
    return days.map((d) => HOURS.map((h) => visibleProviders.filter((p) => isAvail(p.id, d, h)).length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, visibleProviders]);

  const pickedProvider = picked ? providers.find((p) => p.id === picked.providerId) : null;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1300px] mx-auto">
      <header className="flex items-end justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Disponibilités prestataires</h1>
          <p className="text-[13px] text-ink-500 mt-1">Cliquez sur un créneau pour réserver un prestataire.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
          <button onClick={() => setWeekStart(startOfWeekISO(todayISO()))} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Cette semaine</button>
          <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
        </div>
      </header>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={role} onChange={(e) => setRole(e.target.value as RoleName | "all")}
          className="h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
          {ALL_ROLES.map((r) => <option key={r} value={r}>{r === "all" ? "Tous les rôles" : r}</option>)}
        </select>
        <span className="text-[12px] text-ink-500">{visibleProviders.length} prestataire{visibleProviders.length > 1 ? "s" : ""}</span>
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
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="text-right pr-2 border-r border-b border-ink-150 text-[10px] text-ink-400" style={{ height: SLOT_H }}>
                <span className="-mt-1.5 inline-block">{h}h</span>
              </div>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className="relative border-r border-ink-150 last:border-r-0">
              {HOURS.map((h, hi) => {
                const count = matrix[di][hi];
                const intensity = Math.min(count / Math.max(visibleProviders.length, 1), 1);
                const bg = count === 0
                  ? "transparent"
                  : `color-mix(in oklab, var(--s-confirmed-bg) ${20 + intensity * 80}%, transparent)`;
                return (
                  <button
                    key={h}
                    disabled={count === 0}
                    onClick={() => {
                      const free = visibleProviders.filter((p) => isAvail(p.id, d, h));
                      if (free[0]) setPicked({ providerId: free[0].id, dayISO: d, hour: h });
                    }}
                    className="w-full block border-b border-ink-150 transition-colors hover:bg-accent-soft/60 disabled:cursor-not-allowed text-[10px] text-ink-700"
                    style={{ height: SLOT_H, backgroundColor: bg }}
                    title={count === 0 ? "Aucun prestataire dispo" : `${count} prestataire${count > 1 ? "s" : ""} dispo`}
                  >
                    {count > 0 ? count : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {picked && pickedProvider && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-40 rounded-xl border border-ink-200 bg-card shadow-xl p-4">
          <div className="flex items-start gap-3">
            <Avatar name={pickedProvider.fullName} size={40} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">{pickedProvider.fullName}</div>
              <div className="text-[12px] text-ink-500">{pickedProvider.roles.join(", ")}</div>
              <div className="text-[12px] text-ink-700 mt-1">
                {fmtDayShort(picked.dayISO)} · {picked.hour}h00
              </div>
            </div>
            <button onClick={() => setPicked(null)} className="text-ink-400 hover:text-ink-900">✕</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setPicked(null)} className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
              Envoyer la demande
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
