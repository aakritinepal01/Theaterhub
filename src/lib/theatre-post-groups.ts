export type TheatreMediaItem = {
  id: string;
  title: string;
  image: string;
  mediaType: string;
  href: string;
  theatreName: string;
};
export type TheatreMediaGroup = { id: string; title: string; stories: TheatreMediaItem[] };
type Post = {
  id: string; kind: string; caption: string; createdAt: Date;
  theatre: { id: number; title: string; slug: string | null };
  assets: { id: string; url: string; mediaType: string; position: number }[];
};

export function groupTheatrePosts(posts: Post[], kind: "STORY" | "REEL"): TheatreMediaGroup[] {
  const groups = new Map<number, TheatreMediaGroup>();
  const ordered = posts.filter(post => post.kind === kind).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));
  for (const post of ordered) {
    if (!post.assets.length) continue;
    const theatre = post.theatre;
    const group = groups.get(theatre.id) ?? { id: `${kind}-${theatre.id}`, title: theatre.title, stories: [] };
    for (const asset of [...post.assets].sort((a, b) => a.position - b.position)) {
      group.stories.push({ id: asset.id, title: post.caption || theatre.title, image: asset.url,
        mediaType: asset.mediaType, theatreName: theatre.title,
        href: theatre.slug ? `/theatre/${theatre.slug}/` : "/theatre/" });
    }
    groups.set(theatre.id, group);
  }
  return [...groups.values()];
}
