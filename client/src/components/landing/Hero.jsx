import { FaArrowRight, FaSearch, FaStar } from "react-icons/fa";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-32 pb-24">

      {/* Background Blur */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}

          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-8">

              <FaStar />

              Trusted by 20,000+ freelancers

            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900">

              Build Amazing

              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">

                Freelance Teams

              </span>

            </h1>

            <p className="mt-8 text-lg text-slate-600 leading-8 max-w-xl">

              Connect with skilled freelancers, collaborate in real-time,
              manage projects effortlessly, and grow your business faster
              using one powerful platform.

            </p>

            {/* Search Box */}

            <div className="mt-10 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex items-center">

              <FaSearch className="text-gray-400 ml-3 mr-4" />

              <input
                type="text"
                placeholder="Search Skills, Projects, Freelancers..."
                className="flex-1 outline-none text-slate-700"
              />

              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">

                Search

              </button>

            </div>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-5">

              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:scale-105 transition">

                Hire Freelancer

                <FaArrowRight />

              </button>

              <button className="border-2 border-slate-300 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition">

                Find Work

              </button>

            </div>

          </div>

                    {/* RIGHT SIDE */}

          <div className="relative flex justify-center">

            {/* Main Card */}

            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-slate-200">

              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700"
                alt="Team Collaboration"
                className="rounded-2xl w-full h-[420px] object-cover"
              />

              <div className="mt-6">

                <h3 className="text-2xl font-bold text-slate-900">
                  Collaborate Smarter
                </h3>

                <p className="text-slate-600 mt-2">
                  Hire professionals, manage projects, chat instantly,
                  and deliver work faster than ever.
                </p>

              </div>

            </div>

            {/* Floating Card 1 */}

            <div className="absolute -left-10 top-10 bg-white rounded-2xl shadow-xl px-6 py-4 border border-slate-100">

              <p className="text-sm text-slate-500">
                Active Freelancers
              </p>

              <h2 className="text-3xl font-bold text-blue-600">
                20K+
              </h2>

            </div>

            {/* Floating Card 2 */}

            <div className="absolute -right-8 bottom-20 bg-white rounded-2xl shadow-xl px-6 py-4 border border-slate-100">

              <p className="text-sm text-slate-500">
                Projects Completed
              </p>

              <h2 className="text-3xl font-bold text-green-600">
                150K+
              </h2>

            </div>

            {/* Floating Card 3 */}

            <div className="absolute left-24 -bottom-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl px-6 py-4">

              <p className="text-sm opacity-90">
                Client Satisfaction
              </p>

              <h2 className="text-3xl font-bold">
                98%
              </h2>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;