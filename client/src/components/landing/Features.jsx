import {
  FaUsers,
  FaComments,
  FaTasks,
  FaShieldAlt,
  FaChartLine,
  FaLaptopCode,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaUsers size={30} />,
      title: "Smart Hiring",
      description:
        "Find verified freelancers with the right skills and experience in minutes.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaComments size={30} />,
      title: "Real-Time Chat",
      description:
        "Communicate instantly with freelancers using integrated messaging.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaTasks size={30} />,
      title: "Project Management",
      description:
        "Track tasks, milestones, deadlines, and progress from one dashboard.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaShieldAlt size={30} />,
      title: "Secure Payments",
      description:
        "Protected transactions with milestone-based payment releases.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FaChartLine size={30} />,
      title: "Analytics",
      description:
        "Gain insights into project performance and freelancer productivity.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: <FaLaptopCode size={30} />,
      title: "AI Collaboration",
      description:
        "Use AI-powered recommendations to match the best freelancers.",
      color: "from-pink-500 to-violet-500",
    },
  ];

  return (
    <section className="py-24 bg-slate-50">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
            Why Choose FreelancerHub
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            Everything You Need
            <span className="block text-blue-600">
              To Work Better Together
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
            Our platform provides powerful tools that help freelancers and
            clients collaborate efficiently from project creation to delivery.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-6 group-hover:rotate-6 transition-all duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-slate-600 leading-7">
                {feature.description}
              </p>

              <button className="mt-8 text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                Learn More
                <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}

        <div className="mt-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">

          <h3 className="text-4xl font-bold">
            Ready to Build Your Next Project?
          </h3>

          <p className="mt-5 text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of freelancers and businesses already using
            FreelancerHub to connect, collaborate, and succeed together.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">

            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition">
              Hire a Freelancer
            </button>

            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition">
              Become a Freelancer
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Features;