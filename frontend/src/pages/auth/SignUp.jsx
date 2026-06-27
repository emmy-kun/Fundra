import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import { signup, login } from "../../services/authService";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", password_confirm: "", role: "BUYER" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Build payload: avoid spaces in username by using email local part; send full name as first_name
      const usernameDerived = form.email ? form.email.split('@')[0] : form.fullName.replace(/\s+/g, '_');
      const payload = {
        username: usernameDerived,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.fullName,
      };

      await signup(payload);

      // Auto-login after signup so onboarding and protected routes work
      await login({ username: usernameDerived, password: form.password });
      navigate("/onboarding");
    } catch (err) {
      const detail = err?.response?.data;
      setError(typeof detail === "string" ? detail : Object.values(detail || {}).flat().join(" "));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-10"
        >
          {/* Logo & Header */}
          <div className="text-center">
            <img
              src={logo}
              alt="Fundra Logo"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
              Fundra
            </h1>

            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Create your account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
                py-4
                font-semibold
                text-white
                transition-all
                duration-300
                hover:shadow-xl
                hover:scale-[1.01]
                active:scale-[0.98]
              "
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="cursor-pointer font-semibold text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}