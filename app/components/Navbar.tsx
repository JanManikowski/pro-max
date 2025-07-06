'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; subcategories?: Subcategory[] };

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: Category[] = [];

      for (const cat of catSnap.docs) {
        const subSnap = await getDocs(collection(db, `categories/${cat.id}/subcategories`));
        const sub = subSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        catData.push({ id: cat.id, name: cat.data().name, subcategories: sub });
      }

      setCategories(catData);
    };

    load();
  }, []);

  const cachedCategories = useMemo(() => categories, [categories]);

  return (
    <nav className="bg-primary text-white shadow border-b font-roboto text-[16px] z-50 relative">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4 relative z-50">
        {/* Logo */}
        <img src="/logo.png" alt="Logo" className="h-10" />

        {/* Nav Links */}
        <ul className="flex gap-8 items-center font-medium relative">
          <li>
            <Link href="#" className="hover:text-accent transition">
              Over het bedrijf
            </Link>
          </li>

          {/* Producten Dropdown */}
          <div
            className="relative z-50"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <li className="px-4 py-2">
  <div className="inline-block px-4 py-2">
    <Link
      href="/products"
      className="hover:text-accent transition cursor-pointer"
      onClick={(e) => {
        // Optional: close dropdown when navigating
        setShowDropdown(false);
      }}
    >
      Producten
    </Link>
  </div>
</li>


            {showDropdown && (
              <div className="fixed left-1/2 top-[72px] transform -translate-x-1/2 w-screen bg-white shadow-xl py-6 px-10 flex flex-wrap justify-center gap-8 z-40 border-t">
                {cachedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="relative group flex flex-col items-center w-32 text-center hover:text-accent transition"
                  >
                    <span className="font-semibold cursor-default">{cat.name}</span>

                    {cat.subcategories?.length > 0 && (
                      <ul className="py-2 absolute top-[40px] left-1/2 -translate-x-1/2 mt-2 w-screen bg-white shadow-xl py-4 px-6 flex flex-wrap justify-center gap-4 rounded border opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200 z-50">
                        {cat.subcategories.map((sub) => (
                          <li
                            key={sub.id}
                            className="hover:text-accent cursor-pointer px-3 py-1 whitespace-nowrap"
                          >
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <li>
            <Link href="#" className="hover:text-accent transition">
              Over Ons
            </Link>
          </li>

          <li>
            <Link href="#" className="hover:text-accent transition">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍"
            className="border px-2 py-2 rounded text-sm"
          />
          <select className="text-sm border px-2 py-2 rounded">
            <option>Nederlands</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
