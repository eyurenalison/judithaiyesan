"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { getPrisma } from "../lib/db";
import { checkRateLimit, getClientIp } from "../lib/security";
import { requireAdmin } from "./guard";

export async function adminSignIn(formData: FormData) {
  const clientIp = await getClientIp();
  const rateKey = `admin_login:${clientIp}`;
  const rateCheck = checkRateLimit(rateKey, 5, 15 * 60 * 1000);

  if (!rateCheck.allowed) {
    return {
      error: `Too many failed login attempts from this network. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Invalid email or password. Please verify your credentials.",
        };
      }
      return { error: "Authentication failed. Please try again." };
    }
    // Re-throw redirect error to allow Next.js to navigate
    throw error;
  }
}

export async function adminSignOut() {
  await signOut({
    redirectTo: "/admin/login",
  });
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function intValue(formData: FormData, key: string) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function guardedPrisma() {
  await requireAdmin();
  return getPrisma();
}

export async function saveSettings(formData: FormData) {
  const prisma = await guardedPrisma();
  const id = optionalText(formData, "id");
  const data = {
    contactAddress: text(formData, "contactAddress"),
    contactEmail: text(formData, "contactEmail"),
    contactPhone: text(formData, "contactPhone"),
    facebookUrl: optionalText(formData, "facebookUrl"),
    faviconSrc: text(formData, "faviconSrc"),
    instagramUrl: optionalText(formData, "instagramUrl"),
    logoSrc: text(formData, "logoSrc"),
    siteName: text(formData, "siteName"),
  };

  if (id) {
    await prisma.siteSettings.update({ data, where: { id } });
  } else {
    await prisma.siteSettings.create({ data });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function createHeroSlide(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.heroSlide.create({
    data: {
      buttonLabel: optionalText(formData, "buttonLabel"),
      buttonUrl: optionalText(formData, "buttonUrl"),
      imageSrc: text(formData, "imageSrc"),
      order: intValue(formData, "order"),
      published: boolValue(formData, "published"),
      subtitle: optionalText(formData, "subtitle"),
      title: text(formData, "title"),
    },
  });

  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function updateHeroSlide(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.heroSlide.update({
    data: {
      buttonLabel: optionalText(formData, "buttonLabel"),
      buttonUrl: optionalText(formData, "buttonUrl"),
      imageSrc: text(formData, "imageSrc"),
      order: intValue(formData, "order"),
      published: boolValue(formData, "published"),
      subtitle: optionalText(formData, "subtitle"),
      title: text(formData, "title"),
    },
    where: { id: text(formData, "id") },
  });

  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function deleteHeroSlide(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.heroSlide.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function createAlbum(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.album.create({
    data: {
      audioFileSrc: optionalText(formData, "audioFileSrc"),
      coverImageSrc: text(formData, "coverImageSrc"),
      downloadFileSrc: optionalText(formData, "downloadFileSrc"),
      externalListenUrl: optionalText(formData, "externalListenUrl"),
      featured: boolValue(formData, "featured"),
      order: intValue(formData, "order"),
      published: boolValue(formData, "published"),
      subtitle: optionalText(formData, "subtitle"),
      title: text(formData, "title"),
    },
  });

  revalidatePath("/admin/albums");
  revalidatePath("/albums");
  revalidatePath("/");
}

export async function updateAlbum(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.album.update({
    data: {
      audioFileSrc: optionalText(formData, "audioFileSrc"),
      coverImageSrc: text(formData, "coverImageSrc"),
      downloadFileSrc: optionalText(formData, "downloadFileSrc"),
      externalListenUrl: optionalText(formData, "externalListenUrl"),
      featured: boolValue(formData, "featured"),
      order: intValue(formData, "order"),
      published: boolValue(formData, "published"),
      subtitle: optionalText(formData, "subtitle"),
      title: text(formData, "title"),
    },
    where: { id: text(formData, "id") },
  });

  revalidatePath("/admin/albums");
  revalidatePath("/albums");
  revalidatePath("/");
}

export async function deleteAlbum(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.album.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/albums");
  revalidatePath("/albums");
  revalidatePath("/");
}

export async function createLyric(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.lyric.create({
    data: {
      body: text(formData, "body"),
      coverSrc: optionalText(formData, "coverSrc"),
      published: boolValue(formData, "published"),
      songTitle: text(formData, "songTitle"),
      summary: optionalText(formData, "summary"),
    },
  });

  revalidatePath("/admin/lyrics");
  revalidatePath("/lyrics");
}

export async function updateLyric(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.lyric.update({
    data: {
      body: text(formData, "body"),
      coverSrc: optionalText(formData, "coverSrc"),
      published: boolValue(formData, "published"),
      songTitle: text(formData, "songTitle"),
      summary: optionalText(formData, "summary"),
    },
    where: { id: text(formData, "id") },
  });

  revalidatePath("/admin/lyrics");
  revalidatePath("/lyrics");
}

export async function deleteLyric(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.lyric.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/lyrics");
  revalidatePath("/lyrics");
}

export async function createEvent(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.event.create({
    data: {
      coverImageSrc: text(formData, "coverImageSrc"),
      date: new Date(text(formData, "date")),
      description: text(formData, "description"),
      displayDate: text(formData, "displayDate"),
      location: text(formData, "location"),
      published: boolValue(formData, "published"),
      status: text(formData, "status"),
      title: text(formData, "title"),
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.event.update({
    data: {
      coverImageSrc: text(formData, "coverImageSrc"),
      date: new Date(text(formData, "date")),
      description: text(formData, "description"),
      displayDate: text(formData, "displayDate"),
      location: text(formData, "location"),
      published: boolValue(formData, "published"),
      status: text(formData, "status"),
      title: text(formData, "title"),
    },
    where: { id: text(formData, "id") },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.event.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function attachGalleryItem(formData: FormData) {
  const prisma = await guardedPrisma();

  await prisma.galleryItem.create({
    data: {
      caption: optionalText(formData, "caption"),
      eventId: text(formData, "eventId"),
      mediaId: text(formData, "mediaId"),
      order: intValue(formData, "order"),
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function removeGalleryItem(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.galleryItem.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteMedia(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.media.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/media");
}

export async function markMessageRead(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.contactMessage.update({
    data: { read: true },
    where: { id: text(formData, "id") },
  });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData: FormData) {
  const prisma = await guardedPrisma();
  await prisma.contactMessage.delete({ where: { id: text(formData, "id") } });
  revalidatePath("/admin/messages");
}

function parseIds(formData: FormData): string[] {
  const raw = formData.get("ids");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function deleteMessagesBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.contactMessage.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/messages");
}

export async function deleteAlbumsBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.album.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/albums");
  revalidatePath("/albums");
  revalidatePath("/");
}

export async function deleteEventsBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.event.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteHeroSlidesBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.heroSlide.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function deleteMediaBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.media.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/media");
}

export async function deleteLyricsBulk(formData: FormData) {
  const prisma = await guardedPrisma();
  const ids = parseIds(formData);
  if (ids.length === 0) return;
  await prisma.lyric.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/admin/lyrics");
  revalidatePath("/lyrics");
}
