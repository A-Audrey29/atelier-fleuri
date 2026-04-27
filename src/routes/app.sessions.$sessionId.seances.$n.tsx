import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getSession, getWorkshop, getCenter, seancesForSession, ticketsForSeance, getProvider,
} from "@/data/seed";
import { fmtSeance } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { Avatar } from "@/components/Avatar";
import { CommentsThread } from "@/components/CommentsThread";

export const Route = createFileRoute("/app/sessions/$sessionId/seances/$n")({
  component: SeanceTicket,
});

function SeanceTicket() {
  const { sessionId, n } = Route.useParams();
  const session = getSession(sessionId);
  const ws = getWorkshop(session.workshopId);
  const center = getCenter(session.centerId);
  const seances = seancesForSession(sessionId);
  const seance = seances.find((s) => s.index === Number(n));
  if (!seance) throw notFound();
  const tks = ticketsForSeance(seance.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[800px] mx-auto">
      <Link to="/app/sessions/$sessionId" params={{ sessionId }} className="text-[12px] text-ink-500 hover:text-ink-900">
        ‹ {ws.name} — {session.groupLabel}
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Séance {seance.index}</h1>
          <p className="text-[13px] text-ink-500 mt-1">{fmtSeance(seance.start)} · {center.name}</p>
        </div>
      </header>

      <section className="rounded-xl border border-ink-150 bg-card overflow-hidden">
        <header className="px-5 py-3 border-b border-ink-150 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Rôles requis</h2>
          <span className="text-[12px] text-ink-500">{tks.filter((t) => t.status === "confirmed" || t.status === "done").length} / {tks.length} pourvus</span>
        </header>
        <ul className="divide-y divide-ink-150">
          {tks.map((t) => {
            const provider = getProvider(t.providerId);
            return (
              <li key={t.id} className="px-5 py-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] uppercase tracking-wider text-ink-400 mb-1">{t.role}</div>
                  {provider ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={provider.fullName} size={32} />
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium truncate">{provider.fullName}</div>
                        <div className="text-[11px] text-ink-500">{provider.city}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[14px] text-ink-500 italic">Aucun prestataire</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusChip status={t.status} />
                  <div className="flex gap-1 text-[11px]">
                    {t.status === "pending" && <button className="text-accent-ink hover:underline">Relancer</button>}
                    {(t.status === "empty" || t.status === "refused") && <button className="text-accent-ink hover:underline">+ Inviter</button>}
                    {t.status === "confirmed" && <button className="text-ink-400 hover:text-ink-700">Réassigner</button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-6">
        <CommentsThread
          seanceId={seance.id}
          currentRole="referent"
          currentName={session.referentName}
        />
      </div>
    </div>
  );
}
