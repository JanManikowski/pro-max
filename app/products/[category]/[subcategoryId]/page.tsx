'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Item = {
  id: string;
  title: string;
  description: string;
  bulletpoints?: string[];
  uG?: number;
  afdichten?: string;
  kamer?: string;
  images?: string[];
};

export default function SubcategoryPage() {
  const { subcategoryId } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const categoriesSnap = await getDocs(collection(db, 'categories'));

        for (const cat of categoriesSnap.docs) {
          const subSnap = await getDocs(
            collection(db, `categories/${cat.id}/subcategories`)
          );

          for (const sub of subSnap.docs) {
            if (sub.id === subcategoryId) {
              setSubcategoryName(sub.data().name);

              const itemSnap = await getDocs(
                collection(
                  db,
                  `categories/${cat.id}/subcategories/${sub.id}/items`
                )
              );

              const itemsData = itemSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Item[];

              setItems(itemsData);
              setLoading(false);
              return;
            }
          }
        }

        // Not found
        setSubcategoryName('Onbekende subcategorie');
        setLoading(false);
      } catch (error) {
        console.error('Error loading subcategory items:', error);
        setLoading(false);
      }
    };

    load();
  }, [subcategoryId]);

  if (loading) {
    return <div className="p-6">Laden...</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">
        Items in {subcategoryName ?? 'Subcategorie'}
      </h1>

      {items.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
              <p className="text-sm text-gray-600">{item.description}</p>
              {item.images && item.images.length > 0 && (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full mt-2 rounded"
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Geen items gevonden.</p>
      )}
    </div>
  );
}
