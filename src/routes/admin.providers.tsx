import { createFileRoute } from "@tanstack/react-router";
import { providers } from "@/data/seed";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/admin/providers")({
  component: () => (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Prestataires</h1>
          <p className="text-[13px] text-ink-500 mt-1">{providers.length} prestataires référencés.</p>
        </div>
        <button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Inviter</button>
      </header>
      <ul className="grid gap-2">
        {providers.map((p) => (
          <li key={p.id} className="rounded-lg border border-ink-150 bg-card p-3 flex items-center gap-3">
            <Avatar name={p.fullName} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium">{p.fullName}</div>
              <div className="text-[12px] text-ink-500">{p.roles.join(", ")} · {p.city}</div>
            </div>
            <span className="text-[11px] text-s-confirmed-ink bg-s-confirmed-bg border border-s-confirmed-border rounded-full px-2 py-0.5">Validé</span>
          </li>
        ))}
      </ul>
    </div>
  ),
});
