import {
  FaGoogle,
  FaMicrosoft,
  FaAmazon,
  FaApple,
  FaFacebook,
} from "react-icons/fa";

function TrustedCompanies() {
  const companies = [
    {
      name: "Google",
      icon: <FaGoogle className="text-4xl text-red-500" />,
    },
    {
      name: "Microsoft",
      icon: <FaMicrosoft className="text-4xl text-blue-500" />,
    },
    {
      name: "Amazon",
      icon: <FaAmazon className="text-4xl text-orange-500" />,
    },
    {
      name: "Apple",
      icon: <FaApple className="text-4xl text-gray-800" />,
    },
    {
      name: "Meta",
      icon: <FaFacebook className="text-4xl text-blue-600" />,
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-14">

          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold mb-4">
            Trusted Worldwide
          </span>

          <h2 className="text-4xl font-bold text-slate-900">
            Companies Hiring Through FreelancerHub
          </h2>

          <p className="mt-5 text-slate-600 text-lg max-w-2xl mx-auto">
            Thousands of startups and enterprise companies trust our platform
            to discover top freelancers and build high-performing teams.
          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">


                      {companies.map((company, index) => (
            <div
              key={index}
              className="group bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className="mb-5 group-hover:scale-110 transition-transform duration-300">
                {company.icon}
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                {company.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}

        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="text-center">
            <h3 className="text-4xl font-bold text-blue-600">20K+</h3>
            <p className="text-slate-600 mt-2">Freelancers</p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-purple-600">15K+</h3>
            <p className="text-slate-600 mt-2">Projects Posted</p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-green-600">98%</h3>
            <p className="text-slate-600 mt-2">Success Rate</p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-orange-500">150+</h3>
            <p className="text-slate-600 mt-2">Countries</p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default TrustedCompanies;