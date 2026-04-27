import { createFileRoute, Link } from "@tanstack/react-router";
import { tickets, getSeance, getSession, getWorkshop, getCenter } from "@/data/seed";
import { fmtSeance } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/pro/")({
  component: ProHome,
});

function ProHome() {
  const PROVIDER_ID = "p1";
  const pending = tickets.filter((t) => t.providerId === PROVIDER_ID && t.status === "pending");
  const upcoming = tickets.filter((t) => t.providerId === PROVIDER_ID && t.status === "confirmed");

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[900px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Bonjour Marie-Laure</h1>
        <p className="text-[13px] text-ink-500 mt-1">{pending.length} demande{pending.length > 1 ? "s" : ""} en attente de votre réponse.</p>
      </header>

      <section className="mb-6">
        <h2 className="text-[14px] font-semibold mb-3">Demandes à traiter</h2>
        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-200 p-6 text-center text-[13px] text-ink-500">
            Aucune demande en attente.
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((t) => {
              const se = getSeance(t.seanceId);
              const sess = getSession(se.sessionId);
              const ws = getWorkshop(sess.workshopId);
              const center = getCenter(sess.centerId);
              return (
                <li key={t.id} className="rounded-lg border border-ink-150 bg-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[14px] font-semibold">{ws.name}</div>
                      <div className="text-[12px] text-ink-500 mt-0.5">{center.name} · S{se.index} · {fmtSeance(se.start)}</div>
                    </div>
                    <StatusChip status="pending" />
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">Accepter</button>
                    <button className="flex-1 h-9 rounded-md border border-ink-200 text-[13px] text-ink-700 hover:bg-ink-50">Refuser</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold">Prochaines interventions</h2>
          <Link to="/pro/missions" className="text-[12px] text-accent-ink hover:underline">Tout voir ›</Link>
        </div>
        <ul className="space-y-2">
          {upcoming.map((t) => {
            const se = getSeance(t.seanceId);
            const sess = getSession(se.sessionId);
            const ws = getWorkshop(sess.workshopId);
            const center = getCenter(sess.centerId);
            return (
              <li key={t.id} className="rounded-lg border border-ink-150 bg-card p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{ws.name}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">{center.name} · {fmtSeance(se.start)}</div>
                </div>
                <StatusChip status={t.status} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
