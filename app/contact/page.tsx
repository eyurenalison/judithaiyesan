import { ContactSection } from "../components/contact-section";
import { PageHero } from "../components/page-hero";
import { getSiteSettings } from "../lib/content";
import { createContactMessage } from "./actions";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        description="Contact details now live in one shared section that can be reused across the public site."
        eyebrow="Contact"
        imageSrc="/images/bg-img/banner.jpg"
        title="Contact"
      />
      <ContactSection
        settings={settings}
        title="Contact Judith Aiyesan"
        tone="light"
      />
      <section className="page-section">
        <div className="site-shell contact-form-shell">
          <form
            action={createContactMessage}
            className="admin-form contact-form"
          >
            <div className="section-heading">
              <p className="eyebrow">Message</p>
              <h2>Send A Message</h2>
            </div>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" required type="email" />
            </label>
            <label>
              Subject
              <input name="subject" />
            </label>
            <label>
              Message
              <textarea name="message" required rows={7} />
            </label>
            <button className="primary-button" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
