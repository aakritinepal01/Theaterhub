import Link from "next/link";

export type BentoBlogPost = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  excerpt: string;
  date: string;
  categories: string[];
  readTime?: string;
};

// Curated theatre/stage/performance Unsplash fallback images per post id
const THEATRE_FALLBACKS: Record<number, string> = {
  1:  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",  // stage spotlight
  3:  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80",  // theatre interior
  5:  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",  // dramatic lighting
  6:  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",  // performance
  7:  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",  // stage curtain
  8:  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80",  // dramatic scene
  9:  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1200&q=80",  // masks
  10: "https://images.unsplash.com/photo-1504804884814-d58d4c9b0a35?auto=format&fit=crop&w=1200&q=80",  // epic stage
  11: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",  // letter / scroll
  12: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1200&q=80",  // newsletter / paper
};

const GENERIC_FALLBACKS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
];

function getPostImage(post: BentoBlogPost): string {
  if (post.image) return post.image;
  return THEATRE_FALLBACKS[post.id] ?? GENERIC_FALLBACKS[post.id % GENERIC_FALLBACKS.length];
}

export function BentoBlogGrid({ posts }: { posts: BentoBlogPost[] }) {
  if (!posts.length) return null;

  // First post is hero; rest are secondary
  const [hero, ...rest] = posts;

  return (
    <section className="bento2-grid" aria-label="Featured blog stories">
      {/* ── HERO CARD ── */}
      <Link className="bento2-hero" href={`/blog/${hero.slug}/`}>
        <img src={getPostImage(hero)} alt={hero.title} className="bento2-img" loading="eager" />
        <div className="bento2-overlay" />
        <div className="bento2-hero-body">
          {hero.categories[0] && (
            <span className="bento2-cat">{hero.categories[0]}</span>
          )}
          <h2 className="bento2-hero-title">{hero.title}</h2>
          <p className="bento2-hero-excerpt">{hero.excerpt}</p>
          <div className="bento2-meta">
            <span>{hero.date}</span>
            {hero.readTime && <span>· {hero.readTime}</span>}
            <span className="bento2-read-link">Read Story →</span>
          </div>
        </div>
      </Link>

      {/* ── SECONDARY CARDS ── */}
      {rest.length > 0 && (
        <div className="bento2-secondaries">
          {rest.map((post) => (
            <Link key={post.id} className="bento2-secondary" href={`/blog/${post.slug}/`}>
              <div className="bento2-secondary-img-wrap">
                <img src={getPostImage(post)} alt={post.title} className="bento2-img" loading="lazy" />
                <div className="bento2-overlay bento2-overlay-light" />
              </div>
              <div className="bento2-secondary-body">
                {post.categories[0] && (
                  <span className="bento2-cat bento2-cat-sm">{post.categories[0]}</span>
                )}
                <h3 className="bento2-secondary-title">{post.title}</h3>
                <div className="bento2-meta bento2-meta-sm">
                  <span>{post.date}</span>
                  {post.readTime && <span>· {post.readTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
