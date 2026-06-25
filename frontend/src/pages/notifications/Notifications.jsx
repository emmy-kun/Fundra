import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      title: "Payment Sent",
      message: "Your payment of $120 has been secured in escrow.",
      icon: <ShieldCheck size={20} />,
      color: "text-blue-600 bg-blue-100",
      time: "2 mins ago",
    },
    {
      id: 2,
      title: "Transaction Completed",
      message: "Your order has been confirmed and funds released.",
      icon: <CheckCircle2 size={20} />,
      color: "text-green-600 bg-green-100",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Pending Action",
      message: "Confirm receipt of your order to release funds.",
      icon: <Clock3 size={20} />,
      color: "text-amber-600 bg-amber-100",
      time: "Yesterday",
    },
  ];

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

          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600" />
              <h2 className="font-semibold text-lg">
                Recent Notifications
              </h2>
            </div>

            <button className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
              Mark all as read
            </button>
          </div>

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-6 border-b border-gray-100 hover:bg-slate-50 transition-all"
            >
              <div className="flex gap-4">

                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center ${notification.color}`}
                >
                  {notification.icon}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {notification.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {notification.time}
                  </p>
                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}