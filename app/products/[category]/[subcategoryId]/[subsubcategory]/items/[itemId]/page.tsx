'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../../../../../../components/Navbar';

export default function ItemDetailPage() {
  const { category, subcategoryId, subsubcategory, itemId } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (
          typeof category !== 'string' ||
          typeof subcategoryId !== 'string' ||
          typeof subsubcategory !== 'string' ||
          typeof itemId !== 'string'
        ) {
          setLoading(false);
          return;
        }

        const ref = doc(
          db,
          'categories',
          category,
          'subcategories',
          subcategoryId,
          'subsubcategories',
          subsubcategory,
          'items',
          itemId
        );

        const snap = await getDoc(ref);
        if (snap.exists()) {
          setItem(snap.data());
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [category, subcategoryId, subsubcategory, itemId]);

  if (loading) return <div className="p-6">Laden...</div>;
  if (!item) return <div className="p-6">Item niet gevonden.</div>;

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold mb-10 text-center">{item.title || item.name}</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image */}
          <div className="flex-1 flex justify-center items-start">
            {item.images?.[0] && (
              <img
                src={item.images[0]}
                alt={item.title || 'Product'}
                className="w-full max-w-lg rounded-xl shadow-lg object-contain"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-8">
            <ul className="space-y-4 text-lg">
              {item.bulletpoints?.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-10 mt-10 text-center">
              <div>
                <p className="text-3xl font-bold">{item.uG || '–'}</p>
                <p className="text-gray-500">Uw waarde</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{item.afdichten || '–'}</p>
                <p className="text-gray-500">Afdichtingen</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{item.kamer || '–'}</p>
                <p className="text-gray-500">Kamers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4">Beschrijving</h2>
            <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
              {item.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
