import Link from "next/link";
import { ProfileForm } from "@/components/TheatreDashboardForms";
import { getOwnerTheatre } from "@/lib/theatre-dashboard";

export const dynamic = "force-dynamic";

export default async function TheatreProfilePage() {
  const { theatre } = await getOwnerTheatre();
  if (!theatre) return null;

  const profileStrength = [
    theatre.about,
    theatre.profilePic,
    theatre.coverImage,
    theatre.email,
    theatre.phone,
    theatre.address,
    theatre.linkWebsite,
  ].filter(Boolean).length;
  const strength = Math.round((profileStrength / 7) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="owner-main-grid" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
        <section className="owner-panel owner-profile-panel" id="profile" style={{ margin: 0 }}>
          <div className="owner-panel-head">
            <div>
              <p>Complete theatre record</p>
              <h2>Edit theatre profile</h2>
            </div>
            <span>All existing information is pre-filled</span>
          </div>
          <ProfileForm theatre={theatre} />
        </section>

        <aside className="owner-side-column" style={{ display: "flex", flexDirection: "column", gap: "14px", margin: 0 }}>
          <section className="owner-panel" style={{ margin: 0 }}>
            <div className="owner-panel-head" style={{ marginBottom: "16px" }}>
              <div>
                <p>Profile status</p>
                <h2>Completion</h2>
              </div>
              <strong style={{ fontSize: "1.3rem", color: "var(--owner-accent)" }}>{strength}%</strong>
            </div>
            <div style={{ height: "8px", background: "var(--owner-line-subtle)", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ height: "100%", width: `${strength}%`, background: "var(--owner-brand-grad)", borderRadius: "999px" }} />
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--owner-text-sub)", margin: 0 }}>
              A complete profile helps audiences and partners discover your venue, history, and contact details.
            </p>
            {theatre.slug && (
              <div style={{ marginTop: "16px" }}>
                <Link
                  href={`/theatre/${theatre.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="owner-profile-link"
                  style={{ display: "inline-block" }}
                >
                  View live public page ↗
                </Link>
              </div>
            )}
          </section>

          <section className="owner-panel owner-contact" style={{ margin: 0 }}>
            <div className="owner-panel-head">
              <div>
                <p>Contact information</p>
                <h2>Current details</h2>
              </div>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{theatre.email || "Not added"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{theatre.phone || "Not added"}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{theatre.address || "Not added"}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>{theatre.linkWebsite || "Not added"}</dd>
              </div>
              {theatre.linkFacebook && (
                <div>
                  <dt>Facebook</dt>
                  <dd>
                    <a href={theatre.linkFacebook} target="_blank" rel="noopener noreferrer">
                      {theatre.linkFacebook}
                    </a>
                  </dd>
                </div>
              )}
              {theatre.linkInstagram && (
                <div>
                  <dt>Instagram</dt>
                  <dd>
                    <a href={theatre.linkInstagram} target="_blank" rel="noopener noreferrer">
                      {theatre.linkInstagram}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
