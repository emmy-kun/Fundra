import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Store, Check } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";

export default function Onboarding() {
  const [role, setRole] = useState("buyer");
  const navigate = useNavigate();

  const handleContinue = () => {
    // Persist role to backend before continuing
    (async () => {
      try {
        const { updateRole } = await import('../../services/authService');
        await updateRole(role === 'buyer' ? 'BUYER' : 'SELLER');
      } catch (err) {
        // ignore failure; allow client-side flow
        console.error('Failed to persist role', err);
      } finally {
        navigate(
          role === "buyer"
            ? "/buyer/dashboard"
            : "/seller/dashboard"
        );
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <img
                src={logo}
                alt="Fundra Logo"
                className="h-14 w-14 object-contain"
              />

              <h1 className="text-4xl font-extrabold text-gray-900">
                Fundra
              </h1>
            </div>

            <p className="mt-4 text-gray-500 text-lg">
              Choose how you'd like to get started.
            </p>
          </div>

          {/* Role Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer */}
            <button
              onClick={() => setRole("buyer")}
              className={`relative cursor-pointer rounded-3xl border bg-white p-10 text-center transition-all duration-300 ${
                role === "buyer"
                  ? "border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              {role === "buyer" && (
                <div className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check size={18} />
                </div>
              )}

              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl transition-all duration-300 ${
                  role === "buyer"
                    ? "bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 text-white shadow-lg"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <ShoppingCart size={48} />
              </div>

              <h3 className="mt-8 text-2xl font-bold text-gray-900">
                I'm a Buyer
              </h3>

              <p className="mt-4 text-gray-500 leading-relaxed max-w-sm mx-auto">
                Purchase products securely and keep your money protected until
                you confirm that your order has been received.
              </p>
            </button>

            {/* Seller */}
            <button
              onClick={() => setRole("seller")}
              className={`relative cursor-pointer rounded-3xl border bg-white p-10 text-center transition-all duration-300 ${
                role === "seller"
                  ? "border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 scale-[1.02]"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              {role === "seller" && (
                <div className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check size={18} />
                </div>
              )}

              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl transition-all duration-300 ${
                  role === "seller"
                    ? "bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 text-white shadow-lg"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Store size={48} />
              </div>

              <h3 className="mt-8 text-2xl font-bold text-gray-900">
                I'm a Seller
              </h3>

              <p className="mt-4 text-gray-500 leading-relaxed max-w-sm mx-auto">
                Sell products confidently and receive payment only after buyers
                confirm successful delivery.
              </p>
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Your role can be changed later from your profile settings.
          </p>

          {/* Continue Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleContinue}
              className="
                cursor-pointer
                rounded-2xl
                bg-gradient-to-r
                from-blue-800
                via-blue-600
                to-sky-500
                px-16
                py-4
                font-semibold
                text-white
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:shadow-xl
                hover:shadow-blue-200
                active:scale-[0.98]
              "
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}