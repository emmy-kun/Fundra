import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { getMyTransactions } from "../../services/transactionService";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchTransactions();
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

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found.</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => openTransaction(transaction.id)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {transaction.seller_username || transaction.seller?.username || "Seller"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${Number(transaction.amount).toFixed(2)}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-400" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
