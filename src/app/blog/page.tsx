import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl, plainText } from "@/lib/content";
import { displayBlogCategoryTitle, isPublicBlogCategory } from "@/lib/blog-categories";
import { FESTIVAL_CATEGORY_SLUGS } from "@/lib/festivals";
import { BlogInteractiveView, type BlogViewPost, type CategoryFilter } from "@/components/BlogInteractiveView";
import Link from "next/link";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Theatre Stories, News & Newsletter | TheatreHub Nepal",
  description:
    "Explore stage stories, performance reviews, festival coverage, director insights, and weekly newsletters from Nepal's theatre community.",
};

function calculateReadTime(text: string): string {
  const wordsPerMinute = 180;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Retry helper for transient Neon DB errors (P1001 = unreachable, P2024 = pool timeout)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 800): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const isTransient = code === "P1001" || code === "P2024";
      if (isTransient && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}


function NewsPageIntro({
  postCount,
  topicCount,
  newsletterCount,
}: {
  postCount: number;
  topicCount: number;
  newsletterCount: number;
}) {
  return (
      <section className="reviews-intro news-intro" aria-labelledby="news-page-title">
        <div className="reviews-intro-copy">
          <span className="reviews-eyebrow">TheatreHub newsroom</span>
          <h1 id="news-page-title">Stories from Nepal&apos;s living stage</h1>
          <p>
            Theatre news, artist conversations, festival coverage, and community updates from the people shaping Nepal&apos;s stage.
          </p>
        </div>
        <div className="reviews-summary-grid" aria-label="News overview">
          <div className="reviews-summary-stat">
            <strong>{postCount}</strong>
            <span>Published stories</span>
          </div>
          <div className="reviews-summary-stat reviews-summary-stat-accent">
            <strong>{topicCount}</strong>
            <span>Topics covered</span>
          </div>
          <div className="reviews-summary-stat">
            <strong>{newsletterCount}</strong>
            <span>Newsletters</span>
          </div>
        </div>
      </section>
  );
}

function BlogDBError() {
  return (
    <main className="blog-page-content site-container news-index-page">
      <NewsPageIntro postCount={0} topicCount={0} newsletterCount={0} />
      <div className="blog-db-error-card">
        <div className="blog-db-error-icon">🎭</div>
        <h2>Stage is briefly unavailable</h2>
        <p>
          Our database is warming up or temporarily unreachable — this usually resolves in a few seconds.
          Please refresh the page.
        </p>
        <Link href="/blog" className="button">
          Refresh Page
        </Link>
      </div>
    </main>
  );
}

export default async function BlogPage() {
  // Wrap entire page data fetch in try/catch with retry for Neon transient errors
  let dbPosts;
  try {
    dbPosts = await withRetry(() =>
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          NOT: {
            categories: { some: { category: { slug: { in: [...FESTIVAL_CATEGORY_SLUGS] } } } },
          },
        },
        orderBy: { publishDate: "desc" },
        include: { categories: { include: { category: true } } },
      })
    );
  } catch {
    return <BlogDBError />;
  }

  // Categories are non-critical — fail silently
  const dbCategories = await withRetry(() =>
    prisma.blogCategory.findMany({ orderBy: { title: "asc" } })
  ).catch(() => []);

  const posts: BlogViewPost[] = dbPosts.map((post) => {
    const rawContent = post.content || "";
    const excerptText = (post.description || plainText(rawContent)).slice(0, 190);
    const readTime = calculateReadTime(rawContent || excerptText);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      image: mediaUrl(post.featuredImage),
      excerpt: excerptText,
      date: formatDate(post.publishDate),
      readTime,
      categories: post.categories
        .filter((item) => isPublicBlogCategory(item.category))
        .map((item) => displayBlogCategoryTitle(item.category)),
    };
  });

  const categories: CategoryFilter[] = dbCategories
    .filter(isPublicBlogCategory)
    .map((category) => ({
      id: category.id,
      title: displayBlogCategoryTitle(category),
      slug: category.slug === "press-release" ? "newsletter" : category.slug,
    }));

  const newsletterCount = posts.filter((post) =>
    post.categories.some((category) => category.toLowerCase() === "newsletter")
  ).length;

  return (
    <main className="blog-page-content site-container news-index-page">
      <NewsPageIntro
        postCount={posts.length}
        topicCount={categories.length}
        newsletterCount={newsletterCount}
      />
      <BlogInteractiveView posts={posts} categories={categories} showEditorialNav />
    </main>
  );
}
