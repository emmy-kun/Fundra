import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";

// Backend
// import { createEscrow } from "../../services/escrowService";

export default function RequestMoney() {
  const navigate = useNavigate();

  /* ==========================================
      FORM STATE
  ========================================== */

  const [formData, setFormData] = useState({
    buyer_email: "",
    product: "",
    amount: "",
    delivery_date: "",
    description: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ==========================================
      SUBMIT
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      /*
      BACKEND

      await createEscrow(formData);

      */

      console.log("Escrow Payload:", formData);

      navigate("/seller/dashboard");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-10">

          <button
            onClick={() => navigate("/seller/dashboard")}
            className="
              h-12
              w-12
              rounded-2xl
              bg-white
              border
              border-gray-200
              flex
              items-center
              justify-center
              hover:bg-gray-100
              transition-all
            "
          >
            <ArrowLeft size={22} />
          </button>

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Create Escrow Request
            </h1>

            <p className="text-gray-500 mt-1">
              Send a secure payment request to your buyer.
            </p>

          </div>

        </div>

        {/* FORM CARD */}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            p-8
            lg:p-10
          "
        >
            {/* ================= FORM ================= */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* BUYER EMAIL */}

  <div>

    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Buyer Email
    </label>

    <div className="relative">

      <Mail
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="email"
        name="buyer_email"
        value={formData.buyer_email}
        onChange={handleChange}
        placeholder="buyer@email.com"
        required
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          pl-12
          pr-4
          py-4
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>

  </div>

  {/* PRODUCT */}

  <div>

    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Product Name
    </label>

    <div className="relative">

      <Package
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        name="product"
        value={formData.product}
        onChange={handleChange}
        placeholder="MacBook Pro M4"
        required
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          pl-12
          pr-4
          py-4
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>

  </div>

  {/* AMOUNT */}

  <div>

    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Amount (USD)
    </label>

    <div className="relative">

      <DollarSign
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="1000"
        required
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          pl-12
          pr-4
          py-4
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>

  </div>

  {/* DELIVERY DATE */}

  <div>

    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Expected Delivery Date
    </label>

    <div className="relative">

      <Calendar
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="date"
        name="delivery_date"
        value={formData.delivery_date}
        onChange={handleChange}
        required
        className="
          w-full
          rounded-2xl
          border
          border-gray-200
          pl-12
          pr-4
          py-4
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

    </div>

  </div>

</div>

{/* DESCRIPTION */}

<div className="mt-8">

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Product Description
  </label>

  <div className="relative">

    <FileText
      size={18}
      className="absolute left-4 top-5 text-gray-400"
    />

    <textarea
      rows={4}
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Describe the product or service..."
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        pl-12
        pr-4
        py-4
        resize-none
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />

  </div>

</div>

{/* NOTES */}

<div className="mt-6">

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Additional Notes (Optional)
  </label>

  <textarea
    rows={3}
    name="notes"
    value={formData.notes}
    onChange={handleChange}
    placeholder="Any additional instructions for the buyer..."
    className="
      w-full
      rounded-2xl
      border
      border-gray-200
      px-4
      py-4
      resize-none
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
  />

</div>

{/* ================= ACTION BUTTONS ================= */}

<div className="mt-10 flex flex-col-reverse sm:flex-row justify-end gap-4">

  <button
    type="button"
    onClick={() => navigate("/seller/dashboard")}
    className="
      px-8
      py-4
      rounded-2xl
      border
      border-gray-200
      bg-white
      font-semibold
      text-gray-700
      hover:bg-gray-100
      transition-all
    "
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={loading}
    className="
      px-8
      py-4
      rounded-2xl
      bg-gradient-to-r
      from-blue-700
      via-blue-600
      to-sky-500
      text-white
      font-semibold
      flex
      items-center
      justify-center
      gap-2
      hover:shadow-lg
      hover:shadow-blue-200
      transition-all
      disabled:opacity-60
      disabled:cursor-not-allowed
    "
  >

    {loading ? (
      <>
        <Loader2
          size={20}
          className="animate-spin"
        />
        Creating...
      </>
    ) : (
      <>
        Create Escrow
      </>
    )}

  </button>

</div>

</motion.form>

</div>

</div>
  );
}
