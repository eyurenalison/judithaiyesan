import type { SiteSettings } from "../lib/content/types";

type ContactSectionProps = {
  settings: SiteSettings;
  title?: string;
  tone?: "light" | "dark";
};

export function ContactSection({
  settings,
  title = "Get In Touch",
  tone = "dark",
}: ContactSectionProps) {
  return (
    <section className={`contact-band ${tone}`}>
      <div className="site-shell contact-grid">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>{title}</h2>
          <p>
            For invitations, ministry bookings, collaborations, or general
            inquiries, use the contact details below.
          </p>
        </div>
        <div className="contact-card">
          <a href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
            {settings.contactPhone}
          </a>
          <p>{settings.contactAddress}</p>
        </div>
      </div>
    </section>
  );
}
