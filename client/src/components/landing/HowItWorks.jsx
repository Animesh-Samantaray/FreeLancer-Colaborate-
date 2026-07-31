import {
  FaUserPlus,
  FaSearch,
  FaHandshake,
  FaCheckCircle,
} from "react-icons/fa";

function HowItWorks() {
  const steps = [
    {
      icon: <FaUserPlus size={28} />,
      title: "Create Account",
      description:
        "Sign up as a client or freelancer and complete your professional profile.",
      color: "from-blue-500 to-cyan-500",
      step: "01",
    },
    {
      icon: <FaSearch size={28} />,
      title: "Find Talent",
      description:
        "Browse thousands of skilled freelancers or search for exciting projects.",
      color: "from-purple-500 to-pink-500",
      step: "02",
    },
    {
      icon: <FaHandshake size={28} />,
      title: "Collaborate",
      description:
        "Chat, share files, assign tasks, and manage everything in one workspace.",
      color: "from-green-500 to-emerald-500",
      step: "03",
    },
    {
      icon: <FaCheckCircle size={28} />,
      title: "Get Results",
      description:
        "Complete projects successfully with secure payments and client reviews.",
      color: "from-orange-500 to-red-500",
      step: "04",
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <span className="inline-block bg-blue-100 text-blue-600 font-semibold px-5 py-2 rounded-full">
            Simple Process
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            How FreelancerHub Works
          </h2>

          <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
            Start collaborating in just four simple steps and manage your
            freelance journey with confidence.
          </p>

        </div>

        <div className="relative">

          <div className="hidden lg:block absolute top-16 left-0 w-full h-1 bg-slate-200"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            

                      {steps.map((step, index) => (
            <div key={index} className="relative text-center group">

              {/* Step Number */}

              <div className="absolute -top-5 right-5 text-6xl font-extrabold text-slate-100 select-none">
                {step.step}
              </div>

              {/* Icon */}

              <div
                className={`relative z-10 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
              >
                {step.icon}
              </div>

              {/* Card */}

              <div className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-300">

                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {step.title}
                </h3>

                <p className="text-slate-600 leading-7">
                  {step.description}
                </p>

              </div>

            </div>
          ))}

          </div>

        </div>

        {/* Bottom Section */}

        <div className="mt-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 text-center text-white">

          <h3 className="text-4xl font-bold">
            Start Your Freelancing Journey Today
          </h3>

          <p className="mt-5 text-slate-300 text-lg max-w-2xl mx-auto">
            Whether you're hiring top talent or searching for your next
            opportunity, FreelancerHub makes collaboration simple,
            secure, and efficient.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">

            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition">
              Get Started
            </button>

            <button className="border border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition">
              Learn More
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;