import { FaBriefcase } from "react-icons/fa";

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8">

        <nav className="h-20 flex items-center justify-between">

          {/* Logo */}

          <div className="flex items-center gap-3 cursor-pointer">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">

              <FaBriefcase size={18} />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-800">

                FreelancerHub

              </h1>

              <p className="text-xs text-slate-500">

                Collaboration Platform

              </p>

            </div>

          </div>

          {/* Menu */}

          <ul className="hidden lg:flex items-center gap-10">

            <li className="cursor-pointer font-medium text-slate-700 hover:text-blue-600 transition">
              Home
            </li>

            <li className="cursor-pointer font-medium text-slate-700 hover:text-blue-600 transition">
              Find Talent
            </li>

            <li className="cursor-pointer font-medium text-slate-700 hover:text-blue-600 transition">
              Find Projects
            </li>

            <li className="cursor-pointer font-medium text-slate-700 hover:text-blue-600 transition">
              About
            </li>

            <li className="cursor-pointer font-medium text-slate-700 hover:text-blue-600 transition">
              Contact
            </li>

          </ul>

          {/* Buttons */}

          <div className="flex items-center gap-4">

            <button className="hidden md:block text-slate-700 font-semibold hover:text-blue-600 transition">

              Login

            </button>

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition duration-300">

              Get Started

            </button>

          </div>

        </nav>

      </div>

    </header>
  );
}

export default Navbar;