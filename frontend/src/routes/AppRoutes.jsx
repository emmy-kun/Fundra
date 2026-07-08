import { useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

import SignUp from "../pages/auth/SignUp";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Onboarding from "../pages/auth/Onboarding";

import BuyerDashboard from "../pages/buyer/Dashboard";
import AddMoney from "../pages/shared/AddMoney";
import SendMoney from "../pages/buyer/SendMoney";
import Withdraw from "../pages/shared/Withdraw";
import SellerDashboard from "../pages/seller/Dashboard";
import RefundMoney from "../pages/seller/RefundMoney";

import TransactionHistory from "../pages/shared/TransactionHistory";
import TransactionDetails from "../pages/shared/TransactionDetails";
import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import Settings from "../pages/settings/Settings";
import ProtectedRoute from "./ProtectedRoute";
import { getProfile } from "../services/authService";
import RequestMoney from "../pages/seller/RequestMoney";

function RootRedirect() {
  const [role, setRole] = useState(undefined);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setRole(null);
      setChecking(false);
      return;
    }

    let isMounted = true;

    const loadRole = async () => {
      try {
        const response = await getProfile();
        if (isMounted) {
          setRole(response.data?.role || null);
        }
      } catch (error) {
        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-600">
        Loading...
      </div>
    );
  }

  if (!localStorage.getItem("accessToken") || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "SELLER") {
    return <Navigate to="/seller/dashboard" replace />;
  }

  if (role === "BUYER") {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      <Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/buyer/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
      <Route path="/buyer/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
      <Route path="/buyer/send-money" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />

      <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/refund-money" element={<ProtectedRoute><RefundMoney /></ProtectedRoute>} />
      <Route path="/seller/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      <Route path="/seller/transactions/:id" element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>} />

      <Route path="/buyer/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>} />
      <Route path="/buyer/transactions/:id" element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/seller/request-money" element={<ProtectedRoute><RequestMoney /></ProtectedRoute>} />
    </Routes>
  );
}
