import { v2 as cloudinary } from "cloudinary";

// Initialise once — safe to import from anywhere on the server
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // always return https URLs
});

export { cloudinary };

// ─── Upload utility ────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  secureUrl:  string;   // https://res.cloudinary.com/…
  publicId:   string;   // e.g. "theatrehub/plays/abc123"
  resourceType: string; // "image" | "video" | "raw"
  format:     string;   // "jpg", "mp4", …
  bytes:      number;
  width?:     number;
  height?:    number;
}

/**
 * Upload any File (image or video) to Cloudinary.
 *
 * @param file   - A Web API File object (from FormData)
 * @param folder - Cloudinary folder, e.g. "theatrehub/plays"
 */
export async function uploadToCloudinary(
  file: File,
  folder = "theatrehub",
): Promise<CloudinaryUploadResult> {
  if (file.size === 0) throw new Error("Uploaded file is empty");
  if (file.size > 100 * 1024 * 1024) throw new Error("File must be smaller than 100 MB");

  // Convert File → base64 data URI — works in Node 18+ / Next.js edge-safe
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto", // handles images AND videos automatically
    use_filename:  false,  // let Cloudinary generate a unique public_id
    overwrite:     false,
  });

  return {
    secureUrl:    result.secure_url,
    publicId:     result.public_id,
    resourceType: result.resource_type,
    format:       result.format,
    bytes:        result.bytes,
    width:        result.width,
    height:       result.height,
  };
}
