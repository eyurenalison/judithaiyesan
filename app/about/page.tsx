import Image from "next/image";
import { PageHero } from "../components/page-hero";
import { createContactMessage } from "../contact/actions";
import { getSiteSettings } from "../lib/content";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        description="Songwriter, gospel singer, entrepreneur, public servant, wife, mother, and worship minister."
        eyebrow="About"
        imageSrc="/images/bg-img/j-1.jpg"
        title="Judith Aiyesan"
      />
      <section className="page-section">
        <div className="site-shell split-section">
          <div className="portrait-frame">
            <Image
              src="/images/bg-img/j-2.png"
              alt="Judith Aiyesan"
              fill
              sizes="(max-width: 760px) 100vw, 420px"
            />
          </div>
          <div className="prose">
            <p className="eyebrow">Biography</p>
            <h2>A Life Of Worship And Service</h2>
            <p>
              Judith Aiyesan wears multiple caps as a songwriter, gospel singer,
              entrepreneur, and public servant.
            </p>
            <p>
              Her passion for music began early, singing as a little girl in the
              children&apos;s choir. She has served in music ministry for most
              of her life and writes songs shaped by worship, scripture, and
              real life experiences.
            </p>
            <p>
              She is happily married to Dr. Olabode Aiyesan and they are blessed
              with three children.
            </p>
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
