import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ReviewItem } from "@/components/ReviewsInteractiveView";

export type ReviewSubmissionStatus = "PENDING" | "APPROVED";

export type ReviewSubmissionRecord = {
  id: number;
  playTitle: string;
  playSlug: string;
  playImage: string | null;
  theatreName: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar: string;
  performanceDate: Date | null;
  viewingContext: string;
  rating: number;
  verdictTag: ReviewItem["verdictTag"];
  reviewTitle: string;
  excerpt: string;
  content: string;
  keyQuote: string;
  acting: number;
  direction: number;
  stageDesign: number;
  script: number;
  recommendation: string;
  status: ReviewSubmissionStatus;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CountRow = {
  status: string;
  count: bigint | number | string;
};

const REVIEWER_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

const scoreSchema = z.coerce
  .number()
  .min(1, "Scores must be at least 1.")
  .max(5, "Scores cannot be greater than 5.")
  .transform((value) => Number(value.toFixed(1)));

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const reviewSubmissionSchema = z.object({
  playTitle: requiredText("Play title", 160),
  theatreName: requiredText("Theatre venue", 160),
  performanceDate: z.union([z.literal(""), z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid performance date.")]).optional().default(""),
  viewingContext: optionalText(220),
  reviewerName: requiredText("Reviewer name", 120),
  reviewerRole: optionalText(80),
  scores: z.object({
    acting: scoreSchema,
    direction: scoreSchema,
    stageDesign: scoreSchema,
    script: scoreSchema,
  }),
  title: requiredText("Review headline", 180),
  keyQuote: optionalText(240),
  summary: requiredText("Short summary", 520),
  critique: requiredText("Detailed critique", 5000),
  whatWorked: optionalText(1600),
  whatCouldImprove: optionalText(1600),
  recommendation: z.enum(["Strongly recommend", "Worth watching", "Mixed experience"]).default("Strongly recommend"),
});

let reviewTableReady: Promise<void> | null = null;

async function createReviewTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS review_submissions (
      id SERIAL PRIMARY KEY,
      play_title TEXT NOT NULL,
      play_slug TEXT NOT NULL UNIQUE,
      play_image TEXT,
      theatre_name TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_role TEXT NOT NULL DEFAULT 'Audience Member',
      reviewer_avatar TEXT NOT NULL DEFAULT '${REVIEWER_AVATAR.replace(/'/g, "''")}',
      performance_date DATE,
      viewing_context TEXT NOT NULL DEFAULT '',
      rating DOUBLE PRECISION NOT NULL,
      verdict_tag TEXT NOT NULL,
      review_title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      key_quote TEXT NOT NULL,
      acting DOUBLE PRECISION NOT NULL,
      direction DOUBLE PRECISION NOT NULL,
      stage_design DOUBLE PRECISION NOT NULL,
      script DOUBLE PRECISION NOT NULL,
      recommendation TEXT NOT NULL DEFAULT 'Strongly recommend',
      status TEXT NOT NULL DEFAULT 'PENDING',
      approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT review_submissions_status_check CHECK (status IN ('PENDING', 'APPROVED'))
    )
  `);
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS review_submissions_status_created_idx ON review_submissions (status, created_at DESC)");
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS review_submissions_status_approved_idx ON review_submissions (status, approved_at DESC)");
}

export async function ensureReviewSubmissionTable() {
  if (!reviewTableReady) {
    reviewTableReady = createReviewTable().catch((error) => {
      reviewTableReady = null;
      throw error;
    });
  }

  await reviewTableReady;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function averageScore(scores: { acting: number; direction: number; stageDesign: number; script: number }) {
  return Number(((scores.acting + scores.direction + scores.stageDesign + scores.script) / 4).toFixed(1));
}

function verdictForRating(rating: number): ReviewItem["verdictTag"] {
  if (rating >= 4.7) return "Masterpiece";
  if (rating >= 4) return "Highly Recommended";
  return "Audience Favorite";
}

function excerptFromSummary(summary: string) {
  return summary.length > 160 ? `${summary.slice(0, 160)}...` : summary;
}

function formatDisplayDate(value: Date | null) {
  if (!value) return "Recent Review";
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function contentFromSubmission(data: z.infer<typeof reviewSubmissionSchema>) {
  const context = [
    data.performanceDate ? `Performance date: ${formatDisplayDate(new Date(`${data.performanceDate}T00:00:00`))}` : "",
    data.viewingContext ? `Viewing context: ${data.viewingContext}` : "",
  ].filter(Boolean);

  return [
    data.critique,
    data.whatWorked ? `What worked best: ${data.whatWorked}` : "",
    data.whatCouldImprove ? `Could be stronger: ${data.whatCouldImprove}` : "",
    context.length ? `${context.join(". ")}.` : "",
    `Recommendation: ${data.recommendation}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export class ReviewSubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewSubmissionValidationError";
  }
}

