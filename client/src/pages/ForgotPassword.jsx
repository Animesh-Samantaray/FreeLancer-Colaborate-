import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
  if (!email) {
    return toast.error("Please enter your email");
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/send-reset-otp", {
      email,
    });

    if (response.data.success) {
      toast.success(response.data.message);
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to send OTP"
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
            Forgot Password
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your email to receive an OTP.
          </p>

        </div>

        {/* Email */}

        <div className="mb-6">

          <label className="font-medium mb-2 block">
            Email
          </label>

          <div className="relative">

            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

        </div>
                {/* Send OTP Button */}

        <button
           type="button"
           onClick={handleSendOTP}
           disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300 disabled:opacity-60"
            >
          {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;