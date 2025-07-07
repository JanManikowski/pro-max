// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [previews, setPreviews] = useState<{ title: string; href: string; img: string }[]>([]);

  useEffect(() => {
    const fetchPreviewImages = async () => {
      const categories = ['ramen', 'deuren', 'schuifsystemen'];
      const promises = categories.map(async (cat) => {
        try {
          const snap = await getDocs(collection(db, `categories/${cat}/subcategories`));
          for (const docSnap of snap.docs) {
            const subId = docSnap.id;
            const itemSnap = await getDocs(
              collection(db, `categories/${cat}/subcategories/${subId}/items`)
            );
            const item = itemSnap.docs[0]?.data();
            const img = item?.images?.[0] || '/placeholder.jpg';
            return { title: cat.charAt(0).toUpperCase() + cat.slice(1), href: `/products/${cat}`, img };
          }
        } catch (err) {
          console.error(`Error fetching preview for ${cat}:`, err);
        }
      });

      const results = await Promise.all(promises);
      setPreviews(results.filter(Boolean) as any);
    };

    fetchPreviewImages();
  }, []);

  return (
    <div className="bg-white text-gray-800 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center text-white px-6">
        <Image
          src="/home-main.jpg"
          alt="Hero Image"
          layout="fill"
          objectFit="cover"
          quality={90}
          priority
          className="z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
        <div className="z-20 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
            Synego – PVC-producten met een <br />
            <span className="text-blue-300">uitzonderlijke afwerkingskwaliteit</span>
          </h1>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-6">Over Ons</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
          MJM Kozijnen levert maatwerkoplossingen voor moderne en duurzame woonprojecten. Met
          jarenlange ervaring in aluminium en kunststof systemen staan wij garant voor kwaliteit,
          service en design.
        </p>
      </section>

      {/* Features */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-10">Waarom kiezen voor MJM?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Energie-efficiënt</h3>
            <p className="text-gray-600">Onze kozijnen zijn ontwikkeld met isolatie en duurzaamheid in gedachten.</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Strak Design</h3>
            <p className="text-gray-600">Moderne uitstraling met oog voor detail – perfect voor nieuwbouw én renovatie.</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Maatwerk</h3>
            <p className="text-gray-600">Elk product wordt afgestemd op jouw wensen en specificaties.</p>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section id="producten" className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-10">Onze Producten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {previews.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="block bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <img src={p.img} alt={p.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
