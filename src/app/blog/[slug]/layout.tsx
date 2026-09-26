import { EditorialSectionNav } from "@/components/EditorialSectionNav";

export default function NewsArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EditorialSectionNav activeSection="news" />
      {children}
    </>
  );
}
