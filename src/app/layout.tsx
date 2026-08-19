import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/SiteShell";
import { Footer } from "@/components/Footer";

export const metadata:Metadata={title:{default:"TheatreHub",template:"%s | TheatreHub"},description:"Theatre productions, professionals, venues and writing from Nepal."};
export const dynamic = "force-dynamic";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<Footer/></body></html>}
