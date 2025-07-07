'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';       // ← import your Footer
import image1 from '../../public/raam.png';

type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; subcategories?: Subcategory[] };

export default function ProductenPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      const data: Category[] = [];
      for (const doc of snap.docs) {
        const subSnap = await getDocs(
          collection(db, `categories/${doc.id}/subcategories`)
        );
        data.push({
          id: doc.id,
          name: doc.data().name,
          subcategories: subSnap.docs.map(s => ({
            id: s.id,
            name: s.data().name,
          })),
        });
      }
      setCategories(data);
      setLoading(false);
      setTimeout(() => setShowContent(true), 100);
    };
    load();
  }, []);

  return (
    <>
      <Navbar />

      <div className="w-full h-screen bg-white relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Fade-in + dark-right overlay */}
        <div
          className={`relative z-10 h-full transition-opacity duration-[700ms] ease-in ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* dark overlay on right 50% */}
          <div className="absolute top-0 left-1/2 w-1/2 h-full bg-gray-900/20 pointer-events-none" />

          {/* Main flex content */}
          <div className="relative flex flex-col lg:flex-row h-full max-w-[1400px] mx-auto px-10 py-20 gap-20">
            {/* — LEFT */}
            <div className="w-full lg:w-1/2 overflow-y-auto">
              <h1 className="text-6xl font-extrabold text-gray-900 mb-14">
                Producten
              </h1>
              <ul className="space-y-6">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link
                      href={`/products/${encodeURIComponent(cat.name.toLowerCase())}`}
                    >
                      <div
                        onMouseEnter={() => setHoveredId(cat.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`transition-all duration-300 ease-in-out
                          px-6 py-4 rounded-xl cursor-pointer flex items-center gap-3
                          ${
                            hoveredId === cat.id
                              ? 'bg-white shadow-lg border border-gray-200'
                              : ''
                          }`}
                      >
                        {hoveredId === cat.id && (
                          <span className="text-blue-500 text-xl">›</span>
                        )}
                        <span
                          className={`text-2xl font-medium ${
                            hoveredId === cat.id ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* — RIGHT */}
            <div className="w-full lg:w-1/2 relative h-full">
              <Image
                src={image1}
                alt="Product visual"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />   {/* ← render your Footer here */}
    </>
  );
}
