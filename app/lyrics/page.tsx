import { LyricsAccordion } from "../components/lyrics-accordion";
import { PageHero } from "../components/page-hero";
import { createContactMessage } from "../contact/actions";
import { getLyrics, getSiteSettings } from "../lib/content";

export default async function LyricsPage() {
  const [settings, lyrics] = await Promise.all([
    getSiteSettings(),
    getLyrics(),
  ]);

  return (
    <>
      <PageHero
        description="Explore the lyrics to all of Judith Aiyesan's songs."
        eyebrow="Lyrics"
        imageSrc="/images/bg-img/breadcumb3.jpg"
        title="Song Lyrics"
      />
      <section className="page-section">
        <div className="site-shell">
          <div className="lyrics-page-layout">
            <div className="lyrics-main">
              <div className="section-heading">
                <p className="eyebrow">Songs</p>
                <h2>Available Lyrics</h2>
              </div>
              <LyricsAccordion lyrics={lyrics} />
            </div>
            {lyrics.some((l) => l.coverSrc) ? (
              <aside className="lyrics-sidebar">
                {lyrics
                  .filter((l) => l.coverSrc)
                  .map((l) => (
                    <div className="lyrics-sidebar-card" key={l.title}>
                      <img alt={l.title} src={l.coverSrc} />
                    </div>
                  ))}
              </aside>
            ) : null}
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
