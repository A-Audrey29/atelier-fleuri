import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { providers as seedProviders } from "@/data/seed";
import type { Provider, RoleName } from "@/data/types";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/admin/providers")({
  component: ProvidersPage,
});

const ALL_ROLES: RoleName[] = [
  "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

function ProvidersPage() {
  const [list, setList] = useState<Provider[]>([...seedProviders]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ fullName: string; email: string; phone: string; city: string; roles: RoleName[] }>(
    { fullName: "", email: "", phone: "", city: "", roles: [] }
  );

  function toggleRole(r: RoleName) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
    }));
  }

  function submit() {
    if (!form.fullName.trim() || form.roles.length === 0) return;
    const np: Provider = {
      id: `p${Date.now()}`,
      fullName: form.fullName.trim(),
      roles: form.roles,
      city: form.city || "—",
      phone: form.phone,
      email: form.email,
    };
    setList((l) => [np, ...l]);
    setForm({ fullName: "", email: "", phone: "", city: "", roles: [] });
    setOpen(false);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Prestataires</h1>
          <p className="text-[13px] text-ink-500 mt-1">{list.length} prestataires référencés.</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Inviter</button>
      </header>

      <ul className="grid gap-2">
        {list.map((p) => (
          <li key={p.id} className="rounded-lg border border-ink-150 bg-card p-3 flex items-center gap-3">
            <Avatar name={p.fullName} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium">{p.fullName}</div>
              <div className="text-[12px] text-ink-500">{p.roles.join(", ")} · {p.city}</div>
            </div>
            <Link
              to="/admin/providers/$providerId/documents"
              params={{ providerId: p.id }}
              className="h-8 px-2.5 rounded-md border border-ink-200 text-[12px] text-ink-700 hover:bg-ink-50"
            >
              Documents
            </Link>
            <span className="text-[11px] text-s-confirmed-ink bg-s-confirmed-bg border border-s-confirmed-border rounded-full px-2 py-0.5">Validé</span>
          </li>
        ))}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-900/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-xl bg-card border border-ink-200 shadow-xl p-6">
            <h2 className="text-[18px] font-semibold mb-1">Inviter un prestataire</h2>
            <p className="text-[12px] text-ink-500 mb-5">Le prestataire recevra un email pour activer son compte.</p>
            <div className="space-y-3">
              <Field label="Nom complet">
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                </Field>
                <Field label="Téléphone">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                </Field>
              </div>
              <Field label="Commune">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
              </Field>
              <Field label="Rôles (besoins du projet)">
                <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto rounded-md border border-ink-200 p-2">
                  {ALL_ROLES.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-[12px] cursor-pointer hover:bg-ink-50 rounded px-1.5 py-1">
                      <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleRole(r)} />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-150">
              <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md text-[13px] text-ink-500 hover:text-ink-900">Annuler</button>
              <button onClick={submit} disabled={!form.fullName.trim() || form.roles.length === 0}
                className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40">
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
