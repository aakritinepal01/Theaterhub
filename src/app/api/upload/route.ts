import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { uploadImage } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "theatres";

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "No file selected." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File must be smaller than 10 MB." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image files (JPG, PNG, WebP, GIF) are allowed." }, { status: 400 });
    }

    const url = await uploadImage(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to upload image." },
      { status: 500 }
    );
  }
}
