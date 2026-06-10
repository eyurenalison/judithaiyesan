import Image from "next/image";
import type { Album } from "../lib/content/types";

type AlbumCardProps = {
  album: Album;
};

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <article className="media-card">
      <div className="media-card-image">
        <Image
          src={album.coverSrc}
          alt={album.title}
          fill
          sizes="(max-width: 760px) 100vw, 260px"
        />
      </div>
      <div className="media-card-body">
        <p
          style={{
            textAlign: "center",
            padding: "0",
            fontSize: "0.75rem",
            fontWeight: "400",
          }}
        >
          {album.subtitle}
        </p>
        <h4 style={{ textAlign: "center", fontSize: "0.875rem", padding: "0" }}>
          {album.title}
        </h4>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={album.listenHref}
            style={{
              textTransform: "uppercase",
              fontSize: "0.9rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Click To Listen
          </a>
        </div>
      </div>
    </article>
  );
}
