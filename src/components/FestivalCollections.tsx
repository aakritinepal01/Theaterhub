import Link from "next/link";

export type FestivalCollectionPost = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  excerpt: string;
  date: string;
  series: string;
};

const FESTIVAL_FALLBACKS = [
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=900&q=80",
];

function poster(post: FestivalCollectionPost) {
  return post.image || FESTIVAL_FALLBACKS[Math.abs(post.id) % FESTIVAL_FALLBACKS.length];
}

export function FestivalLiveStage({ posts }: { posts: FestivalCollectionPost[] }) {
  const loopPosts = posts.length ? [...posts, ...posts, ...posts] : [];

  return (
    <section className="festival-live-stage-section" aria-labelledby="festival-live-stage-title">
      <div className="festival-collection-heading">
        <div>
          <span className="festival-live-kicker"><i aria-hidden="true" /> Live festival desk</span>
          <h2 id="festival-live-stage-title">Live Stage</h2>
          <p>Current festival dispatches, programmes, and stories selected by the editorial team.</p>
        </div>
        <span className="festival-collection-count">{posts.length} live</span>
      </div>

      {posts.length ? (
        <div className="festival-live-viewport">
          <div className="festival-live-track">
            {loopPosts.map((post, index) => {
              const isClone = index >= posts.length;
              return (
                <Link
                  className="festival-live-card"
                  href={`/blog/${post.slug}/`}
                  key={`${post.id}-${index}`}
                  tabIndex={isClone ? -1 : undefined}
                  aria-hidden={isClone || undefined}
                >
                  <img src={poster(post)} alt={isClone ? "" : post.title} loading={index < 4 ? "eager" : "lazy"} />
                  <span className="festival-live-badge"><i aria-hidden="true" /> Live Stage</span>
                  <span className="festival-live-overlay" aria-hidden="true" />
                  <span className="festival-live-copy">
                    <small>{post.series}</small>
                    <strong>{post.title}</strong>
                    <time>{post.date}</time>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="festival-collection-empty">
          <strong>Live Stage is preparing its next story.</strong>
          <span>Current festival coverage will appear here as soon as it is published.</span>
        </div>
      )}
    </section>
  );
}

export function FestivalArchive({ posts }: { posts: FestivalCollectionPost[] }) {
  return (
    <section className="festival-archive-section" aria-labelledby="festival-archive-title">
      <div className="festival-collection-heading festival-archive-heading">
        <div>
          <span className="section-kicker">Past coverage</span>
          <h2 id="festival-archive-title">Festival Archive</h2>
          <p>Reporting, conversations, and programmes preserved from Nepal&apos;s festival circuit.</p>
        </div>
        <span className="festival-collection-count">{posts.length} archived</span>
      </div>

      {posts.length ? (
        <div className="festival-archive-grid">
          {posts.map((post) => (
            <Link className="festival-archive-card" href={`/blog/${post.slug}/`} key={post.id}>
              <span className="festival-archive-image">
                <img src={poster(post)} alt={post.title} loading="lazy" />
                <span>{post.series}</span>
              </span>
              <span className="festival-archive-copy">
                <time>{post.date}</time>
                <strong>{post.title}</strong>
                <span>{post.excerpt}</span>
                <em>Read festival story <span aria-hidden="true">→</span></em>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="festival-collection-empty">
          <strong>The archive is ready for its first entry.</strong>
          <span>Festival stories moved from Live Stage will remain available here.</span>
        </div>
      )}
    </section>
  );
}
