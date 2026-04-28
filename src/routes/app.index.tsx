import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  sessions, getWorkshop, getCenter, seancesForSession, ticketsForSeance, getProvider,
  seanceStatus, suggestionsForRole, providers,
} from "@/data/seed";
import type { RoleName, Ticket } from "@/data/types";
import { fmtSeance, fmtDayShort } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { Avatar } from "@/components/Avatar";
import { SideDrawer } from "@/components/SideDrawer";

export const Route = createFileRoute("/app/")({
  component: MyTickets,
});

function MyTickets() {
  const [tab, setTab] = useState<"current" | "history">("current");
  const [pickerOpen, setPickerOpen] = useState<{ role: RoleName; seanceId: string } | null>(null);
  const [openSessions, setOpenSessions] = useState<Record<string, boolean>>({});

  const now = new Date();
  function isFuture(seanceStart: string) {
    const m = seanceStart.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return true;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  const filteredSessions = sessions
    .map((s) => {
      const seances = seancesForSession(s.id);
      const filtered = tab === "current"
        ? seances.filter((se) => isFuture(se.start))
        : seances.filter((se) => !isFuture(se.start));
      return { session: s, seances: filtered };
    })
    .filter((x) => x.seances.length > 0);

  function toggle(id: string) {
    setOpenSessions((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
      <header className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Mes tickets</h1>
          <p className="text-[13px] text-ink-500 mt-1">Vos séances d'atelier et l'avancement des prestataires.</p>
        </div>
        <Link
          to="/app/sessions/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-900 text-paper px-3.5 py-2 text-[13px] font-medium hover:bg-ink-700 transition-colors"
        >
          <span>+</span> Nouvelle séance
        </Link>
      </header>

      <div className="flex gap-1 mb-5 border-b border-ink-150">
        {(["current", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "relative px-3 py-2 text-[13px] font-medium transition-colors",
              tab === t ? "text-ink-900" : "text-ink-400 hover:text-ink-700",
            ].join(" ")}
          >
            {t === "current" ? "En cours" : "Passé"}
            {tab === t && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink-900" />}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {filteredSessions.length === 0 && (
          <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center">
            <p className="text-[13px] text-ink-500">Aucune session à afficher.</p>
          </div>
        )}
        {filteredSessions.map(({ session, seances }) => {
          const ws = getWorkshop(session.workshopId);
          const center = getCenter(session.centerId);
          const isOpen = openSessions[session.id] ?? false;
          // Compteur statuts pour aperçu replié
          const statuses = seances.map((se) => seanceStatus(se.id));
          const nbBlocked = statuses.filter((s) => s === "blocked" || s === "empty").length;
          const nbConfirmed = statuses.filter((s) => s === "confirmed" || s === "done").length;
          return (
            <article key={session.id} className="rounded-xl border border-ink-150 bg-card overflow-hidden">
              <button
                onClick={() => toggle(session.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-150 bg-ink-50/40 hover:bg-ink-50 transition-colors text-left"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-ink-900">{ws.name} — {session.groupLabel}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">
                    {center.name} · {seances.length} séance{seances.length > 1 ? "s" : ""}
                    <span className="mx-2">·</span>
                    <span className="text-s-confirmed-ink">{nbConfirmed} confirmée{nbConfirmed > 1 ? "s" : ""}</span>
                    {nbBlocked > 0 && <><span className="mx-1.5">·</span><span className="text-s-refused-ink">{nbBlocked} à compléter</span></>}
                  </div>
                </div>
                <span className={`text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>▾</span>
              </button>

              {isOpen && (
                <ul className="divide-y divide-ink-150">
                  {seances.map((se) => {
                    const status = seanceStatus(se.id);
                    const tks = ticketsForSeance(se.id);
                    return (
                      <li key={se.id} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <Link
                            to="/app/sessions/$sessionId/seances/$n"
                            params={{ sessionId: session.id, n: String(se.index) }}
                            className="flex items-center gap-3 group min-w-0"
                          >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink-50 border border-ink-150 text-[12px] font-semibold text-ink-700">
                              {se.index}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[14px] font-medium group-hover:text-accent-ink transition-colors">
                                Séance {se.index} · <span className="text-ink-500 font-normal">{fmtSeance(se.start)}</span>
                              </div>
                              <div className="text-[11px] text-ink-400 mt-0.5">{se.durationMin} min</div>
                            </div>
                          </Link>
                          <StatusChip status={status} />
                        </div>

                        <div className="grid gap-2">
                          {tks.map((t) => (
                            <RoleSlot
                              key={t.id}
                              ticket={t}
                              seanceId={se.id}
                              onPick={(role) => setPickerOpen({ role, seanceId: se.id })}
                            />
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <SideDrawer
        open={!!pickerOpen}
        onClose={() => setPickerOpen(null)}
        subtitle={pickerOpen ? "Choisir un prestataire" : undefined}
        title={pickerOpen ? pickerOpen.role : undefined}
      >
        {pickerOpen && (
          <div className="space-y-2">
            <p className="text-[12px] text-ink-500 mb-3">
              Prestataires {pickerOpen.role.toLowerCase()} disponibles le{" "}
              {fmtDayShort(
                seancesForSession(sessions.find((s) => seancesForSession(s.id).some((se) => se.id === pickerOpen.seanceId))!.id)
                  .find((se) => se.id === pickerOpen.seanceId)!.start,
              )}
              .
            </p>
            {providers
              .filter((p) => p.roles.includes(pickerOpen.role))
              .map((p) => (
                <button
                  key={p.id}
                  className="flex items-center gap-3 w-full p-2.5 rounded-md hover:bg-ink-50 text-left"
                  onClick={() => setPickerOpen(null)}
                >
                  <Avatar name={p.fullName} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium">{p.fullName}</div>
                    <div className="text-[12px] text-ink-500">{p.city}</div>
                  </div>
                  <span className="text-[12px] text-accent-ink font-medium">Inviter</span>
                </button>
              ))}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}

function RoleSlot({
  ticket,
  seanceId,
  onPick,
}: {
  ticket: Ticket;
  seanceId: string;
  onPick: (role: RoleName) => void;
}) {
  const provider = getProvider(ticket.providerId);

  if (!provider || ticket.status === "empty" || ticket.status === "refused") {
    const suggestions = suggestionsForRole(ticket.role, ticket.providerId ? [ticket.providerId] : []);
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50/40 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-ink-700 font-medium">Manque {ticket.role}</span>
            {ticket.status === "refused" && <StatusChip status="refused" />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => onPick(ticket.role)}
                className="inline-flex items-center gap-1.5 rounded-md bg-card border border-ink-200 px-2 py-1 text-[12px] hover:border-ink-400 transition-colors"
              >
                <Avatar name={s.fullName} size={18} />
                <span>+ {s.fullName.split(" ")[0]} {s.fullName.split(" ")[1]?.[0]}.</span>
              </button>
            ))}
            <button
              onClick={() => onPick(ticket.role)}
              className="text-[12px] text-accent-ink hover:underline px-1 py-1"
            >
              Voir tous
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink-150 bg-card px-3 py-2.5 flex items-center gap-3">
      <Avatar name={provider.fullName} size={32} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{provider.fullName}</div>
        <div className="text-[11px] text-ink-500">{ticket.role} · {provider.city}</div>
      </div>
      <StatusChip status={ticket.status} />
    </div>
  );
}
