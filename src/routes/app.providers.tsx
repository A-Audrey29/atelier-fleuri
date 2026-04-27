import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { providers } from "@/data/seed";
import type { Provider, RoleName } from "@/data/types";
import { Avatar } from "@/components/Avatar";
import { SideDrawer } from "@/components/SideDrawer";

export const Route = createFileRoute("/app/providers")({
  component: ProvidersPage,
});

const ALL_ROLES: RoleName[] = [
  "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

function ProvidersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleName | "all">("all");
  const [selected, setSelected] = useState<Provider | null>(null);

  const filtered = providers.filter((p) => {
    if (role !== "all" && !p.roles.includes(role)) return false;
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
      <header className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight">Annuaire prestataires</h1>
        <p className="text-[13px] text-ink-500 mt-1">{filtered.length} prestataire{filtered.length > 1 ? "s" : ""}.</p>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="Rechercher un nom ou une ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleName | "all")}
          className="h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300"
        >
          <option value="all">Tous les rôles</option>
          {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <ul className="grid sm:grid-cols-2 gap-2">
        {filtered.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setSelected(p)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-ink-150 bg-card hover:border-ink-300 transition-colors text-left"
            >
              <Avatar name={p.fullName} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">{p.fullName}</div>
                <div className="text-[12px] text-ink-500 truncate">{p.roles.join(", ")}</div>
                <div className="text-[11px] text-ink-400 mt-0.5">{p.city}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        subtitle="Prestataire"
        title={selected?.fullName}
      >
        {selected && (
          <div className="space-y-4 text-[13px]">
            <div className="flex items-center gap-3">
              <Avatar name={selected.fullName} size={56} />
              <div>
                <div className="text-[15px] font-medium">{selected.fullName}</div>
                <div className="text-[12px] text-ink-500">{selected.city}</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Rôles</div>
              <div className="flex gap-1.5 flex-wrap">
                {selected.roles.map((r) => (
                  <span key={r} className="text-[11px] bg-ink-50 border border-ink-150 rounded-full px-2 py-0.5">{r}</span>
                ))}
              </div>
            </div>
            {selected.phone && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Contact</div>
                <div>{selected.phone}</div>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
