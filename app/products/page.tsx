'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase'; // Adjust the import path as necessary
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

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
    <div className="max-w-screen-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Producten</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="border rounded p-4 shadow hover:shadow-lg transition">
            <Link href={`/products/${cat.id}`}>
  <h2 className="text-xl font-semibold mb-3 hover:text-blue-600 cursor-pointer transition">
    {cat.name}
  </h2>
</Link>


            {cat.subcategories?.length > 0 ? (
              <ul className="space-y-1">
                {cat.subcategories.map((sub) => (
                  <Link href={`/products/${sub.id}`} key={sub.id}>
  <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
    {sub.name}
  </li>
</Link>

                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Geen subcategorieën</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
