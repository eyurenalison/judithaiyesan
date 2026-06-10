import type { CSSProperties } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  imageSrc?: string;
  variant?: "default" | "home";
};

export function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  variant = "default",
}: PageHeroProps) {
  const style = imageSrc
    ? ({
        "--hero-image": `url("${imageSrc}")`,
      } as CSSProperties)
    : undefined;

  return (
    <section className={`page-hero ${variant}`} style={style}>
      <div className="site-shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className="lede">{description}</p> : null}
      </div>
    </section>
  );
}
