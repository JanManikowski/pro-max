'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../../../../../components/Navbar';

export default function ItemDetailPage() {
  const { category, subcategoryId, subsubcategory, itemId } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (
        typeof category !== 'string' ||
        typeof subcategoryId !== 'string' ||
        typeof itemId !== 'string'
      ) {
        setLoading(false);
        return;
      }

      const ref = typeof subsubcategory === 'string'
        ? doc(db, 'categories', category, 'subcategories', subcategoryId, 'subsubcategories', subsubcategory, 'items', itemId)
        : doc(db, 'categories', category, 'subcategories', subcategoryId, 'items', itemId);

      const snap = await getDoc(ref);
      if (snap.exists()) {
        setItem(snap.data());
      }
      setLoading(false);
    };

    fetchItem();
  }, [category, subcategoryId, subsubcategory, itemId]);

  if (loading) return <div className="p-6">Laden...</div>;
  if (!item) return <div className="p-6">Item niet gevonden.</div>;

  return (
    <div className="w-full min-h-screen bg-white text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold mb-10">{item.title || item.name}</h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Product Image */}
          <div className="w-full lg:w-1/2">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full max-w-md mx-auto object-contain rounded-md shadow-md"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                Geen afbeelding beschikbaar
              </div>
            )}
          </div>

          {/* Right: Bulletpoints */}
          <div className="w-full lg:w-1/2 space-y-4">
            <ul className="space-y-3 text-lg">
              {item.bulletpoints?.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-16">
          {item.uG && (
            <div>
              <div className="text-3xl font-bold">{item.uG}</div>
              <div className="text-sm text-gray-600">Uw waarde</div>
            </div>
          )}
          {item.afdichten && (
            <div>
              <div className="text-3xl font-bold">{item.afdichten}</div>
              <div className="text-sm text-gray-600">Afdichtingen</div>
            </div>
          )}
          {item.kamer && (
            <div>
              <div className="text-3xl font-bold">{item.kamer}</div>
              <div className="text-sm text-gray-600">Kamers</div>
            </div>
          )}
        </div>

        {/* Description section */}
        {item.description && (
          <div className="mt-16 max-w-4xl mx-auto text-lg leading-relaxed">
            <h2 className="text-2xl font-bold mb-4">Beschrijving</h2>
            <p>{item.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
