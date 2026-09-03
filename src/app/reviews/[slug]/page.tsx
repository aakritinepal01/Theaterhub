import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl, publishedWhere } from "@/lib/content";
import { DEFAULT_REVIEWS } from "@/app/reviews/page";
import type { ReviewItem } from "@/components/ReviewsInteractiveView";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curatedReview = DEFAULT_REVIEWS.find((review) => review.playSlug === slug);

  let review: ReviewItem | undefined = curatedReview;
  if (!review) {
    const play = await prisma.play.findFirst({
      where: { slug, ...publishedWhere() },
      include: { theatre: true },
    });

    if (play) {
      const rating = play.ratingAverage || 4.5;
      review = {
        id: `db-${play.id}`,
        playTitle: play.title,
        playSlug: play.slug || slug,
        playImage: mediaUrl(play.coverImage),
        theatreName: play.theatre?.title || "TheatreHub Stage",
        reviewerName: "TheatreHub Critic",
        reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
        reviewerRole: "Official Critic",
        rating,
        verdictTag: rating >= 4.7 ? "Masterpiece" : rating >= 4 ? "Highly Recommended" : "Audience Favorite",
        date: formatDate(play.launchedOn) || "Recent Production",
        title: `Critique: ${play.title}`,
        excerpt: play.abstract || play.directorialNote || "A TheatreHub review of this stage production.",
        content: play.abstract || play.directorialNote || "A TheatreHub review of this stage production.",
        keyQuote: `${play.title} presents a vibrant contribution to Nepal's stage repertory.`,
        scores: {
          acting: Math.min(5, rating + 0.1),
          direction: rating,
          stageDesign: Math.max(3.8, rating - 0.2),
          script: rating,
        },
      };
    }
  }

  if (!review) notFound();

  return (
    <main className="review-detail-page">
      <div className="site-container review-detail-shell">
        <Link href="/reviews/" className="review-detail-back">← Back to Reviews</Link>
        <div className="review-detail-hero">
          <div className="review-detail-image-wrap">
            <img src={review.playImage || "/images/placeholder-play.jpg"} alt={review.playTitle} />
          </div>
          <div className="review-detail-intro">
            <span className="review-detail-verdict">{review.verdictTag}</span>
            <div className="review-detail-rating">★ {review.rating.toFixed(1)} <span>/ 5.0</span></div>
            <p className="review-detail-kicker">{review.theatreName} · {review.date}</p>
            <h1>{review.playTitle}</h1>
            <h2>&ldquo;{review.title}&rdquo;</h2>
            <div className="review-detail-reviewer">
              <img src={review.reviewerAvatar} alt={review.reviewerName} />
              <span><strong>{review.reviewerName}</strong><small>{review.reviewerRole}</small></span>
            </div>
          </div>
        </div>

        <article className="review-detail-content">
          <blockquote>&ldquo;{review.keyQuote}&rdquo;</blockquote>
          {review.content.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          <div className="review-detail-scores">
            <div><span>Acting</span><strong>{review.scores.acting.toFixed(1)}</strong></div>
            <div><span>Direction</span><strong>{review.scores.direction.toFixed(1)}</strong></div>
            <div><span>Stage Design</span><strong>{review.scores.stageDesign.toFixed(1)}</strong></div>
            <div><span>Script &amp; Dialog</span><strong>{review.scores.script.toFixed(1)}</strong></div>
          </div>
        </article>
      </div>
    </main>
  );
}
