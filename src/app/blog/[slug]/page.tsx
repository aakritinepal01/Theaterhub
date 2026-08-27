import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl } from "@/lib/content";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = slug === "press-release" ? "newsletter" : slug;

  const post = await prisma.blogPost.findFirst({
    where: {
      OR: [{ slug: targetSlug }, { slug }],
      status: "PUBLISHED",
    },
    select: { title: true, description: true, featuredImage: true },
  });

  if (!post) return { title: "Story Not Found | TheatreHub" };

  return {
    title: `${post.title} | TheatreHub Journal`,
    description: post.description || `Read ${post.title} on TheatreHub Nepal.`,
    openGraph: {
      title: post.title,
      description: post.description || "",
      images: post.featuredImage ? [mediaUrl(post.featuredImage) || ""] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const targetSlug = slug === "press-release" ? "newsletter" : slug;

  const post = await prisma.blogPost.findFirst({
    where: {
      OR: [{ slug: targetSlug }, { slug }],
      status: "PUBLISHED",
    },
    include: {
      categories: { include: { category: true } },
      user: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  if (!post) notFound();

  // Related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: post.id },
    },
    take: 3,
    orderBy: { publishDate: "desc" },
    include: { categories: { include: { category: true } } },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theatrehub.org";
  const postUrl = `${siteUrl}/blog/${post.slug}/`;
  const authorName =
    post.user.firstName || post.user.lastName
      ? `${post.user.firstName} ${post.user.lastName}`.trim()
      : post.user.username || "TheatreHub Team";

  const categories = post.categories.map((c) =>
    c.category.title === "Press Release" ? "Newsletter" : c.category.title
  );

  const featuredImg = mediaUrl(post.featuredImage);

  return (
    <article className="post-detail-wrapper">
      {/* ── Header & Hero Metadata ── */}
      <header className="post-detail-hero">
        <div className="site-container post-hero-inner">
          <nav className="post-breadcrumbs" aria-label="Breadcrumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog/">News</Link>
            <span aria-hidden="true">/</span>
            <span className="current-crumb">{post.title}</span>
          </nav>

          <div className="post-cat-list">
            {categories.map((cat) => (
              <span className="post-cat-tag" key={cat}>
                {cat === "Newsletter" ? "📬 Newsletter" : cat}
              </span>
            ))}
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-meta-bar">
            <div className="post-author-info">
              <span className="author-avatar">🎭</span>
              <div>
                <strong>{authorName}</strong>
                <span>Published on {formatDate(post.publishDate)}</span>
              </div>
            </div>

            <div className="post-share-quick">
              <a
                className="share-btn share-tw"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X / Twitter"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                className="share-btn share-fb"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                className="share-btn share-wa"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}: ${postUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Featured Image ── */}
      {featuredImg && (
        <div className="site-container post-banner-container">
          <img src={featuredImg} alt={post.title} className="post-detail-banner" />
        </div>
      )}

      {/* ── Article Content Body ── */}
      <main className="site-container post-detail-content">
        <div
          className="post-body-prose"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") }}
        />

        {/* Article End Share Bar */}
        <div className="post-share-footer">
          <span>Enjoyed this stage story? Share with fellow theatre lovers:</span>
          <div className="post-share-row">
            <a
              className="share-chip share-chip-tw"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on X
            </a>
            <a
              className="share-chip share-chip-fb"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on Facebook
            </a>
            <a
              className="share-chip share-chip-wa"
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}: ${postUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Newsletter Subscription Box */}
        <div className="post-newsletter-box">
          <NewsletterSubscribe compact={true} />
        </div>

        {/* ── Related Stories Section ── */}
        {relatedPosts.length > 0 && (
          <section className="post-related-section">
            <h3>More Stage Stories &amp; Newsletters</h3>
            <div className="related-grid">
              {relatedPosts.map((rel) => (
                <div key={rel.id} className="related-card">
                  <span className="related-cat">
                    {rel.categories[0]?.category.title === "Press Release"
                      ? "Newsletter"
                      : rel.categories[0]?.category.title || "Story"}
                  </span>
                  <h4>
                    <Link href={`/blog/${rel.slug}/`}>{rel.title}</Link>
                  </h4>
                  <small>{formatDate(rel.publishDate)}</small>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
}
