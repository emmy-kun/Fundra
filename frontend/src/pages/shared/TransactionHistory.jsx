import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

export default function TransactionHistory() {
  const navigate = useNavigate();

  const transactions = [
    {
      id: "1",
      seller: "Nike Store",
      amount: "$120",
      status: "Pending",
      date: "Today",
    },
    {
      id: "2",
      seller: "Apple Store",
      amount: "$599",
      status: "Completed",
      date: "Yesterday",
    },
    {
      id: "3",
      seller: "Gaming Hub",
      amount: "$85",
      status: "Cancelled",
      date: "June 20",
    },
  ];

  const getStatusBadge = (status) => {
    if (status === "Pending") {
      return (
        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
          <Clock3 size={14} />
          Pending
        </div>
      );
    }

    if (status === "Completed") {
      return (
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle2 size={14} />
          Completed
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

          <h1 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h1>
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

        {/* Transactions */}
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => openTransaction(transaction.id)}
              className="
                bg-white
                rounded-2xl
                border
                border-gray-100
                p-5
                hover:shadow-lg
                hover:-translate-y-1
                transition-all
                cursor-pointer
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {transaction.seller}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {transaction.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {transaction.amount}
                    </p>

                    <div className="mt-2">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-400"
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}