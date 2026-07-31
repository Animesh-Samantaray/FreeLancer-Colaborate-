import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
  FaArrowUp,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white">

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Company */}

          <div className="lg:col-span-2">

            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FreelancerHub
            </h2>

            <p className="mt-6 text-slate-400 leading-8">
              FreelancerHub is a modern freelancer collaboration platform
              that helps businesses hire top talent and enables freelancers
              to work on amazing projects from anywhere in the world.
            </p>

            <div className="flex gap-4 mt-8">

              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-blue-600 transition flex items-center justify-center"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-sky-500 transition flex items-center justify-center"
              >
                <FaTwitter />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-blue-700 transition flex items-center justify-center"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-pink-600 transition flex items-center justify-center"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-gray-700 transition flex items-center justify-center"
              >
                <FaGithub />
              </a>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Find Freelancers</a></li>
              <li><a href="#" className="hover:text-white transition">Find Projects</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>

            </ul>

          </div>

          {/* Services */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Services
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>Web Development</li>
              <li>UI / UX Design</li>
              <li>Mobile Apps</li>
              <li>Digital Marketing</li>
              <li>Content Writing</li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-semibold mb-6">
              Contact
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>support@freelancerhub.com</li>
              <li>+91 98765 43210</li>
              <li>Punjab, India</li>
              <li>Available 24/7</li>

            </ul>

          </div>

        </div>

        <hr className="border-slate-700 my-12" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                      {/* Copyright */}

          <p className="text-slate-400 text-center md:text-left">
            © {new Date().getFullYear()} FreelancerHub. All rights reserved.
          </p>

          {/* Footer Links */}

          <div className="flex items-center gap-6 text-slate-400">

            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white transition">
              Terms
            </a>

            <a href="#" className="hover:text-white transition">
              Cookies
            </a>

          </div>

          {/* Back To Top */}

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center hover:scale-110 transition duration-300 shadow-lg"
          >
            <FaArrowUp />
          </button>

        </div>

      </div>

    </footer>
  );
}

export default Footer;