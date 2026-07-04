import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import { login, getProfile } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login({ username: form.username, password: form.password });

      try {
        const profile = await getProfile();
        const role = profile.data.role;
        navigate(role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard');
      } catch (e) {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to sign in right now.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 sm:p-10"
        >
          {/* Logo & Brand */}
          <div className="text-center">
            <img
              src={logo}
              alt="Fundra Logo"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
              Fundra
            </h1>

            <h2 className="mt-1 text-lg text-gray-900">
              Welcome back
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Username
              </label>

              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  setError("");
                }}
                className={`
                  w-full
                  rounded-2xl
                  border
                  px-3
                  py-3
                  text-sm
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-all
                  duration-200
                  focus:border-transparent
                  ${error ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-blue-500"}
                `}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setError("");
                }}
                className={`
                  w-full
                  rounded-2xl
                  border
                  px-3
                  py-3
                  text-sm
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-all
                  duration-200
                  focus:border-transparent
                  ${error ? "border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-blue-500"}
                `}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="
                  text-sm
                  font-medium
                  text-blue-600
                  cursor-pointer
                  transition-all
                  duration-200
                  hover:text-blue-700
                  hover:underline
                "
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="
                w-full
                cursor-pointer
                rounded-2xl
                bg-gradient-to-r
                from-blue-700
                via-blue-600
                to-sky-500
                py-3
                font-semibold
                text-white
                transition-all
                duration-300
                hover:shadow-xl
                hover:scale-[1.01]
                active:scale-[0.98]
              "
            >
              Log In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="
                cursor-pointer
                font-semibold
                text-blue-600
                transition-all
                duration-200
                hover:text-blue-700
                hover:underline
              "
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}