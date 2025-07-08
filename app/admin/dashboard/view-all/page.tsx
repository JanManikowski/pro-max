'use client';

import { useEffect, useState, FormEvent } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  Folder,
  FileText,
  PlusCircle,
  Edit2,
  Trash2,
  XCircle,
} from 'lucide-react';

// ————— Types —————
interface Item {
  id: string;
  title: string;
  description: string;
  uG: number;
  afdichten: string;
  kamer: string;
  bulletpoints: string[];
  images: string[];
}
interface SubSubcategory {
  id: string;
  name: string;
  items?: Item[];
}
interface Subcategory {
  id: string;
  name: string;
  // items directly under this subcategory (if any)
  items?: Item[];
  // nested sub-subcategories
  subSubcategories?: SubSubcategory[];
}
interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

enum EditType {
  Cat = 'cat',
  Sub = 'sub',
  SubSub = 'subsub',
  Item = 'item',
}

type EditState = {
  type: EditType;
  path: {
    catId?: string;
    subId?: string;
    subSubId?: string;
    itemId?: string;
  };
  // for cat/sub/subsub edits: { name: string }
  // for item edits: Item fields
  data: Partial<Record<keyof Item | 'name', any>>;
};

export default function ViewAllPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);

  // — Fetch everything, including sub-subcategories and items —
  const reload = async () => {
    setLoading(true);
    const catSnap = await getDocs(collection(db, 'categories'));
    const cats: Category[] = [];

    for (const catDoc of catSnap.docs) {
      const catData = catDoc.data() as DocumentData;
      const cat: Category = {
        id: catDoc.id,
        name: catData.name,
        subcategories: [],
      };

      // Subcategories
      const subSnap = await getDocs(
        collection(db, `categories/${catDoc.id}/subcategories`)
      );
      for (const subDoc of subSnap.docs) {
        const subData = subDoc.data() as DocumentData;
        const sub: Subcategory = {
          id: subDoc.id,
          name: subData.name,
          items: [],
          subSubcategories: [],
        };

        // Sub-subcategories
        const subSubSnap = await getDocs(
          collection(
            db,
            `categories/${catDoc.id}/subcategories/${subDoc.id}/subsubcategories`
          )
        );
        for (const ssDoc of subSubSnap.docs) {
          const ssData = ssDoc.data() as DocumentData;
          const ss: SubSubcategory = {
            id: ssDoc.id,
            name: ssData.name,
            items: [],
          };
          // Items under this sub-subcategory
          const ssItemSnap = await getDocs(
            collection(
              db,
              `categories/${catDoc.id}/subcategories/${subDoc.id}/subsubcategories/${ssDoc.id}/items`
            )
          );
          ss.items = ssItemSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Item, 'id'>),
          }));
          sub.subSubcategories!.push(ss);
        }

        // Items directly under the subcategory
        const itemSnap = await getDocs(
          collection(
            db,
            `categories/${catDoc.id}/subcategories/${subDoc.id}/items`
          )
        );
        sub.items = itemSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Item, 'id'>),
        }));

        cat.subcategories!.push(sub);
      }

      cats.push(cat);
    }

    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  // — Deletion handler for all levels —
  const handleDelete = async (
    type: EditType,
    catId: string,
    subId?: string,
    subSubId?: string,
    itemId?: string
  ) => {
    let path = '';
    if (type === EditType.Cat) {
      path = `categories/${catId}`;
    } else if (type === EditType.Sub && subId) {
      path = `categories/${catId}/subcategories/${subId}`;
    } else if (type === EditType.SubSub && subId && subSubId) {
      path = `categories/${catId}/subcategories/${subId}/subsubcategories/${subSubId}`;
    } else if (type === EditType.Item && subId && itemId) {
      if (subSubId) {
        path = `categories/${catId}/subcategories/${subId}/subsubcategories/${subSubId}/items/${itemId}`;
      } else {
        path = `categories/${catId}/subcategories/${subId}/items/${itemId}`;
      }
    }
    if (!path) return;
    await deleteDoc(doc(db, path));
    reload();
  };

  // — Kick off edit modal with the right existing data —
  const startEdit = (
    type: EditType,
    catId: string,
    subId?: string,
    subSubId?: string,
    item?: Item
  ) => {
    const payload: any = {};

    if (type === EditType.Cat) {
      payload.name = categories.find((c) => c.id === catId)?.name;
    }
    if (type === EditType.Sub && subId) {
      payload.name = categories
        .find((c) => c.id === catId)
        ?.subcategories?.find((s) => s.id === subId)?.name;
    }
    if (type === EditType.SubSub && subId && subSubId) {
      payload.name = categories
        .find((c) => c.id === catId)
        ?.subcategories?.find((s) => s.id === subId)
        ?.subSubcategories?.find((ss) => ss.id === subSubId)?.name;
    }
    if (type === EditType.Item && subId && item) {
      payload.title = item.title;
      payload.description = item.description;
      payload.uG = item.uG;
      payload.afdichten = item.afdichten;
      payload.kamer = item.kamer;
      payload.bulletpoints = [...item.bulletpoints];
      payload.images = [...item.images];
    }

    setEditing({
      type,
      path: { catId, subId, subSubId, itemId: item?.id },
      data: payload,
    });
  };

  // — Save edits for all four levels —
  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { type, path, data } = editing;
    let docPath = '';

    if (type === EditType.Cat && path.catId) {
      docPath = `categories/${path.catId}`;
    } else if (type === EditType.Sub && path.catId && path.subId) {
      docPath = `categories/${path.catId}/subcategories/${path.subId}`;
    } else if (
      type === EditType.SubSub &&
      path.catId &&
      path.subId &&
      path.subSubId
    ) {
      docPath = `categories/${path.catId}/subcategories/${path.subId}/subsubcategories/${path.subSubId}`;
    } else if (
      type === EditType.Item &&
      path.catId &&
      path.subId &&
      path.itemId
    ) {
      if (path.subSubId) {
        docPath = `categories/${path.catId}/subcategories/${path.subId}/subsubcategories/${path.subSubId}/items/${path.itemId}`;
      } else {
        docPath = `categories/${path.catId}/subcategories/${path.subId}/items/${path.itemId}`;
      }
    }

    if (!docPath) return;
    await updateDoc(doc(db, docPath), data as any);
    setEditing(null);
    reload();
  };

  if (loading)
    return <p className="p-6 text-gray-500">Loading dashboard…</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Dashboard: Categories
        </h1>

        {/* — Categories — */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <Folder className="text-blue-500 w-6 h-6" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  {cat.name}
                </h2>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => startEdit(EditType.Cat, cat.id)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="mr-1 w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(EditType.Cat, cat.id)}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <Trash2 className="mr-1 w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            <div className="space-y-6 ml-8">
              {/* — Subcategories — */}
              {cat.subcategories?.map((sub) => (
                <div key={sub.id} className="border-l-2 border-gray-200 pl-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="text-purple-500 w-5 h-5" />
                      <h3 className="text-xl font-medium text-gray-700">
                        {sub.name}
                      </h3>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() =>
                          startEdit(EditType.Sub, cat.id, sub.id)
                        }
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Edit2 className="mr-1 w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(EditType.Sub, cat.id, sub.id)
                        }
                        className="flex items-center text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 className="mr-1 w-4 h-4" /> Delete
                      </button>
                    </div>

                    {/* — Sub-subcategories — */}
                  </div>
                  {sub.subSubcategories?.map((ss) => (
                    <div
                      key={ss.id}
                      className="border-l-2 border-gray-200 pl-6 mb-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="text-green-500 w-4 h-4" />
                          <h4 className="text-lg font-medium text-gray-600">
                            {ss.name}
                          </h4>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              startEdit(
                                EditType.SubSub,
                                cat.id,
                                sub.id,
                                ss.id
                              )
                            }
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Edit2 className="mr-1 w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                EditType.SubSub,
                                cat.id,
                                sub.id,
                                ss.id
                              )
                            }
                            className="flex items-center text-red-600 hover:text-red-800 text-sm"
                          >
                            <Trash2 className="mr-1 w-4 h-4" /> Delete
                          </button>
                        </div>

                        {/* — Items under sub-subcategory — */}
                      </div>
                      {ss.items?.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex justify-between items-start ml-4"
                        >
                          <div>
                            <h5 className="font-semibold text-gray-800">
                              {item.title}
                            </h5>
                            <p className="text-gray-600 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() =>
                                startEdit(
                                  EditType.Item,
                                  cat.id,
                                  sub.id,
                                  ss.id,
                                  item
                                )
                              }
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Edit2 className="mr-1 w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  EditType.Item,
                                  cat.id,
                                  sub.id,
                                  ss.id,
                                  item.id
                                )
                              }
                              className="flex items-center text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 className="mr-1 w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* — Items directly under the subcategory (if no sub-subs) — */}
                  {(!sub.subSubcategories?.length ||
                    sub.subSubcategories.length === 0) &&
                    sub.items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {item.title}
                            </h4>
                            <p className="text-gray-600 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() =>
                                startEdit(
                                  EditType.Item,
                                  cat.id,
                                  sub.id,
                                  undefined,
                                  item
                                )
                              }
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Edit2 className="mr-1 w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  EditType.Item,
                                  cat.id,
                                  sub.id,
                                  undefined,
                                  item.id
                                )
                              }
                              className="flex items-center text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 className="mr-1 w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* — Edit Modal — */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 overflow-y-auto max-h-screen">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editing.type === EditType.Cat
                    ? 'Edit Category'
                    : editing.type === EditType.Sub
                    ? 'Edit Subcategory'
                    : editing.type === EditType.SubSub
                    ? 'Edit Sub-subcategory'
                    : 'Edit Item'}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Cat / Sub / SubSub = single name field */}
                {(editing.type === EditType.Cat ||
                  editing.type === EditType.Sub ||
                  editing.type === EditType.SubSub) && (
                  <input
                    type="text"
                    value={editing.data.name || ''}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              data: { ...prev.data, name: e.target.value },
                            }
                          : null
                      )
                    }
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {/* Item fields */}
                {editing.type === EditType.Item && (
                  <>
                    <input
                      type="text"
                      value={editing.data.title || ''}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  title: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      placeholder="Title"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editing.data.description || ''}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  description: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      placeholder="Description"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        value={editing.data.uG ?? ''}
                        onChange={(e) =>
                          setEditing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    uG: Number(e.target.value),
                                  },
                                }
                              : null
                          )
                        }
                        placeholder="uG"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        value={editing.data.afdichten || ''}
                        onChange={(e) =>
                          setEditing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    afdichten: e.target.value,
                                  },
                                }
                              : null
                          )
                        }
                        placeholder="Afdichten"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        value={editing.data.kamer || ''}
                        onChange={(e) =>
                          setEditing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    kamer: e.target.value,
                                  },
                                }
                              : null
                          )
                        }
                        placeholder="Kamer"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Bulletpoints */}
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Bulletpoints
                      </label>
                      {(editing.data.bulletpoints || []).map((bp: string, i: number) => (
                        <div key={i} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => {
                              const arr = [
                                ...(editing.data.bulletpoints || []),
                              ];
                              arr[i] = e.target.value;
                              setEditing((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      data: { ...prev.data, bulletpoints: arr },
                                    }
                                  : null
                              );
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [
                                ...(editing.data.bulletpoints || []),
                              ];
                              arr.splice(i, 1);
                              setEditing((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      data: { ...prev.data, bulletpoints: arr },
                                    }
                                  : null
                              );
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [
                            ...(editing.data.bulletpoints || []),
                            '',
                          ];
                          setEditing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: { ...prev.data, bulletpoints: arr },
                                }
                              : null
                          );
                        }}
                        className="inline-flex items-center text-green-600 hover:text-green-800"
                      >
                        <PlusCircle className="mr-1 w-5 h-5" /> Add
                        Bulletpoint
                      </button>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Images (URLs)
                      </label>
                      {(editing.data.images || []).map((img: string, i: number) => (
                        <div key={i} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) => {
                              const arr = [...(editing.data.images || [])];
                              arr[i] = e.target.value;
                              setEditing((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      data: { ...prev.data, images: arr },
                                    }
                                  : null
                              );
                            }}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...(editing.data.images || [])];
                              arr.splice(i, 1);
                              setEditing((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      data: { ...prev.data, images: arr },
                                    }
                                  : null
                              );
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...(editing.data.images || []), ''];
                          setEditing((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: { ...prev.data, images: arr },
                                }
                              : null
                          );
                        }}
                        className="inline-flex items-center text-green-600 hover:text-green-800"
                      >
                        <PlusCircle className="mr-1 w-5 h-5" /> Add Image URL
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
