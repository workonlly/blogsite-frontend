'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of our Post data based on your SQLite schema
interface Post {
  id: number;
  title: string;
  subtitle: string | null;
  big_image: string | null;
  raise: number; // SQLite stores booleans as 1 or 0
  created_at: string;
}

interface SEOData {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  title: string;
  description: string;
}

// SEO Panel Component
function SEOPanel() {
  const [seoData, setSeoData] = useState<SEOData>({
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch SEO data on mount
  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/blog', { cache: 'no-store' });
        const result = await response.json();
        if (result.success && result.data) {
          setSeoData({
            seo_title: result.data.seo_title || '',
            seo_description: result.data.seo_description || '',
            seo_keywords: result.data.seo_keywords || '',
            title: result.data.title || '',
            description: result.data.description || '',
          });
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
        setMessage({ type: 'error', text: 'Failed to load SEO data' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSEOData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch('http://localhost:4000/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData),
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'SEO data updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update SEO data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Ensure your backend is running.' });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <svg className="animate-spin h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading SEO data...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          SEO & Blog Metadata
        </h2>
        <p className="text-sm text-slate-600 mt-1">Manage your blog's search engine optimization and metadata</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Blog Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Blog Title
          </label>
          <input
            type="text"
            name="title"
            value={seoData.title}
            onChange={handleInputChange}
            placeholder="e.g., Mastering SQL: A Beginner's Guide"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-slate-500 mt-1">The main title of your blog post</p>
        </div>

        {/* Blog Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Blog Description
          </label>
          <textarea
            name="description"
            value={seoData.description}
            onChange={handleInputChange}
            placeholder="Full content and details of your blog post..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">Complete description and content of your blog</p>
        </div>

        {/* SEO Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            SEO Title
          </label>
          <input
            type="text"
            name="seo_title"
            value={seoData.seo_title}
            onChange={handleInputChange}
            placeholder="e.g., How to Learn SQL Fast | Beginner Guide"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            maxLength={60}
          />
          <p className="text-xs text-slate-500 mt-1">Appears in search results (60 characters max)</p>
        </div>

        {/* SEO Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            SEO Meta Description
          </label>
          <textarea
            name="seo_description"
            value={seoData.seo_description}
            onChange={handleInputChange}
            placeholder="Brief description that appears in search results..."
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            maxLength={160}
          />
          <p className="text-xs text-slate-500 mt-1">Appears in search results (160 characters max)</p>
        </div>

        {/* SEO Keywords */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            SEO Keywords
          </label>
          <input
            type="text"
            name="seo_keywords"
            value={seoData.seo_keywords}
            onChange={handleInputChange}
            placeholder="e.g., sql, learn sql, database, sql tutorial, beginners"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-slate-500 mt-1">Comma-separated keywords for SEO (e.g., keyword1, keyword2, keyword3)</p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save SEO Metadata
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http://localhost:4000/api/media/')) {
      return imageUrl.replace('http://localhost:4000', '');
    }

    return imageUrl;
  };

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Adjust the URL if your backend runs on a different port/route
        const response = await fetch('http://localhost:4000/api/posts', {
          cache: 'no-store',
        });
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
          const text = await response.text();
          setError((text && text.substring(0, 500)) || `Request failed: ${response.status}`);
          return;
        }

        if (contentType.includes('application/json')) {
          let result;
          try {
            result = await response.json();
          } catch (err) {
            const text = await response.text();
            setError('Invalid JSON response: ' + (text ? text.substring(0, 500) : ''));
            return;
          }

          if (result && result.success) {
            setPosts(result.data);
          } else {
            setError(result?.message || 'Failed to fetch posts.');
          }
        } else {
          const text = await response.text();
          setError('Unexpected response from server: ' + (text ? text.substring(0, 500) : ''));
        }
      } catch (err) {
        setError('Network error. Ensure your backend server is running.');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleDelete = async (postId: number) => {
    const confirmed = window.confirm('Delete this post permanently?');
    alert(`[Delete Action] User confirmation: ${confirmed} for post ID: ${postId}`);

    if (!confirmed) {
      return;
    }

    try {
      const backendUrl =  'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/delete/${postId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete post.');
      }

      // Remove from UI immediately
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    } catch (deleteError) {
      console.error('Delete error:', deleteError);
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete post.');
    }
  };

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto py-8">
      {/* SEO Panel */}
      <SEOPanel />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and review your published content.</p>
        </div>
      
      </div>

      {/* --- STATE: LOADING --- */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium">Loading your content...</p>
        </div>
      )}

      {/* --- STATE: ERROR --- */}
      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* --- STATE: EMPTY (No Posts) --- */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white border border-slate-200 border-dashed rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No posts published yet</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center mt-2 mb-6">
            You haven't written any articles yet. Click the button below to draft your first lead-generating post.
          </p>
          <a href="/admin/newpost" className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
            Start Writing
          </a>
        </div>
      )}

      {/* --- STATE: SUCCESS (Grid Layout) --- */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/admin/${post.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  router.push(`/admin/${post.id}`);
                }
              }}
            >
              {/* Card Image */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {post.big_image ? (
                  <img 
                    src={resolveImageSrc(post.big_image) || undefined} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-slate-400 text-sm">No Image Provided</span>
                  </div>
                )}
                
                {/* Raise/Highlight Badge */}
                {post.raise === 1 && (
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Featured
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex-1 mb-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 line-clamp-2" title={post.title}>
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {post.subtitle}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-xs font-medium text-slate-400">
                    {formatDate(post.created_at)}
                  </span>
                  
                  {/* Action Buttons (Edit / Delete) */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/admin/${post.id}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                      title="Edit Post"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(post.id);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Post"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  );
}