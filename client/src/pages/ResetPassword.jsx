import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../api/axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetPassword = async () => {
    if (
      !formData.email ||
      !formData.otp ||
      !formData.newPassword
    ) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/change-password",
        formData
      );

      if (response.data.success) {
        toast.success(response.data.message);

        navigate("/login");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your OTP and new password
          </p>

        </div>
                {/* Email */}

        <div className="mb-5">

          <label className="font-medium mb-2 block">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full border rounded-xl py-3 px-4 outline-none focus:border-blue-500"
            value={formData.email}
            onChange={handleChange}
          />

        </div>

        {/* OTP */}

        <div className="mb-5">

          <label className="font-medium mb-2 block">
            OTP
          </label>

          <div className="relative">

            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
              value={formData.otp}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* New Password */}

        <div className="mb-6">

          <label className="font-medium mb-2 block">
            New Password
          </label>

          <div className="relative">

            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              className="w-full border rounded-xl py-3 pl-12 pr-12 outline-none focus:border-blue-500"
              value={formData.newPassword}
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
                {/* Reset Password Button */}

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300 disabled:opacity-60"
        >
          {loading ? "Updating Password..." : "Reset Password"}
        </button>
                {/* Back to Login */}

        <p className="text-center mt-8 text-gray-600">

          Remember your password?

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

export default ResetPassword;