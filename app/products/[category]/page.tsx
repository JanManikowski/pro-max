'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase'; // Adjust the import path as necessary
import { collection, getDocs } from 'firebase/firestore';

// Item type for what you're displaying inside a subcategory
type Item = {
  id: string;
  title: string;
  description: string;
  images?: string[];
};

export default function SubcategoryPage() {
  const { category, subcategory } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const subSnap = await getDocs(
          collection(db, `categories/${category}/subcategories`)
        );

        let found = false;

        for (const sub of subSnap.docs) {
          if (sub.id === subcategory) {
            setSubcategoryName(sub.data().name);

            const itemSnap = await getDocs(
              collection(db, `categories/${category}/subcategories/${subcategory}/items`)
            );

            const itemsData = itemSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Item[];

            setItems(itemsData);
            found = true;
            break;
          }
        }

        if (!found) {
          setSubcategoryName('Onbekende subcategorie');
        }
      } catch (err) {
        console.error('Fout bij het laden van de subcategorie:', err);
        setSubcategoryName('Fout bij laden');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, subcategory]);

  if (loading) return <div className="p-6">Laden...</div>;

  return (
    <div className="w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className="w-full h-screen flex flex-col md:flex-row items-center border-b"
        >
          {/* Image Section */}
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

          {/* Text Section */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center h-full">
            <h2 className="text-4xl font-bold mb-4">{item.title}</h2>
            <p className="text-gray-600 mb-6">{item.description}</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-max">
              ZIE MEER
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
