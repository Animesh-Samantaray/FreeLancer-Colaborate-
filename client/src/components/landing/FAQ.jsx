import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

function FAQ() {
  const faqs = [
    {
      question: "How do I hire a freelancer?",
      answer:
        "Create an account, post your project, review freelancer profiles, and hire the best candidate for your work.",
    },
    {
      question: "How are payments secured?",
      answer:
        "Payments are protected using milestone-based escrow. Funds are released only after approved work.",
    },
    {
      question: "Can I work as a freelancer from any country?",
      answer:
        "Yes. FreelancerHub is available globally, allowing freelancers and clients to collaborate from anywhere.",
    },
    {
      question: "Does FreelancerHub provide real-time chat?",
      answer:
        "Yes. Clients and freelancers can communicate instantly through our built-in messaging system.",
    },
    {
      question: "Is there any service fee?",
      answer:
        "A small service fee is charged depending on the project value. Full pricing will be available on the Pricing page.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-24 bg-slate-50">

      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="bg-blue-100 text-blue-600 px-5 py-2 rounded-full font-semibold">
            Frequently Asked Questions
          </span>

          <h2 className="text-5xl font-bold text-slate-900 mt-6">
            Got Questions?
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            Everything you need to know about FreelancerHub.
          </p>

        </div>

        <div className="space-y-6">

                      {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-slate-50 transition"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {faq.question}
                </h3>

                <div className="text-blue-600">
                  {openIndex === index ? <FaMinus /> : <FaPlus />}
                </div>
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-6 text-slate-600 leading-8">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Bottom Help Box */}

        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">

          <h3 className="text-4xl font-bold">
            Still Have Questions?
          </h3>

          <p className="mt-5 text-lg text-blue-100 max-w-2xl mx-auto">
            Our support team is available to help you with hiring,
            freelancing, payments, and platform-related questions.
          </p>

          <button className="mt-8 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition duration-300">
            Contact Support
          </button>

        </div>

      </div>

    </section>
  );
}

export default FAQ;