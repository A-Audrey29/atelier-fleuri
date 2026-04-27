import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/export")({
  component: () => (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[760px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Export comptable</h1>
        <p className="text-[13px] text-ink-500 mt-1">Générez un export CSV ou XLSX par période.</p>
      </header>
      <form className="rounded-xl border border-ink-150 bg-card p-5 space-y-4">
        <Field label="Période">
          <div className="flex gap-2">
            <input type="date" className="flex-1 h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
            <span className="self-center text-ink-400">→</span>
            <input type="date" className="flex-1 h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
          </div>
        </Field>
        <Field label="Centre social">
          <select className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
            <option>Tous</option>
          </select>
        </Field>
        <Field label="Prestataire">
          <select className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]">
            <option>Tous</option>
          </select>
        </Field>
        <Field label="Format">
          <div className="flex gap-2">
            <button type="button" className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50">CSV</button>
            <button type="button" className="h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50">XLSX</button>
          </div>
        </Field>
        <button type="button" className="h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 w-full">
          Générer l'export
        </button>
      </form>
    </div>
  ),
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] text-ink-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
