import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import SiteEditor from "@/components/SiteEditor";
import { getSite } from "@/lib/sites";

// The site being edited is mutable local data — render fresh per request.
export const dynamic = "force-dynamic";

export default async function SiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSite(id);
  if (!site) notFound();

  return (
    <>
      <NavBar />
      <SiteEditor site={site} />
    </>
  );
}
