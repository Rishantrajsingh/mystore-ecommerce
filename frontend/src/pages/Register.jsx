import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../api/authApi";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Password and Confirm Password do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      await registerCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setMessage("Registration successful! Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Registration Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-between bg-blue-600 p-10 lg:p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-2xl font-bold">M</span>
              </div>

              <span className="text-2xl font-bold">MyStore</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Start your shopping journey with us.
            </h1>

            <p className="text-blue-100 mt-6 leading-relaxed">
              Create your account to explore products, manage your shopping cart
              and track your orders.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <p className="text-lg font-semibold">Join MyStore Today!</p>

            <p className="text-blue-100 text-sm mt-2">
              Create your account and enjoy a simple shopping experience.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="p-7 sm:p-10 lg:p-12">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-8 md:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>

            <span className="text-2xl font-bold text-slate-800">MyStore</span>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Create Account
            </p>

            <h2 className="text-3xl font-bold text-slate-900">Join MyStore</h2>

            <p className="text-slate-500 mt-3">
              Enter your details to create your account.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                disabled={loading}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
                disabled={loading}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                disabled={loading}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Show Password */}
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 accent-blue-600"
              />
              Show Password
            </label>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-xl text-sm font-medium ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          {/* Login Link */}
          <div className="border-t border-slate-100 mt-7 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
