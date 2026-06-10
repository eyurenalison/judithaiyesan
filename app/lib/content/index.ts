import {
  albums,
  events,
  heroSlides,
  lyrics,
  siteSettings,
} from "./seed-content";
import type {
  Album,
  EventItem,
  GalleryImage,
  HeroSlide,
  Lyric,
  SiteSettings,
} from "./types";

async function readDatabase<T>(reader: () => Promise<T>, fallback: T) {
  try {
    return await reader();
  } catch {
    return fallback;
  }
}

export async function getSiteSettings() {
  return readDatabase<SiteSettings>(async () => {
    const { getPrisma } = await import("../db");
    const settings = await getPrisma().siteSettings.findFirst();

    if (!settings) {
      return siteSettings;
    }

    return {
      contactAddress: settings.contactAddress,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      facebookUrl: settings.facebookUrl ?? undefined,
      faviconSrc: settings.faviconSrc,
      instagramUrl: settings.instagramUrl ?? undefined,
      logoSrc: settings.logoSrc,
      siteName: settings.siteName,
    };
  }, siteSettings);
}

export async function getHeroSlides() {
  const fallback = heroSlides
    .filter((slide) => slide.published)
    .sort((first, second) => first.order - second.order);

  return readDatabase<HeroSlide[]>(async () => {
    const { getPrisma } = await import("../db");
    const slides = await getPrisma().heroSlide.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      where: { published: true },
    });

    if (slides.length === 0) {
      return fallback;
    }

    return slides.map((slide) => ({
      buttonLabel: slide.buttonLabel ?? undefined,
      buttonUrl: slide.buttonUrl ?? undefined,
      imageSrc: slide.imageSrc,
      order: slide.order,
      published: slide.published,
      subtitle: slide.subtitle ?? undefined,
      title: slide.title,
    }));
  }, fallback);
}

export async function getAlbums() {
  const fallback = albums
    .filter((album) => album.published)
    .sort((first, second) => first.order - second.order);

  return readDatabase<Album[]>(async () => {
    const { getPrisma } = await import("../db");
    const records = await getPrisma().album.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      where: { published: true },
    });

    if (records.length === 0) {
      return fallback;
    }

    return records.map((album) => ({
      audioSrc: album.audioFileSrc ?? undefined,
      coverSrc: album.coverImageSrc,
      downloadHref: album.downloadFileSrc ?? undefined,
      featured: album.featured,
      listenHref: album.externalListenUrl ?? album.audioFileSrc ?? "#",
      order: album.order,
      published: album.published,
      subtitle: album.subtitle ?? "Single",
      title: album.title,
    }));
  }, fallback);
}

export async function getFeaturedAlbums(limit?: number) {
  const allAlbums = await getAlbums();
  const featuredAlbums = allAlbums.filter((album) => album.featured);

  return typeof limit === "number"
    ? featuredAlbums.slice(0, limit)
    : featuredAlbums;
}

export async function getLyrics() {
  const fallback = lyrics.filter((lyric) => lyric.published);

  return readDatabase<Lyric[]>(async () => {
    const { getPrisma } = await import("../db");
    const records = await getPrisma().lyric.findMany({
      orderBy: { createdAt: "desc" },
      where: { published: true },
    });

    if (records.length === 0) {
      return fallback;
    }

    return records.map((lyric) => ({
      body: lyric.body,
      coverSrc: lyric.coverSrc ?? undefined,
      published: lyric.published,
      summary: lyric.summary ?? "",
      title: lyric.songTitle,
    }));
  }, fallback);
}

export async function getEvents() {
  const fallback = events.filter((event) => event.published);

  return readDatabase<EventItem[]>(async () => {
    const { getPrisma } = await import("../db");
    const records = await getPrisma().event.findMany({
      include: {
        galleryItems: {
          include: { media: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "desc" },
      where: { published: true },
    });

    if (records.length === 0) {
      return fallback;
    }

    return records.map((event) => {
      const gallery: GalleryImage[] = event.galleryItems.map((item) => ({
        alt: item.media.altText ?? event.title,
        caption: item.caption ?? undefined,
        src: item.media.url,
      }));

      return {
        date: event.displayDate,
        description: event.description,
        gallery: gallery.length > 0 ? gallery : undefined,
        imageSrc: event.coverImageSrc,
        location: event.location,
        published: event.published,
        status: event.status === "past" ? "Past" : "Upcoming",
        title: event.title,
      };
    });
  }, fallback);
}
