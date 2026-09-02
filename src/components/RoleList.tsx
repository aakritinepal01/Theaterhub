import Link from "next/link";

export function RoleList({
  items,
}: {
  items: { role: string; profiles: { name: string; slug: string | null }[] }[];
}) {
  return (
    <ul className="role-list">
      {items.map((item) => (
        <li key={item.role} className="role-item">
          <span className="role-label">{item.role}</span>
          <div className="role-names">
            {item.profiles.map((p, i) => (
              <span key={`${p.slug}-${i}`} className="role-person">
                {p.slug ? (
                  <Link href={`/profile/${p.slug}/`} className="role-person-link">
                    {p.name}
                  </Link>
                ) : (
                  <span className="role-person-name">{p.name}</span>
                )}
                {i < item.profiles.length - 1 && <span className="role-sep">, </span>}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CreditList({
  title,
  items,
}: {
  title?: string;
  items: { play: { title: string; slug: string | null }; roles: string[] }[];
}) {
  if (!items.length) return null;
  return (
    <section className="credit-list-section">
      {title && <h2>{title}</h2>}
      <ul className="credit-list">
        {items.map((item, i) => (
          <li key={i}>
            <Link href={`/play/${item.play.slug}/`}>{item.play.title}</Link>{" "}
            <span className="credit-roles">({item.roles.join(", ")})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
