import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, ShieldCheck, Wallet, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions, updateTransactionStatus } from "../../services/transactionService";

export default function RefundMoney() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await getMyTransactions();
        const sellerTransactions = (response.data || []).filter((t) => ["PENDING", "PROCESSING", "SHIPPED"].includes(t.status));
        setTransactions(sellerTransactions);
      } catch (err) {
        setError("Unable to load escrow transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
      await updateTransactionStatus(id, { status });
      const response = await getMyTransactions();
      const sellerTransactions = (response.data || []).filter((t) => ["PENDING", "PROCESSING", "SHIPPED"].includes(t.status));
      setTransactions(sellerTransactions);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update the escrow transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Escrow Workflow</h1>
            <p className="text-sm text-gray-500">Track pending, shipped, and refundable payments.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading escrow transactions...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No active escrows right now.</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {transaction.buyer_username || transaction.buyer?.username || "Buyer"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{transaction.description || "Escrow payment"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1"><Wallet size={14} /> ${Number(transaction.amount).toFixed(2)}</span>
                          <span className="inline-flex items-center gap-1"><UserRound size={14} /> {transaction.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {transaction.status === "PENDING" ? (
                        <>
                          <button onClick={() => handleAction(transaction.id, "PROCESSING")} disabled={processingId === transaction.id} className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{processingId === transaction.id ? "Working..." : "Mark Processing"}</button>
                          <button onClick={() => handleAction(transaction.id, "CANCELED")} disabled={processingId === transaction.id} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">Refund</button>
                        </>
                      ) : null}
                      {transaction.status === "PROCESSING" ? (
                        <>
                          <button onClick={() => handleAction(transaction.id, "SHIPPED")} disabled={processingId === transaction.id} className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{processingId === transaction.id ? "Working..." : "Mark Shipped"}</button>
                          <button onClick={() => handleAction(transaction.id, "CANCELED")} disabled={processingId === transaction.id} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">Refund</button>
                        </>
                      ) : null}
                      {transaction.status === "SHIPPED" ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                          <Clock3 size={14} /> Waiting for buyer confirmation
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}