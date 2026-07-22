import Link from "next/link";
import NavBar from "@/components/NavBar";
import { listSites } from "@/lib/sites";

// Sites are mutable local data — render fresh per request, not prerendered.
export const dynamic = "force-dynamic";

export default function SitesPage() {
  const sites = listSites();

  return (
    <>
      <NavBar />
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Web Builder</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Proposal sites built for leads — edit content, then share the preview link.
          </p>
        </header>

        {sites.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No sites yet. Go to Lead Finder and click &ldquo;Build site&rdquo; on a saved lead.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sites.map((site) => (
              <li
                key={site.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4"
              >
                <div>
                  <div className="font-medium">{site.business_name}</div>
                  <div className="text-xs text-neutral-500">
                    {site.template} template · updated {new Date(site.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  <Link href={`/sites/${site.id}`} className="underline">
                    Edit
                  </Link>
                  <Link href={`/sites/${site.id}/preview`} className="underline" target="_blank">
                    Preview
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
