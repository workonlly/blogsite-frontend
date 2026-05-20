import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  big_image: string | null;
  image_urls: string[];
  created_at: string;
};

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:4000';

const resolveImageSrc = (imageUrl: string | null): string => {
  if (!imageUrl) return '/robot.png';
  
  // If already in /api/media/ format, return as-is
  if (imageUrl.startsWith('/api/media/')) {
    return imageUrl;
  }
  
  // If full URL with localhost, remove the domain part
  if (imageUrl.startsWith(`${BACKEND_BASE_URL}/api/media/`)) {
    return imageUrl.replace(BACKEND_BASE_URL, '');
  }
  
  // Otherwise return as-is
  return imageUrl;
};

async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/posts`, { cache: 'no-store' });
    if (!response.ok) return [];
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function Posts() {
  const posts = await getPosts();
  console.log('Fetched posts:', posts);

  if (!posts.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-slate-500">
        No posts available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${post.id}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
        >
          {/* Post Image */}
          <div className="h-56 overflow-hidden bg-slate-100">
            {(() => {
              // Prefer image_urls if available, otherwise use big_image
              const imageSrc = post.image_urls && post.image_urls.length > 0 && post.image_urls[0]
                ? resolveImageSrc(post.image_urls[0])
                : post.big_image
                ? resolveImageSrc(post.big_image)
                : '/robot.png';
              
              return (
                <img
                  src={imageSrc}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              );
            })()}
          </div>

          {/* Post Content */}
          <div className="flex flex-grow flex-col p-6">
            <p className="mb-2 text-sm font-semibold text-indigo-500">
              Post • {formatDate(post.created_at)}
            </p>
            <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
              {post.title}
            </h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600">
              {post.subtitle || post.content.slice(0, 120)}...
            </p>
            <div className="mt-auto">
              <span className="text-sm font-medium text-indigo-600 hover:underline">
                Read more →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}