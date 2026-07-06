import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Mail,
  Wallet,
  Calendar,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { getProfile } from "../../services/authService";
import {
  cancelTransaction,
  confirmDelivery,
  getTransactionById,
  updateTransactionStatus,
} from "../../services/transactionService";

const STATUS_LABEL = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  SUCCESSFUL: "Completed",
  CANCELED: "Cancelled",
};

const STATUS_OPTIONS = {
  PENDING: [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
  ],
  PROCESSING: [
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
  ],
  SHIPPED: [{ value: "SHIPPED", label: "Shipped" }],
};

const getStatusBadge = (status) => {
  if (status === "PENDING" || status === "PROCESSING") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
        <Clock3 size={16} />
        {STATUS_LABEL[status] || status}
      </div>
    );
  }

  if (status === "SUCCESSFUL" || status === "SHIPPED") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
        <ShieldCheck size={16} />
        {STATUS_LABEL[status] || status}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium">
      <Receipt size={16} />
      {STATUS_LABEL[status] || "Cancelled"}
    </div>
  );
};

export default function TransactionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const profile = await getProfile();
        setRole(profile.data?.role || null);
      } catch (err) {
        setRole(null);
      }

      try {
        const response = await getTransactionById(id);
        setTransaction(response.data);
      } catch (err) {
        setError("Unable to load transaction details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="p-6 text-center text-gray-500">Loading transaction details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="p-6 text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const status = transaction?.status || "PENDING";
  const formattedAmount = transaction ? `$${Number(transaction.amount).toFixed(2)}` : "";
  const formattedDate = transaction ? new Date(transaction.created_at).toLocaleString() : "";
  const sellerEmail = transaction?.seller?.email || transaction?.seller?.username || "Seller";
  const statusOptions = STATUS_OPTIONS[status] || [{ value: status, label: STATUS_LABEL[status] || status }];
  const isBuyer = role === "BUYER";
  const isSeller = role === "SELLER";

  const refreshTransaction = async () => {
    const response = await getTransactionById(id);
    setTransaction(response.data);
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    setError(null);

    try {
      if (isSeller) {
        if (action === "processing") {
          await updateTransactionStatus(id, { status: "PROCESSING" });
        } else if (action === "shipped") {
          await updateTransactionStatus(id, { status: "SHIPPED" });
        } else if (action === "refund") {
          await updateTransactionStatus(id, { status: "CANCELED" });
        }
      } else if (isBuyer) {
        if (action === "cancel") {
          await cancelTransaction(id);
        } else if (action === "confirm") {
          await confirmDelivery(id);
        }
      }

      await refreshTransaction();
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update this transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!isSeller || nextStatus === status || actionLoading) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await updateTransactionStatus(id, { status: nextStatus });
      await refreshTransaction();
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update this transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-500 text-sm">Transaction #{transaction.id}</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              {/* Amount */}
              <div className="text-center border-b border-gray-100 pb-8">
                <p className="text-sm text-gray-500">Escrow Payment</p>
                <h2 className="text-6xl font-extrabold text-gray-900 mt-3">{formattedAmount}</h2>
                {getStatusBadge(status)}
              </div>

              {/* Details */}
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-600" />
                    <span className="text-gray-600">Seller Email</span>
                  </div>
                  <span className="font-semibold text-gray-900">{sellerEmail}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Wallet size={18} className="text-blue-600" />
                    <span className="text-gray-600">Amount</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formattedAmount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-blue-600" />
                    <span className="text-gray-600">Date</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formattedDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col md:flex-row gap-4">
                {isSeller ? (
                  <>
                    {status === "PENDING" ? (
                      <button
                        onClick={() => handleAction("processing")}
                        disabled={actionLoading}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 py-4 text-white font-semibold hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "Mark as Processing"}
                      </button>
                    ) : null}
                    {status === "PROCESSING" ? (
                      <button
                        onClick={() => handleAction("shipped")}
                        disabled={actionLoading}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 py-4 text-white font-semibold hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "I have received my item"}
                      </button>
                    ) : null}
                    {(status === "PENDING" || status === "PROCESSING") ? (
                      <button
                        onClick={() => handleAction("refund")}
                        disabled={actionLoading}
                        className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-4 text-red-600 font-semibold hover:bg-red-100 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "Refund Buyer"}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    {(status === "PENDING" || status === "PROCESSING") ? (
                      <button
                        onClick={() => handleAction("cancel")}
                        disabled={actionLoading || status === "SHIPPED"}
                        className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-4 text-red-600 font-semibold hover:bg-red-100 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {actionLoading ? "Working..." : "Cancel Payment"}
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleAction("confirm")}
                      disabled={actionLoading || status !== "SHIPPED"}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 py-4 text-white font-semibold hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-60"
                    >
                      {actionLoading ? "Working..." : "I have received my order"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Escrow Protection</h3>
                  <p className="text-xs text-gray-500">Buyer Protection Active</p>
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  Your payment is currently held securely by Fundra. Funds will only be released after you confirm receipt of your order.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Transaction Status</h3>
              </div>

              {isSeller ? (
                <div className="space-y-3">
                  <label htmlFor="transaction-status" className="text-sm font-medium text-gray-700">
                    Update the current progress
                  </label>
                  <select
                    id="transaction-status"
                    value={status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    disabled={actionLoading || status === "SUCCESSFUL" || status === "CANCELED"}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Status can only move forward and cannot be reverted once updated.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Current progress: {STATUS_LABEL[status] || status}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Transaction ID</h3>
              </div>
              <p className="text-gray-700 font-mono text-sm break-all">TXN-{transaction.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
