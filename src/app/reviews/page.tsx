import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl, publishedWhere } from "@/lib/content";
import { listApprovedReviewItems } from "@/lib/reviews";
import { ReviewsInteractiveView, type ReviewItem } from "@/components/ReviewsInteractiveView";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Theatre Reviews & Criticisms | TheatreHub Nepal",
  description:
    "Explore performance reviews, expert theatrical critiques, audience ratings, and artistic scorecards from Nepal's living stage.",
};

type ReviewPlay = Prisma.PlayGetPayload<{
  include: {
    theatre: true;
  };
}>;

// Retry helper for Neon DB transient connection issues
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw error;
  }
}

export const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "spotlight-1",
    playTitle: "Yahapuri (याहापुरी)",
    playSlug: "yahapuri",
    playImage: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",
    theatreName: "Mandala Theatre Nepal",
    reviewerName: "Siddhartha Thapa",
    reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    reviewerRole: "Senior Stage Critic",
    rating: 4.9,
    verdictTag: "Masterpiece",
    date: "Aug 24, 2026",
    isSpotlight: true,
    title: "A Masterful Synthesis of Mythic Storytelling & Raw Stage Performance",
    excerpt:
      "Mandala Theatre's latest production Yahapuri delivers a mesmerizing exploration of power, existential dilemma, and Nepali folklore, anchored by stellar ensemble acting and striking scenography.",
    keyQuote:
      "Yahapuri sets a high landmark for modern Nepali theatre — blending traditional mythical narrative with visceral physical ensemble work.",
    content:
      "From the opening blackout, Yahapuri commands absolute attention. The production weaves intricate traditional Nepali mythical motifs with contemporary sociopolitical allegories in a manner that feels both deeply grounded and poetically expansive.\n\nThe ensemble work is magnificent. Every movement across the bamboo-structured stage is executed with sharp rhythmic control. The atmospheric lighting by the technical crew transforms minimal set design into rich, ethereal landscapes of emotion.\n\nParticular praise must be given to the directorial vision, which balances silence and explosive dialogue seamlessly. Yahapuri is not merely a play to watch — it is an immersive theatrical experience that stays with you long after the final curtain.",
    scores: {
      acting: 5.0,
      direction: 4.9,
      stageDesign: 4.8,
      script: 4.9,
    },
  },
  {
    id: "rev-2",
    playTitle: "Degree Kaila (डिग्री माइला)",
    playSlug: "degree-kaila",
    playImage: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80",
    theatreName: "Shilpee Theatre Kathmandu",
    reviewerName: "Pooja Shrestha",
    reviewerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    reviewerRole: "Cultural Journalist",
    rating: 4.7,
    verdictTag: "Must Watch",
    date: "Aug 18, 2026",
    title: "Bittersweet Comedy that Hits Close to Home for Educated Nepali Youth",
    excerpt:
      "A hilarious yet deeply poignant satire detailing the struggles, pride, and disillusionment of youth navigating unemployment in contemporary Nepal.",
    keyQuote:
      "Equal parts gut-wrenching and laugh-out-loud funny — a mirror reflecting the silent anxieties of an entire generation.",
    content:
      "Degree Kaila captures the tragicomic reality of educated youth in rural Nepal with razor-sharp wit. The lead performance is electric, capturing the character's intellectual arrogance and inner despair with subtle nuances.\n\nThe set design recreates a vibrant village tea shop, giving the dialogue authentic texture and rhythm. The pacing in the second act is tight and culminates in an emotionally resonant climax that leaves the audience in contemplative silence.",
    scores: {
      acting: 4.8,
      direction: 4.7,
      stageDesign: 4.5,
      script: 4.8,
    },
  },
  {
    id: "rev-3",
    playTitle: "Sirumarani (सिरुमारानी)",
    playSlug: "sirumarani",
    playImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    theatreName: "Kausi Theatre Teku",
    reviewerName: "Bishal Karki",
    reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    reviewerRole: "Theatre Researcher & Writer",
    rating: 4.8,
    verdictTag: "Poignant Drama",
    date: "Aug 10, 2026",
    title: "Poetic Exploration of Feminine Agency and Indigenous Heritage",
    excerpt:
      "Staged in Kausi Theatre's intimate intimate space, Sirumarani brings indigenous folklore to life through breathtaking choreography and live folk instrumentation.",
    keyQuote:
      "A luminous production where song, movement, and dramatic intensity blend seamlessly.",
    content:
      "Sirumarani stands out for its bold artistic choices. Combining live traditional instruments with experimental light cues, the performance evokes an otherworldly atmosphere.\n\nThe lead actress delivers a tour-de-force performance, portraying resilience in the face of systemic oppression. The intimate seating at Kausi Theatre puts the audience right in the middle of the emotional storm.",
    scores: {
      acting: 4.9,
      direction: 4.8,
      stageDesign: 4.7,
      script: 4.8,
    },
  },
  {
    id: "rev-4",
    playTitle: "Hamlet (हाम्लेट - नेपाली रुपान्तरण)",
    playSlug: "hamlet-nepali",
    playImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    theatreName: "Theatre Village Nepal",
    reviewerName: "Anupa Rai",
    reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    reviewerRole: "Drama Academic",
    rating: 4.6,
    verdictTag: "Highly Recommended",
    date: "Jul 29, 2026",
    title: "Shakespearean Tragedy Reimagined in a Himalayan Context",
    excerpt:
      "This adaptation transforms Elsinore Castle into a feudally tense Himalayan court, preserving Shakespeare's poetic depth while connecting with local sensibilities.",
    keyQuote:
      "Soliloquies rendered in classical Nepali prose resonate with unexpected grace and tragic force.",
    content:
      "Adapting Shakespeare into Nepali is always a monumental task, but this production rises to the challenge. The translation captures the existential weight of Hamlet's inner conflict.\n\nThe swordfight choreography and live percussion during key soliloquies heighten the tension. A must-see for lovers of classic drama.",
    scores: {
      acting: 4.7,
      direction: 4.6,
      stageDesign: 4.6,
      script: 4.7,
    },
  },
  {
    id: "rev-5",
    playTitle: "Katha Kasturi (कथा कस्तुरी)",
    playSlug: "katha-kasturi",
    playImage: "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=1200&q=80",
    theatreName: "Pokhara Theatre",
    reviewerName: "Rohan Gurung",
    reviewerAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    reviewerRole: "Audience Reviewer",
    rating: 4.5,
    verdictTag: "Audience Favorite",
    date: "Jul 15, 2026",
    title: "Warm, Nostalgic & Emotionally Resonant Tale of Mountain Life",
    excerpt:
      "Pokhara Theatre delivers a heartwarming story of memory, family bonds, and the changing landscape of Nepal's hill villages.",
    keyQuote:
      "A soothing theatrical breeze that touches the heart with simplicity and warmth.",
    content:
      "Katha Kasturi reminds us of the power of straightforward human stories. The actors embody village elders with incredible warmth and subtle humor.\n\nThe set design features authentic wooden props and mountain vistas, transporting the audience straight to the Annapurna foothills.",
    scores: {
      acting: 4.6,
      direction: 4.5,
      stageDesign: 4.6,
      script: 4.4,
    },
  },
];

