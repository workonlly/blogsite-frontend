import parse from 'html-react-parser';
import { Metadata } from 'next';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:4000';

type Post = {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  big_image: string | null;
  image_urls: string[];
  created_at: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

const resolveImageSrc = (imageUrl: string | null): string => {
  if (!imageUrl) return '/robot.png';
  if (imageUrl.startsWith(`${BACKEND_BASE_URL}/api/media/`)) {
    return imageUrl.replace(BACKEND_BASE_URL, '');
  }
  return imageUrl;
};

async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/posts/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'This post does not exist.',
    };
  }

  return {
    title: post.title,
    description: post.subtitle || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.subtitle || post.content.substring(0, 160),
      images: [resolveImageSrc(post.big_image)],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-slate-500">Post not found.</main>;
  }

  // Process content to handle /image placeholders
  // Ensure imageUrls is always an array (handle both array and JSON string)
  let imageUrls: string[] = [];
  if (Array.isArray(post.image_urls)) {
    imageUrls = post.image_urls;
  } else if (typeof post.image_urls === 'string') {
    try {
      imageUrls = JSON.parse(post.image_urls);
      if (!Array.isArray(imageUrls)) imageUrls = [];
    } catch {
      imageUrls = [];
    }
  }

  const imagePlaceholders = (post.content.match(/\/image/g) || []).length;
  let imageIndex = 0;

  const processedContent = () => {
    let content = post.content;

    // Replace each /image placeholder with actual image
    content = content.replace(/\/image/g, () => {
      if (imageIndex < imageUrls.length) {
        const imageUrl = imageUrls[imageIndex];
        imageIndex++;
        return `<div class="my-8 rounded-2xl overflow-hidden border border-slate-200"><img src="${resolveImageSrc(imageUrl)}" alt="post image" class="w-full h-auto" /></div>`;
      }
      return '';
    });

    return content;
  };

  // Remaining images not used in /image placeholders
  const remainingImages = Array.isArray(imageUrls) ? imageUrls.slice(imagePlaceholders) : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Featured Image */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <img
          src={post.big_image ? resolveImageSrc(post.big_image) : '/robot.png'}
          alt={post.title}
          className="h-auto w-full object-cover"
        />
      </div>

      {/* Title and Subtitle */}
      <h1 className="text-4xl font-bold text-indigo-600">{post.title}</h1>
      {post.subtitle && <p className="mt-4 text-lg text-slate-600">{post.subtitle}</p>}

      {/* Article Content */}
      <article className="prose prose-slate mt-10 max-w-none">
        {parse(processedContent())}
      </article>

      {/* Remaining Images (if any) */}
      {remainingImages.length > 0 && (
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingImages.map((imageUrl, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={resolveImageSrc(imageUrl)}
                  alt={`post gallery ${idx + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
