import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Leaf className="text-green-600 w-7 h-7" />
          <span className="font-bold text-2xl text-gray-800">AgriCarbon</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-gray-700">
          <Link to="/" className="hover:text-green-600 transition">Home</Link>
          <a href="#" className="hover:text-green-600 transition">About</a>
          <Link to="#" className="hover:text-green-600 transition">Contact</Link>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl hover:cursor-pointer">
            Signup
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-white/90 backdrop-blur-md shadow-md py-4 space-y-4">
          <Link to="/" className="hover:text-green-600 transition">Home</Link>
          <Link to="#" className="hover:text-green-600 transition">About</Link>
          <Link to="#" className="hover:text-green-600 transition">Contact</Link>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
            Signup
          </Button>
        </div>
      )}
    </nav>
  );
}
