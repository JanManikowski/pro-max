'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import SearchBar from './SearchBar'; // adjust path if needed

type SubSubcategory = { id: string; name: string };
type Subcategory = { id: string; name: string; subsubcategories?: SubSubcategory[] };
type Category = { id: string; name: string; subcategories?: Subcategory[] };

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: Category[] = [];

      for (const cat of catSnap.docs) {
        const catId = cat.id;
        const subSnap = await getDocs(collection(db, `categories/${catId}/subcategories`));
        const subcategories: Subcategory[] = [];

        for (const sub of subSnap.docs) {
          const subId = sub.id;
          const subsubSnap = await getDocs(
            collection(db, `categories/${catId}/subcategories/${subId}/subsubcategories`)
          );
          const subsubcategories = subsubSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));

          subcategories.push({
            id: subId,
            name: sub.data().name,
            subsubcategories,
          });
        }

        catData.push({
          id: catId,
          name: cat.data().name,
          subcategories,
        });
      }

      setCategories(catData);
    };

    load();
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 z-50 relative font-roboto">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </Link>

        {/* Navigation */}
        <ul className="flex gap-8 items-center text-base font-medium relative">
          <li>
            <Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">
              Over het bedrijf
            </Link>
          </li>

          {/* Producten */}
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
                className="hover:text-blue-600 transition hover:underline underline-offset-4"
              >
                Producten
              </Link>

              {/* Hover buffer */}
              <div className="absolute top-full left-0 w-full h-6 pointer-events-auto"></div>
            </div>
          </li>

          <li>
            <Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">
              Over Ons
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-blue-600 transition hover:underline underline-offset-4">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right side: Search + Language */}
        <div className="flex items-center gap-3">
          <SearchBar />
          {/* <select className="text-sm border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>Nederlands</option>
            <option>English</option>
          </select> */}
        </div>
      </div>

      {/* DROPDOWN OUTSIDE MAIN CONTAINER FOR FIXED WIDTH */}
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
                      href={`/products/${activeCategory}/${sub.id}`}
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
            {activeCategory &&
              activeSubcategory &&
              categories
                .find((c) => c.id === activeCategory)
                ?.subcategories?.find((s) => s.id === activeSubcategory)
                ?.subsubcategories?.length > 0 && (
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
          </div>
        </div>
      )}
    </nav>
  );
}
