import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, accountsStore, centersStore } from "@/data/store";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const accounts = useStore(accountsStore);
  const centers = useStore(centersStore);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | "referent" | "provider" | "admin">("all");

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
        <button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Inviter</button>
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
    </div>
  );
}
