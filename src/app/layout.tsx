import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/SiteShell";
import { Footer } from "@/components/Footer";

export const metadata:Metadata={title:{default:"TheatreHub",template:"%s | TheatreHub"},description:"Theatre productions, professionals, venues and writing from Nepal."};
export const dynamic = "force-dynamic";
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("theaterhub-theme")==="dark"?"dark":"light"}catch{document.documentElement.dataset.theme="light"}`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{__html:themeScript}}/><Header/>{children}<Footer/></body></html>}
