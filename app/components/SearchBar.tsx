'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { useGlobalData } from './GlobalDataContext';

export default function SearchBar() {
  const { categories } = useGlobalData();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const items: any[] = [];

    categories.forEach(cat => {
      const catId = cat.id;
      const catName = cat.name;

      cat.subcategories?.forEach(sub => {
        const subId = sub.id;
        const subName = sub.name;

        sub.subsubcategories?.forEach(subsub => {
          items.push({
            name: subsub.name,
            path: `/products/${catId}/${subId}/${subsub.id}`,
          });
        });

        items.push({ name: subName, path: `/products/${catId}/${subId}` });
      });

      items.push({ name: catName, path: `/products/${catId}` });
    });

    const fuseInstance = new Fuse(items, {
      keys: ['name'],
      threshold: 0.4,
    });

    setFuse(fuseInstance);
  }, [categories]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (fuse && value.length > 1) {
      const results = fuse.search(value).slice(0, 5);
      setSuggestions(results.map(r => r.item));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (path: string) => {
    setQuery('');
    setSuggestions([]);
    router.push(path);
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        placeholder="🔍 Zoek producten..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg text-left text-sm">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleSelect(s.path)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
