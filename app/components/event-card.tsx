"use client";

import Image from "next/image";
import { useState } from "react";
import type { EventItem } from "../lib/content/types";
import { GalleryModal } from "./gallery-modal";
import { Modal } from "./modal";

type EventCardProps = {
  event: EventItem;
};

export function EventCard({ event }: EventCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <article className="media-card event-card">
      <div className="media-card-image">
        <Image
          src={event.imageSrc}
          alt={event.title}
          fill
          sizes="(max-width: 760px) 100vw, 360px"
        />
        <span className="status-pill">{event.status}</span>
      </div>
      <div className="media-card-body">
        <p className="card-kicker">{event.date}</p>
        <br />
        <h2>{event.title}</h2> <br />
        <p>{event.location}</p> <br />
        <p>{event.description}</p> <br />
        <div className="card-actions" style={{ paddingTop: "10px" }}>
          <button
            className="text-button"
            onClick={() => setIsDetailsOpen(true)}
            type="button"
          >
            See Event
          </button>
          {event.gallery?.length ? (
            <GalleryModal
              images={event.gallery}
              title={`${event.title} Gallery`}
            />
          ) : null}
        </div>
      </div>
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={event.title}
      >
        <div className="dialog-body event-dialog-body">
          <div className="event-dialog-image">
            <Image
              src={event.imageSrc}
              alt={event.title}
              fill
              sizes="(max-width: 760px) 100vw, 420px"
            />
          </div>
          <div className="event-dialog-content">
            <p className="card-kicker">{event.status}</p>
            <p>
              <strong>Date:</strong> {event.date}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <p>{event.description}</p>
          </div>
        </div>
      </Modal>
    </article>
  );
}
