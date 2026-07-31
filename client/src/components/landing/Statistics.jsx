import {
  FaUsers,
  FaBriefcase,
  FaGlobe,
  FaStar,
} from "react-icons/fa";

function Statistics() {
  const stats = [
    {
      icon: <FaUsers size={32} />,
      number: "20K+",
      title: "Active Freelancers",
      description: "Verified professionals across multiple industries.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaBriefcase size={32} />,
      number: "15K+",
      title: "Projects Completed",
      description: "Successful collaborations between clients and talent.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaGlobe size={32} />,
      number: "150+",
      title: "Countries",
      description: "Connecting freelancers and businesses worldwide.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaStar size={32} />,
      number: "4.9/5",
      title: "Customer Rating",
      description: "Thousands of satisfied clients and freelancers.",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="bg-blue-600/20 text-blue-300 px-5 py-2 rounded-full font-semibold">
            Platform Growth
          </span>

          <h2 className="text-5xl font-bold mt-6">
            Trusted by Thousands Around the World
          </h2>

          <p className="mt-5 text-slate-300 text-lg max-w-3xl mx-auto">
            FreelancerHub is helping businesses and freelancers connect,
            collaborate, and build amazing products together.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                      {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-3 hover:bg-white/15 transition-all duration-300"
            >
              {/* Icon */}

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-6 shadow-xl`}
              >
                {stat.icon}
              </div>

              {/* Number */}

              <h3 className="text-5xl font-extrabold">
                {stat.number}
              </h3>

              {/* Title */}

              <h4 className="mt-4 text-2xl font-semibold">
                {stat.title}
              </h4>

              {/* Description */}

              <p className="mt-4 text-slate-300 leading-7">
                {stat.description}
              </p>
            </div>
          ))}

        </div>

        {/* Bottom Banner */}

        <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">

          <h3 className="text-4xl font-bold">
            Ready to Join FreelancerHub?
          </h3>

          <p className="mt-5 text-blue-100 text-lg max-w-2xl mx-auto">
            Whether you're hiring skilled professionals or searching for
            your next freelance opportunity, FreelancerHub gives you
            everything you need to succeed.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">

            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition duration-300">
              Get Started
            </button>

            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Statistics;