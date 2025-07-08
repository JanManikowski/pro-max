'use client';

import { useEffect, useState, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { auth, storage } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  listAll
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import Link from 'next/link';

interface Album { name: string; coverUrl: string; }

export default function OurProjectsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const root = storageRef(storage, 'about-us');
        const res = await listAll(root);
        const data = await Promise.all(
          res.prefixes.map(async pref => {
            const items = await listAll(pref);
            const first = items.items[0];
            const coverUrl = first ? await getDownloadURL(first) : '';
            return { name: pref.name, coverUrl };
          })
        );
        setAlbums(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlbums(false);
      }
    }
    loadAlbums();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !files?.length) return;

    for (let file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1920,
        });
        const path = `about-us/${folderName}/${compressed.name}`;
        const ref = storageRef(storage, path);
        const task = uploadBytesResumable(ref, compressed);

        task.on('state_changed',
          snap => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setProgressMap(m => ({ ...m, [file.name]: pct }));
          },
          err => console.error(err),
          () => console.log('uploaded', file.name)
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-0 pt-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-12 border-b-4 border-orange-400 inline-block">
            Onze Projecten
          </h1>

          {/* Albums */}
          {loadingAlbums ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map(a => (
                <Link
                  href={`/our-projects/${encodeURIComponent(a.name)}`}
                  key={a.name}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-56 w-full">
                    {a.coverUrl && (
                      <Image
                        src={a.coverUrl}
                        alt={a.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-5 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">
                      {a.name}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Uploader — only if signed in */}
          {user && (
            <section className="mt-16 bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Afbeelding uploaden
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-600 mb-2">Folder naam</label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    placeholder="bijv. teamfoto"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-2">Kies afbeeldingen</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setFiles(e.target.files)}
                    className="w-full text-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-block bg-orange-500 text-white font-medium rounded-lg px-6 py-2 hover:bg-orange-600 transition-colors"
                >
                  Start upload
                </button>
              </form>

              {/* Progress */}
              {Object.keys(progressMap).length > 0 && (
                <div className="mt-8 space-y-4">
                  {Object.entries(progressMap).map(([name, pct]) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1 text-sm text-gray-600">
                        <span>{name}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-orange-500 transition-width"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
