import { AlbumCard } from "../components/album-card";
import { HomeContactForm } from "../components/home-contact-form";
import { PageHero } from "../components/page-hero";
import { getAlbums, getSiteSettings } from "../lib/content";

export default async function AlbumsPage() {
  const [settings, albums] = await Promise.all([
    getSiteSettings(),
    getAlbums(),
  ]);

  return (
    <>
      <PageHero
        description="Album covers, audio previews, listening links, and downloads now share one reusable album card."
        eyebrow="Music"
        imageSrc="/images/bg-img/breadcumb3.jpg"
        title="Albums"
      />
      <section className="page-section">
        <div className="site-shell">
          <div className="section-heading">
            <p className="eyebrow">Releases</p>
            <h2>Featured Music</h2>
          </div>
          <div className="card-grid">
            {albums.map((album) => (
              <AlbumCard album={album} key={album.title} />
            ))}
          </div>
        </div>
      </section>
      <section className="home-contact-section">
        <div className="site-shell">
          <div className="home-section-heading white">
            <p>See what&apos;s new</p>
            <h2>Get In Touch</h2>
          </div>
          <HomeContactForm />
          <p className="home-contact-meta">
            {settings.contactEmail} · {settings.contactPhone}
          </p>
        </div>
      </section>
    </>
  );
}
