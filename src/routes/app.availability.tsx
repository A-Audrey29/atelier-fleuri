import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { providers, availabilities } from "@/data/seed";
import { workshopsStore, useStore } from "@/data/store";
import type { RoleName, Provider } from "@/data/types";
import { fmtDayShort, addDaysISO, startOfWeekISO, getDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { ROLE_COLORS, ALL_ROLES_LIST, RoleDot } from "@/lib/roleColors";

export const Route = createFileRoute("/app/availability")({
  validateSearch: (s: Record<string, unknown>) => ({
    workshopId: typeof s.workshopId === "string" ? s.workshopId : "",
    // Indices des slots actifs (séparés par ","), ex. "0,2"
    slots: typeof s.slots === "string" ? s.slots : "",
  }),
  component: AvailabilityPage,
});

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_H = 56;
const DOW_LABELS = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

const ALL_ROLES: (RoleName | "all")[] = ["all", ...ALL_ROLES_LIST];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AvailabilityPage() {
  const search = useSearch({ from: "/app/availability" });
  const workshops = useStore(workshopsStore);
  const [view, setView] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeekISO(todayISO()));
  const [monthCursor, setMonthCursor] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [workshopId, setWorkshopId] = useState<string>(search.workshopId ?? "");
  const selectedWorkshop = workshops.find((w) => w.id === workshopId) ?? null;

  const [role, setRole] = useState<RoleName | "all">("all");
  // Slots actifs (sous-ensemble des requiredRoles de l'atelier)
  const activeSlots = useMemo(() => {
    if (!selectedWorkshop) return null;
    if (!search.slots) return selectedWorkshop.requiredRoles;
    const idxs = new Set(search.slots.split(",").map((x: string) => +x));
    return selectedWorkshop.requiredRoles.filter((_, i) => idxs.has(i));
  }, [selectedWorkshop, search.slots]);
  const allowedRoles: RoleName[] | null = activeSlots
    ? Array.from(new Set(activeSlots.flatMap((s) => s.acceptedRoles)))
    : null;
  const effectiveRoleFilter: RoleName | "all" = allowedRoles ? "all" : role;

  const [picked, setPicked] = useState<{ dayISO: string; hour: number } | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const visibleProviders = useMemo(() => {
    return providers.filter((p) => {
      if (allowedRoles) return p.roles.some((r) => allowedRoles.includes(r));
      return effectiveRoleFilter === "all" || p.roles.includes(effectiveRoleFilter);
    });
  }, [allowedRoles, effectiveRoleFilter]);

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

  /** Pour un créneau : liste des prestataires libres (filtrés) puis rôles uniques. */
  function freeAt(dayISO: string, hour: number) {
    return visibleProviders.filter((p) => isAvail(p.id, dayISO, hour));
  }

  function rolesAt(dayISO: string, hour: number): RoleName[] {
    const free = freeAt(dayISO, hour);
    const set = new Set<RoleName>();
    free.forEach((p) => p.roles.forEach((r) => {
      if (!allowedRoles || allowedRoles.includes(r)) set.add(r);
    }));
    return Array.from(set);
  }

  function rolesForDay(dayISO: string): RoleName[] {
    const set = new Set<RoleName>();
    HOURS.forEach((h) => rolesAt(dayISO, h).forEach((r) => set.add(r)));
    return Array.from(set);
  }

  function countForDay(dayISO: string) {
    return HOURS.reduce((acc, h) => acc + (freeAt(dayISO, h).length > 0 ? 1 : 0), 0);
  }

  const legendRoles: RoleName[] = allowedRoles ?? ALL_ROLES_LIST;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1300px] mx-auto">
      <header className="flex items-end justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Disponibilités prestataires</h1>
          <p className="text-[13px] text-ink-500 mt-1">Cliquez sur un créneau pour voir les prestataires disponibles.</p>
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
          {view === "week" ? (
            <>
              <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
              <button onClick={() => setWeekStart(startOfWeekISO(todayISO()))} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Cette semaine</button>
              <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
            </>
          ) : (
            <>
              <button onClick={() => setMonthCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">‹</button>
              <button onClick={() => { const d = new Date(); setMonthCursor({ y: d.getFullYear(), m: d.getMonth() }); }} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-ink-50">Aujourd'hui</button>
              <button onClick={() => setMonthCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))} className="h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50">›</button>
            </>
          )}
        </div>
      </header>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}
          className="h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
          <option value="">Tous les ateliers</option>
          {workshops.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value as RoleName | "all")}
          disabled={!!allowedRoles}
          className="h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed">
          {ALL_ROLES.map((r) => <option key={r} value={r}>{r === "all" ? "Tous les rôles" : r}</option>)}
        </select>
        {selectedWorkshop && (
          <span className="text-[11px] text-accent-ink bg-accent-soft border border-accent/30 rounded-full px-2.5 py-1">
            Filtré sur : {selectedWorkshop.requiredRoles.join(" · ")}
          </span>
        )}
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="h-9 px-3 rounded-md border border-ink-200 text-[12px] text-ink-700 hover:bg-ink-50"
        >
          {legendOpen ? "Masquer la légende" : "Légende des rôles"}
        </button>
        <span className="text-[12px] text-ink-500 ml-auto">{visibleProviders.length} prestataire{visibleProviders.length > 1 ? "s" : ""}</span>
      </div>

      {legendOpen && (
        <div className="rounded-lg border border-ink-150 bg-card px-3 py-2 mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {legendRoles.map((r) => (
            <span key={r} className="inline-flex items-center gap-1.5 text-[12px] text-ink-700">
              <RoleDot role={r} size={9} />
              {r}
            </span>
          ))}
        </div>
      )}

      {view === "week" ? (
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
            {days.map((d) => (
              <div key={d} className="relative border-r border-ink-150 last:border-r-0">
                {HOURS.map((h) => {
                  const free = freeAt(d, h);
                  const count = free.length;
                  const roles = rolesAt(d, h);
                  const intensity = Math.min(count / Math.max(visibleProviders.length, 1), 1);
                  const bg = count === 0
                    ? "transparent"
                    : `color-mix(in oklab, var(--s-confirmed-bg) ${15 + intensity * 60}%, transparent)`;
                  const tooltip = free
                    .map((p) => `${p.roles.filter((r) => !allowedRoles || allowedRoles.includes(r)).join(", ")} — ${p.fullName}`)
                    .join("\n");
                  return (
                    <button
                      key={h}
                      disabled={count === 0}
                      onClick={() => setPicked({ dayISO: d, hour: h })}
                      className="w-full block border-b border-ink-150 transition-colors hover:bg-accent-soft/60 disabled:cursor-not-allowed text-left px-1.5 py-1"
                      style={{ height: SLOT_H, backgroundColor: bg }}
                      title={tooltip || "Aucun prestataire dispo"}
                    >
                      {count > 0 && (
                        <div className="flex flex-col h-full justify-between">
                          <span className="text-[10px] text-ink-500 leading-none">{count}</span>
                          <div className="flex flex-wrap gap-[3px]">
                            {roles.slice(0, 6).map((r) => <RoleDot key={r} role={r} size={7} />)}
                            {roles.length > 6 && <span className="text-[9px] text-ink-500">+{roles.length - 6}</span>}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <MonthView
          y={monthCursor.y} m={monthCursor.m}
          countForDay={countForDay}
          rolesForDay={rolesForDay}
          maxProviders={Math.max(visibleProviders.length, 1)}
          onPick={(dayISO) => {
            const firstHour = HOURS.find((h) => freeAt(dayISO, h).length > 0);
            if (firstHour !== undefined) setPicked({ dayISO, hour: firstHour });
          }}
        />
      )}

      {picked && (
        <BookingDrawer
          dayISO={picked.dayISO}
          hour={picked.hour}
          providers={freeAt(picked.dayISO, picked.hour)}
          allowedRoles={allowedRoles}
          onClose={() => setPicked(null)}
        />
      )}
    </div>
  );
}

function BookingDrawer({ dayISO, hour, providers, allowedRoles, onClose }: {
  dayISO: string;
  hour: number;
  providers: Provider[];
  allowedRoles: RoleName[] | null;
  onClose: () => void;
}) {
  // Regroupement par rôle (un prestataire peut apparaître sous plusieurs rôles si pertinent)
  const grouped = useMemo(() => {
    const map = new Map<RoleName, Provider[]>();
    providers.forEach((p) => {
      p.roles.forEach((r) => {
        if (allowedRoles && !allowedRoles.includes(r)) return;
        if (!map.has(r)) map.set(r, []);
        map.get(r)!.push(p);
      });
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [providers, allowedRoles]);

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-40 rounded-xl border border-ink-200 bg-card shadow-xl">
      <div className="flex items-start justify-between gap-3 p-4 border-b border-ink-150">
        <div>
          <div className="text-[13px] font-semibold text-ink-900">{fmtDayShort(dayISO)} · {hour}h00</div>
          <div className="text-[12px] text-ink-500">{providers.length} prestataire{providers.length > 1 ? "s" : ""} disponible{providers.length > 1 ? "s" : ""}</div>
        </div>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-900 leading-none">✕</button>
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-2">
        {grouped.length === 0 && (
          <p className="text-[12px] text-ink-500 px-2 py-3">Aucun prestataire pour les rôles requis.</p>
        )}
        {grouped.map(([role, list]) => (
          <div key={role} className="mb-2 last:mb-0">
            <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
              <RoleDot role={role} size={9} />
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: ROLE_COLORS[role].ink }}>{role}</span>
            </div>
            {list.map((p) => (
              <button
                key={p.id}
                onClick={onClose}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-ink-50 text-left"
              >
                <Avatar name={p.fullName} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink-900 truncate">{p.fullName}</div>
                  <div className="text-[11px] text-ink-500 truncate">{p.city}</div>
                </div>
                <span className="text-[11px] text-accent-ink">Demander →</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ y, m, countForDay, rolesForDay, maxProviders, onPick }: {
  y: number; m: number;
  countForDay: (dayISO: string) => number;
  rolesForDay: (dayISO: string) => RoleName[];
  maxProviders: number;
  onPick: (dayISO: string) => void;
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
      <div className="text-[14px] font-semibold mb-2 capitalize">{monthName} {y}</div>
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
            const cnt = countForDay(c.date);
            const roles = cnt > 0 ? rolesForDay(c.date) : [];
            const intensity = Math.min(cnt / HOURS.length, 1);
            const bg = cnt === 0
              ? "transparent"
              : `color-mix(in oklab, var(--s-confirmed-bg) ${15 + intensity * 60}%, transparent)`;
            return (
              <button
                key={i}
                disabled={cnt === 0}
                onClick={() => onPick(c.date!)}
                className={`text-left border-r border-b border-ink-150 min-h-[96px] p-2 last:border-r-0 hover:bg-accent-soft/40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${isToday ? "ring-1 ring-accent" : ""}`}
                style={{ backgroundColor: bg }}
              >
                <div className={`text-[12px] font-medium ${isToday ? "text-accent-ink" : "text-ink-900"}`}>{c.d}</div>
                {cnt > 0 && (
                  <>
                    <div className="mt-1 text-[10px] text-s-confirmed-ink">{cnt}h dispo</div>
                    <div className="mt-1.5 flex flex-wrap gap-[3px]">
                      {roles.slice(0, 6).map((r) => <RoleDot key={r} role={r} size={7} />)}
                      {roles.length > 6 && <span className="text-[9px] text-ink-500">+{roles.length - 6}</span>}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
