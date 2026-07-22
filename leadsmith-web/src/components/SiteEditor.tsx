"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Site, SiteService, SiteTemplateId } from "@/lib/site-types";
import { SITE_TEMPLATES, parseServices } from "@/lib/site-types";
import SiteTemplateRenderer from "@/components/site-templates";

interface SiteFormState {
  template: SiteTemplateId;
  businessName: string;
  tagline: string;
  about: string;
  services: SiteService[];
  phone: string;
  email: string;
  address: string;
  accentColor: string;
}

function formFromSite(site: Site): SiteFormState {
  return {
    template: site.template,
    businessName: site.business_name,
    tagline: site.tagline,
    about: site.about,
    services: parseServices(site.services),
    phone: site.phone ?? "",
    email: site.email ?? "",
    address: site.address ?? "",
    accentColor: site.accent_color,
  };
}

const SAVE_DEBOUNCE_MS = 600;

export default function SiteEditor({ site }: { site: Site }) {
  const [form, setForm] = useState<SiteFormState>(() => formFromSite(site));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  function scheduleSave(next: SiteFormState) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus("saving");
    saveTimeout.current = setTimeout(async () => {
      await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: next.template,
          businessName: next.businessName,
          tagline: next.tagline,
          about: next.about,
          services: next.services,
          phone: next.phone.trim() === "" ? null : next.phone.trim(),
          email: next.email.trim() === "" ? null : next.email.trim(),
          address: next.address.trim() === "" ? null : next.address.trim(),
          accentColor: next.accentColor,
        }),
      });
      setSaveStatus("saved");
    }, SAVE_DEBOUNCE_MS);
  }

  function update(patch: Partial<SiteFormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      scheduleSave(next);
      return next;
    });
  }

  function updateService(index: number, patch: Partial<SiteService>) {
    const services = form.services.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update({ services });
  }

  function addService() {
    update({ services: [...form.services, { name: "", description: "" }] });
  }

  function removeService(index: number) {
    update({ services: form.services.filter((_, i) => i !== index) });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/sites" className="text-sm text-neutral-500 underline">
            ← All sites
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{form.businessName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : ""}
          </span>
          <Link
            href={`/sites/${site.id}/preview`}
            target="_blank"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium"
          >
            Open preview
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <Field label="Template">
            <select
              value={form.template}
              onChange={(e) => update({ template: e.target.value as SiteTemplateId })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              {SITE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Business name">
            <input
              value={form.businessName}
              onChange={(e) => update({ businessName: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="About">
            <textarea
              value={form.about}
              onChange={(e) => update({ about: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Accent color">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="h-9 w-16 rounded-md border border-neutral-300"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Email">
            <input
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Services</span>
              <button
                type="button"
                onClick={addService}
                className="text-xs font-medium text-neutral-600 underline"
              >
                + Add service
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.services.map((service, i) => (
                <div key={i} className="rounded-md border border-neutral-200 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={service.name}
                      onChange={(e) => updateService(i, { name: e.target.value })}
                      placeholder="Service name"
                      className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="text-xs text-neutral-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(i, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="max-h-[calc(100vh-160px)] overflow-y-auto rounded-lg border border-neutral-200">
          <SiteTemplateRenderer
            templateId={form.template}
            businessName={form.businessName}
            tagline={form.tagline}
            about={form.about}
            services={form.services}
            phone={form.phone || null}
            email={form.email || null}
            address={form.address || null}
            accentColor={form.accentColor}
          />
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
