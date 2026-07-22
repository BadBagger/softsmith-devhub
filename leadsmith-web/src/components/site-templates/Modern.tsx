import type { SiteTemplateProps } from "./types";

export default function ModernTemplate({
  businessName,
  tagline,
  about,
  services,
  phone,
  email,
  address,
  accentColor,
}: SiteTemplateProps) {
  return (
    <div className="min-h-full bg-white font-sans text-neutral-900">
      <section
        className="px-8 py-20 text-center text-white sm:px-16"
        style={{ backgroundColor: accentColor }}
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{businessName}</h1>
        {tagline && <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{tagline}</p>}
      </section>

      {about && (
        <section className="mx-auto max-w-3xl px-8 py-16 text-center sm:px-16">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">About</h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">{about}</p>
        </section>
      )}

      {services.length > 0 && (
        <section className="bg-neutral-50 px-8 py-16 sm:px-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Services
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6">
                <h3 className="font-semibold" style={{ color: accentColor }}>
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="px-8 py-16 text-center sm:px-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Get in touch
        </h2>
        <div className="mt-4 flex flex-col items-center gap-1 text-neutral-700">
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
          {address && <span>{address}</span>}
          {!phone && !email && !address && (
            <span className="text-neutral-400">Add contact info to complete this page.</span>
          )}
        </div>
      </footer>
    </div>
  );
}
