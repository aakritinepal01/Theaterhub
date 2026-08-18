import Link from "next/link";

export function RoleList({items}:{items:{role:string;profiles:{name:string;slug:string|null}[]}[]}){return <ul className="role-list">{items.map(item=><li key={item.role}><em>{item.role}</em>{item.profiles.map((p,i)=><span key={`${p.slug}-${i}`}>{i>0&&", "}{p.slug?<Link href={`/profile/${p.slug}/`}>{p.name}</Link>:p.name}</span>)}</li>)}</ul>}

export function CreditList({title,items}:{title?:string;items:{play:{title:string;slug:string|null};roles:string[]}[]}){if(!items.length)return null;return <section>{title&&<h2>{title}</h2>}<ul>{items.map((item,i)=><li key={i}><Link href={`/play/${item.play.slug}/`}>{item.play.title}</Link> ({item.roles.join(", ")})</li>)}</ul></section>}
