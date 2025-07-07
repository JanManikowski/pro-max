'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../../../../../components/Navbar';
import Link from 'next/link';

interface Item {
  id: string;
  title?: string;
  afdichten?: string;
  kamer?: string;
  uG?: number;
  images?: string[];
}

export default function SubSubcategoryItemsPage() {
  const params = useParams();
  const { category, subcategoryId, subsubcategory } = params as {
    category: string;
    subcategoryId: string;
    subsubcategory: string;
  };

  const [items, setItems] = useState<Item[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const path = `categories/${category}/subcategories/${subcategoryId}/subsubcategories/${subsubcategory}/items`;
        const snap = await getDocs(collection(db, path));
        const data: Item[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchItems();
  }, [category, subcategoryId, subsubcategory]);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center capitalize">
          {subsubcategory}
        </h1>

        <div
          className={`transition-opacity duration-700 ease-out ${
            dataLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${category}/${subcategoryId}/${subsubcategory}/items/${item.id}`}
                  className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title ?? 'Afbeelding'}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                      Geen afbeelding
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">
                      {item.title ?? 'Geen titel'}
                    </h2>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        <strong>Afdichtingen:</strong> {item.afdichten || '–'}
                      </li>
                      <li>
                        <strong>Kamer:</strong> {item.kamer || '–'}
                      </li>
                      <li>
                        <strong>uG:</strong> {item.uG ?? '–'}
                      </li>
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Geen items gevonden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
