'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBar from './SearchBar'; // adjust path if needed
import { useGlobalData } from './GlobalDataContext'; // ✅ use the context!

export default function Navbar() {
  const { categories, loading } = useGlobalData();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 z-50 relative font-roboto">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4 relative">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </Link>

        <ul className="flex gap-8 items-center text-base font-medium relative">
          <li><Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">Over het bedrijf</Link></li>

          <li className="relative">
            <div
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => {
                setShowDropdown(false);
                setActiveCategory(null);
                setActiveSubcategory(null);
              }}
              className="relative"
            >
              <Link href="/products" className="hover:text-blue-600 transition hover:underline underline-offset-4">Producten</Link>
              <div className="absolute top-full left-0 w-full h-6 pointer-events-auto"></div>
            </div>
          </li>

          <li><Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">Over Ons</Link></li>
          <li><Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">Contact</Link></li>
        </ul>

        <div className="flex items-center gap-3">
          <SearchBar />
        </div>
      </div>

      {showDropdown && (
  <div
    onMouseEnter={() => setShowDropdown(true)}
    onMouseLeave={() => {
      setShowDropdown(false);
      setActiveCategory(null);
      setActiveSubcategory(null);
    }}
    className="fixed top-[72px] left-1/2 -translate-x-1/2 w-screen bg-white shadow-2xl border-t z-40 text-center animate-fade-in"
  >
    <div className="max-w-screen-xl mx-auto">
      {loading ? (
        <div className="py-6 text-gray-400">Laden...</div>
      ) : (
        <>
          {/* Category Row */}
          <div className="flex flex-wrap justify-center gap-6 py-4 border-b">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.id}`}
                className={`px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-blue-600 ${
                  activeCategory === cat.id ? 'text-blue-600 font-semibold underline underline-offset-4' : ''
                }`}
                onMouseEnter={() => {
                  setActiveCategory(cat.id);
                  setActiveSubcategory(null);
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Subcategory Row */}
          {activeCategory && (
            <div className="flex flex-wrap justify-center gap-6 py-4 border-b bg-gray-50">
              {categories
                .find((c) => c.id === activeCategory)
                ?.subcategories?.map((sub) => (
                  <Link
                    key={sub.id}
                    href={
                      sub.subsubcategories && sub.subsubcategories.length > 0
                        ? `/products/${activeCategory}/${sub.id}`
                        : `/products/${activeCategory}/${sub.id}/items`
                    }
                    className={`px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-blue-600 ${
                      activeSubcategory === sub.id ? 'text-blue-600 font-semibold underline underline-offset-4' : ''
                    }`}
                    onMouseEnter={() => setActiveSubcategory(sub.id)}
                  >
                    {sub.name}
                  </Link>
                ))}
            </div>
          )}

          {/* Sub-subcategory Row */}
          {activeCategory && activeSubcategory &&
            (() => {
              const subsubcategories = categories
                .find((c) => c.id === activeCategory)
                ?.subcategories?.find((s) => s.id === activeSubcategory)
                ?.subsubcategories;
              return Array.isArray(subsubcategories) && subsubcategories.length > 0;
            })() && (
              <div className="flex flex-wrap justify-center gap-6 py-4 bg-gray-100">
                {categories
                  .find((c) => c.id === activeCategory)
                  ?.subcategories?.find((s) => s.id === activeSubcategory)
                  ?.subsubcategories?.map((subsub) => (
                    <Link
                      key={subsub.id}
                      href={`/products/${activeCategory}/${activeSubcategory}/${subsub.id}`}
                      className="px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-blue-600 text-sm"
                    >
                      {subsub.name}
                    </Link>
                  ))}
              </div>
            )}
        </>
      )}
    </div>
  </div>
)}

    </nav>
  );
}
