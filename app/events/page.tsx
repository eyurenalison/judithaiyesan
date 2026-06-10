import { EventCard } from "../components/event-card";
import { PageHero } from "../components/page-hero";
import { createContactMessage } from "../contact/actions";
import { getEvents, getSiteSettings } from "../lib/content";

export default async function EventsPage() {
  const [settings, events] = await Promise.all([
    getSiteSettings(),
    getEvents(),
  ]);

  return (
    <>
      <PageHero
        description="Upcoming events, past events, and galleries now use reusable event and gallery components."
        eyebrow="Events"
        imageSrc="/images/bg-img/breadcumb3.jpg"
        title="Events"
      />
      <section className="page-section">
        <div className="site-shell">
          <div className="section-heading">
            <p className="eyebrow">Gatherings</p>
            <h2>Upcoming And Past Events</h2>
          </div>
          <div className="card-grid two-column">
            {events.map((event) => (
              <EventCard event={event} key={`${event.title}-${event.date}`} />
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
