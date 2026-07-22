"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/lead-types";
import { LEAD_STATUSES } from "@/lib/lead-types";
import type { LeadCandidate } from "@/lib/leads";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  won: "Won",
  lost: "Lost",
};

function scoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-100 text-emerald-800";
  if (score >= 40) return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-600";
}

export default function LeadFinder({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [candidates, setCandidates] = useState<LeadCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  async function loadLeads() {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data.leads ?? []);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!category.trim() || !location.trim()) return;
    setSearching(true);
    setSearchError(null);
    setCandidates([]);
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? "Search failed.");
        return;
      }
      setCandidates(data.candidates ?? []);
    } catch {
      setSearchError("Could not reach the server.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSave(candidate: LeadCandidate) {
    setSavingId(candidate.placeId);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate, category, location }),
      });
      if (res.ok) {
        setCandidates((prev) =>
          prev.map((c) => (c.placeId === candidate.placeId ? { ...c, alreadySaved: true } : c)),
        );
        await loadLeads();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
  }

  async function handleBuildSite(leadId: string) {
    setBuildingId(leadId);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/sites/${data.site.id}`);
      } else {
        setBuildingId(null);
      }
    } catch {
      setBuildingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-xs font-medium text-neutral-500">
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. plumbers"
              className="w-48 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="location" className="text-xs font-medium text-neutral-500">
              Location
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dayton, OH"
              className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {searchError && (
          <p className="mt-3 max-w-xl rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchError}
          </p>
        )}

        {candidates.length > 0 && (
          <ul className="mt-6 flex flex-col gap-3">
            {candidates.map((c) => (
              <li
                key={c.placeId}
                className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.businessName}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreColor(c.score)}`}>
                      score {c.score}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">{c.address ?? "No address on file"}</p>
                  <p className="text-sm text-neutral-500">
                    {c.phone ?? "No phone"} ·{" "}
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer" className="underline">
                        has a website
                      </a>
                    ) : (
                      "no website"
                    )}
                    {c.rating !== null && ` · ${c.rating}★ (${c.ratingCount ?? 0})`}
                  </p>
                  <p className="text-xs text-neutral-400">{c.scoreReasons.join(" · ")}</p>
                </div>
                <button
                  onClick={() => handleSave(c)}
                  disabled={c.alreadySaved || savingId === c.placeId}
                  className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium disabled:cursor-default disabled:opacity-50"
                >
                  {c.alreadySaved ? "Saved" : savingId === c.placeId ? "Saving…" : "Save lead"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Saved leads</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500">No saved leads yet. Search above and save a few.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Business</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">
                      <div className="font-medium">{lead.business_name}</div>
                      <div className="text-xs text-neutral-500">{lead.address}</div>
                    </td>
                    <td className="px-3 py-2 text-neutral-600">{lead.category}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleBuildSite(lead.id)}
                        disabled={buildingId === lead.id}
                        className="mr-3 rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                      >
                        {buildingId === lead.id ? "Building…" : "Build site"}
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-xs text-neutral-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
