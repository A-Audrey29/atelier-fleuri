import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tickets, getSeance, getSession, getWorkshop, getCenter } from "@/data/seed";
import { fmtSeance } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/pro/missions")({
  component: ProMissions,
});

function ProMissions() {
  const PROVIDER_ID = "p1";
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const all = tickets
    .filter((t) => t.providerId === PROVIDER_ID && (t.status === "confirmed" || t.status === "done" || t.status === "pending"))
    .map((t) => ({ t, se: getSeance(t.seanceId) }))
    .sort((a, b) => a.se.start.localeCompare(b.se.start));

  const filtered = all.filter(({ t }) => {
    if (filter === "upcoming") return t.status !== "done";
    if (filter === "past") return t.status === "done";
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[900px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Mes missions</h1>
      </header>

      <div className="flex gap-1 mb-5 border-b border-ink-150">
        {(["all", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-3 py-2 text-[13px] font-medium ${filter === f ? "text-ink-900" : "text-ink-400 hover:text-ink-700"}`}
          >
            {f === "all" ? "Toutes" : f === "upcoming" ? "À venir" : "Passées"}
            {filter === f && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink-900" />}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map(({ t, se }) => {
          const sess = getSession(se.sessionId);
          const ws = getWorkshop(sess.workshopId);
          const center = getCenter(sess.centerId);
          return (
            <li key={t.id} className="rounded-lg border border-ink-150 bg-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">{ws.name}</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{center.name} · S{se.index} · {fmtSeance(se.start)}</div>
              </div>
              <StatusChip status={t.status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
