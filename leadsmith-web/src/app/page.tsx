import LeadFinder from "@/components/LeadFinder";
import { listLeads } from "@/lib/leads";

// The leads list is mutable local data (SQLite), not build-time content —
// this page must be rendered fresh per request, not prerendered once.
export const dynamic = "force-dynamic";

export default function Home() {
  const initialLeads = listLeads();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">LeadSmith</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Lead Finder — find local businesses worth pitching a new website to.
        </p>
      </header>
      <LeadFinder initialLeads={initialLeads} />
    </main>
  );
}
