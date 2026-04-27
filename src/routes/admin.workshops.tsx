import { createFileRoute } from "@tanstack/react-router";
import { workshops } from "@/data/seed";

export const Route = createFileRoute("/admin/workshops")({
  component: () => (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Ateliers</h1>
          <p className="text-[13px] text-ink-500 mt-1">{workshops.length} ateliers actifs.</p>
        </div>
        <button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Nouvel atelier</button>
      </header>
      <ul className="grid sm:grid-cols-2 gap-2">
        {workshops.map((w) => (
          <li key={w.id} className="rounded-lg border border-ink-150 bg-card p-4">
            <div className="text-[14px] font-semibold">{w.name}</div>
            <div className="text-[12px] text-ink-500 mt-1.5 flex flex-wrap gap-1">
              {w.requiredRoles.map((r) => (
                <span key={r} className="bg-ink-50 border border-ink-150 rounded-full px-2 py-0.5">{r}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  ),
});
