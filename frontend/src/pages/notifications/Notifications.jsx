import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getMyTransactions } from "../../services/transactionService";

const ICON_MAP = {
  pending: <Clock3 size={20} />,
  processing: <Clock3 size={20} />,
  shipped: <ShieldCheck size={20} />,
  successful: <CheckCircle2 size={20} />,
  canceled: <XCircle size={20} />,
};

const COLOR_MAP = {
  pending: "text-amber-600 bg-amber-100",
  processing: "text-amber-600 bg-amber-100",
  shipped: "text-blue-600 bg-blue-100",
  successful: "text-green-600 bg-green-100",
  canceled: "text-red-600 bg-red-100",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  SUCCESSFUL: "Completed",
  CANCELED: "Cancelled",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getMyTransactions();
        const transactions = response.data?.results || response.data || [];
        const notificationsData = (Array.isArray(transactions) ? transactions : []).map((txn) => {
          const type = txn.status?.toLowerCase() || "pending";
          const counterparty =
            txn.seller_username ||
            txn.seller?.username ||
            txn.buyer_username ||
            txn.buyer?.username ||
            "counterparty";
          const amount = Number(txn.amount || 0).toFixed(2);
          let message;

          if (txn.status === "SUCCESSFUL") {
            message = `$${amount} payment was completed with ${counterparty}.`;
          } else if (txn.status === "CANCELED") {
            message = `$${amount} transaction was cancelled with ${counterparty}.`;
          } else if (txn.status === "SHIPPED") {
            message = `$${amount} order has shipped with ${counterparty}.`;
          } else if (txn.status === "PROCESSING") {
            message = `$${amount} transaction is processing with ${counterparty}.`;
          } else {
            message = `$${amount} transaction is pending with ${counterparty}.`;
          }

          return {
            id: txn.id,
            title: `Transaction ${STATUS_LABEL[txn.status] || txn.status || "Pending"}`,
            message,
            type,
            time: new Date(txn.updated_at || txn.created_at).toLocaleString(),
          };
        });

        setNotifications(notificationsData);
      } catch (err) {
        const apiMessage =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load notifications.";
        setError(apiMessage);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => ICON_MAP[type] || <Bell size={20} />;
  const getNotificationColor = (type) => COLOR_MAP[type] || "text-slate-500 bg-slate-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600" />
              <h2 className="font-semibold text-lg">Recent Notifications</h2>
            </div>

            <button className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
              Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading notifications...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications available.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-6 border-b border-gray-100 hover:bg-slate-50 transition-all"
              >
                <div className="flex gap-4">

                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}
