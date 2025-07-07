'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Item = { id: string; name: string; [key: string]: any };
type SubSubcategory = { id: string; name: string; items?: Item[] };
type Subcategory = { id: string; name: string; subsubcategories?: SubSubcategory[]; items?: Item[] };
type Category = { id: string; name: string; subcategories?: Subcategory[]; items?: Item[] };

type GlobalDataContextType = {
  categories: Category[];
  loading: boolean;
};

const GlobalDataContext = createContext<GlobalDataContextType>({ categories: [], loading: true });

export default function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: Category[] = [];

      for (const cat of catSnap.docs) {
        const catId = cat.id;
        const catName = cat.data().name;
        const catObj: Category = { id: catId, name: catName };

        const subSnap = await getDocs(collection(db, `categories/${catId}/subcategories`));
        const subcategories: Subcategory[] = [];

        for (const sub of subSnap.docs) {
          const subId = sub.id;
          const subName = sub.data().name;
          const subObj: Subcategory = { id: subId, name: subName };

          const subsubSnap = await getDocs(collection(db, `categories/${catId}/subcategories/${subId}/subsubcategories`));
          const subsubcategories: SubSubcategory[] = [];

          for (const subsub of subsubSnap.docs) {
            const subsubId = subsub.id;
            const subsubName = subsub.data().name;

            const itemSnap = await getDocs(collection(db, `categories/${catId}/subcategories/${subId}/subsubcategories/${subsubId}/items`));
            const items: Item[] = itemSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            subsubcategories.push({ id: subsubId, name: subsubName, items });
          }

          subObj.subsubcategories = subsubcategories;
          subcategories.push(subObj);
        }

        catObj.subcategories = subcategories;
        catData.push(catObj);
      }

      setCategories(catData);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <GlobalDataContext.Provider value={{ categories, loading }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export const useGlobalData = () => useContext(GlobalDataContext);
