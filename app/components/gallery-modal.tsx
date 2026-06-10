"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "../lib/content/types";
import { Modal } from "./modal";

type GalleryModalProps = {
  title: string;
  images: GalleryImage[];
};

export function GalleryModal({ title, images }: GalleryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="text-button"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        View Gallery
      </button>
      <Modal
        className="gallery-dialog"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
      >
        <div className="gallery-grid">
          {images.map((image) => (
            <div className="gallery-image" key={image.src}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 50vw, 240px"
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
