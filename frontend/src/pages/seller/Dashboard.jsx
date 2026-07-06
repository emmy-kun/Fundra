import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  User,
  Eye,
  EyeOff,
  HandCoins,
  Wallet,
  ChevronRight,
  Clock3,
  Home,
  History,
  Plus,
} from "lucide-react";

import { motion } from "framer-motion";

import logo from "../../assets/images/logo.png";

import paying from "../../assets/images/paying.png";
import riskfree from "../../assets/images/risk free.png";
import trusted from "../../assets/images/trusted.png";
import verified from "../../assets/images/verified.png";

import { getProfile } from "../../services/authService";
import { getMyTransactions } from "../../services/transactionService";
import { getMyWallet } from "../../services/walletService";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ==========================================
      USER
  ========================================== */

  const [user, setUser] = useState(null);

  /* ==========================================
      DASHBOARD DATA
  ========================================== */

  const [sellerStats, setSellerStats] = useState({
    availableEarnings: 0,
    pendingRelease: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [wallet, setWallet] = useState(null);

  const [showBalance, setShowBalance] = useState(true);

  /* ==========================================
      SLIDER
  ========================================== */

  const slides = [
    {
      image: paying,
      title: "Secure Escrow",
      description:
        "Every buyer payment is securely protected until delivery is confirmed.",
    },

    {
      image: trusted,
      title: "Trusted Payments",
      description:
        "Build buyer confidence with Fundra's secure escrow system.",
    },

    {
      image: riskfree,
      title: "Risk-Free Selling",
      description:
        "Receive payment only after successful delivery confirmation.",
    },

    {
      image: verified,
      title: "Verified Transactions",
      description:
        "Every payment request is securely monitored and verified.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  /* ==========================================
      LOAD PROFILE
  ========================================== */

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile.data);
      } catch (err) {
        console.log(err);
      }

      try {
        const walletResponse = await getMyWallet();
        const walletData = walletResponse.data || {};
        setWallet(walletData);
        setSellerStats({
          availableEarnings: walletData.available_balance || 0,
          pendingRelease: walletData.escrow_balance || 0,
        });
      } catch (err) {
        console.log(err);
      }

      try {
        const transactionsResponse = await getMyTransactions();
        const transactions = transactionsResponse.data || [];
        setRecentRequests(transactions);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between mb-8">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <img
              src={logo}
              alt="Fundra"
              className="h-12 w-12 object-contain"
            />

            <div>

              <p className="text-sm text-gray-400">
                Welcome back,
              </p>

              <h1 className="text-2xl font-bold text-gray-900">

                {user?.first_name ||
                  user?.username ||
                  "Seller"}

              </h1>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/notifications")}
              className="
                relative
                h-11
                w-11
                rounded-xl
                border
                border-gray-200
                bg-white
                flex
                items-center
                justify-center
                hover:bg-gray-50
              "
            >
              <Bell size={20} />

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  h-5
                  w-5
                  rounded-full
                  bg-red-500
                  text-white
                  text-xs
                  flex
                  items-center
                  justify-center
                "
              >
                {recentRequests.filter(
                  (item) => item.status === "pending"
                ).length}
              </span>

            </button>

            <button
              onClick={() => navigate("/profile")}
              className="
                h-11
                w-11
                rounded-xl
                bg-gradient-to-r
                from-blue-700
                to-sky-500
                text-white
                flex
                items-center
                justify-center
              "
            >
              <User size={20} />
            </button>

          </div>

        </div>
        {/* ================= DASHBOARD GRID ================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT CONTENT */}

          <div className="xl:col-span-2 space-y-6">

            {/* ================= BALANCE CARD ================= */}

            <div
              className="
                rounded-3xl
                bg-gradient-to-br
                from-blue-700
                via-blue-600
                to-sky-500
                p-8
                text-white
                shadow-xl
              "
            >

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-blue-100 text-sm">
                    Available Earnings
                  </p>

                  <div className="flex items-center gap-3 mt-2">

                    <h2 className="text-4xl font-extrabold tracking-wide">

                      {showBalance
                        ? `$${Number(
                            sellerStats.availableEarnings
                          ).toLocaleString()}`
                        : "••••••••"}

                    </h2>

                    <button
                      onClick={() =>
                        setShowBalance(!showBalance)
                      }
                      className="text-white/90 hover:text-white"
                    >
                      {showBalance ? (
                        <EyeOff size={22} />
                      ) : (
                        <Eye size={22} />
                      )}
                    </button>

                  </div>

                </div>

                <div
                  className="
                    h-14
                    w-14
                    rounded-2xl
                    bg-white/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Wallet size={28} />
                </div>

              </div>

              {/* Pending */}

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4">

                <div>

                  <p className="text-blue-100 text-sm">
                    Pending Release
                  </p>

                  <h3 className="text-xl font-bold mt-1">

                    {showBalance
                      ? `$${Number(
                          sellerStats.pendingRelease
                        ).toLocaleString()}`
                      : "••••••"}

                  </h3>

                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-gray-900">
                    {recentRequests.filter((r) => r.status === "SHIPPED" || r.status === "PENDING" || r.status === "PROCESSING").length} Active
                  </span>
                  <button
                    onClick={() => navigate("/seller/transaction-history")}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30"
                  >
                    History
                  </button>
                </div>

              </div>

            </div>

            {/* ================= QUICK ACTIONS ================= */}

            <div className="grid md:grid-cols-2 gap-5">

              {/* REQUEST MONEY */}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: .98 }}
                onClick={() =>
                  navigate("/seller/refund-money")
                }
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-gray-100
                  p-6
                  shadow-sm
                  hover:shadow-lg
                  transition-all
                  text-left
                "
              >

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        h-14
                        w-14
                        rounded-2xl
                        bg-blue-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <HandCoins
                        size={28}
                        className="text-blue-700"
                      />
                    </div>

                    <div>

                      <h3 className="font-bold text-gray-900">
                        Refund Money
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Create a secure escrow refund
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={22}
                    className="text-gray-400"
                  />

                </div>

              </motion.button>

              {/* ACTIVE ESCROWS */}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: .98 }}
                onClick={() =>
                  navigate("/seller/transaction-history")
                }
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-gray-100
                  p-6
                  shadow-sm
                  hover:shadow-lg
                  transition-all
                  text-left
                "
              >

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        h-14
                        w-14
                        rounded-2xl
                        bg-amber-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Clock3
                        size={28}
                        className="text-amber-600"
                      />
                    </div>

                    <div>

                      <h3 className="font-bold text-gray-900">
                        Active Escrows
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        View all pending payments. 
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={22}
                    className="text-gray-400"
                  />

                </div>

              </motion.button>

            </div>
            </div>
                      {/* ================= RIGHT PANEL ================= */}

          <div className="space-y-6">

            {/* PROMO SLIDER */}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-72 object-cover transition-all duration-500"
              />

              <div className="p-6">

                <h3 className="text-xl font-bold text-gray-900">
                  {slides[currentSlide].title}
                </h3>

                <p className="text-gray-500 mt-2">
                  {slides[currentSlide].description}
                </p>

                <div className="flex justify-center gap-2 mt-6">

                  {slides.map((_, index) => (

                    <div
                      key={index}
                      className={`rounded-full transition-all duration-300 ${
                        currentSlide === index
                          ? "w-8 h-2 bg-blue-600"
                          : "w-2 h-2 bg-gray-300"
                      }`}
                    />

                  ))}

                </div>

              </div>

            </div>

            {/* Recent TransactionsS */}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between mb-6">

                <h3 className="text-lg font-bold text-gray-900">
                  Recent Transactions
                </h3>

                <button
                  onClick={() =>
                    navigate("/seller/transaction-history")
                  }
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  View All
                </button>

              </div>

              {recentRequests.length === 0 ? (

                <div className="py-10 text-center">

                  <Clock3
                    size={42}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-4 text-gray-500">
                    No recent Transactions yet.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {recentRequests.slice(0, 5).map((request) => (

                    <motion.div
                      key={request.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() =>
                        navigate(`/seller/transaction/${request.id}`)
                      }
                      className="
                        cursor-pointer
                        rounded-2xl
                        border
                        border-gray-100
                        p-4
                        hover:bg-gray-50
                        transition-all
                      "
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h4 className="font-semibold text-gray-900">
                            {request.buyer}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {request.product}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="font-bold text-gray-900">
                            $
                            {Number(
                              request.amount || 0
                            ).toLocaleString()}
                          </p>

                          <span
                            className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === "SUCCESSFUL"
                                ? "bg-green-100 text-green-700"
                                : request.status === "CANCELED"
                                ? "bg-red-100 text-red-700"
                                : request.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {request.status === "SUCCESSFUL"
                              ? "Completed"
                              : request.status === "CANCELED"
                              ? "Cancelled"
                              : request.status === "SHIPPED"
                              ? "Shipped"
                              : request.status === "PROCESSING"
                              ? "Processing"
                              : "Pending"}
                          </span>

                        </div>

                      </div>

                    </motion.div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">

        <div className="flex justify-around items-center h-16">

          <button
            onClick={() => navigate("/seller/dashboard")}
            className={`flex flex-col items-center ${
              location.pathname === "/seller/dashboard"
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <Home size={22} />
          </button>

          <button
            onClick={() =>
              navigate("/seller/refund-money")
            }
            className="
              -mt-8
              h-14
              w-14
              rounded-full
              bg-gradient-to-r
              from-blue-700
              via-blue-600
              to-sky-500
              text-white
              flex
              items-center
              justify-center
              shadow-xl
            "
          >
            <Plus size={28} />
          </button>

          <button
            onClick={() =>
              navigate("/seller/transaction-history")
            }
            className={`flex flex-col items-center ${
              location.pathname.includes("transaction")
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <History size={22} />
          </button>

        </div>

      </div>

    </div>
  );
}