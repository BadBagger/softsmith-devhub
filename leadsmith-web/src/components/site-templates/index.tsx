import type { SiteTemplateId } from "@/lib/site-types";
import type { SiteTemplateProps } from "./types";
import ModernTemplate from "./Modern";
import ClassicTemplate from "./Classic";

export type { SiteTemplateProps } from "./types";

interface SiteTemplateRendererProps extends SiteTemplateProps {
  templateId: SiteTemplateId;
}

export default function SiteTemplateRenderer({ templateId, ...props }: SiteTemplateRendererProps) {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate {...props} />;
    case "modern":
    default:
      return <ModernTemplate {...props} />;
  }
}
