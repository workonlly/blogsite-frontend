'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000';

interface FormDataState {
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  title: string;
  subtitle: string;
  content: string;
  raise: boolean;
}

interface PostRecord {
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  title: string;
  subtitle: string | null;
  content: string;
  big_image: string | null;
  image_urls: string | null;
  raise: number | boolean;
}

const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const parseList = (value: string | null) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map(String);
    }
  } catch {
    return [];
  }

  return [];
};

export default function EditPostClient({ postId }: { postId: string }) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormDataState>({
    seo_title: '',
    seo_description: '',
    seo_keywords: [''],
    title: '',
    subtitle: '',
    content: '',
    raise: false,
  });
  const [existingHeroImage, setExistingHeroImage] = useState<string | null>(null);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!postId || postId === 'undefined') {
      setError('Invalid post id.');
      setIsLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/posts/${postId}`, { cache: 'no-store' });
        const result = await response.json();

        if (!result.success) {
          setError(result.message || 'Failed to load post.');
          return;
        }

        const post: PostRecord = result.data;
        setFormData({
          seo_title: post.seo_title || '',
          seo_description: post.seo_description || '',
          seo_keywords: parseList(post.seo_keywords).length > 0 ? parseList(post.seo_keywords) : [''],
          title: post.title || '',
          subtitle: post.subtitle || '',
          content: post.content || '',
          raise: Boolean(post.raise),
        });
        setExistingHeroImage(post.big_image);
        setExistingAdditionalImages(parseList(post.image_urls));
      } catch (fetchError) {
        setError('Network error. Ensure your backend server is running.');
        console.error('Fetch error:', fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleKeywordChange = (index: number, value: string) => {
    setFormData((prev) => {
      const nextKeywords = [...prev.seo_keywords];
      nextKeywords[index] = value;
      return { ...prev, seo_keywords: nextKeywords };
    });
  };

  const addKeyword = () => setFormData((prev) => ({ ...prev, seo_keywords: [...prev.seo_keywords, ''] }));
  const removeKeyword = (index: number) => setFormData((prev) => ({
    ...prev,
    seo_keywords: prev.seo_keywords.filter((_, i) => i !== index),
  }));

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHeroImage(e.target.files[0]);
      setExistingHeroImage(null);
    }
  };

  const removeHeroImage = () => {
    setHeroImage(null);
    setExistingHeroImage(null);
    if (heroInputRef.current) heroInputRef.current.value = '';
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nextFiles = Array.from(e.target.files);
      setAdditionalImages((prev) => {
        const merged = [...prev, ...nextFiles];
        if (merged.length > 3) {
          alert('You can only select a maximum of 3 additional images.');
          return merged.slice(0, 3);
        }
        return merged;
      });
      if (additionalInputRef.current) additionalInputRef.current.value = '';
    }
  };

  const removeAdditionalExistingImage = (indexToRemove: number) => {
    setExistingAdditionalImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeAdditionalNewImage = (indexToRemove: number) => {
    setAdditionalImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resolveImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith(`${BACKEND_BASE_URL}/api/media/`)) {
      return imageUrl.replace(BACKEND_BASE_URL, '');
    }
    return imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!postId || postId === 'undefined') {
      alert('Invalid post id.');
      return;
    }

    const submitData = new FormData();
    submitData.append('seo_title', formData.seo_title);
    submitData.append('seo_description', formData.seo_description);
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('content', formData.content);
    submitData.append('raise', String(formData.raise));
    submitData.append('existing_big_image', existingHeroImage || '');
    submitData.append('existing_image_urls', JSON.stringify(existingAdditionalImages));

    const cleanKeywords = formData.seo_keywords.filter((keyword) => keyword.trim() !== '');
    submitData.append('seo_keywords', JSON.stringify(cleanKeywords));

    if (heroImage) submitData.append('big_image', heroImage);

    additionalImages.forEach((file) => {
      submitData.append('image_urls', file);
    });

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        body: submitData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Post updated successfully!');
        router.push('/admin');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (submitError) {
      console.error('Submission failed:', submitError);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-slate-500">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button onClick={() => router.push('/admin')} className="mt-3 text-sm text-red-700 hover:text-red-900 underline">
          Back to posts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Edit Post</h2>
        <p className="text-sm text-slate-500 mt-1">Update the content, SEO, and images for this article.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Engine Optimization (SEO)
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="seo_title" className="block text-sm font-medium text-slate-700">SEO Title</label>
              <input type="text" id="seo_title" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="seo_description" className="block text-sm font-medium text-slate-700">SEO Description</label>
              <textarea id="seo_description" name="seo_description" rows={2} value={formData.seo_description} onChange={handleChange} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">SEO Keywords</label>
                <button type="button" onClick={addKeyword} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors">
                  + Add Keyword
                </button>
              </div>
              <div className="space-y-2">
                {formData.seo_keywords.map((keyword, index) => (
                  <div key={`keyword-${index}`} className="flex gap-2">
                    <input type="text" value={keyword} onChange={(event) => handleKeywordChange(index, event.target.value)} className={inputClass} />
                    <button type="button" onClick={() => removeKeyword(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" aria-label="Remove keyword">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-t-2 border-slate-100" />

        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Post Content
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Post Title</label>
              <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700">Subtitle</label>
              <input type="text" id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">Content</label>
              <textarea id="content" name="content" required rows={8} value={formData.content} onChange={handleChange} className={`${inputClass} font-mono`} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Image</label>
              <div className="flex flex-col gap-4">
                {heroImage ? (
                  <div className="relative inline-block w-fit">
                    <img src={URL.createObjectURL(heroImage)} alt="Hero Preview" className="h-40 w-auto object-cover rounded-lg border border-slate-200 shadow-sm" />
                    <button type="button" onClick={removeHeroImage} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors" title="Remove Hero Image">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : existingHeroImage ? (
                  <div className="relative inline-block w-fit">
                    <img src={resolveImageSrc(existingHeroImage) || undefined} alt="Existing Hero" className="h-40 w-auto object-cover rounded-lg border border-slate-200 shadow-sm" />
                    <button type="button" onClick={removeHeroImage} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors" title="Remove Hero Image">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : null}

                <input
                  type="file"
                  id="big_image"
                  accept="image/*"
                  ref={heroInputRef}
                  onChange={handleHeroImageChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Images</label>
              {existingAdditionalImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {existingAdditionalImages.map((imageUrl, index) => (
                    <div key={imageUrl} className="relative inline-block">
                      <img src={resolveImageSrc(imageUrl) || undefined} alt={`Existing ${index + 1}`} className="h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm" />
                      <button type="button" onClick={() => removeAdditionalExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" title="Remove Image">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {additionalImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {additionalImages.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="relative inline-block">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm" />
                      <button type="button" onClick={() => removeAdditionalNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" title="Remove Image">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                id="image_urls"
                accept="image/*"
                multiple
                ref={additionalInputRef}
                onChange={handleAdditionalImagesChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 transition-all cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2 flex items-center mt-2">
              <input type="checkbox" id="raise" name="raise" checked={formData.raise} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="raise" className="ml-2 block text-sm font-medium text-slate-900">Raise (Highlight/Feature this post)</label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" className="inline-flex justify-center rounded-md bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 transition-all">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}