'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs
} from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Adjust the import path as necessary

type Item = {
  id: string;
  title: string;
  uG: number;
  afdichten: string;
  kamer: string;
  bulletpoints: string[];
  images: string[];
  description: string;
};

type Subcategory = {
  id: string;
  name: string;
  items?: Item[];
};

type Category = {
  id: string;
  name: string;
  subcategories?: Subcategory[];
};

export default function ViewAllPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: Category[] = [];

      for (const catDoc of catSnap.docs) {
        const category: Category = {
          id: catDoc.id,
          name: catDoc.data().name,
          subcategories: []
        };

        const subSnap = await getDocs(
          collection(db, `categories/${catDoc.id}/subcategories`)
        );

        for (const subDoc of subSnap.docs) {
          const subcategory: Subcategory = {
            id: subDoc.id,
            name: subDoc.data().name,
            items: []
          };

          const itemSnap = await getDocs(
            collection(
              db,
              `categories/${catDoc.id}/subcategories/${subDoc.id}/items`
            )
          );

          const items: Item[] = itemSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Item[];

          subcategory.items = items;
          category.subcategories!.push(subcategory);
        }

        catData.push(category);
      }

      setCategories(catData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">All Categories, Subcategories & Items</h1>

      {categories.map((cat) => (
        <div key={cat.id} className="bg-white shadow rounded p-4">
          <details open>
            <summary className="font-bold text-lg mb-2 cursor-pointer">
              📁 {cat.name}
            </summary>

            {cat.subcategories?.map((sub) => (
              <div key={sub.id} className="ml-4 my-2">
                <details>
                  <summary className="font-semibold text-gray-700 cursor-pointer">
                    📂 {sub.name}
                  </summary>

                  <ul className="ml-4 mt-2 space-y-3">
                    {sub.items?.map((item) => (
                      <li key={item.id} className="border rounded p-3 bg-gray-50">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-700 mb-1">{item.description}</p>
                        <p className="text-xs text-gray-600">uG: {item.uG}</p>
                        <p className="text-xs text-gray-600">Afdichten: {item.afdichten}</p>
                        <p className="text-xs text-gray-600">Kamer: {item.kamer}</p>
                        {item.bulletpoints?.length > 0 && (
                          <ul className="list-disc ml-5 text-xs text-gray-600">
                            {item.bulletpoints.map((bp, i) => (
                              <li key={i}>{bp}</li>
                            ))}
                          </ul>
                        )}
                        {item.images?.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.images.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`item-${i}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </details>
        </div>
      ))}
    </div>
  );
}
