import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { setUser, checkAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
  if (!formData.email || !formData.password) {
    return toast.error("Please fill all fields");
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/login", formData);

    if (response.data.success) {
      toast.success(response.data.message);

      setUser(response.data.user);

      await checkAuth();

      navigate("/");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Login Failed"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

        {/* Logo */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FreelancerHub
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome Back 👋
          </p>

        </div>

        {/* Email */}

        <div className="mb-5">

          <label className="font-medium mb-2 block">
            Email
          </label>

          <div className="relative">

            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* Password */}

        <div className="mb-6">

          <label className="font-medium mb-2 block">
            Password
          </label>

          <div className="relative">

            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="w-full border rounded-xl py-3 pl-12 pr-12 outline-none focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

        </div>

                {/* Forgot Password */}

        <div className="flex justify-end mb-6">

          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login Button */}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}

        <div className="flex items-center my-7">

          <div className="flex-1 border-t"></div>

          <span className="px-4 text-gray-500 text-sm">
            OR
          </span>

          <div className="flex-1 border-t"></div>

        </div>

        {/* Google Login */}

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "http://localhost:5000/api/auth/google";
          }}
          className="w-full border border-gray-300 rounded-xl py-3 flex justify-center items-center gap-3 hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />

          Continue with Google
        </button>

        {/* Register */}

        <p className="text-center mt-8 text-gray-600">

          Don't have an account?

          <Link
            to="/register"
            className="text-blue-600 font-semibold ml-2 hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;