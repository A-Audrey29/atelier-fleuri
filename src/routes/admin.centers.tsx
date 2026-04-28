import { createFileRoute } from "@tanstack/react-router";
import { useStore, centersStore } from "@/data/store";

export const Route = createFileRoute("/admin/centers")({
  component: CentersPage,
});

function CentersPage() {
  const centers = useStore(centersStore);
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Centres sociaux</h1>
          <p className="text-[13px] text-ink-500 mt-1">{centers.length} centres partenaires en Guadeloupe.</p>
        </div>
        <button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">+ Ajouter</button>
      </header>
      <ul className="grid sm:grid-cols-2 gap-2">
        {centers.map((c) => (
          <li key={c.id} className="rounded-lg border border-ink-150 bg-card p-4">
            <div className="text-[14px] font-semibold">{c.name}</div>
            <div className="text-[12px] text-ink-500 mt-1">{c.address}</div>
            <div className="text-[12px] text-ink-700 mt-2 pt-2 border-t border-ink-150 space-y-0.5">
              <div>Référent · <span className="font-medium">{c.contactName}</span></div>
              <div className="text-ink-500">
                <a href={`tel:${c.contactPhone.replace(/\s/g, "")}`} className="hover:text-ink-900">{c.contactPhone}</a>
                {c.contactEmail && (
                  <>
                    <span className="mx-1.5">·</span>
                    <a href={`mailto:${c.contactEmail}`} className="hover:text-ink-900">{c.contactEmail}</a>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
