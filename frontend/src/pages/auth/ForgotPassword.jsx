import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import { forgotPassword, resetPassword } from "../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("send");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const response = await forgotPassword({ email });
      setMessage(
        response.data?.message ||
          "If an account exists for that email, a reset code has been sent."
      );
      if (response.data?.code) {
        setMessage(
          `${response.data.message || "Reset code sent."} Your reset code is ${response.data.code}.`
        );
      }
      setStage("reset");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to send password reset code."
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !code || !newPassword || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({
        email,
        code,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setMessage(response.data?.message || "Password reset successfully.");
      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to reset password."
      );
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
          <div className="text-center">
            <img
              src={logo}
              alt="Fundra Logo"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your account email to receive a password reset code.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {stage === "reset" && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Reset code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reset code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {message ? (
              <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3">
              {stage === "send" ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                >
                  Send reset code
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                >
                  Reset password
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
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
