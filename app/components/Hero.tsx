// components/Hero.tsx
'use client';

import Image from 'next/image';
import mainImage from '../../public/home-main.jpg';

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-400 text-white px-6">
      {/* Background Image */}
      <Image
        src='../public/home-main.jpg'
        alt="Hero Image"
        layout="fill"
        objectFit="cover"
        quality={90}
        className="z-0"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />

      {/* Text Content */}
      <div className="z-20 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
          Synego – PVC-producten met een <br />
          <span className="text-blue-300">uitzonderlijke afwerkingskwaliteit</span>
        </h1>
      </div>
    </section>
  );
}
