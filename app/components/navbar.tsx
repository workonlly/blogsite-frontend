import React from 'react';
import Link from 'next/link';
// --- SVG ICONS ---
const BrandIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);



function Navbar() {
  return (
      <nav className="sticky top-0 z-50 bg-white border-indigo-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Section */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
                <BrandIcon />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                <span className="text-indigo-600">B2B</span> <span>Lead Generation Expert</span>
              </span>
            </Link>
            
            {/* Desktop Menu Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-md font-medium text-slate-600 hover:text-indigo-600 transition-colors">Blogs</Link>
              <Link href="/aboutus" className="text-md font-medium text-slate-600 hover:text-indigo-600 transition-colors">About Us</Link>
              <Link href="/privacy" className="text-md font-medium text-slate-600 hover:text-indigo-600 transition-colors">Privacy</Link>
              <Link href="/termsandservices" className="text-md font-medium text-slate-600 hover:text-indigo-600 transition-colors">Terms</Link>
              
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="md:hidden flex items-center">
              <button className="text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </nav>
  )
}

export default Navbar