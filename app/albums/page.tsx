import { AlbumCard } from "../components/album-card";
import { PageHero } from "../components/page-hero";
import { createContactMessage } from "../contact/actions";
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
          <form action={createContactMessage} className="home-contact-form">
            <input name="name" placeholder="Name" required />
            <input name="email" placeholder="E-mail" required type="email" />
            <input name="subject" placeholder="Subject" />
            <textarea name="message" placeholder="Message" required rows={8} />
            <button className="home-outline-button" type="submit">
              Send
            </button>
          </form>
          <p className="home-contact-meta">
            {settings.contactEmail} · {settings.contactPhone}
          </p>
        </div>
      </section>
    </>
  );
}
