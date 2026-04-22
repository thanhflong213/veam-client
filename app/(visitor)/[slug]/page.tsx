import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPage } from '../../lib/api';
import VisitorSidebar from '../components/VisitorSidebar';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPage(slug);
    return { title: page.seoTitle || page.title, description: page.seoDescription };
  } catch {
    return {};
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  let page;
  try {
    page = await getPage(slug);
  } catch {
    notFound();
  }

  return (
    <div className="page-body">
      <article>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: 'var(--navy)', marginBottom: 22 }}>
          {page.title}
        </h1>
        <div className="rc" dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
      </article>
      <VisitorSidebar />
    </div>
  );
}
