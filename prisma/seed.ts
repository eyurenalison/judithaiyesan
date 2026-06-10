import "dotenv/config";
import { getPrisma } from "../app/lib/db";
import {
  albums,
  events,
  heroSlides,
  lyrics,
  siteSettings,
} from "../app/lib/content/seed-content";

const prisma = getPrisma();

async function seedSettings() {
  await prisma.siteSettings.upsert({
    create: {
      id: "site-settings",
      ...siteSettings,
    },
    update: siteSettings,
    where: { id: "site-settings" },
  });
}

async function seedHeroSlides() {
  for (const slide of heroSlides) {
    await prisma.heroSlide.upsert({
      create: {
        id: `hero-slide-${slide.order}`,
        ...slide,
      },
      update: slide,
      where: { id: `hero-slide-${slide.order}` },
    });
  }
}

async function seedAlbums() {
  for (const album of albums) {
    const id = `album-${album.title.toLowerCase().replaceAll(" ", "-")}`;

    await prisma.album.upsert({
      create: {
        id,
        audioFileSrc: album.audioSrc,
        coverImageSrc: album.coverSrc,
        downloadFileSrc: album.downloadHref,
        externalListenUrl: album.listenHref,
        featured: album.featured,
        order: album.order,
        published: album.published,
        subtitle: album.subtitle,
        title: album.title,
      },
      update: {
        audioFileSrc: album.audioSrc,
        coverImageSrc: album.coverSrc,
        downloadFileSrc: album.downloadHref,
        externalListenUrl: album.listenHref,
        featured: album.featured,
        order: album.order,
        published: album.published,
        subtitle: album.subtitle,
        title: album.title,
      },
      where: { id },
    });
  }
}

async function seedLyrics() {
  for (const lyric of lyrics) {
    const id = `lyric-${lyric.title.toLowerCase().replaceAll(" ", "-")}`;

    await prisma.lyric.upsert({
      create: {
        id,
        body: lyric.body,
        coverSrc: lyric.coverSrc,
        published: lyric.published,
        songTitle: lyric.title,
        summary: lyric.summary,
      },
      update: {
        body: lyric.body,
        coverSrc: lyric.coverSrc,
        published: lyric.published,
        songTitle: lyric.title,
        summary: lyric.summary,
      },
      where: { id },
    });
  }
}

function eventDateFromDisplay(displayDate: string) {
  const parsedDate = new Date(displayDate.replace(" at ", " "));

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

async function seedEventsAndGallery() {
  for (const event of events) {
    const eventId = `event-${event.title.toLowerCase().replaceAll(" ", "-")}`;
    const status = event.status.toLowerCase();

    await prisma.event.upsert({
      create: {
        id: eventId,
        coverImageSrc: event.imageSrc,
        date: eventDateFromDisplay(event.date),
        description: event.description,
        displayDate: event.date,
        location: event.location,
        published: event.published,
        status,
        title: event.title,
      },
      update: {
        coverImageSrc: event.imageSrc,
        date: eventDateFromDisplay(event.date),
        description: event.description,
        displayDate: event.date,
        location: event.location,
        published: event.published,
        status,
        title: event.title,
      },
      where: { id: eventId },
    });

    if (!event.gallery?.length) {
      continue;
    }

    for (const [index, image] of event.gallery.entries()) {
      const mediaId = `media-upper-room-${index + 1}`;

      await prisma.media.upsert({
        create: {
          id: mediaId,
          altText: image.alt,
          filename: image.src.split("/").at(-1),
          type: "image",
          url: image.src,
        },
        update: {
          altText: image.alt,
          filename: image.src.split("/").at(-1),
          type: "image",
          url: image.src,
        },
        where: { id: mediaId },
      });

      await prisma.galleryItem.upsert({
        create: {
          eventId,
          mediaId,
          order: index,
        },
        update: {
          order: index,
        },
        where: {
          eventId_mediaId: {
            eventId,
            mediaId,
          },
        },
      });
    }
  }
}

async function main() {
  await seedSettings();
  await seedHeroSlides();
  await seedAlbums();
  await seedLyrics();
  await seedEventsAndGallery();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeded.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
