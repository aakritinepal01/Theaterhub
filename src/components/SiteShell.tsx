import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, currentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

async function logout() {
  "use server";
  await clearSession();
  redirect("/");
}

export async function Header() {
  const user = await currentUser().catch(() => null);
  const profile = user ? await prisma.profile.findFirst({ where: { ownerId: user.id }, select: { slug: true } }).catch(() => null) : null;
  const links = [
    { label: "Home", href: "/" },
    { label: "Plays", href: "/play/" },
    { label: "Theatres", href: "/theatre/" },
    { label: "Blog", href: "/blog/" },
    { label: "About", href: "/about-us/" },
    { label: "Contact", href: "/contact-us/" },
  ];
  return <Navbar links={links} user={user ? { username: user.username, isStaff: user.isStaff, profileSlug: profile?.slug } : null} logoutAction={logout} />;
}

export function PageFrame({children,fullWidth=false}:{children:React.ReactNode;sidebar?:boolean;fullWidth?:boolean}){return <div className={fullWidth?"page-frame-full":"site-container main-grid main-grid-full"}><main>{children}</main></div>}
