import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/projects")({
  component: () => (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight">Dispositifs</h1>
        <p className="text-[13px] text-ink-500 mt-1">Programmes financés et leurs centres associés.</p>
      </header>
      <ul className="space-y-2">
        <li className="rounded-lg border border-ink-150 bg-card p-4">
          <div className="text-[14px] font-semibold">REAAP 2025 — Réseau Écoute Appui Accompagnement Parents</div>
          <div className="text-[12px] text-ink-500 mt-1">6 centres · Budget 48 000 € · Période 01/01 → 31/12</div>
        </li>
        <li className="rounded-lg border border-ink-150 bg-card p-4">
          <div className="text-[14px] font-semibold">Sport-Santé Jeunesse 2025</div>
          <div className="text-[12px] text-ink-500 mt-1">3 centres · Budget 22 000 € · Période 03/2025 → 09/2025</div>
        </li>
      </ul>
    </div>
  ),
});
