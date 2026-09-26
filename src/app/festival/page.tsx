import type { Metadata } from "next";
import {
  FestivalArchive,
  FestivalLiveStage,
  type FestivalCollectionPost,
} from "@/components/FestivalCollections";
import { formatDate, mediaUrl, plainText } from "@/lib/content";
import {
  FESTIVAL_CATEGORY_SLUGS,
  FESTIVAL_LIVE_STAGE_SLUG,
  festivalSeriesTitle,
  isFestivalSeriesSlug,
} from "@/lib/festivals";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Theatre Festivals | TheatreHub Nepal",
  description:
    "Explore international and national theatre festival stories, programmes, artists, and stage coverage from Nepal.",
};

export default async function FestivalPage() {
  const dbPosts = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        categories: {
          some: {
            category: { slug: { in: [...FESTIVAL_CATEGORY_SLUGS] } },
          },
        },
      },
      orderBy: { publishDate: "desc" },
      include: { categories: { include: { category: true } } },
    })
    .catch(() => []);

  const festivalCategories = Array.from(
    new Map(
      dbPosts
        .flatMap((post) => post.categories.map((item) => item.category))
        .filter((category) => isFestivalSeriesSlug(category.slug))
        .map((category) => [category.id, category]),
    ).values(),
  ).sort((a, b) => a.title.localeCompare(b.title));

  const posts: Array<FestivalCollectionPost & { isLive: boolean }> = dbPosts.map((post) => {
    const rawContent = post.content || "";
    const excerpt = (post.description || plainText(rawContent)).slice(0, 190);
    const categories = post.categories.map((item) => item.category);
    const series = categories.find((category) => isFestivalSeriesSlug(category.slug));

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      image: mediaUrl(post.featuredImage),
      excerpt,
      date: formatDate(post.publishDate),
      series: series ? festivalSeriesTitle(series.slug) : "Festival",
      isLive: categories.some((category) => category.slug === FESTIVAL_LIVE_STAGE_SLUG),
    };
  });

  const livePosts = posts.filter((post) => post.isLive);
  const archivePosts = posts.filter((post) => !post.isLive);

  const latestYear = dbPosts.find((post) => post.publishDate)?.publishDate?.getFullYear() ?? "—";

  return (
    <main className="blog-page-content site-container news-index-page festival-index-page">
      <section className="reviews-intro festival-intro" aria-labelledby="festival-page-title">
        <div className="reviews-intro-copy">
          <span className="reviews-eyebrow">TheatreHub festival desk</span>
          <h1 id="festival-page-title">Festivals that bring stages together</h1>
          <p>
            Follow national and international theatre festivals through programmes, artist stories,
            performances, and dispatches from across Nepal&apos;s theatre community.
          </p>
        </div>

        <div className="reviews-summary-grid" aria-label="Festival overview">
          <div className="reviews-summary-stat">
            <strong>{posts.length}</strong>
            <span>Festival stories</span>
          </div>
          <div className="reviews-summary-stat reviews-summary-stat-accent">
            <strong>{festivalCategories.length}</strong>
            <span>Festival series</span>
          </div>
          <div className="reviews-summary-stat">
            <strong>{latestYear}</strong>
            <span>Latest coverage</span>
          </div>
        </div>
      </section>

      <FestivalLiveStage posts={livePosts} />
      <FestivalArchive posts={archivePosts} />
    </main>
  );
}