export async function createReviewSubmission(input: unknown) {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    throw new ReviewSubmissionValidationError(parsed.error.issues[0]?.message || "Invalid review submission.");
  }

  await ensureReviewSubmissionTable();

  const data = parsed.data;
  const submittedAt = new Date();
  const rating = averageScore(data.scores);
  const slugBase = slugify(data.playTitle) || "audience-review";
  const playSlug = `${slugBase}-${submittedAt.getTime()}`;
  const reviewerRole = data.reviewerRole || "Audience Member";
  const keyQuote = data.keyQuote || data.title;
  const performanceDate = data.performanceDate ? new Date(`${data.performanceDate}T00:00:00`) : null;

  if (performanceDate && Number.isNaN(performanceDate.getTime())) {
    throw new ReviewSubmissionValidationError("Invalid performance date.");
  }

  const rows = await prisma.$queryRaw<{ id: number; playSlug: string; status: ReviewSubmissionStatus }[]>`
    INSERT INTO review_submissions (
      play_title,
      play_slug,
      play_image,
      theatre_name,
      reviewer_name,
      reviewer_role,
      reviewer_avatar,
      performance_date,
      viewing_context,
      rating,
      verdict_tag,
      review_title,
      excerpt,
      content,
      key_quote,
      acting,
      direction,
      stage_design,
      script,
      recommendation,
      status
    )
    VALUES (
      ${data.playTitle},
      ${playSlug},
      ${null},
      ${data.theatreName},
      ${data.reviewerName},
      ${reviewerRole},
      ${REVIEWER_AVATAR},
      ${performanceDate},
      ${data.viewingContext},
      ${rating},
      ${verdictForRating(rating)},
      ${data.title},
      ${excerptFromSummary(data.summary)},
      ${contentFromSubmission(data)},
      ${keyQuote},
      ${data.scores.acting},
      ${data.scores.direction},
      ${data.scores.stageDesign},
      ${data.scores.script},
      ${data.recommendation},
      ${"PENDING"}
    )
    RETURNING id, play_slug AS "playSlug", status
  `;

  return rows[0];
}

const reviewSubmissionSelect = `
  SELECT
    id,
    play_title AS "playTitle",
    play_slug AS "playSlug",
    play_image AS "playImage",
    theatre_name AS "theatreName",
    reviewer_name AS "reviewerName",
    reviewer_role AS "reviewerRole",
    reviewer_avatar AS "reviewerAvatar",
    performance_date AS "performanceDate",
    viewing_context AS "viewingContext",
    rating,
    verdict_tag AS "verdictTag",
    review_title AS "reviewTitle",
    excerpt,
    content,
    key_quote AS "keyQuote",
    acting,
    direction,
    stage_design AS "stageDesign",
    script,
    recommendation,
    status,
    approved_at AS "approvedAt",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM review_submissions
`;

function normalizeStatus(value: string): ReviewSubmissionStatus {
  return value === "APPROVED" ? "APPROVED" : "PENDING";
}

