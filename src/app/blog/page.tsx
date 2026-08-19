import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, mediaUrl, plainText } from "@/lib/content";
import { BentoBlogGrid, type BentoBlogPost } from "@/components/BentoBlogGrid";

export const revalidate = 300;

export default async function Blog() {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishDate: "desc" },
    include: { categories: { include: { category: true } } },
  });
  const posts = rows.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    image: mediaUrl(post.featuredImage),
    excerpt: (post.description || plainText(post.content)).slice(0, 190),
    date: formatDate(post.publishDate),
    categories: post.categories.map(item => item.category.title),
  }));
  const featured: BentoBlogPost[] = posts.slice(0, 4);
  const remaining = posts.slice(4);

  return <main className="blog-page-content">{posts.length ? <>
      <BentoBlogGrid posts={featured} />
      {remaining.length > 0 && <section className="blog-archive"><div className="blog-archive-heading"><p className="landing-kicker">Keep reading</p><h2>More stories</h2></div><div className="blog-grid">{remaining.map(post => <article className="blog-card" key={post.id}>
        <Link className="blog-card-image" href={`/blog/${post.slug}/`}>{post.image ? <img src={post.image} alt={post.title} /> : <span>No featured image</span>}</Link>
        <div className="blog-card-copy"><small>{post.date} {post.categories.map(category => `#${category}`).join(", ")}</small><h2><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="play-read-more" href={`/blog/${post.slug}/`}>Read More <span aria-hidden="true">→</span></Link></div>
      </article>)}</div></section>}
    </> : <div className="landing-empty"><h2>No blog posts yet</h2><p>Published stories will appear here.</p></div>}</main>;
}
