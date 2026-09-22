import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const videoExtensions: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/ogg": "ogv" };

export async function saveUploadedImage(value: FormDataEntryValue | null, folder: string) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > 10 * 1024 * 1024) throw new Error("Image must be smaller than 10 MB");
  const extension = extensions[value.type] || "jpg";
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await value.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}

export async function uploadImage(file: File, folder = "theatres"): Promise<string> {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const { uploadToCloudinary } = await import("./cloudinary");
      const res = await uploadToCloudinary(file, `theatrehub/${folder}`);
      return res.secureUrl;
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local file storage:", err);
    }
  }

  const url = await saveUploadedImage(file, folder);
  if (!url) throw new Error("Failed to save image");
  return url;
}

export async function uploadVideo(file: File, folder = "reels"): Promise<string> {
  if (!file.type.startsWith("video/")) throw new Error("Please select a video file");
  if (file.size > 100 * 1024 * 1024) throw new Error("Video must be smaller than 100 MB");
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try { const { uploadToCloudinary } = await import("./cloudinary"); return (await uploadToCloudinary(file, `theatrehub/${folder}`)).secureUrl; } catch (err) { console.warn("Cloudinary video upload failed, falling back to local storage:", err); }
  }
  const extension = videoExtensions[file.type] || "mp4";
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}
