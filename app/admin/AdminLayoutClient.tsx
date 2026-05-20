'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminLogoutButton from './AdminLogoutButton';
import { readAdminSession } from './adminAuth';

// --- SVG ICONS ---
const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = readAdminSession();
    const valid = Boolean(session);
    setIsAuthenticated(valid);
    setReady(true);

    if (!valid && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }

    if (valid && pathname === '/admin/login') {
      router.replace('/admin');
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = window.setInterval(() => {
      const session = readAdminSession();
      if (!session) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      }
    }, 1000 * 20);

    return () => window.clearInterval(timer);
  }, [isAuthenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading admin panel...
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Admin<span className="text-slate-400 font-normal mx-1">|</span>Workspace
              </span>
            </div>

            <nav className="flex items-center space-x-4">
              <a
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <DocumentIcon />
                All Posts
              </a>
              <a
                href="/admin/terms_services"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <DocumentIcon />
                terms&services
              </a>
              <a
                href="/admin/privacy"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <DocumentIcon />
                privacy policy
              </a>
              <a
                href="/admin/about_us"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                <DocumentIcon />
                About Us
              </a>

              <div className="pl-4 border-l border-slate-200 flex items-center gap-3">
                <a
                  href="/admin/newpost"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200"
                >
                  <PlusIcon />
                  New Post
                </a>
                <AdminLogoutButton />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
