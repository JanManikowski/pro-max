// File: products/[category]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

type Subcategory = {
  id: string;
  name: string;
  smallText: string;
  image?: string | null;
  hasSubSubcategories: boolean;
};

export default function CategoryPage() {
  const { category } = useParams();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ smallText?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof category !== 'string') return;

    const load = async () => {
      try {
        // Load category info
        const catSnap = await getDoc(doc(db, 'categories', category));
        if (catSnap.exists()) setCategoryInfo(catSnap.data());

        // Load subcategories
        const subSnap = await getDocs(collection(db, `categories/${category}/subcategories`));
        const subData = await Promise.all(
          subSnap.docs.map(async (subDoc) => {
            const sub = subDoc.data();
            const subId = subDoc.id;

            // Check if it has subsubcategories
            const subsubSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${subId}/subsubcategories`)
            );
            const hasSubSubcategories = !subsubSnap.empty;

            // Try to get preview image from first item
            const itemSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${subId}/items`)
            );
            const previewImage = itemSnap.docs[0]?.data()?.images?.[0] || null;

            return {
              id: subId,
              name: sub.name,
              smallText: sub.smallText || '',
              image: previewImage,
              hasSubSubcategories,
            };
          })
        );

        setSubcategories(subData);
      } catch (err) {
        console.error('Failed to load category:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category]);

  if (loading) return <div className="p-6">Laden...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <Navbar />

      <h1 className="text-center text-5xl font-bold mt-12 mb-4 capitalize text-gray-900">
        {category}
      </h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
        {categoryInfo?.smallText ||
          'Hieronder vindt u een overzicht van de subcategorieën binnen deze categorie.'}
      </p>

      {subcategories.map((sub) => (
        <div
          key={sub.id}
          className="w-full h-fit flex flex-col md:flex-row items-center border-b bg-white py-12"
        >
          <div className="md:w-1/2 h-full flex items-center justify-center p-8">
            {sub.image ? (
              <img
                src={sub.image}
                alt={sub.name}
                className="object-contain max-h-[300px] max-w-full"
              />
            ) : (
              <div className="text-gray-400">Geen afbeelding</div>
            )}
          </div>

          <div className="md:w-1/2 p-8 flex flex-col justify-center h-full">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">{sub.name}</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">{sub.smallText}</p>
            <Link
              href={
                sub.hasSubSubcategories
                  ? `/products/${category}/${sub.id}`
                  : `/products/${category}/${sub.id}/items`
              }
              className="bg-primary text-white px-6 py-3 rounded hover:bg-accent transition w-max"
            >
              ZIE MEER
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
