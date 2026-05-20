'use client';

import React, { useEffect, useState } from 'react';
const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000';
type PageRecord = {
  id: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  title: string | null;
  description: string | null;
};

type Props = {
  pageId: number;
  title: string;
  endpoint: string;
};

const inputClass = 'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const parseKeywords = (value: string | null) => {
  if (!value) return [''];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String);
    }
  } catch {
    return [''];
  }

  return [''];
};

export default function StaticPageEditor({ pageId, title, endpoint }: Props) {
  const [, setPage] = useState<PageRecord | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(['']);
  const [pageTitle, setPageTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, { cache: 'no-store' });
        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
          const text = await response.text();
          setError(text || `Request failed: ${response.status}`);
          return;
        }

        if (!contentType.includes('application/json')) {
          const text = await response.text();
          setError(`Unexpected response: ${text.slice(0, 500)}`);
          return;
        }

        const result = await response.json();
        if (!result.success) {
          setError(result.message || 'Failed to load page.');
          return;
        }

        const record: PageRecord = result.data;
        setPage(record);
        setSeoTitle(record.seo_title || '');
        setSeoDescription(record.seo_description || '');
        setSeoKeywords(parseKeywords(record.seo_keywords));
        setPageTitle(record.title || '');
        setDescription(record.description || '');
      } catch (fetchError) {
        console.error(fetchError);
        setError('Network error. Ensure the backend is running on localhost:4000.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [endpoint]);

  const updateKeyword = (index: number, value: string) => {
    setSeoKeywords((current) => current.map((keyword, keywordIndex) => (keywordIndex === index ? value : keyword)));
  };

  const addKeyword = () => setSeoKeywords((current) => [...current, '']);

  const removeKeyword = (index: number) => {
    setSeoKeywords((current) => current.filter((_, keywordIndex) => keywordIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: JSON.stringify(seoKeywords.filter((keyword) => keyword.trim() !== '')),
          title: pageTitle,
          description,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Unexpected response from server.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to save page.');
      }

      setPage(result.data);
      alert(`${title} updated successfully.`);
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : 'Failed to save page.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading page {pageId}...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">Editing record id {pageId}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">SEO Title</label>
          <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">SEO Description</label>
          <textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} rows={3} className={inputClass} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">SEO Keywords</label>
            <button type="button" onClick={addKeyword} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">+ Add Keyword</button>
          </div>
          <div className="space-y-2">
            {seoKeywords.map((keyword, index) => (
              <div key={`${pageId}-keyword-${index}`} className="flex gap-2">
                <input value={keyword} onChange={(event) => updateKeyword(index, event.target.value)} className={inputClass} />
                <button type="button" onClick={() => removeKeyword(index)} className="rounded-md border border-slate-200 px-3 text-sm text-slate-500 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Page Title</label>
          <input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={8} className={inputClass} />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-500">Record id {pageId}</div>
          <button type="submit" disabled={isSaving} className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

    </div>
  );
}