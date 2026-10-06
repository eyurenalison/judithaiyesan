import { ContactSection } from "../components/contact-section";
import { PageHero } from "../components/page-hero";
import { getSiteSettings } from "../lib/content";
import { ContactForm } from "./contact-form";

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
          <ContactForm />
        </div>
      </section>
    </>
  );
}
