import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, accountsStore, centersStore } from "@/data/store";
import type { UserAccount } from "@/data/types";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const accounts = useStore(accountsStore);
  const centers = useStore(centersStore);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | "referent" | "provider" | "admin">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ firstName: string; lastName: string; email: string; role: "referent" | "provider" | "admin"; centerId: string }>(
    { firstName: "", lastName: "", email: "", role: "referent", centerId: "" }
  );

  function submit() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const acc: UserAccount = {
      id: `u${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      centerId: form.role === "referent" ? form.centerId || undefined : undefined,
      createdAt: today,
    };
    accountsStore.update((arr) => [acc, ...arr]);
    setForm({ firstName: "", lastName: "", email: "", role: "referent", centerId: "" });
    setOpen(false);
  }

  const filtered = accounts.filter((a) => {
    if (role !== "all" && a.role !== role) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        a.firstName.toLowerCase().includes(s) ||
        a.lastName.toLowerCase().includes(s) ||
        a.email.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
      <header className="mb-5 flex justify-between items-end gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-[13px] text-ink-500 mt-1">{filtered.length} compte{filtered.length > 1 ? "s" : ""}.</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Nouvel utilisateur</button>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}
          className="h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
          <option value="all">Tous les rôles</option>
          <option value="referent">Référents famille</option>
          <option value="provider">Prestataires</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="rounded-xl border border-ink-150 bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-ink-50/40 text-[11px] uppercase tracking-wider text-ink-400">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Utilisateur</th>
              <th className="text-left font-medium px-4 py-2.5">Email</th>
              <th className="text-left font-medium px-4 py-2.5">Rôle</th>
              <th className="text-left font-medium px-4 py-2.5">Centre</th>
              <th className="text-left font-medium px-4 py-2.5">Créé le</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const center = a.centerId ? centers.find((c) => c.id === a.centerId) : null;
              const roleLabel = a.role === "referent" ? "Référent" : a.role === "provider" ? "Prestataire" : "Admin";
              return (
                <tr key={a.id} className="border-t border-ink-150 hover:bg-ink-50/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${a.firstName} ${a.lastName}`} size={28} />
                      <span className="font-medium">{a.firstName} {a.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">{a.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] bg-ink-50 border border-ink-150 rounded-full px-2 py-0.5">{roleLabel}</span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-500">{center?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-500">{a.createdAt}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="text-[12px] text-accent-ink hover:underline">Modifier</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-900/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] rounded-xl bg-card border border-ink-200 shadow-xl p-6">
            <h2 className="text-[18px] font-semibold mb-1">Nouvel utilisateur</h2>
            <p className="text-[12px] text-ink-500 mb-5">Créez un compte d'accès à la plateforme.</p>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Prénom">
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                </Field>
                <Field label="Nom">
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                </Field>
              </div>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
              </Field>
              <Field label="Rôle">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
                  <option value="referent">Référent famille</option>
                  <option value="provider">Prestataire</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              {form.role === "referent" && (
                <Field label="Centre social affilié">
                  <select value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })}
                    className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
                    <option value="">— Sélectionner —</option>
                    {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-150">
              <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md text-[13px] text-ink-500 hover:text-ink-900">Annuler</button>
              <button onClick={submit}
                disabled={!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()}
                className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40">
                Créer le compte
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
