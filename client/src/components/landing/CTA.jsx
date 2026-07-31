import { FaArrowRight, FaUsers, FaBriefcase } from "react-icons/fa";

function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700"></div>

      <div className="absolute -top-32 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-12 lg:p-16 text-center">

          <span className="inline-block bg-white/20 text-white px-5 py-2 rounded-full font-semibold">
            Join FreelancerHub Today
          </span>

          <h2 className="mt-8 text-5xl lg:text-6xl font-extrabold text-white leading-tight">

            Start Building Amazing
            <br />
            Projects Together

          </h2>

          <p className="mt-8 text-xl text-blue-100 max-w-3xl mx-auto leading-8">

            Connect with skilled freelancers, hire top talent,
            manage projects, collaborate in real time,
            and grow your business with confidence.

          </p>

          {/* Buttons */}

          <div className="mt-12 flex flex-wrap justify-center gap-6">

            <button className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition">

              Hire Freelancer

              <FaArrowRight />

            </button>

            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-700 transition">

              Become a Freelancer

            </button>

          </div>

          {/* Stats */}

          <div className="mt-16 grid md:grid-cols-2 gap-8">

                      <div className="bg-white/10 border border-white/20 rounded-2xl p-8">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-lg">
              <FaUsers size={30} />
            </div>

            <h3 className="mt-6 text-4xl font-bold text-white">
              20K+
            </h3>

            <p className="mt-2 text-blue-100 text-lg">
              Active Freelancers
            </p>

          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-8">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-purple-700 flex items-center justify-center shadow-lg">
              <FaBriefcase size={30} />
            </div>

            <h3 className="mt-6 text-4xl font-bold text-white">
              15K+
            </h3>

            <p className="mt-2 text-blue-100 text-lg">
              Projects Posted
            </p>

          </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default CTA;