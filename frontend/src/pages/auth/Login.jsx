import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary navigation until backend authentication is added
    navigate("/onboarding");
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
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-4
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-all
                  duration-200
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-transparent
                "
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-4
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-all
                  duration-200
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-transparent
                "
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
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
              </button>
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