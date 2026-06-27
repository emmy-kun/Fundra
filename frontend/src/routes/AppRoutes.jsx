import { Routes, Route } from "react-router-dom";

import SignUp from "../pages/auth/SignUp";
import Login from "../pages/auth/Login";
import Onboarding from "../pages/auth/Onboarding";

import BuyerDashboard from "../pages/buyer/Dashboard";
import AddMoney from "../pages/buyer/AddMoney";
import SendMoney from "../pages/buyer/SendMoney";
import Withdraw from "../pages/buyer/Withdraw";

import TransactionHistory from "../pages/shared/TransactionHistory";
import TransactionDetails from "../pages/shared/TransactionDetails";
import Notifications from "../pages/notifications/Notifications";
import Profile from "../pages/profile/Profile";
import Settings from "../pages/settings/Settings";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/buyer/add-money" element={<AddMoney />} />
      <Route path="/buyer/withdraw" element={<Withdraw />} />
      <Route path="/buyer/send-money" element={<SendMoney />} />

      <Route
        path="/buyer/transaction-history"
        element={<TransactionHistory />}
      />
      <Route path="/transactions/:id" element={<TransactionDetails />} />

      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route
  path="/settings"
  element={<Settings />}
/>
    </Routes>
  );
}
