import { FaStar, FaQuoteLeft } from "react-icons/fa";

function Testimonials() {
  const testimonials = [
    {
      name: "James Anderson",
      role: "CEO, TechNova",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      rating: 5,
      review:
        "FreelancerHub completely transformed the way we hire developers. We found amazing talent within hours instead of weeks.",
    },
    {
      name: "Sophia Williams",
      role: "UI/UX Designer",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 5,
      review:
        "The collaboration tools are fantastic. Chat, file sharing, and task management are all in one place, making remote work effortless.",
    },
    {
      name: "Daniel Carter",
      role: "Startup Founder",
      image: "https://randomuser.me/api/portraits/men/52.jpg",
      rating: 5,
      review:
        "I've worked with many freelancer platforms, but this one offers the best user experience and project management features.",
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="bg-blue-100 text-blue-600 px-5 py-2 rounded-full font-semibold">
            Testimonials
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            What Our Clients Say
          </h2>

          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Thousands of businesses and freelancers trust FreelancerHub
            every day to build successful projects.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-slate-50 rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
            >
              {/* Quote Icon */}

              <div className="absolute top-6 right-6 text-blue-100 text-4xl">
                <FaQuoteLeft />
              </div>

              {/* Profile */}

              <div className="flex items-center gap-4">

                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />

                <div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {testimonial.name}
                  </h3>

                  <p className="text-slate-500">
                    {testimonial.role}
                  </p>

                </div>

              </div>

              {/* Rating */}

              <div className="flex gap-1 mt-6">

                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}

              </div>

              {/* Review */}

              <p className="mt-6 text-slate-600 leading-8 italic">
                "{testimonial.review}"
              </p>

            </div>
          ))}

        </div>

        {/* Bottom CTA */}

        <div className="mt-20 text-center">

          <h3 className="text-3xl font-bold text-slate-900">
            Join Thousands of Happy Users
          </h3>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            FreelancerHub helps businesses hire faster and freelancers
            find meaningful work from anywhere in the world.
          </p>

          <button className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:scale-105 transition duration-300">
            Join FreelancerHub Today
          </button>

        </div>

      </div>

    </section>
  );
}

export default Testimonials;