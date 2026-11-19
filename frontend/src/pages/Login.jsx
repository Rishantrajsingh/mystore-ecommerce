import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomer } from "../api/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const data = await loginCustomer(email, password);

      setMessage(`Welcome ${data.name}! Login successful.`);
      setMessageType("success");

      setTimeout(() => {
        navigate("/products", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Login Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Invalid email or password. Please try again.",
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
              Everything you need, all in one place.
            </h1>

            <p className="text-blue-100 mt-6 leading-relaxed">
              Discover great products, manage your shopping cart and keep track
              of all your orders with MyStore.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <p className="text-lg font-semibold">Welcome to MyStore!</p>

            <p className="text-blue-100 text-sm mt-2">
              Your shopping journey starts here.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-10 md:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>

            <span className="text-2xl font-bold text-slate-800">MyStore</span>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Welcome Back
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Login to your account
            </h2>

            <p className="text-slate-500 mt-3">
              Enter your details to continue shopping.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ✉
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-11 pr-16 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Login to MyStore →"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Register Link */}
          <div className="border-t border-slate-100 mt-8 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                Create Account
              </Link>
            </p>
          </div>

          <p className="text-xs text-center text-slate-400 mt-5">
            Secure login powered by MyStore
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
