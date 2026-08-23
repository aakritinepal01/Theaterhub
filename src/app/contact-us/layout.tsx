import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | TheatreHub",
  description:
    "Get in touch with the TheatreHub team. List a production, register a venue, submit a story, or ask us anything about Nepal's theatre platform.",
  openGraph: {
    title: "Contact Us | TheatreHub",
    description: "Reach out to the TheatreHub team for listings, partnerships, or general enquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
