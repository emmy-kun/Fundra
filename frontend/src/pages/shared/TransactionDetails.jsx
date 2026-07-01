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
import { getTransactionById } from "../../services/transactionService";

const STATUS_LABEL = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  SUCCESSFUL: "Completed",
  CANCELED: "Cancelled",
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

  useEffect(() => {
    const fetchTransaction = async () => {
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
                <div className="inline-flex mt-5 items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                  <Clock3 size={16} />
                  {status === "SUCCESSFUL" ? "Completed" : STATUS_LABEL[status] || status}
                </div>
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
                <button
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 py-4 text-white font-semibold hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                >
                  I Have Received My Order
                </button>
                <button
                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-4 text-red-600 font-semibold hover:bg-red-100 transition-all cursor-pointer"
                >
                  Cancel Payment
                </button>
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
