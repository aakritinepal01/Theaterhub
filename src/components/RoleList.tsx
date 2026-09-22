import Link from "next/link";
import styles from "./RoleList.module.css";
import { groupPlaysByRole } from "@/lib/roles";

function CreditLines({ text }: { text: string }) {
  return text.split(/[,\n]+/).map(value => value.trim()).filter(Boolean).map((value, index) => (
    <span className={styles.line} key={index}>{value}</span>
  ));
}

export function RoleList({
  items,
}: {
  items: { role: string; profiles: { name: string; slug: string | null }[] }[];
}) {
  return (
    <ul className="role-list">
      {items.map((item) => (
        <li key={item.role} className="role-item">
          <span className="role-label"><CreditLines text={item.role} /></span>
          <div className={`role-names ${styles.lines}`}>
            {item.profiles.map((p, i) => (
              <span key={`${p.slug}-${i}`} className="role-person">
                {p.slug ? (
                  <Link href={`/profile/${p.slug}/`} className="role-person-link">
                    <CreditLines text={p.name} />
                  </Link>
                ) : (
                  <span className="role-person-name"><CreditLines text={p.name} /></span>
                )}
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
  variant,
}: {
  title?: string;
  variant?: "play";
  items: { play: { title: string; slug: string | null }; roles: string[] }[];
}) {
  if (!items.length) return null;
  if (variant === "play") return (
    <section className="play-detail-credit-panel">
      {title && <h3>{title}</h3>}
      <ul className="role-list">
        {groupPlaysByRole(items).map(group => <li className="role-item" key={group.role}>
          <span className="role-label">{group.role}</span>
          <div className={`role-names ${styles.lines}`}>
            {group.plays.map(play => play.slug ? <Link key={play.slug} className="role-person-link" href={`/play/${play.slug}/`}>{play.title}</Link> : <span key={play.title} className="role-person-name">{play.title}</span>)}
          </div>
        </li>)}
      </ul>
    </section>
  );
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
