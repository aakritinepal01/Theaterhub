import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArtistPhoto } from "@/lib/content";
import { groupCreditsByPlay } from "@/lib/roles";
import { PageFrame } from "@/components/SiteShell";
import { CreditList } from "@/components/RoleList";
import { ArtistSocialLinks } from "@/components/ArtistSocialLinks";
import styles from "./profile.module.css";

export default async function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await prisma.profile.findUnique({
    where: { slug },
    include: {
      makerCredits: { include: { play: true } },
      castCredits: { include: { play: true } },
      crewCredits: { include: { play: true } },
    },
  });

  if (!p) notFound();

  const image = getArtistPhoto(p);

  return (
    <>
      <header className="site-container page-header">
        <span className="landing-kicker">Theater Artist Profile</span>
        <h1>{p.name}</h1>
      </header>

      <PageFrame>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <img className={styles.portrait} src={image} alt={p.name} />
            {p.bio ? (
              <div className={styles.bio} dangerouslySetInnerHTML={{ __html: p.bio }} />
            ) : (
              <p className={styles.bio}>
                No bio available for &ldquo;{p.name}&rdquo;. Dedicated theatre practitioner contributing to stage productions in Nepal.
              </p>
            )}
            <ArtistSocialLinks artist={p} />
            {p.address && <p className={styles.address}>{p.address}</p>}
          </aside>
          <div className={styles.credits}>
            <CreditList variant="play" title="Creative Team" items={groupCreditsByPlay(p.makerCredits)} />
            <CreditList variant="play" title="On Stage" items={groupCreditsByPlay(p.castCredits)} />
            <CreditList variant="play" title="Off Stage" items={groupCreditsByPlay(p.crewCredits)} />
          </div>
        </div>
      </PageFrame>
    </>
  );
}
