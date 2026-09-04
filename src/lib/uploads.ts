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
