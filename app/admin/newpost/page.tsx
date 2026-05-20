'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FormDataState {
  seo_title: string;
  seo_description: string;
  seo_keywords: string[]; 
  title: string;
  subtitle: string;
  content: string;
  raise: boolean;
}

function NewPostForm() {
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

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

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
      const newKeywords = [...prev.seo_keywords];
      newKeywords[index] = value;
      return { ...prev, seo_keywords: newKeywords };
    });
  };

  const addKeyword = () => setFormData((prev) => ({ ...prev, seo_keywords: [...prev.seo_keywords, ''] }));
  const removeKeyword = (index: number) => setFormData((prev) => ({
    ...prev,
    seo_keywords: prev.seo_keywords.filter((_, i) => i !== index)
  }));

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHeroImage(e.target.files[0]);
    }
  };

  const removeHeroImage = () => {
    setHeroImage(null);
    if (heroInputRef.current) heroInputRef.current.value = ''; 
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesArray = Array.from(e.target.files);
      setAdditionalImages((prev) => {
        const combinedFiles = [...prev, ...newFilesArray];
        if (combinedFiles.length > 3) {
          alert("You can only select a maximum of 3 additional images.");
          return combinedFiles.slice(0, 3);
        }
        return combinedFiles;
      });
      if (additionalInputRef.current) additionalInputRef.current.value = '';
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitData = new FormData();

    submitData.append('seo_title', formData.seo_title);
    submitData.append('seo_description', formData.seo_description);
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('content', formData.content);
    submitData.append('raise', String(formData.raise));
    
    const cleanKeywords = formData.seo_keywords.filter(k => k.trim() !== '');
    submitData.append('seo_keywords', JSON.stringify(cleanKeywords));

    if (heroImage) submitData.append('big_image', heroImage);
    
    additionalImages.forEach((file) => {
      submitData.append('image_urls', file); 
    });

    try {
      // Connect to your backend route (ensure the port matches your Express server)
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: submitData, // Browser automatically sets multipart/form-data headers
      });
      const result = await response.json();
      if (result.success) {
        alert("Post created successfully!");
        router.push('/admin');
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  // Base input class for cleaner JSX
  const inputClass = "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create New Post</h2>
        <p className="text-sm text-slate-500 mt-1">Fill out the details below to publish a new article.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- SEO SECTION --- */}
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
              <input type="text" id="seo_title" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputClass} placeholder="Optimized title for search engines" />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="seo_description" className="block text-sm font-medium text-slate-700">SEO Description</label>
              <textarea id="seo_description" name="seo_description" rows={2} value={formData.seo_description} onChange={handleChange} className={inputClass} placeholder="Brief summary for search results" />
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
                    <input type="text" value={keyword} onChange={(e) => handleKeywordChange(index, e.target.value)} className={inputClass} placeholder="e.g., b2b marketing" />
                    <button type="button" onClick={() => removeKeyword(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" aria-label="Remove keyword">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {formData.seo_keywords.length === 0 && <p className="text-sm text-slate-400 italic">No keywords added.</p>}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-t-2 border-slate-100" />

        {/* --- MAIN CONTENT SECTION --- */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Post Content
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Post Title <span className="text-red-500">*</span></label>
              <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className={inputClass} placeholder="Main display title" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700">Subtitle</label>
              <input type="text" id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} className={inputClass} placeholder="Optional subtitle or hook" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">Content [add /image in the content where you want to show images] <span className="text-red-500">*</span></label>
              <textarea id="content" name="content" required rows={8} value={formData.content} onChange={handleChange} className={`${inputClass} font-mono`} placeholder="Write your post content here..." />
            </div>

            {/* --- FILE UPLOAD: HERO IMAGE --- */}
            <div className="sm:col-span-2">
              <label htmlFor="big_image" className="block text-sm font-medium text-slate-700 mb-1">Hero Image [16:9]</label>
              <div className="flex flex-col gap-4">
                <input 
                  type="file" 
                  id="big_image" 
                  accept="image/*"
                  ref={heroInputRef}
                  onChange={handleHeroImageChange}
                  className={`block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 transition-all cursor-pointer ${heroImage ? 'hidden' : ''}`} 
                />
                
                {heroImage && (
                  <div className="relative inline-block w-fit">
                    <img src={URL.createObjectURL(heroImage)} alt="Hero Preview" className="h-40 w-auto object-cover rounded-lg border border-slate-200 shadow-sm" />
                    <button type="button" onClick={removeHeroImage} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors" title="Remove Hero Image">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- FILE UPLOAD: ADDITIONAL IMAGES --- */}
            <div className="sm:col-span-2">
              <label htmlFor="image_urls" className="block text-sm font-medium text-slate-700 mb-1">
                Additional Images <span className="text-slate-400 font-normal">({additionalImages.length}/3)</span>
              </label>
              <div className="flex flex-col gap-4">
                {additionalImages.length < 3 && (
                  <input 
                    type="file" 
                    id="image_urls" 
                    accept="image/*"
                    multiple
                    ref={additionalInputRef}
                    onChange={handleAdditionalImagesChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 transition-all cursor-pointer" 
                  />
                )}

                {additionalImages.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {additionalImages.map((file, index) => (
                      <div key={index} className="relative inline-block">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm" />
                        <button type="button" onClick={() => removeAdditionalImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" title="Remove Image">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center mt-2">
              <input type="checkbox" id="raise" name="raise" checked={formData.raise} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="raise" className="ml-2 block text-sm font-medium text-slate-900">Raise (Highlight/Feature this post)</label>
            </div>

          </div>
        </section>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" className="inline-flex justify-center rounded-md bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 transition-all">
            Upload & Publish
          </button>
        </div>

      </form>
    </div>
  );
}

export default NewPostForm;