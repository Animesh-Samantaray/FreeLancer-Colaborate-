import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrustedCompanies from "../components/landing/TrustedCompanies";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import PopularCategories from "../components/landing/PopularCategories";
import TopFreelancers from "../components/landing/TopFreelancers";
import Statistics from "../components/landing/Statistics";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <HowItWorks />
      <PopularCategories />
      <TopFreelancers />
      <Statistics />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;