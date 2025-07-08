'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { auth, storage } from '../../lib/firebase';
import {
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  ref as storageRef,
  listAll,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export default function AlbumPage() {
  const { albumId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);

  // all images with their storage path
  const [files, setFiles] = useState<string[]>([]);
  // computed mason tiles
  const [tiles, setTiles] = useState<{ url: string; span: number; path: string }[]>([]);
  const [loading, setLoading] = useState(true);
  // lightbox state
  const [selected, setSelected] = useState<string | null>(null);

  // upload form state
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // list images from storage
  const loadFiles = async () => {
    if (!albumId) return;
    setLoading(true);
    try {
      const folderRef = storageRef(storage, `about-us/${albumId}`);
      const listing = await listAll(folderRef);
      setFiles(listing.items.map((item) => item.fullPath));
    } catch (e) {
      console.error('listAll error', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // on mount or album change
  useEffect(() => {
    loadFiles();
  }, [albumId]);

  // compute tiles spans
  useEffect(() => {
    if (!files.length) {
      setTiles([]);
      return;
    }
    async function computeTiles() {
      const result = await Promise.all(
        files.map(async (path) => {
          const url = await getDownloadURL(storageRef(storage, path));
          const img = new window.Image();
          img.src = url;
          await new Promise((r) => (img.onload = r));
          const ratio = img.naturalHeight / img.naturalWidth;
          const span = Math.ceil(ratio * 2);
          return { url, span, path };
        })
      );
      setTiles(result);
    }
    computeTiles();
  }, [files]);

  // delete
  const handleDelete = async (path: string) => {
    if (!confirm('Weet je zeker dat je deze afbeelding wilt verwijderen?')) return;
    try {
      await deleteObject(storageRef(storage, path));
      await loadFiles();
    } catch (e) {
      console.error('delete error', e);
      alert('Verwijderen mislukt');
    }
  };

  // upload
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!uploadFiles?.length) return alert('Selecteer bestanden');
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const path = `about-us/${albumId}/${compressed.name}`;
        const task = uploadBytesResumable(storageRef(storage, path), compressed);

        task.on(
          'state_changed',
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setProgressMap((m) => ({ ...m, [file.name]: pct }));
          },
          (err) => {
            console.error('upload error', err);
            alert(`Upload van ${file.name} mislukt`);
          },
          async () => {
            setProgressMap((m) => ({ ...m, [file.name]: 100 }));
            await loadFiles();
          }
        );
      } catch (err) {
        console.error('compress/upload error', err);
        alert(`Verwerking ${file.name} mislukt`);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-white py-10 px-4 lg:px-32">
        {/* header + toggle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Album: <span className="text-[#FF914B]">{albumId}</span>
          </h1>
          {user && (
            <button
              onClick={() => setEditMode((f) => !f)}
              className="px-4 py-2 bg-[#FF914B] text-white rounded hover:bg-[#e6833d] transition"
            >
              {editMode ? 'Afsluiten bewerken' : 'Bewerkingen aanzetten'}
            </button>
          )}
        </div>

        {/* upload form */}
        {editMode && user && (
          <form onSubmit={handleUpload} className="mb-8 space-y-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setUploadFiles(e.target.files)}
              className="block"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
            >
              Upload starten
            </button>
            {Object.entries(progressMap).map(([name, pct]) => (
              <div key={name} className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>{name}</span><span>{pct}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-green-600 h-2 rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </form>
        )}

        {/* gallery */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF914B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tiles.length === 0 ? (
          <p className="text-gray-500">Geen afbeeldingen in dit album.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 auto-rows-[300px] auto-flow-dense">
              {tiles.map(({ url, span, path }) => (
                <div
                  key={url}
                  style={{ gridRowEnd: `span ${span}` }}
                  className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => setSelected(url)}
                >
                  <img
                    src={url}
                    alt={Array.isArray(albumId) ? albumId.join(', ') : albumId}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                  {editMode && user && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(path); }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-500 transition"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>

            {/* lightbox overlay */}
            {selected && (
              <div
                className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50"
                onClick={() => setSelected(null)}
              >
                <img
                  src={selected}
                  alt="Full size"
                  className="max-h-full max-w-full"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 text-white text-3xl"
                >✕</button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}