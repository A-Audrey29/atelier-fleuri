import { createFileRoute, Link } from "@tanstack/react-router";
import { getSession, getWorkshop, getCenter, seancesForSession, seanceStatus } from "@/data/seed";
import { commentCountForSeance } from "@/data/comments";
import { fmtSeance } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/app/sessions/$sessionId")({
  component: SessionDetail,
});

function SessionDetail() {
  const { sessionId } = Route.useParams();
  const session = getSession(sessionId);
  const ws = getWorkshop(session.workshopId);
  const center = getCenter(session.centerId);
  const seances = seancesForSession(sessionId);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[900px] mx-auto">
      <Link to="/app" className="text-[12px] text-ink-500 hover:text-ink-900">‹ Retour aux tickets</Link>
      <header className="mt-3 mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">{ws.name} — {session.groupLabel}</h1>
        <p className="text-[13px] text-ink-500 mt-1">{center.name} · {center.city} · {seances.length} séances</p>
      </header>

      <section className="rounded-xl border border-ink-150 bg-card p-5 mb-5">
        <h2 className="text-[14px] font-semibold mb-3">Détails</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-[13px]">
          <div><dt className="text-ink-400 text-[11px] uppercase tracking-wider mb-0.5">Salle</dt><dd>{session.room ?? "—"}</dd></div>
          <div><dt className="text-ink-400 text-[11px] uppercase tracking-wider mb-0.5">Public</dt><dd>{session.audience ?? "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-ink-400 text-[11px] uppercase tracking-wider mb-0.5">Notes</dt><dd className="text-ink-700">{session.notes ?? "—"}</dd></div>
        </dl>
      </section>

      <section>
        <h2 className="text-[14px] font-semibold mb-3">Timeline des séances</h2>
        <ol className="space-y-2">
          {seances.map((se) => (
            <li key={se.id}>
              <Link
                to="/app/sessions/$sessionId/seances/$n"
                params={{ sessionId, n: String(se.index) }}
                className="flex items-center gap-3 rounded-lg border border-ink-150 bg-card px-4 py-3 hover:border-ink-300 transition-colors"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink-50 border border-ink-150 text-[12px] font-semibold text-ink-700">
                  {se.index}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">Séance {se.index}</div>
                  <div className="text-[12px] text-ink-500">{fmtSeance(se.start)} · {se.durationMin} min</div>
                </div>
                <StatusChip status={seanceStatus(se.id)} />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
