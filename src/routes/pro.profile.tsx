import { createFileRoute } from "@tanstack/react-router";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/pro/profile")({
  component: ProProfile,
});

function ProProfile() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[760px] mx-auto">
      <header className="mb-6 flex items-center gap-4">
        <Avatar name="Marie-Laure Cadet" size={64} />
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Marie-Laure Cadet</h1>
          <p className="text-[13px] text-ink-500 mt-1">Psychologue · Pointe-à-Pitre</p>
        </div>
      </header>

      <div className="space-y-5">
        <Card title="Informations professionnelles">
          <Field label="Téléphone" value="0690 10 20 30" />
          <Field label="Email" value="ml.cadet@asanble.gp" />
          <Field label="Zone d'intervention" value="Grande-Terre, Basse-Terre Nord" />
        </Card>
        <Card title="Rôles & spécialités">
          <div className="flex gap-1.5 flex-wrap">
            <Badge>Psychologue</Badge>
            <Badge>Adolescents</Badge>
            <Badge>Familles</Badge>
          </div>
        </Card>
        <Card title="Documents administratifs">
          <DocLine name="Diplôme d'État" status="Validé" />
          <DocLine name="Attestation URSSAF" status="Validé" />
          <DocLine name="RIB" status="À fournir" />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-ink-150 bg-card p-5">
      <h2 className="text-[14px] font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink-150 pb-2 last:border-b-0 text-[13px]">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] bg-ink-50 border border-ink-150 rounded-full px-2.5 py-0.5">{children}</span>;
}

function DocLine({ name, status }: { name: string; status: string }) {
  const ok = status === "Validé";
  return (
    <div className="flex justify-between items-center border-b border-ink-150 pb-2 last:border-b-0 text-[13px]">
      <span>{name}</span>
      <span className={ok ? "text-s-confirmed-ink" : "text-s-pending-ink"}>{status}</span>
    </div>
  );
}
