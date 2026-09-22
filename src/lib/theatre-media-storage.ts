import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { validatePostFiles } from "./theatre-media-validation";

export type StoredAsset = { url: string; mediaType: "image" | "video"; publicId: string | null };

export async function validateMediaContent(file: File) {
  const error = validatePostFiles([file]);
  if (error) throw new Error(error);
  const bytes = Buffer.from(await file.slice(0, 32).arrayBuffer());
  const mime = file.type.split(";")[0];
  const valid = mime === "image/jpeg" ? bytes.subarray(0, 3).equals(Buffer.from([255,216,255]))
    : mime === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : mime === "image/gif" ? /^GIF8[79]a/.test(bytes.toString("ascii"))
    : mime === "image/webp" ? bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
    : mime === "video/webm" ? bytes.subarray(0, 4).equals(Buffer.from([26,69,223,163]))
    : bytes.toString("ascii", 4, 8) === "ftyp";
  if (!valid) throw new Error("One of the selected files is not a valid photo or video. Please choose another file.");
}

export async function storeTheatreMedia(file: File, theatreId: number): Promise<StoredAsset> {
  const mediaType = file.type.startsWith("video/") ? "video" : "image";
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const { uploadToCloudinary } = await import("./cloudinary");
    const result = await uploadToCloudinary(file, `theatrehub/theatre-posts/${theatreId}`);
    return { url: result.secureUrl, mediaType, publicId: result.publicId };
  }
  if (process.env.NODE_ENV === "production") throw new Error("Media storage is not configured. Please contact the administrator.");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
  const folder = `uploads/theatre-posts/${theatreId}`;
  const filename = `${randomUUID()}.${extensions[file.type.split(";")[0]]}`;
  await mkdir(path.join(process.cwd(), "public", folder), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", folder, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/${folder}/${filename}`, mediaType, publicId: null };
}

export async function removeStoredAsset(asset: StoredAsset) {
  if (asset.publicId) {
    const { cloudinary } = await import("./cloudinary");
    await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.mediaType });
  } else if (/^\/uploads\/theatre-posts\/\d+\/[a-f0-9-]+\.(jpg|png|gif|webp|mp4|webm|mov)$/.test(asset.url)) {
    await unlink(path.join(process.cwd(), "public", asset.url.slice(1)));
  }
}
