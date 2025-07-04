'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Adjust the import path as necessary

export default function AddItemPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bulletpoints, setBulletpoints] = useState('');
  const [uG, setUG] = useState('');
  const [afdichten, setAfdichten] = useState('');
  const [kamer, setKamer] = useState('');
  const [images, setImages] = useState('');

  // Fetch all categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory || selectedCategory === '__new__') return;
      const snapshot = await getDocs(
        collection(db, `categories/${selectedCategory}/subcategories`)
      );
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubcategories(data);
    };
    fetchSubcategories();
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let categoryId = selectedCategory;
      let subcategoryId = selectedSubcategory;

      // Step 1: Create new category if selected
      if (selectedCategory === '__new__' && newCategoryName) {
        const catDoc = await addDoc(collection(db, 'categories'), {
          name: newCategoryName
        });
        categoryId = catDoc.id;
      }

      // Step 2: Create new subcategory if selected
      if (selectedSubcategory === '__new__' && newSubcategoryName) {
        const subRef = doc(
          db,
          `categories/${categoryId}/subcategories/${newSubcategoryName
            .toLowerCase()
            .replace(/\s+/g, '-')}`
        );
        await setDoc(subRef, {
          name: newSubcategoryName
        });
        subcategoryId = subRef.id;
      }

      // Step 3: Add item
      const itemData = {
        title,
        description,
        bulletpoints: bulletpoints
          .split('\n')
          .map((bp) => bp.trim())
          .filter(Boolean),
        uG: parseFloat(uG),
        afdichten,
        kamer,
        images: images
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean)
      };

      await addDoc(
        collection(
          db,
          `categories/${categoryId}/subcategories/${subcategoryId}/items`
        ),
        itemData
      );

      alert('Item added successfully!');
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error adding item');
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setNewCategoryName('');
    setSelectedSubcategory('');
    setNewSubcategoryName('');
    setTitle('');
    setDescription('');
    setBulletpoints('');
    setUG('');
    setAfdichten('');
    setKamer('');
    setImages('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto space-y-4 py-6 px-4"
    >
      <h1 className="text-2xl font-bold">Add New Item</h1>

      {/* Category Selection */}
      <div>
        <label className="block mb-1 font-semibold">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
            setNewCategoryName('');
          }}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="__new__">+ New category</option>
        </select>
        {selectedCategory === '__new__' && (
          <input
            type="text"
            className="w-full mt-2 border p-2 rounded"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
        )}
      </div>

      {/* Subcategory Selection */}
      {selectedCategory && (
        <div>
          <label className="block mb-1 font-semibold">Subcategory</label>
          <select
            value={selectedSubcategory}
            onChange={(e) => {
              setSelectedSubcategory(e.target.value);
              setNewSubcategoryName('');
            }}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
            <option value="__new__">+ New subcategory</option>
          </select>
          {selectedSubcategory === '__new__' && (
            <input
              type="text"
              className="w-full mt-2 border p-2 rounded"
              placeholder="New subcategory name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              required
            />
          )}
        </div>
      )}

      {/* Item Fields */}
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Item title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Bulletpoints (one per line)"
        value={bulletpoints}
        onChange={(e) => setBulletpoints(e.target.value)}
        rows={4}
      />

      <input
        type="number"
        step="0.01"
        className="w-full border p-2 rounded"
        placeholder="uG (e.g. 0.2)"
        value={uG}
        onChange={(e) => setUG(e.target.value)}
        required
      />

      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Afdichten"
        value={afdichten}
        onChange={(e) => setAfdichten(e.target.value)}
      />

      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Kamer"
        value={kamer}
        onChange={(e) => setKamer(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Image URLs (comma-separated)"
        value={images}
        onChange={(e) => setImages(e.target.value)}
        rows={2}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Add Item
      </button>
    </form>
  );
}
