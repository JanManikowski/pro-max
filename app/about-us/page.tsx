'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import img4 from '../../public/about-us-4.jpg';
import img2 from '../../public/about-us-2.jpg';
import img3 from '../../public/about-us-3.jpg';;
import img5 from '../../public/about-us-5.jpg';

export default function AboutUsPage() {
  return (
    <>
      <Navbar />    

      <main className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[60vh] w-full">
          {/* Hero background image → replace src with your high-res showroom / factory shot */}
          <Image
            src={img3}
            alt="Pro Max factory overview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-white text-5xl md:text-6xl font-extrabold">
              Over Pro Max
            </h1>
          </div>
        </section>

        {/* Intro Text */}
        <section className="max-w-4xl mx-auto py-16 px-6 text-gray-700 space-y-6">
          <p className="text-lg leading-relaxed">
            Kunststof kozijnen van de beste kwaliteit, die vind je bij Pro Max. Elke kozijn
            wordt helemaal naar uw wens gemaakt. Daarom kunnen wij geen standaard prijzen
            voor kunststof kozijnen geven. Vraag daarom voor uw kunststof kozijnen naar
            een prijsindicatie of bel voor een afspraak.
          </p>

          {/* Suggestion: you could put a team photo or workshop image here */}
          <div className="w-full h-64 relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src={img2}
              alt="Ons team aan het werk"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Features List */}
        <section className="bg-white py-16">
          <div className="max-w-3xl mx-auto grid gap-8">
            <h2 className="text-3xl font-semibold text-gray-800 text-center">
              Onze Belangrijkste Voordelen
            </h2>
            <ul className="space-y-4 text-gray-600 list-inside list-disc px-6 md:px-0">
              <li>Geen schilderwerk meer</li>
              <li>Geen onderhoudskosten</li>
              <li>10 jaar garantie</li>
              <li>Duurzaam en energiezuinig</li>
              <li>Waarde verhoging van de woning</li>
              <li>In alle stijlen en kleuren verkrijgbaar</li>
              <li>Levering binnen 4-6 weken</li>
              <li>Altijd een scherpe prijs</li>
            </ul>
          </div>
        </section>

        {/* Company Story / History */}
        <section className="max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-4 text-gray-700">
            <h3 className="text-2xl font-semibold">Ons Verhaal</h3>
            <p className="leading-relaxed">
              Sinds onze oprichting in 2005 hebben we ons volledig toegelegd op
              hoogwaardig kunststof maatwerk. Van eerste schets tot definitieve
              montage: iedere stap voeren we zelf uit met vakmensen die passie hebben
              voor perfectie. Zo garanderen wij dat uw nieuwe kozijnen niet alleen mooi
              zijn, maar ook jarenlang meegaan.
            </p>
            <p className="leading-relaxed">
              Met een eigen productiehal, een showroom en een deskundig adviesteam staan
              we klaar om van uw project een succes te maken. Neem gerust vrijblijvend
              contact op – wij helpen u graag verder.
            </p>
          </div>

          {/* Timeline or history image – replace with company-founder photo, timeline graphic, etc. */}
          <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={img5}
              alt="Historische foto van Pro Max"
              fill
              className="object-cover"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
