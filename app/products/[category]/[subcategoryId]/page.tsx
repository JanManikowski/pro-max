// File: products/[category]/[subcategoryId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function SubcategoryPage() {
  const { category, subcategoryId } = useParams() as {
    category: string;
    subcategoryId: string;
  };
  const router = useRouter();

  const [subsubcategories, setSubsubcategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const subsubSnap = await getDocs(
          collection(db, `categories/${category}/subcategories/${subcategoryId}/subsubcategories`)
        );

        if (subsubSnap.empty) {
          // Redirect to items if no subsubcategories
          router.replace(`/products/${category}/${subcategoryId}/items`);
          return;
        }

        const subsubs = subsubSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setSubsubcategories(subsubs);
      } catch (err) {
        console.error('Error loading subsubcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, subcategoryId, router]);

  if (loading) return <div className="p-6">Laden...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center capitalize">
          Subcategorieën in {subcategoryId}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {subsubcategories.map((subsub) => (
            <Link
              key={subsub.id}
              href={`/products/${category}/${subcategoryId}/${subsub.id}/items`}
              className="block p-6 border bg-white shadow rounded hover:shadow-md transition text-center text-lg font-medium text-gray-800"
            >
              {subsub.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
