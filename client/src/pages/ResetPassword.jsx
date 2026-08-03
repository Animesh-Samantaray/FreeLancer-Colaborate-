import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaKey, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    inputOtp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.email) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.inputOtp.trim()) {
      toast.error("OTP Code is required");
      return false;
    }
    if (!formData.newPassword) {
      toast.error("New password is required");
      return false;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await api.post("/auth/change-password", formData);

      if (response.data.success) {
        toast.success(response.data.message || "Password updated successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Reset password component error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-mesh">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-card glow-border p-8 rounded-3xl shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-2xl font-display">F</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-display">
              Reset Password
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Enter the OTP code sent to your email and your new password
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Email Field */}
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

            {/* OTP Field */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                OTP Verification Code
              </label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="inputOtp"
                  placeholder="Enter 6-digit OTP code"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm"
                  value={formData.inputOtp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl py-2.5 pl-12 pr-12 text-sm"
                  value={formData.newPassword}
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

            {/* Reset Button */}
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
                  <span>Updating Password...</span>
                </div>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            Remembered your password?
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

export default ResetPassword;