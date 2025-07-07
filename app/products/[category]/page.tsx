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

  // Load basic category and subcategory info
  useEffect(() => {
    if (typeof category !== 'string') return;

    const loadInitial = async () => {
      try {
        const catSnap = await getDoc(doc(db, 'categories', category));
        if (catSnap.exists()) setCategoryInfo(catSnap.data());

        const subSnap = await getDocs(collection(db, `categories/${category}/subcategories`));
        const subData: Subcategory[] = subSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          smallText: doc.data().smallText || '',
          image: null,
          hasSubSubcategories: false,
        }));

        setSubcategories(subData);
      } catch (err) {
        console.error('Failed to load category:', err);
      }
    };

    loadInitial();
  }, [category]);

  // Load images and sub-subcategory info
  useEffect(() => {
    if (typeof category !== 'string' || subcategories.length === 0) return;

    const loadDetails = async () => {
      const updatedSubcategories = await Promise.all(
        subcategories.map(async (sub) => {
          let hasSubSubcategories = false;
          let previewImage: string | null = null;

          try {
            const subsubSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${sub.id}/subsubcategories`)
            );
            hasSubSubcategories = !subsubSnap.empty;

            const itemSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${sub.id}/items`)
            );
            previewImage = itemSnap.docs[0]?.data()?.images?.[0] || null;
          } catch (err) {
            console.warn(`Error loading details for subcategory ${sub.id}`, err);
          }

          return {
            ...sub,
            hasSubSubcategories,
            image: previewImage,
          };
        })
      );

      setSubcategories(updatedSubcategories);
      setDataLoaded(true); // Trigger fade-in
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
            className="w-full h-fit flex flex-col md:flex-row items-center border-b bg-white py-12"
          >
            <div className="md:w-1/2 h-full flex items-center justify-center p-8">
              {sub.image ? (
                <img
                  src={sub.image}
                  alt={sub.name}
                  className="object-contain max-h-[300px] max-w-full"
                />
              ) : null}
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
