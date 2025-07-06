'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import Navbar from '../../../../components/Navbar';
import Link from 'next/link';

export default function ItemsPage() {
  const { category, subcategoryId } = useParams() as { category: string; subcategoryId: string };

  const [items, setItems] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const ref = collection(
          db,
          `categories/${category}/subcategories/${subcategoryId}/items`
        );

        const snap = await getDocs(ref);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category, subcategoryId]);

  if (loading) return <div className="p-6">Laden...</div>;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center capitalize">
          {subcategoryId.replace(/-/g, ' ')}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {items.map((item) => (
  <Link
  key={item.id}
  href={
    item.subsubcategory
      ? `/products/${category}/${subcategoryId}/${item.subsubcategory}/items/${item.id}`
      : `/products/${category}/${subcategoryId}/items/${item.id}`
  }
  className="block"
>
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
      {item.images?.[0] ? (
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          Geen afbeelding
        </div>
      )}

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          {item.title}
        </h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Afdichtingen:</strong> {item.afdichten || '–'}</li>
          <li><strong>Kamer:</strong> {item.kamer || '–'}</li>
          <li><strong>uG:</strong> {item.uG ?? '–'}</li>
        </ul>
      </div>
    </div>
  </Link>
))}

        </div>
      </div>
    </div>
  );
}