function normalizeVerdict(value: string): ReviewItem["verdictTag"] {
  if (value === "Masterpiece" || value === "Highly Recommended" || value === "Audience Favorite") return value;
  return "Audience Favorite";
}

function normalizeReviewRow(row: ReviewSubmissionRecord): ReviewSubmissionRecord {
  return {
    ...row,
    status: normalizeStatus(row.status),
    verdictTag: normalizeVerdict(row.verdictTag),
    rating: Number(row.rating),
    acting: Number(row.acting),
    direction: Number(row.direction),
    stageDesign: Number(row.stageDesign),
    script: Number(row.script),
  };
}

export function reviewSubmissionToReviewItem(row: ReviewSubmissionRecord): ReviewItem {
  const review = normalizeReviewRow(row);

  return {
    id: `submission-${review.id}`,
    playTitle: review.playTitle,
    playSlug: review.playSlug,
    playImage: review.playImage,
    theatreName: review.theatreName,
    reviewerName: review.reviewerName,
    reviewerAvatar: review.reviewerAvatar || REVIEWER_AVATAR,
    reviewerRole: review.reviewerRole,
    rating: review.rating,
    verdictTag: review.verdictTag,
    date: formatDisplayDate(review.performanceDate || review.approvedAt || review.createdAt),
    title: review.reviewTitle,
    excerpt: review.excerpt,
    content: review.content,
    keyQuote: review.keyQuote,
    scores: {
      acting: review.acting,
      direction: review.direction,
      stageDesign: review.stageDesign,
      script: review.script,
    },
  };
}

export async function listApprovedReviewItems(limit = 50) {
  await ensureReviewSubmissionTable();
  const rows = await prisma.$queryRawUnsafe<ReviewSubmissionRecord[]>(
    `${reviewSubmissionSelect}
     WHERE status = 'APPROVED'
     ORDER BY approved_at DESC NULLS LAST, created_at DESC
     LIMIT $1`,
    limit
  );

  return rows.map((row) => reviewSubmissionToReviewItem(row));
}

export async function getApprovedReviewItemBySlug(slug: string) {
  await ensureReviewSubmissionTable();
  const rows = await prisma.$queryRawUnsafe<ReviewSubmissionRecord[]>(
    `${reviewSubmissionSelect}
     WHERE status = 'APPROVED' AND play_slug = $1
     LIMIT 1`,
    slug
  );
  const review = rows[0];
  return review ? reviewSubmissionToReviewItem(review) : undefined;
}

export async function listReviewSubmissionsForAdmin(limit = 100, offset = 0) {
  await ensureReviewSubmissionTable();
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeOffset = Math.max(0, Math.floor(offset));
  const rows = await prisma.$queryRawUnsafe<ReviewSubmissionRecord[]>(
    `${reviewSubmissionSelect}
     ORDER BY
       CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END,
       created_at DESC
     LIMIT $1 OFFSET $2`,
    safeLimit,
    safeOffset
  );

  return rows.map((row) => normalizeReviewRow(row));
}

export async function getReviewModerationStats() {
  await ensureReviewSubmissionTable();
  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT status, COUNT(*) AS count
    FROM review_submissions
    GROUP BY status
  `;
  const pending = rows.find((row) => row.status === "PENDING");
  const approved = rows.find((row) => row.status === "APPROVED");
  const pendingCount = pending ? Number(pending.count) : 0;
  const approvedCount = approved ? Number(approved.count) : 0;

  return {
    pending: pendingCount,
    approved: approvedCount,
    total: pendingCount + approvedCount,
  };
}

export async function approveReviewSubmission(id: number) {
  await ensureReviewSubmissionTable();
  await prisma.$executeRaw`
    UPDATE review_submissions
    SET status = 'APPROVED',
        approved_at = COALESCE(approved_at, NOW()),
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteReviewSubmission(id: number) {
  await ensureReviewSubmissionTable();
  await prisma.$executeRaw`
    DELETE FROM review_submissions
    WHERE id = ${id}
  `;
}
