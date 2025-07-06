'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import image1 from '../../public/raam.png';

type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; subcategories?: Subcategory[] };

export default function ProductenPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: Category[] = [];

      for (const cat of catSnap.docs) {
        const subSnap = await getDocs(collection(db, `categories/${cat.id}/subcategories`));
        const subcategories = subSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        catData.push({ id: cat.id, name: cat.data().name, subcategories });
      }

      setCategories(catData);
    };

    load();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center w-full min-h-screen bg-white">
        <div className="w-full max-w-screen-xl px-6 py-12 flex flex-col lg:flex-row justify-between items-start gap-8">
          {/* Left: Title + Category List */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Producten</h1>
            <ul className="space-y-6">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products/${encodeURIComponent(cat.name.toLowerCase())}`}>
                    <span className="text-lg font-medium text-gray-800 hover:text-blue-600 transition cursor-pointer">
                      {cat.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Image */}
          <div className="w-full lg:w-1/2 flex justify-end">
            <Image
  src={image1}
  alt="Product visual"
  className="object-contain"
  width={600}
  height={600}
/>
          </div>
        </div>
      </div>
    </>
  );
}
