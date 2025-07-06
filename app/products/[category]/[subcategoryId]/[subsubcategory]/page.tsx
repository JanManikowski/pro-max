'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../../../../components/Navbar';

type Item = {
  id: string;
  title: string;
  description: string;
  images?: string[];
};

export default function SubSubCategoryPage() {
  const { category, subcategory, subsubcategory } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const itemSnap = await getDocs(
          collection(
            db,
            `categories/${category}/subcategories/${subcategory}/subsubcategories/${subsubcategory}/items`
          )
        );

        const itemsData = itemSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];

        setItems(itemsData);
      } catch (err) {
        console.error('Fout bij het laden van sub-subcategorie items:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, subcategory, subsubcategory]);

  if (loading) return <div className="p-6">Laden...</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <Navbar />

      <h1 className="text-center text-4xl font-bold mt-10 mb-6 capitalize text-gray-900">
        {subsubcategory}
      </h1>

      {items.map((item) => (
        <div
          key={item.id}
          className="w-full flex flex-col md:flex-row items-center border-b bg-white"
        >
          <div className="md:w-1/2 h-full flex items-center justify-center p-8">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="object-contain max-h-[80%] max-w-full"
              />
            ) : (
              <div className="text-gray-400">Geen afbeelding</div>
            )}
          </div>

          <div className="md:w-1/2 p-8 flex flex-col justify-center h-full">
            <h2 className="text-3xl font-bold mb-4">{item.title}</h2>
            <p className="text-gray-600 mb-6">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
