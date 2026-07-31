import {
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

function TopFreelancers() {
  const freelancers = [
    {
      name: "Sarah Johnson",
      role: "Full Stack Developer",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: "4.9",
      reviews: "245",
      location: "United States",
      rate: "$45/hr",
      skills: ["React", "Node.js", "MongoDB"],
      status: "Available",
    },
    {
      name: "Michael Chen",
      role: "UI / UX Designer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: "4.8",
      reviews: "198",
      location: "Singapore",
      rate: "$40/hr",
      skills: ["Figma", "Adobe XD", "UI Design"],
      status: "Available",
    },
    {
      name: "Emily Brown",
      role: "Digital Marketer",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: "5.0",
      reviews: "310",
      location: "Canada",
      rate: "$35/hr",
      skills: ["SEO", "Google Ads", "Social Media"],
      status: "Available",
    },
    {
      name: "David Wilson",
      role: "Mobile App Developer",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
      rating: "4.9",
      reviews: "289",
      location: "Australia",
      rate: "$50/hr",
      skills: ["Flutter", "React Native", "Firebase"],
      status: "Available",
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="bg-blue-100 text-blue-600 px-5 py-2 rounded-full font-semibold">
            Featured Talent
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            Meet Our Top Freelancers
          </h2>

          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Work with experienced professionals trusted by businesses
            worldwide to deliver exceptional results.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">


                      {freelancers.map((freelancer, index) => (
            <div
              key={index}
              className="group relative bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
            >
              {/* Favorite Button */}
              <button className="absolute top-5 right-5 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:scale-110 transition z-10">
                <FaHeart />
              </button>

              {/* Profile */}
              <div className="p-8 text-center">

                <img
                  src={freelancer.image}
                  alt={freelancer.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                />

                <h3 className="mt-5 text-2xl font-bold text-slate-900">
                  {freelancer.name}
                </h3>

                <p className="text-blue-600 font-medium mt-1">
                  {freelancer.role}
                </p>

                {/* Rating */}

                <div className="flex justify-center items-center gap-2 mt-4">

                  <FaStar className="text-yellow-400" />

                  <span className="font-semibold">
                    {freelancer.rating}
                  </span>

                  <span className="text-slate-500">
                    ({freelancer.reviews})
                  </span>

                </div>

                {/* Location */}

                <div className="flex justify-center items-center gap-2 mt-3 text-slate-500">

                  <FaMapMarkerAlt />

                  <span>{freelancer.location}</span>

                </div>

                {/* Skills */}

                <div className="flex flex-wrap justify-center gap-2 mt-6">

                  {freelancer.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

                {/* Rate */}

                <div className="mt-6">

                  <p className="text-slate-500 text-sm">
                    Hourly Rate
                  </p>

                  <h4 className="text-3xl font-bold text-slate-900">
                    {freelancer.rate}
                  </h4>

                </div>

                {/* Status */}

                <div className="flex justify-center items-center gap-2 mt-4 text-green-600">

                  <FaCheckCircle />

                  <span>{freelancer.status}</span>

                </div>

                {/* Button */}

                <button className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition duration-300">
                  Hire Now
                </button>

              </div>
            </div>
          ))}

        </div>

        {/* Bottom CTA */}

        <div className="mt-20 text-center">

          <h3 className="text-3xl font-bold text-slate-900">
            Looking for More Professionals?
          </h3>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Explore thousands of verified freelancers from around the world
            with skills across development, design, marketing, AI, writing,
            business, and more.
          </p>

          <button className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:scale-105 transition duration-300">
            Explore All Freelancers
          </button>

        </div>

      </div>

    </section>
  );
}

export default TopFreelancers;