import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <Hero />
    </div>
  );
}
