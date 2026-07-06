import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getProfile } from "../../services/authService";
import {
  cancelTransaction,
  confirmDelivery,
  getMyTransactions,
  updateTransactionStatus,
} from "../../services/transactionService";

const FILTERS = {
  ALL: "All",
  ACTIVE: "Active",
  REFUNDED: "Refunded",
};

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [processingId, setProcessingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await getMyTransactions();
      setTransactions(response.data || []);
    } catch (err) {
      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getProfile();
        setRole(profile.data?.role || null);
      } catch (err) {
        setRole(null);
      }

      await fetchTransactions();
    };

    loadData();
  }, []);

  const getStatusBadge = (status) => {
    if (status === "PENDING" || status === "PROCESSING") {
      return (
        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
          <Clock3 size={14} />
          {status === "PROCESSING" ? "Processing" : "Pending"}
        </div>
      );
    }

    if (status === "SUCCESSFUL" || status === "SHIPPED") {
      return (
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle2 size={14} />
          {status === "SHIPPED" ? "Shipped" : "Completed"}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium">
        <XCircle size={14} />
        Cancelled
      </div>
    );
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === FILTERS.ACTIVE) {
      return ["PENDING", "PROCESSING", "SHIPPED"].includes(transaction.status);
    }

    if (filter === FILTERS.REFUNDED) {
      return transaction.status === "CANCELED";
    }

    return true;
  });

  const handleSellerAction = async (id, status) => {
    setProcessingId(id);
    try {
      await updateTransactionStatus(id, { status });
      await fetchTransactions();
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update this transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBuyerAction = async (id, action) => {
    setProcessingId(id);
    try {
      if (action === "cancel") {
        await cancelTransaction(id);
      } else if (action === "confirm") {
        await confirmDelivery(id);
      }
      await fetchTransactions();
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update this transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  const openTransaction = (id) => {
    navigate(`/transactions/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.values(FILTERS).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-2 text-sm font-medium ${filter === item ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found for this view.</div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const counterparty = role === "SELLER"
                ? transaction.buyer_username || transaction.buyer?.username || "Buyer"
                : transaction.seller_username || transaction.seller?.username || "Seller";

              return (
                <div
                  key={transaction.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button
                      type="button"
                      onClick={() => openTransaction(transaction.id)}
                      className="text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                          <ShieldCheck size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {counterparty}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${Number(transaction.amount).toFixed(2)}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {role === "SELLER" ? (
                          <>
                            {transaction.status === "PENDING" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSellerAction(transaction.id, "PROCESSING")}
                                  disabled={processingId === transaction.id}
                                  className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                  {processingId === transaction.id ? "Working..." : "Mark Processing"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSellerAction(transaction.id, "CANCELED")}
                                  disabled={processingId === transaction.id}
                                  className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                                >
                                  Refund
                                </button>
                              </>
                            ) : null}
                            {transaction.status === "PROCESSING" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSellerAction(transaction.id, "SHIPPED")}
                                  disabled={processingId === transaction.id}
                                  className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                  {processingId === transaction.id ? "Working..." : "Mark Shipped"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSellerAction(transaction.id, "CANCELED")}
                                  disabled={processingId === transaction.id}
                                  className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                                >
                                  Refund
                                </button>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {(transaction.status === "PENDING" || transaction.status === "PROCESSING") ? (
                              <button
                                type="button"
                                onClick={() => handleBuyerAction(transaction.id, "cancel")}
                                disabled={processingId === transaction.id}
                                className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                              >
                                {processingId === transaction.id ? "Working..." : "Cancel Payment"}
                              </button>
                            ) : null}
                            {transaction.status === "SHIPPED" ? (
                              <button
                                type="button"
                                onClick={() => handleBuyerAction(transaction.id, "confirm")}
                                disabled={processingId === transaction.id}
                                className="rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                              >
                                {processingId === transaction.id ? "Working..." : "Confirm Delivery"}
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
