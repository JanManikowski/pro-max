export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-12 text-center px-6">
      <h2 className="text-2xl font-bold mb-4">Neem contact met ons op</h2>
      <p className="mb-6">Voor vragen, offertes of samenwerking – wij staan voor u klaar.</p>
      <a
        href="mailto:info@mjmklussenbedrijf.nl"
        className="bg-white text-blue-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
      >
        info@mjmklussenbedrijf.nl
      </a>
      <p className="mt-10 text-sm opacity-70">© {new Date().getFullYear()} MJM Kozijnen</p>
    </footer>
  );
}
