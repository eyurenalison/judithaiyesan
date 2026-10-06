import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { HeroSlidesClient } from "./hero-slides-client";

export default async function AdminHeroSlidesPage() {
  await requireAdmin();
  const slides = await getPrisma().heroSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminShell
      description="Design and manage homepage carousel banners, action buttons, and slide order."
      title="Hero Slides"
    >
      <HeroSlidesClient initialSlides={slides} />
    </AdminShell>
  );
}