export default async function ReviewsPage() {
  let dbPlays: ReviewPlay[] = [];
  let approvedUserReviews: ReviewItem[] = [];
  
  try {
    const now = new Date();
    dbPlays = await withRetry(() =>
      prisma.play.findMany({
        where: publishedWhere(now),
        take: 10,
        orderBy: { ratingAverage: "desc" },
        include: {
          theatre: true,
        },
      })
    );
  } catch {
    dbPlays = [];
  }

  try {
    approvedUserReviews = await listApprovedReviewItems();
  } catch {
    approvedUserReviews = [];
  }

  // Merge DB plays with rating information into ReviewItem list if available
  const dbReviews: ReviewItem[] = dbPlays
    .filter((p) => p.ratingAverage > 0 || p.abstract)
    .map((p) => {
      const rating = p.ratingAverage || 4.5;
      return {
        id: `db-${p.id}`,
        playTitle: p.title,
        playSlug: p.slug || `play-${p.id}`,
        playImage: mediaUrl(p.coverImage),
        theatreName: p.theatre?.title || "TheatreHub Stage",
        reviewerName: "TheatreHub Critic",
        reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
        reviewerRole: "Official Critic",
        rating: rating,
        verdictTag: rating >= 4.7 ? "Masterpiece" : rating >= 4.0 ? "Highly Recommended" : "Audience Favorite",
        date: formatDate(p.launchedOn) || "Recent Production",
        title: `Critique: ${p.title}`,
        excerpt: (p.abstract || p.directorialNote || "").slice(0, 160) + "...",
        content: p.abstract || p.directorialNote || "Comprehensive review and artistic analysis for this stage play.",
        keyQuote: p.directorialNote ? `"${p.directorialNote.slice(0, 100)}..."` : `"${p.title} presents a vibrant contribution to Nepal stage repertory."`,
        scores: {
          acting: Math.min(5, rating + 0.1),
          direction: rating,
          stageDesign: Math.max(3.8, rating - 0.2),
          script: rating,
        },
      };
    });

  // Combine DB reviews with curated default reviews for maximum richness
  const allReviewsMap = new Map<string, ReviewItem>();
  
  DEFAULT_REVIEWS.forEach((rev) => allReviewsMap.set(rev.playTitle.toLowerCase(), rev));
  dbReviews.forEach((rev) => {
    if (!allReviewsMap.has(rev.playTitle.toLowerCase())) {
      allReviewsMap.set(rev.playTitle.toLowerCase(), rev);
    }
  });

  const combinedReviews = [...approvedUserReviews, ...Array.from(allReviewsMap.values())];

  return (
    <main className="reviews-page-main">
      <ReviewsInteractiveView initialReviews={combinedReviews} />
    </main>
  );
}
