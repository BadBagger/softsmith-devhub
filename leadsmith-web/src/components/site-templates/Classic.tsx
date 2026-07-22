import type { SiteTemplateProps } from "./types";

export default function ClassicTemplate({
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
    <div className="min-h-full bg-white font-serif text-neutral-900">
      <header className="border-b-4 px-8 py-14 text-center sm:px-16" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-bold sm:text-4xl">{businessName}</h1>
        {tagline && <p className="mt-3 text-base italic text-neutral-600">{tagline}</p>}
      </header>

      {about && (
        <section className="mx-auto max-w-2xl px-8 py-14 sm:px-16">
          <h2
            className="border-b pb-2 text-lg font-semibold"
            style={{ borderColor: accentColor }}
          >
            About Us
          </h2>
          <p className="mt-4 leading-relaxed text-neutral-700">{about}</p>
        </section>
      )}

      {services.length > 0 && (
        <section className="mx-auto max-w-2xl px-8 py-14 sm:px-16">
          <h2
            className="border-b pb-2 text-lg font-semibold"
            style={{ borderColor: accentColor }}
          >
            What We Offer
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {services.map((service, i) => (
              <li key={i}>
                <span className="font-semibold">{service.name}</span>
                <span className="text-neutral-600"> — {service.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mx-auto max-w-2xl px-8 py-14 text-center sm:px-16">
        <h2
          className="border-b pb-2 text-lg font-semibold"
          style={{ borderColor: accentColor }}
        >
          Contact
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
