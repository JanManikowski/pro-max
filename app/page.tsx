'use client';

import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [previews, setPreviews] = useState<{ title: string; href: string; img: string }[]>([]);

  useEffect(() => {
    const fetchPreviewImages = async () => {
      const categories = ['ramen', 'deuren', 'schuifsystemen'];

      const results = await Promise.all(
        categories.map(async (cat) => {
          let foundImg: string | null = null;

          const subSnap = await getDocs(collection(db, `categories/${cat}/subcategories`));

          for (const subDoc of subSnap.docs) {
            const subId = subDoc.id;

            const subsubSnap = await getDocs(
              collection(db, `categories/${cat}/subcategories/${subId}/subsubcategories`)
            );

            if (!subsubSnap.empty) {
              const firstSubSubId = subsubSnap.docs[0].id;
              const itemsSnap = await getDocs(
                collection(
                  db,
                  `categories/${cat}/subcategories/${subId}/subsubcategories/${firstSubSubId}/items`
                )
              );
              const imgUrl = itemsSnap.docs[0]?.data()?.images?.[0];
              if (imgUrl) {
                foundImg = imgUrl;
                break;
              }
            } else {
              const itemsSnap = await getDocs(
                collection(db, `categories/${cat}/subcategories/${subId}/items`)
              );
              const imgUrl = itemsSnap.docs[0]?.data()?.images?.[0];
              if (imgUrl) {
                foundImg = imgUrl;
                break;
              }
            }
          }

          return {
            title: cat.charAt(0).toUpperCase() + cat.slice(1),
            href: `/products/${cat}`,
            img: foundImg || '/placeholder.jpg',
          };
        })
      );

      setPreviews(results);
    };

    fetchPreviewImages();
  }, []);

  return (
    <div className="bg-white text-gray-800 scroll-smooth">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center text-white px-4 sm:px-6">
        <Image
          src="/home-main.jpg"
          alt="Hero Image"
          layout="fill"
          objectFit="cover"
          priority
          className="z-0"
        />
        <div className="z-20 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-xl text-red-500">
            Pro-Max <br />
            <span className="text-[#FF914B]">Kunststof en aluminium kozijnen</span>
          </h1>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 bg-gray-50 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Over Ons</h2>
        <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
          Pro-Max levert maatwerkoplossingen voor moderne en duurzame woonprojecten. Met
          jarenlange ervaring in aluminium en kunststof systemen staan wij garant voor kwaliteit,
          service en design.
        </p>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-10">Waarom kiezen voor Pro-Max?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Energie-efficiënt</h3>
            <p className="text-gray-600">
              Onze kozijnen zijn ontwikkeld met isolatie en duurzaamheid in gedachten.
            </p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Strak Design</h3>
            <p className="text-gray-600">
              Moderne uitstraling met oog voor detail – perfect voor nieuwbouw én renovatie.
            </p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Maatwerk</h3>
            <p className="text-gray-600">
              Elk product wordt afgestemd op jouw wensen en specificaties.
            </p>
          </div>
        </div>
      </section>

      {/* Product Preview */}
<section id="producten" className="py-16 px-4 sm:px-6 lg:px-10 bg-gray-50 text-center">
  <h2 className="text-3xl sm:text-4xl font-bold mb-10">Onze Producten</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {previews.map((p) => (
      <Link
        key={p.title}
        href={p.href}
        className="block bg-white rounded-lg shadow hover:shadow-xl active:scale-95 transition overflow-hidden"
      >
        {/* ← aspect-square makes this div a perfect 1:1 box */}
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={p.img}
            alt={p.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold">{p.title}</h3>
        </div>
      </Link>
    ))}
  </div>
</section>


      <Footer />
    </div>
  );
}
