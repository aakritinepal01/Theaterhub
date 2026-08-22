import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArtistPhoto } from "@/lib/content";
import { groupCreditsByPlay } from "@/lib/roles";
import { PageFrame } from "@/components/SiteShell";
import { CreditList } from "@/components/RoleList";

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
        <span className="landing-kicker">Theatre Practitioner Profile</span>
        <h1>{p.name}</h1>
      </header>

      <PageFrame>
        <div className="play-row">
          <aside className="artist-profile-sidebar">
            <img className="thumbnail artist-profile-img" src={image} alt={p.name} />

            <div className="socials">
              {[
                ["f", p.linkFacebook],
                ["t", p.linkTwitter],
                ["i", p.linkInstagram],
                ["w", p.linkWebsite],
              ]
                .filter((x) => x[1])
                .map(([n, u]) => (
                  <a
                    className="social"
                    key={n}
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {n}
                  </a>
                ))}
            </div>

            {p.address && <p className="artist-sidebar-address">📍 {p.address}</p>}
          </aside>

          <div className="artist-profile-main">
            {p.bio ? (
              <div
                className="artist-bio-text"
                dangerouslySetInnerHTML={{ __html: p.bio }}
              />
            ) : (
              <p className="artist-bio-text">
                No bio available for &ldquo;{p.name}&rdquo;. Dedicated theatre practitioner contributing to stage productions in Nepal.
              </p>
            )}

            <CreditList items={groupCreditsByPlay(p.makerCredits)} />
            <CreditList title="On Stage" items={groupCreditsByPlay(p.castCredits)} />
            <CreditList title="Off Stage" items={groupCreditsByPlay(p.crewCredits)} />
          </div>
        </div>
      </PageFrame>
    </>
  );
}
