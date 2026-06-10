"use client";

import { useState } from "react";
import type { Lyric } from "../lib/content/types";

type LyricsAccordionProps = {
  lyrics: Lyric[];
};

export function LyricsAccordion({ lyrics }: LyricsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  if (lyrics.length === 0) {
    return <p className="lyrics-empty">No lyrics available yet.</p>;
  }

  return (
    <div className="lyrics-accordion">
      {lyrics.map((lyric, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            className={`lyrics-accordion-item ${isOpen ? "open" : ""}`}
            key={lyric.title}
          >
            <button
              aria-expanded={isOpen}
              className="lyrics-accordion-header"
              onClick={() => toggle(index)}
              type="button"
            >
              <span className="lyrics-accordion-title">
                <span className="lyrics-accordion-icon">♫</span>
                {lyric.title}
              </span>
              <span
                className={`lyrics-accordion-chevron ${isOpen ? "rotated" : ""}`}
              >
                ▾
              </span>
            </button>
            <div
              className={`lyrics-accordion-collapse ${isOpen ? "expanded" : ""}`}
            >
              <div className="lyrics-accordion-body">
                {lyric.summary ? (
                  <p className="lyrics-summary">{lyric.summary}</p>
                ) : null}
                <div
                  className="lyrics-body-text"
                  dangerouslySetInnerHTML={{
                    __html: lyric.body
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
