"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "../lib/content/types";

type HeroCarouselProps = {
  slides: HeroSlide[];
};

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const updateSelected = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", updateSelected);
    updateSelected();

    return () => {
      emblaApi.off("select", updateSelected);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const intervalId = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [emblaApi]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-carousel" aria-label="Featured homepage slides">
      <div className="embla" ref={emblaRef}>
        <div className="embla-track">
          {slides.map((slide) => (
            <article
              className="hero-slide"
              key={`${slide.title}-${slide.order}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.46), rgba(0, 0, 0, 0.46)), url("${slide.imageSrc}")`,
              }}
            >
              <div className="site-shell">
                {slide.subtitle ? (
                  <p className="eyebrow">{slide.subtitle}</p>
                ) : null}
                <h1>{slide.title}</h1>
                {slide.buttonLabel && slide.buttonUrl ? (
                  <Link className="hero-link" href={slide.buttonUrl}>
                    {slide.buttonLabel}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      <button
        aria-label="Previous slide"
        className="carousel-control previous"
        onClick={scrollPrev}
        type="button"
      >
        &lt;
      </button>
      <button
        aria-label="Next slide"
        className="carousel-control next"
        onClick={scrollNext}
        type="button"
      >
        &gt;
      </button>
      <div className="carousel-dots">
        {slides.map((slide, index) => (
          <button
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={selectedIndex === index}
            className="carousel-dot"
            key={`${slide.title}-dot`}
            onClick={() => emblaApi?.scrollTo(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
