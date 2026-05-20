import React from 'react';
import Link from 'next/link';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:4000';

const resolveImageSrc = (imageUrl: string | null): string => {
  if (!imageUrl) return '/robot.png';
  
  if (imageUrl.startsWith('/api/media/')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('http://localhost:4000/api/media/')) {
    return imageUrl.replace('http://localhost:4000', '');
  }
  
  return imageUrl;
};

interface Post {
  id: number;
  title: string;
  subtitle: string | null;
  big_image: string | null;
  raise: number;
  created_at: string;
}

async function Banner() {
  let data: Post[] | null = null;

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/posts`, { cache: 'no-store' });
    if (response.ok) {
      const result = await response.json();
      data = result.data || [];
    }
  } catch (error) {
    console.error("Error fetching banner data:", error);
  }

  // Filter featured posts (raise === 1)
  const featuredPosts = data?.filter((post: Post) => post.raise === 1) || [];

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      {featuredPosts.map((post: Post) => (
        <Link key={post.id} href={`/${post.id}`}>
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
            {/* Featured Image */}
            <img
              src={resolveImageSrc(post.big_image)}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
              <span className="bg-indigo-600 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-4 inline-block">
                Featured
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 hover:text-indigo-200 transition-colors">
                {post.title}
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl line-clamp-2">
                {post.subtitle || ''}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default Banner;