import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  User,
  Eye,
  EyeOff,
  Plus,
  Send,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Home,
  History,
} from "lucide-react";

import logo from "../../assets/images/logo.png";
import paying from "../../assets/images/paying.png";
import riskfree from "../../assets/images/risk free.png";
import trusted from "../../assets/images/trusted.png";
import verified from "../../assets/images/verified.png";
import { motion } from "framer-motion";
import { getProfile } from '../../services/authService';
import { getMyWallet } from '../../services/walletService';
import { getMyTransactions } from '../../services/transactionService';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactionsList, setTransactionsList] = useState([]);
  const [showBalance, setShowBalance] = useState(true);

  const pendingCount = transactionsList.filter(
    (t) => t.status === "PENDING" || t.status === "PROCESSING"
  ).length;

  const slides = [
    {
      image: paying,
      title: "Secure Payments",
      description:
        "Send money confidently through Fundra's protected payment system.",
    },
    {
      image: riskfree,
      title: "Risk-Free Transactions",
      description: "Funds remain protected until buyers confirm delivery.",
    },
    {
      image: trusted,
      title: "Trusted Escrow Protection",
      description: "Built to create trust between buyers and sellers.",
    },
    {
      image: verified,
      title: "Verified Payments",
      description: "Every transaction is authenticated and securely tracked.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile.data);
      } catch (err) {
        // ignore - user may not be authenticated in dev
      }

      try {
        const walletRes = await getMyWallet();
        setBalance(Number(walletRes.data.available_balance || 0));
      } catch (err) {
        // ignore
      }

      try {
        const txRes = await getMyTransactions();
        setTransactionsList(txRes.data || []);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MAIN WRAPPER */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Fundra Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <p className="text-sm text-gray-400">Welcome back,</p>

              <h1 className="text-2xl font-bold text-gray-900">
                {user?.first_name || user?.username || "User"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Bell size={20} />

              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <User size={20} className="text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BALANCE CARD */}
          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm">Available Balance</p>

                <h2 className="mt-3 text-4xl font-extrabold">
                  {showBalance ? `$${Number(balance).toFixed(2)}` : "••••••••"}
                </h2>
              </div>

              <button
                onClick={() => setShowBalance(!showBalance)}
                className="cursor-pointer bg-white/20 hover:bg-white/30 transition-all p-3 rounded-xl"
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/buyer/add-money")}
                className="cursor-pointer bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Add Funds
              </button>

              <button
                onClick={() => navigate("/buyer/withdraw")}
                className="cursor-pointer bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl font-semibold transition-all"
              >
                Withdraw
              </button>
            </div>

            {/* TRANSACTION HISTORY */}
            <button
              className="mt-8 w-full bg-white/15 hover:bg-white/25 transition-all rounded-2xl p-4 flex items-center justify-between cursor-pointer"
              onClick={() => navigate("/buyer/transaction-history")}
            >
              <span className="font-medium">Transaction History</span>

              <div className="flex items-center gap-3">
                {pendingCount > 0 ? (
                  <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                    {pendingCount} Pending
                  </span>
                ) : null}

                <ChevronRight size={18} />
              </div>
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-5">
              Quick Actions
            </h3>

            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => navigate("/buyer/send-money")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Send size={20} />
                  </div>

                  <span className="font-medium">Send Money</span>
                </div>

                <ChevronRight size={18} />
              </button>

              {/* <button
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => navigate("/buyer/request-money")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Plus size={20} />
                  </div>

                  <span className="font-medium">Request Money</span>
                </div>

                <ChevronRight size={18} />
              </button> */}

              <button
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => navigate("/buyer/transaction-history")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>

                  <span className="font-medium">Transaction History</span>
                </div>

                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* FUNDRA SLIDER */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-full min-h-[420px]">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-[320px] object-cover transition-all duration-700"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {slides[currentSlide].title}
                </h3>

                <p className="mt-2 text-gray-500">
                  {slides[currentSlide].description}
                </p>

                <div className="flex justify-center gap-2 mt-6">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === index
                          ? "w-8 bg-blue-600"
                          : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-5">
              Recent Transactions
            </h3>

            <div className="space-y-4">
              {transactionsList && transactionsList.length > 0 ? (
                transactionsList.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div>
                          {item.status === "SUCCESSFUL" && (
                            <CheckCircle2 size={22} className="text-green-500" />
                          )}

                          {(item.status === "PENDING" || item.status === "PROCESSING" || item.status === "SHIPPED") && (
                            <Clock3 size={22} className="text-amber-500" />
                          )}

                          {item.status === "CANCELED" && (
                            <RotateCcw size={22} className="text-red-500" />
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.status}
                          </h4>

                          <p className="text-sm text-gray-500">{item.seller?.username || item.buyer?.username}</p>

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-gray-900">
                        ${Number(item.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV ONLY */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 backdrop-blur-lg">
        <div className="flex justify-around items-center h-16">
          {/* HOME */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/buyer/dashboard")}
            className={`flex flex-col items-center transition-all duration-300 ${
              location.pathname === "/buyer/dashboard"
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <Home size={20} />

            {location.pathname === "/buyer/dashboard" && (
              <motion.div
                layoutId="activeNav"
                className="mt-1 h-1 w-5 rounded-full bg-blue-600"
              />
            )}
          </motion.button>

          {/* CENTER ACTION */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/buyer/send-money")}
            className="
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
        -mt-8
        shadow-2xl
      "
          >
            <Plus size={26} />
          </motion.button>

          {/* HISTORY */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/buyer/transaction-history")}
            className={`flex flex-col items-center transition-all duration-300 ${
              location.pathname.includes("transaction")
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <History size={20} />

            {location.pathname.includes("transaction") && (
              <motion.div
                layoutId="activeNav"
                className="mt-1 h-1 w-5 rounded-full bg-blue-600"
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
