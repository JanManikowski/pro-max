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
  const [dataLoaded, setDataLoaded] = useState(false);

  // 1) Load category description + subcategory list
  useEffect(() => {
    if (typeof category !== 'string') return;

    const loadInitial = async () => {
      try {
        const catSnap = await getDoc(doc(db, 'categories', category));
        if (catSnap.exists()) {
          setCategoryInfo(catSnap.data());
        }

        const subSnap = await getDocs(
          collection(db, `categories/${category}/subcategories`)
        );
        const subs: Subcategory[] = subSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          smallText: d.data().smallText || '',
          image: null,
          hasSubSubcategories: false,
        }));

        setSubcategories(subs);
      } catch (err) {
        console.error('Failed to load category:', err);
      }
    };

    loadInitial();
  }, [category]);

  // 2) For each subcategory, detect if there are sub-subcategories,
  //    then pick a preview image from the correct items collection.
  useEffect(() => {
    if (typeof category !== 'string' || subcategories.length === 0) return;

    const loadDetails = async () => {
      const updated = await Promise.all(
        subcategories.map(async (sub) => {
          // first check for sub-subcategories
          const subsubSnap = await getDocs(
            collection(
              db,
              `categories/${category}/subcategories/${sub.id}/subsubcategories`
            )
          );
          const hasSubSub = !subsubSnap.empty;

          let previewImage: string | null = null;

          if (hasSubSub) {
            // take the first sub-subcategory’s first item image
            const firstSubSubId = subsubSnap.docs[0].id;
            const ssItems = await getDocs(
              collection(
                db,
                `categories/${category}/subcategories/${sub.id}/subsubcategories/${firstSubSubId}/items`
              )
            );
            previewImage = ssItems.docs[0]?.data()?.images?.[0] || null;
          } else {
            // fallback: items directly under this subcategory
            const itemsSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${sub.id}/items`)
            );
            previewImage = itemsSnap.docs[0]?.data()?.images?.[0] || null;
          }

          return {
            ...sub,
            hasSubSubcategories: hasSubSub,
            image: previewImage,
          };
        })
      );

      setSubcategories(updated);
      setDataLoaded(true);
    };

    loadDetails();
  }, [category, subcategories.length]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <Navbar />

      <h1 className="text-center text-5xl font-bold mt-12 mb-4 capitalize text-gray-900">
        {category}
      </h1>

      <div
        className={`transition-opacity duration-500 ease-out ${
          dataLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          {categoryInfo?.smallText ||
            'Hieronder vindt u een overzicht van de subcategorieën binnen deze categorie.'}
        </p>
      </div>

      <div
        className={`transition-opacity duration-500 ease-out ${
          dataLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {subcategories.map((sub) => (
          <div
            key={sub.id}
            className="w-full flex flex-col md:flex-row items-center border-b bg-white py-12"
          >
            <div className="md:w-1/2 flex items-center justify-center p-8">
              {sub.image && (
                <img
                  src={sub.image}
                  alt={sub.name}
                  className="object-contain max-h-[300px] max-w-full"
                />
              )}
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">{sub.name}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {sub.smallText}
              </p>
              <Link
                href={
                  sub.hasSubSubcategories
                    ? `/products/${category}/${sub.id}`
                    : `/products/${category}/${sub.id}/items`
                }
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-max"
              >
                ZIE MEER
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
