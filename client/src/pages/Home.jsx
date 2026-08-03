import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowRight,
  FiSearch,
  FiStar,
  FiBriefcase,
  FiCheckCircle,
  FiUsers,
  FiShield,
  FiTrendingUp,
  FiCpu,
  FiClock,
  FiChevronRight
} from "react-icons/fi";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  // Automatically redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "client") navigate("/client");
      else if (user.role === "freelancer") navigate("/freelancer");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      // Mock routing or redirect to login to sign up and search
      navigate("/login");
    }
  };

  const categories = [
    { name: "Web Development", count: "12,400+ Freelancers", icon: FiCpu },
    { name: "UI/UX Design", count: "8,200+ Freelancers", icon: FiBriefcase },
    { name: "AI & Machine Learning", count: "3,100+ Freelancers", icon: FiCpu },
    { name: "Technical Writing", count: "5,500+ Freelancers", icon: FiCheckCircle },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white bg-gradient-mesh font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* 1. Header/Navbar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-lg font-display">F</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-display">
              FreelancerHub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#categories" className="hover:text-white transition">Categories</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:scale-[1.02] shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-indigo-400 text-xs font-semibold border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <FiStar className="fill-indigo-400/20 animate-pulse" />
            <span>The Professional Collaboration Engine</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight font-display bg-gradient-to-r from-white via-gray-100 to-gray-500 bg-clip-text text-transparent">
            Build Teams.<br />
            Collaborate.<br />
            Deliver Faster.
          </h1>

          <p className="text-gray-400 text-base lg:text-lg leading-relaxed max-w-xl">
            A premium, glassmorphic platform linking developers and designers with high-tier businesses. Manage contracts, tasks, and budgets with enterprise clarity.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="glass-card p-2 rounded-2xl border border-white/8 flex items-center max-w-lg shadow-xl shadow-black/40">
            <FiSearch className="text-gray-400 ml-3 mr-3 w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search skills, developers, projects..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 py-2.5"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition hover:scale-[1.02] shadow-md shadow-indigo-500/25 flex-shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* User Metrics Row */}
          <div className="flex flex-wrap items-center gap-8 pt-4">
            <div>
              <h4 className="text-2xl font-extrabold text-white font-display">20K+</h4>
              <p className="text-xs text-gray-500 mt-0.5">Top Freelancers</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <h4 className="text-2xl font-extrabold text-white font-display">150K+</h4>
              <p className="text-xs text-gray-500 mt-0.5">Projects Shipped</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <h4 className="text-2xl font-extrabold text-[#22C55E] font-display">99.2%</h4>
              <p className="text-xs text-gray-500 mt-0.5">Client Rating</p>
            </div>
          </div>
        </div>

        {/* Floating Mockup Visual */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="glass-card glow-border p-6 rounded-3xl w-full max-w-md shadow-2xl relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-500 font-mono ml-2">localhost:5173/dashboard</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="w-20 h-2 bg-indigo-500/30 rounded-full"></span>
                  <span className="w-10 h-3 bg-[#22C55E]/20 text-[#22C55E] text-[8px] font-bold uppercase rounded px-1.5">active</span>
                </div>
                <div className="w-32 h-3.5 bg-white/10 rounded-full"></div>
                <div className="w-full h-2 bg-white/5 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center"><FiTrendingUp /></div>
                  <div className="w-12 h-2.5 bg-white/10 rounded-full mt-3"></div>
                  <div className="w-16 h-4 bg-white/20 rounded-full mt-1.5"></div>
                </div>
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><FiUsers /></div>
                  <div className="w-12 h-2.5 bg-white/10 rounded-full mt-3"></div>
                  <div className="w-16 h-4 bg-white/20 rounded-full mt-1.5"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">S</div>
                  <div className="space-y-1">
                    <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full"></div>
                  </div>
                </div>
                <FiChevronRight className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider bg-indigo-500/10 px-3.5 py-1 rounded-full">
            Powerful Workspace Features
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-4 font-display">
            A New Standard for Collaboration
          </h2>
          <p className="text-gray-400 mt-3 text-sm">
            Everything your agency or development team needs to build, review, and settle milestones in one clean dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-[#6366F1]/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Direct Workspace Invites</h3>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Assemble client panels and developer teams under unified project contexts. Standardize communication and decrease email overhead.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-[#3B82F6]/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Real-Time Milestone Audits</h3>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Track checklisted tasks, code deliverables, and design scopes. Automatically link review tickets to payouts.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-green-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-6">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Escrow Payment Audits</h3>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Hold project budgets securely. Release funds automatically as milestones are finalized and approved by the workspace manager.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-display">Top Specializations</h2>
            <p className="text-gray-400 text-sm mt-1">Hire vetted experts across all technical fields</p>
          </div>
          <Link to="/register" className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1.5 transition">
            Explore All Categories <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 flex gap-4 items-center hover:bg-white/5 transition cursor-pointer">
              <div className="p-3.5 rounded-xl bg-white/5 text-indigo-400">
                <cat.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card p-12 rounded-3xl glow-border relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight relative z-10 font-display">
            Ready to Accelerate Your Deliverables?
          </h2>
          <p className="text-gray-400 mt-4 text-sm max-w-md relative z-10">
            Create your account today and experience the future of professional freelancer collaboration. Fully secure and modular.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8 relative z-10 justify-center">
            <Link
              to="/register"
              className="bg-white text-black hover:bg-gray-200 px-8 py-3.5 rounded-xl font-bold transition hover:scale-[1.02] shadow-lg text-sm"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition text-sm"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center">
              <span className="font-bold text-white text-sm">F</span>
            </div>
            <span className="font-bold text-white tracking-tight">FreelancerHub</span>
          </div>

          <p className="text-xs">&copy; 2026 FreelancerHub Inc. All rights reserved. Made for professional teams.</p>

          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;