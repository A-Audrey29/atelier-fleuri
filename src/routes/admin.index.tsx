import { createFileRoute, Link } from "@tanstack/react-router";
import { tickets, getSeance, getSession, getWorkshop, getCenter, getProvider, sessions } from "@/data/seed";
import { fmtSeance } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const blocked = tickets.filter((t) => t.status === "refused" || t.status === "blocked");
  const pendingOver24h = tickets.filter((t) => t.status === "pending");
  const sessionsAtRisk = sessions.filter((s) => {
    const ts = tickets.filter((t) => {
      const se = getSeance(t.seanceId);
      return se.sessionId === s.id;
    });
    return ts.some((t) => t.status === "refused" || t.status === "empty");
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Dashboard administrateur</h1>
        <p className="text-[13px] text-ink-500 mt-1 max-w-[720px]">
          Vue d'ensemble opérationnelle de la plateforme : tickets nécessitant
          une intervention, délais de réponse dépassés et sessions à risque
          d'annulation. Cliquez sur un ticket pour aller le débloquer.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <Stat
          label="Tickets bloqués"
          value={blocked.length}
          accent="refused"
          help="Tickets refusés par le prestataire ou marqués bloqués par le système. Action immédiate requise."
        />
        <Stat
          label="Délais dépassés"
          value={pendingOver24h.length}
          accent="pending"
          help="SLA = Service Level Agreement, soit le délai de réponse attendu (24 h). Tickets en attente depuis trop longtemps : à relancer."
        />
        <Stat
          label="Sessions à risque"
          value={sessionsAtRisk.length}
          accent="override"
          help="Sessions ayant au moins une séance avec un ticket refusé ou vide : un rôle requis n'est pas couvert."
        />
      </div>

      <p className="text-[11px] text-ink-500 mb-6">
        <strong>SLA</strong> (<em>Service Level Agreement</em>) = délai de
        réponse attendu d'un prestataire après envoi d'un ticket (par défaut 24 h).
      </p>

      <section className="mb-6">
        <h2 className="text-[14px] font-semibold mb-1">Tickets bloqués</h2>
        <p className="text-[12px] text-ink-500 mb-3">
          Liste des tickets nécessitant une action manuelle (refus prestataire,
          aucune disponibilité trouvée).
        </p>
        <ul className="space-y-2">
          {blocked.map((t) => {
            const se = getSeance(t.seanceId);
            const sess = getSession(se.sessionId);
            const ws = getWorkshop(sess.workshopId);
            const center = getCenter(sess.centerId);
            const provider = getProvider(t.providerId);
            return (
              <li key={t.id} className="rounded-lg border border-ink-150 bg-card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">{ws.name} — {center.city}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">
                    Séance {se.index} · {fmtSeance(se.start)} · {t.role}
                    {provider && ` · refusé par ${provider.fullName}`}
                  </div>
                </div>
                <StatusChip status={t.status} />
                <Link
                  to="/app/sessions/$sessionId/seances/$n"
                  params={{ sessionId: sess.id, n: String(se.index) }}
                  className="text-[12px] text-accent-ink hover:underline"
                >
                  Débloquer ›
                </Link>
              </li>
            );
          })}
          {blocked.length === 0 && <Empty>Aucun ticket bloqué.</Empty>}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent, help }: { label: string; value: number; accent: "refused" | "pending" | "override"; help: string }) {
  const map = {
    refused: "border-s-refused-border bg-s-refused-bg/40 text-s-refused-ink",
    pending: "border-s-pending-border bg-s-pending-bg/40 text-s-pending-ink",
    override: "border-s-override-border bg-s-override-bg/40 text-s-override-ink",
  };
  return (
    <div className={`rounded-lg border p-4 ${map[accent]}`}>
      <div className="text-[12px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-[28px] font-semibold mt-1">{value}</div>
      <div className="text-[11px] opacity-80 mt-1 leading-snug">{help}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <li className="rounded-lg border border-dashed border-ink-200 p-6 text-center text-[13px] text-ink-500">{children}</li>;
}
