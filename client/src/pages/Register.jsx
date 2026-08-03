import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  admin_access_token: "",
});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.role) {
  toast.error("Please select a role");
  return false;
}

if (
  formData.role === "admin" &&
  !formData.admin_access_token.trim()
) {
  toast.error("Admin access token is required");
  return false;
}
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Calls POST /api/auth/register
      const response = await api.post("/register", formData);

      if (response.data.success) {
        toast.success(response.data.message || "Registration successful! Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Register component error:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleLogin = (role) => {
  if (!role) {
    toast.error("Please select a role first.");
    return;
  }

  window.location.href = `http://localhost:5000/api/auth/google?role=${role}`;
};

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-mesh">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-card glow-border p-8 rounded-3xl shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-2xl font-display">F</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-display">
              Create Account
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Join us to collaborate with freelancers or find projects
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-12 text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {formData.role === "admin" && (
  <div>
    <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
      Admin Access Token
    </label>

    <input
      type="password"
      name="admin_access_token"
      placeholder="Enter admin token"
      value={formData.admin_access_token}
      onChange={handleChange}
      className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
    />
  </div>
)}

            {/* Role Dropdown */}
            <div>
  <label className="text-xs font-semibold text-gray-300 mb-3 block uppercase tracking-wider">
    Choose Your Role
  </label>

  <div className="grid grid-cols-3 gap-3">

    <button
      type="button"
      onClick={() =>
        setFormData({ ...formData, role: "client" })
      }
      className={`rounded-xl p-4 border transition-all ${
        formData.role === "client"
          ? "border-indigo-500 bg-indigo-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="text-2xl mb-2">🏢</div>
      <div className="font-semibold text-white">
        Client
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Hire Freelancers
      </p>
    </button>

    <button
      type="button"
      onClick={() =>
        setFormData({ ...formData, role: "freelancer" })
      }
      className={`rounded-xl p-4 border transition-all ${
        formData.role === "freelancer"
          ? "border-indigo-500 bg-indigo-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="text-2xl mb-2">👨‍💻</div>
      <div className="font-semibold text-white">
        Freelancer
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Find Projects
      </p>
    </button>

    <button
      type="button"
      onClick={() =>
        setFormData({ ...formData, role: "admin" })
      }
      className={`rounded-xl p-4 border transition-all ${
        formData.role === "admin"
          ? "border-red-500 bg-red-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="text-2xl mb-2">🛡️</div>
      <div className="font-semibold text-white">
        Admin
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Manage Platform
      </p>
    </button>

  </div>
</div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/35 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span>Register Now</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[rgba(255,255,255,0.08)]"></div>
            <span className="px-4 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              Or Sign Up With
            </span>
            <div className="flex-1 border-t border-[rgba(255,255,255,0.08)]"></div>
          </div>

          {/* Google Register */}
         {formData.role !== "admin" && (
  <button
    type="button"
    onClick={() =>
      handleGoogleLogin(formData.role)
    }
    className="w-full glass-input rounded-xl py-2.5 flex justify-center items-center gap-3 hover:bg-white/5 transition-all"
  >
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google"
      className="w-5 h-5"
    />

    Continue with Google
  </button>
)}

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?
            <Link
              to="/login"
              className="text-[#6366F1] font-semibold ml-1.5 hover:text-[#3B82F6] hover:underline transition"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;