import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageFrame } from "@/components/SiteShell";
import { ContactForm } from "@/components/ContactForm";

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { form: { include: { fields: { where: { visible: true }, orderBy: { order: "asc" } } } } },
  });
  if (!page) notFound();
  return <>
    <header className="site-container"><h1>{page.title}</h1><p>{page.description}</p></header>
    <PageFrame>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
      {page.form && <ContactForm fields={page.form.fields} buttonText={page.form.buttonText} />}
    </PageFrame>
  </>;
}
