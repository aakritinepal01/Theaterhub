import Link from "next/link";

export type BentoBlogPost = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  excerpt: string;
  categories: string[];
};

type IconKind = "camera" | "idea" | "film" | "people" | "article";

function chooseIcon(categories: string[], index: number): IconKind {
  const value = categories.join(" ").toLowerCase();
  if (/(photo|camera|gallery|behind)/.test(value)) return "camera";
  if (/(review|opinion|idea|insight)/.test(value)) return "idea";
  if (/(film|play|production|performance|theatre|theater)/.test(value)) return "film";
  if (/(interview|cast|artist|profile|people|community)/.test(value)) return "people";
  return (["article", "film", "camera", "people"] as IconKind[])[index % 4];
}

function TopicIcon({ kind }: { kind: IconKind }) {
  if (kind === "camera") return <svg viewBox="0 0 24 24"><path d="M4 7h3l1.5-2h7L17 7h3v12H4V7Z"/><circle cx="12" cy="13" r="3.5"/></svg>;
  if (kind === "idea") return <svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8.2 15.4A7 7 0 1 1 15.8 15.4C14.7 16.2 14.3 17 14.2 18h-4.4c-.1-1-.5-1.8-1.6-2.6Z"/></svg>;
  if (kind === "film") return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="7.5" r="1.6"/><circle cx="16.2" cy="12" r="1.6"/><circle cx="12" cy="16.5" r="1.6"/><circle cx="7.8" cy="12" r="1.6"/><path d="M18.5 18.5 22 22"/></svg>;
  if (kind === "people") return <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c.3-4 2.4-6 6-6s5.7 2 6 6M15 15c3.3-.4 5.2 1.3 5.5 4.5"/></svg>;
  return <svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6V3Z"/><path d="M15 3v5h4M9 12h7M9 16h7"/></svg>;
}

export function BentoBlogGrid({ posts }: { posts: BentoBlogPost[] }) {
  return <section className="bento-blog-grid" aria-label="Featured blog stories">
    {posts.map((post, index) => <Link className={`bento-blog-card bento-blog-card-${index + 1}`} href={`/blog/${post.slug}/`} key={post.id}>
      {post.image ? <img src={post.image} alt="" /> : <span className="bento-blog-fallback" />}
      <span className="bento-blog-overlay" />
      <span className="bento-blog-copy">
        <span className="bento-blog-icon" aria-hidden="true"><TopicIcon kind={chooseIcon(post.categories, index)} /></span>
        <strong>{post.title}</strong>
        <span className="bento-blog-excerpt">{post.excerpt}</span>
        <span className="bento-blog-more">Read More <i aria-hidden="true">→</i></span>
      </span>
    </Link>)}
  </section>;
}
