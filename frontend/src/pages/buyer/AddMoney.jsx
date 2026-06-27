import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Building2, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addFunds, getMyWallet } from "../../services/walletService";

export default function AddMoney() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await getMyWallet();
        setBalance(response.data.available_balance || 0);
      } catch (err) {
        setError("Unable to load wallet balance.");
      }
    };

    loadWallet();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !paymentMethod) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addFunds({ amount: Number(amount) });
      navigate("/buyer/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to add funds right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-xl font-bold text-gray-950">
            Add Money
          </h1>
        </div>

        {/* Amount Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-3">
            Amount to Add
          </p>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              USD
            </span>

            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="
                bg-transparent
                text-3xl
                font-bold
                text-gray-500
                outline-none
                w-full
              "
            />
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Current Balance: USD {Number(balance).toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-gray-500 tracking-wide mb-3 uppercase">
            Payment Method
          </h2>

          <div className="space-y-4">

            {/* Credit Card */}
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full bg-white rounded-2xl p-5 border transition-all flex items-center justify-between cursor-pointer ${
                paymentMethod === "card"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>

                <span className="font-medium text-gray-900">
                  Credit / Debit Card
                </span>
              </div>

              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              />
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setPaymentMethod("bank")}
              className={`w-full bg-white rounded-2xl p-5 border transition-all flex items-center justify-between cursor-pointer ${
                paymentMethod === "bank"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Building2 size={20} />
                </div>

                <span className="font-medium text-gray-900">
                  Bank Transfer
                </span>
              </div>

              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  paymentMethod === "bank"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              />
            </button>

            {/* Mobile Money */}
            <button
              onClick={() => setPaymentMethod("mobile")}
              className={`w-full bg-white rounded-2xl p-5 border transition-all flex items-center justify-between cursor-pointer ${
                paymentMethod === "mobile"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Smartphone size={20} />
                </div>

                <span className="font-medium text-gray-900">
                  Mobile Money
                </span>
              </div>

              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  paymentMethod === "mobile"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Continue Button */}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={!amount || !paymentMethod || isSubmitting}
          onClick={handleSubmit}
          className={`mt-8 w-full py-4 rounded-2xl font-semibold transition-all ${
            !amount || !paymentMethod || isSubmitting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white hover:shadow-xl hover:scale-[1.01] cursor-pointer"
          }`}
        >
          {isSubmitting ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}