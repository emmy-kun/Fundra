import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import { signup, login, checkUsername } from "../../services/authService";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", username: "", email: "", phone_number: "", password: "", password_confirm: "", role: "BUYER" });
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Build payload
      const payload = {
        username: form.username,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      };

      await signup(payload);

      // Auto-login after signup so onboarding and protected routes work
      await login({ username: form.username, password: form.password });
      navigate("/onboarding");
    } catch (err) {
      const detail = err?.response?.data;
      setError(typeof detail === "string" ? detail : Object.values(detail || {}).flat().join(" "));
    }
  };

  // Check username availability
  const handleCheckUsername = async (value) => {
    if (!value) {
      setUsernameAvailable(null);
      setSuggestions([]);
      return;
    }

    try {
      const res = await checkUsername(value);
      setUsernameAvailable(res.data.available);
      if (!res.data.available) {
        // suggest alternatives
        const base = value.replace(/[^a-z0-9]/gi, '');
        const alt = [base + Math.floor(Math.random() * 90 + 10), base + '_' + Math.floor(Math.random() * 900 + 100)];
        setSuggestions(alt);
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      setUsernameAvailable(null);
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
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">First Name</label>
                <input type="text" placeholder="John" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Last Name</label>
                <input type="text" placeholder="Doe" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Username</label>
              <input type="text" placeholder="username" value={form.username} onChange={(e) => { setForm({ ...form, username: e.target.value }); handleCheckUsername(e.target.value); }} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />

              {usernameAvailable === true && <p className="text-sm text-green-600">Username is available</p>}
              {usernameAvailable === false && (
                <div>
                  <p className="text-sm text-red-600">Username is taken. Suggestions:</p>
                  <div className="flex gap-2 mt-2">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, username: s })} className="px-2 py-1 rounded bg-gray-100 text-sm">{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Phone Number</label>
              <input type="tel" placeholder="+234 812 345 6789" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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