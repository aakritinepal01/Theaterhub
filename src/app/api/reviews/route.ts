import { NextResponse } from "next/server";
import { createReviewSubmission, ReviewSubmissionValidationError } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const review = await createReviewSubmission(payload);

    return NextResponse.json(
      {
        ok: true,
        review,
        message: "Review submitted for admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ReviewSubmissionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Review submission failed:", error);
    return NextResponse.json({ error: "Unable to submit review right now." }, { status: 500 });
  }
}
