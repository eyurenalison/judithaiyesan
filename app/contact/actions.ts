"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "../lib/db";

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createContactMessage(formData: FormData) {
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const subject = readField(formData, "subject");
  const message = readField(formData, "message");

  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required.");
  }

  await getPrisma().contactMessage.create({
    data: {
      email,
      message,
      name,
      subject: subject || null,
    },
  });

  revalidatePath("/admin/messages");
}
