import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const BACKEND_BASE_URL = process.env.BACKEND_URL ;

type PageRecord = {
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  title: string | null;
  description: string | null;
};


export async function generateMetadata(): Promise<Metadata> {
  const post = await getPage();
 
  if (!post) {
    return {
      title: 'Terms of Service',
      description: 'Our terms of service.',
    };
  }

  return {
    title: post.seo_title || "TermsAndServicesPage",
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
  let post: PageRecord | null = null;
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/terms_of_service/`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) throw new Error("Failed to fetch Terms of Service data.");
    const result = await response.json();
    post = result.data;
  } catch (error) {
    console.error("Error fetching Terms of Service data for SEO metadata:", error);
  }
  console.log("Fetched Terms of Service data for SEO metadata:", post);
  
  if (!post) {
    return {
      seo_title: 'Terms of Service',
      seo_description: 'Our terms of service.',
      seo_keywords: null,
      title: 'Terms of Service',
      description: 'Terms of Service page is unavailable.',
    };
  }
  return post;
}



export default async function TermsAndServicesPage() {
  const page = await getPage();

  if (!page) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-slate-500">Terms of Service page is unavailable.</main>;
  }

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