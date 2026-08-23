import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl, plainText } from "@/lib/content";
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


function BlogDBError() {
  return (
    <main className="blog-page-content site-container">
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
        where: { status: "PUBLISHED" },
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
      categories: post.categories.map((item) =>
        item.category.title === "Press Release" ? "Newsletter" : item.category.title
      ),
    };
  });

  const categories: CategoryFilter[] = dbCategories.map((c) => ({
    id: c.id,
    title: c.title === "Press Release" ? "Newsletter" : c.title,
    slug: c.slug === "press-release" ? "newsletter" : c.slug,
  }));

  return (
    <main className="blog-page-content site-container">
      <BlogInteractiveView posts={posts} categories={categories} />
    </main>
  );
}
