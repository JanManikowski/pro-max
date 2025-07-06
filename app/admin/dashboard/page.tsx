'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Category = { id: string; name?: string; [key: string]: any };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <span>{cat.name}</span>
              <a
                className="text-accent"
                href={`/admin/dashboard/categories/${cat.id}/subcategories`}
              >
                View Subcategories →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
