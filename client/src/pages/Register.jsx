import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
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
    password: "",
    role: "client",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async () => {
  if (
    !formData.fullName ||
    !formData.email ||
    !formData.password
  ) {
    return toast.error("Please fill all fields");
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/register", formData);

    if (response.data.success) {
      toast.success(response.data.message);

      navigate("/login");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Registration Failed"
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
            Create your account
          </p>

        </div>

        {/* Full Name */}

        <div className="mb-5">

          <label className="font-medium mb-2 block">
            Full Name
          </label>

          <div className="relative">

            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
              value={formData.fullName}
              onChange={handleChange}
            />

          </div>

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

        <div className="mb-5">

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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

        </div>
                {/* Role */}

        <div className="mb-6">

          <label className="font-medium mb-2 block">
            Register As
          </label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-xl py-3 px-4 outline-none focus:border-blue-500"
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>

        </div>
                {/* Register Button */}

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
                {/* Login */}

        <p className="text-center mt-8 text-gray-600">

          Already have an account?

          <Link
            to="/login"
            className="text-blue-600 font-semibold ml-2 hover:underline"
          >
            Login
          </Link>

        </p>
              </div>

    </div>
  );
}

export default Register;