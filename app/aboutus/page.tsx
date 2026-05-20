import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type PageRecord = {
  id: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  title: string | null;
  description: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const post = await getPage();
  
  return {
    title: post.seo_title || post.title || undefined,
    description: post.seo_description || undefined,
    keywords: post.seo_keywords ? post.seo_keywords.split(',').map((k: string) => k.trim()) : [],
    openGraph: {
      title: post.title || undefined,
      description: post.seo_description || undefined,
      type: 'website',
      images: ['/robot.png'],
    },
  };
}

async function getPage(): Promise<PageRecord> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/about_us`, {  next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Failed to fetch about us");

    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.error("Error fetching about us:", error);
  }

  return {
    id: 0,
    seo_title: 'About Us',
    seo_description: 'Learn more about us.',
    seo_keywords: null,
    title: 'About Us',
    description: 'About Us page is unavailable.',
  };
}



export default async function AboutUsPage() {
  const page = await getPage();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-indigo-600">{page.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{page.seo_description}</p>
      <article className="prose prose-slate mt-10 max-w-none">
        <p>{page.description}</p>
      </article>
    </main>
  );
}