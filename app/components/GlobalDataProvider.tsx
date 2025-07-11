import GlobalDataContextProvider from './GlobalDataContext';
import { adminDb } from '../lib/firebaseAdmin';

export type Item = { id: string; name: string; [key: string]: any };
export type SubSubcategory = { id: string; name: string; items?: Item[] };
export type Subcategory = { id: string; name: string; subsubcategories?: SubSubcategory[]; items?: Item[] };
export type Category = { id: string; name: string; subcategories?: Subcategory[]; items?: Item[] };

async function loadData(): Promise<Category[]> {
  const catSnap = await adminDb.collection('categories').get();
  const catData: Category[] = [];

  for (const cat of catSnap.docs) {
    const catId = cat.id;
    const catName = cat.data().name;
    const catObj: Category = { id: catId, name: catName };

    const subSnap = await adminDb.collection(`categories/${catId}/subcategories`).get();
    const subcategories: Subcategory[] = [];

    for (const sub of subSnap.docs) {
      const subId = sub.id;
      const subName = sub.data().name;
      const subObj: Subcategory = { id: subId, name: subName };

      const subsubSnap = await adminDb
        .collection(`categories/${catId}/subcategories/${subId}/subsubcategories`)
        .get();
      const subsubcategories: SubSubcategory[] = [];

      for (const subsub of subsubSnap.docs) {
        const subsubId = subsub.id;
        const subsubName = subsub.data().name;

        const itemSnap = await adminDb
          .collection(
            `categories/${catId}/subcategories/${subId}/subsubcategories/${subsubId}/items`
          )
          .get();
        const items: Item[] = itemSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

        subsubcategories.push({ id: subsubId, name: subsubName, items });
      }

      subObj.subsubcategories = subsubcategories;
      subcategories.push(subObj);
    }

    catObj.subcategories = subcategories;
    catData.push(catObj);
  }

  return catData;
}

export default async function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await loadData();

  return (
    <GlobalDataContextProvider data={{ categories, loading: false }}>
      {children}
    </GlobalDataContextProvider>
  );
}
