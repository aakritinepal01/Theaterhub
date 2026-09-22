export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
export const MAX_POST_FILES = 10;
export const MAX_POST_BYTES = 100 * 1024 * 1024;
export function validatePostFiles(files: { type: string; size: number }[]) {
  if (!files.length || files.length > MAX_POST_FILES) return "Select between 1 and 10 photos or videos.";
  if (files.reduce((total, file) => total + file.size, 0) > MAX_POST_BYTES) return "Keep the total upload under 100 MB.";
  for (const file of files) {
    const type = file.type.split(";")[0];
    if (!MEDIA_ACCEPT.split(",").includes(type)) return "Choose JPG, PNG, WebP, GIF, MP4, MOV or WebM files.";
    if (!file.size) return "An empty file cannot be posted.";
    if (file.size > (type.startsWith("video/") ? 50 : 10) * 1024 * 1024) return "Photos can be up to 10 MB and videos up to 50 MB.";
  }
  return null;
}
