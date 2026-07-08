import { useState } from "react";
import { ArrowLeft, Mail, Wallet, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createTransaction } from "../../services/transactionService";

export default function SendMoney() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createTransaction({ seller_email: email, amount: Number(amount), description: note });
      navigate("/buyer/transaction-history");
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to create this transaction.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-xl font-bold text-gray-900">
            Send Money
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          {/* Seller Email */}
          <div className="mb-5">
            <label className="text-xs uppercase font-semibold text-gray-400 tracking-wide">
              Seller Email
            </label>

            <div className="mt-2 flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-4">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="seller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="mb-5">
            <label className="text-xs uppercase font-semibold text-gray-400 tracking-wide">
              Amount
            </label>

            <div className="mt-2 flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-4">
              <Wallet size={18} className="text-gray-400" />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs uppercase font-semibold text-gray-400 tracking-wide">
              Note
            </label>

            <div className="mt-2 flex gap-3 border border-gray-200 rounded-2xl px-4 py-4">
              <FileText size={18} className="text-gray-400 mt-1" />

              <textarea
                rows="4"
                placeholder="What is this payment for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full outline-none resize-none"
              />
            </div>
          </div>

          {/* Escrow Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-blue-600" size={22} />

              <div>
                <h3 className="font-semibold text-blue-900">
                  Escrow Protection
                </h3>

                <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                  Funds are securely held by Fundra and will only be released
                  to the seller after you confirm that you have received your
                  order.
                </p>
              </div>
            </div>
          </div>

          {/* Continue */}
          <form onSubmit={handleSubmit}>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              className="
              mt-6
              w-full
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-blue-700
              via-blue-600
              to-sky-500
              text-white
              font-semibold
              hover:shadow-xl
              hover:scale-[1.01]
              transition-all
              cursor-pointer
            "
          >
            Continue
          </button>
          </form>

        </div>
      </div>
    </div>
  );
}