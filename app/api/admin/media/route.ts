import { NextResponse } from "next/server";
import { uploadMedia } from "@/app/lib/storage";
import { auth } from "@/auth";
import { getPrisma } from "../../../lib/db";

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  const uploaded = await uploadMedia({
    file,
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER,
    resourceType: "auto",
  });
  const prisma = getPrisma();
  const altText = formData.get("altText");
  const media = await prisma.media.create({
    data: {
      altText: typeof altText === "string" ? altText : null,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      type: uploaded.resourceType,
      url: uploaded.url,
    },
  });

  return NextResponse.json({ ...uploaded, id: media.id });
}
