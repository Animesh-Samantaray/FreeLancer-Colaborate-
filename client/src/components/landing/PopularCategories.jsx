import {
  FaCode,
  FaPaintBrush,
  FaBullhorn,
  FaPenNib,
  FaVideo,
  FaMobileAlt,
  FaDatabase,
  FaChartBar,
} from "react-icons/fa";

function PopularCategories() {
  const categories = [
    {
      icon: <FaCode size={32} />,
      title: "Web Development",
      jobs: "2,450+ Projects",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaPaintBrush size={32} />,
      title: "UI / UX Design",
      jobs: "1,320+ Projects",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: <FaBullhorn size={32} />,
      title: "Digital Marketing",
      jobs: "980+ Projects",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FaPenNib size={32} />,
      title: "Content Writing",
      jobs: "870+ Projects",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaVideo size={32} />,
      title: "Video Editing",
      jobs: "720+ Projects",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: <FaMobileAlt size={32} />,
      title: "App Development",
      jobs: "1,150+ Projects",
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      icon: <FaDatabase size={32} />,
      title: "Database",
      jobs: "650+ Projects",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: <FaChartBar size={32} />,
      title: "Data Analysis",
      jobs: "540+ Projects",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <section className="py-24 bg-slate-50">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="bg-blue-100 text-blue-600 px-5 py-2 rounded-full font-semibold">
            Browse Categories
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            Popular Freelance Categories
          </h2>

          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Explore thousands of opportunities across the most in-demand
            freelance skills and industries.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">


                      {categories.map((category, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
              >
                {category.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                {category.title}
              </h3>

              <p className="mt-3 text-slate-600">
                {category.jobs}
              </p>

              <button className="mt-8 text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                Explore Category
                <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}

        <div className="mt-20 text-center">

          <h3 className="text-3xl font-bold text-slate-900">
            Can't Find Your Skill?
          </h3>

          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
            We support hundreds of freelance categories across technology,
            design, marketing, writing, business, finance, AI, and more.
          </p>

          <button className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:scale-105 transition duration-300">
            View All Categories
          </button>

        </div>

      </div>

    </section>
  );
}

export default PopularCategories;