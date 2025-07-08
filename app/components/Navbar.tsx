'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { useGlobalData } from './GlobalDataContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Navbar() {
  const { categories, loading } = useGlobalData();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  // track Firebase user
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // optionally: redirect or toast here
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 z-50 relative font-roboto h-24">
      <div className="w-full h-full flex items-center justify-between px-12 pl-32">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-14" />
        </Link>

        <ul className="flex gap-12 items-center text-xl font-semibold tracking-wide">
          <li>
            <Link
              href="/our-projects"
              className="hover:text-[#FF914B] transition hover:underline underline-offset-4"
            >
              Onze Projecten
            </Link>
          </li>
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
              <Link
                href="/products"
                className="hover:text-[#FF914B] transition hover:underline underline-offset-4"
              >
                Producten
              </Link>
              <div className="absolute top-full left-0 w-full h-24 pointer-events-auto" />
            </div>
          </li>
          <li>
            <Link
              href="/about-us"
              className="hover:text-[#FF914B] transition hover:underline underline-offset-4"
            >
              Over Ons
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="hover:text-[#FF914B] transition hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <SearchBar />

          {/* ← new logout button */}
          {user && (
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-[#FF914B] transition text-sm font-medium"
            >
              Logout
            </button>
          )}
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
          className="fixed top-24 left-1/2 -translate-x-1/2 w-screen bg-white shadow-2xl border-t z-40 text-center animate-fade-in"
        >
          <div className="w-full max-w-[1400px] mx-auto">
            {loading ? (
              <div className="py-6 text-gray-400">Laden...</div>
            ) : (
              <>
                {/* Category Row */}
                <div className="flex flex-wrap justify-center gap-6 py-4 border-b text-lg">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/products/${cat.id}`}
                      className={`px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-[#FF914B] ${
                        activeCategory === cat.id
                          ? 'hover:text-[#FF914B] font-semibold underline underline-offset-4'
                          : ''
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
                  <div className="flex flex-wrap justify-center gap-6 py-4 border-b bg-gray-50 text-base">
                    {categories
                      .find(c => c.id === activeCategory)
                      ?.subcategories?.map(sub => (
                        <Link
                          key={sub.id}
                          href={
                            sub.subsubcategories && sub.subsubcategories.length > 0
                              ? `/products/${activeCategory}/${sub.id}`
                              : `/products/${activeCategory}/${sub.id}/items`
                          }
                          className={`px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-[#FF914B] ${
                            activeSubcategory === sub.id
                              ? 'hover:text-[#FF914B] font-semibold underline underline-offset-4'
                              : ''
                          }`}
                          onMouseEnter={() => setActiveSubcategory(sub.id)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                  </div>
                )}

                {/* Sub-subcategory Row */}
                {activeCategory &&
                  activeSubcategory &&
                  (() => {
                    const subsubs = categories
                      .find(c => c.id === activeCategory)
                      ?.subcategories?.find(s => s.id === activeSubcategory)
                      ?.subsubcategories;
                    return Array.isArray(subsubs) && subsubs.length > 0;
                  })() && (
                    <div className="flex flex-wrap justify-center gap-6 py-4 bg-gray-100 text-sm">
                      {categories
                        .find(c => c.id === activeCategory)
                        ?.subcategories
                        ?.find(s => s.id === activeSubcategory)
                        ?.subsubcategories?.map(s2 => (
                          <Link
                            key={s2.id}
                            href={`/products/${activeCategory}/${activeSubcategory}/${s2.id}`}
                            className="px-4 py-2 transition transform duration-200 ease-in-out hover:scale-110 hover:text-[#FF914B]"
                          >
                            {s2.name}
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
