import { TheatreMediaManager } from "@/components/TheatreDashboardForms";
import { getOwnerTheatre } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

export default async function TheatreMediaPage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;
  return <>
    <div className="owner-page-heading"><p>Public presence</p><h1>Reels &amp; Stories</h1><span>Publish the content that appears in Theatre Reels and TheatreHub Stories.</span></div>
    <TheatreMediaManager reels={theatre.reels} stories={theatre.stories} />
  </>;
}
