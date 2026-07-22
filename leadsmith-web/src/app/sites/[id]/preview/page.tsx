import { notFound } from "next/navigation";
import { getSite } from "@/lib/sites";
import { parseServices } from "@/lib/site-types";
import SiteTemplateRenderer from "@/components/site-templates";

// The site content is mutable local data — render fresh per request.
export const dynamic = "force-dynamic";

export default async function SitePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSite(id);
  if (!site) notFound();

  return (
    <SiteTemplateRenderer
      templateId={site.template}
      businessName={site.business_name}
      tagline={site.tagline}
      about={site.about}
      services={parseServices(site.services)}
      phone={site.phone}
      email={site.email}
      address={site.address}
      accentColor={site.accent_color}
    />
  );
}
