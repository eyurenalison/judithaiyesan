import Image from "next/image";
import { AlbumCard } from "./components/album-card";
import { AudioPlayer } from "./components/audio-player";
import { HeroCarousel } from "./components/hero-carousel";
import { HomeContactForm } from "./components/home-contact-form";
import { getAlbums, getHeroSlides, getSiteSettings } from "./lib/content";

export default async function HomePage() {
  const [settings, heroSlides, albums] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getAlbums(),
  ]);
  const latestAlbum = albums[0];

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <section className="home-section latest-release-section">
        <div className="site-shell">
          <div className="home-section-heading">
            <p>See what&apos;s new</p>
            <h2>Latest Release</h2>
          </div>
          <div className="albums-intro">
            <p>
              These are inspirational, faith-filled and life-transforming songs,
              from real life experiences and based on the unfailing Word of God.
              These songs will take you from a place of pain and unbelief to a
              place of indescribable joy and faith in the finished work of our
              Lord, Jesus Christ.
            </p>
          </div>
          <div className="home-album-strip">
            {albums.map((album) => (
              <AlbumCard album={album} key={album.title} />
            ))}
          </div>
        </div>
      </section>
      <section className="home-section download-section">
        <div className="site-shell">
          <div className="home-section-heading">
            <p>See what&apos;s new</p>
            <h2>Download</h2>
          </div>
          <div className="download-grid">
            {albums.map((album) => (
              <article className="download-card" key={album.title}>
                <Image
                  src={album.coverSrc}
                  alt={album.title}
                  width={360}
                  height={360}
                />
                <h3>{album.title}</h3>
                <div className="download-actions">
                  <a href={album.listenHref}>Listen</a>
                  {album.downloadHref ? (
                    <a href={album.downloadHref}>Download</a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {latestAlbum ? (
        <section className="home-featured-artist">
          <div className="site-shell featured-artist-grid">
            <div className="featured-artist-thumb">
              <Image
                src={latestAlbum.coverSrc}
                alt={latestAlbum.title}
                width={520}
                height={520}
              />
            </div>
            <div className="featured-artist-content">
              <div className="home-section-heading white left">
                <p>See what&apos;s new</p>
                <h2>Buy What&apos;s New</h2>
              </div>
              <p>
                Listen to the latest song by Min. Juditha, {latestAlbum.title}.
              </p>
              {latestAlbum.audioSrc ? (
                <AudioPlayer
                  src={latestAlbum.audioSrc}
                  title={latestAlbum.title}
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
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
