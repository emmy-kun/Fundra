import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Shield,
  BadgeCheck,
  FileText,
  Info,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logo from "../../assets/images/logo.png";

export default function Settings() {
  const navigate = useNavigate();

  const settingsItems = [
    {
      title: "Notifications",
      icon: Bell,
      description: "Manage alerts and updates",
    },
    {
      title: "Security",
      icon: Shield,
      description: "Password and account security",
    },
    {
      title: "Verification",
      icon: BadgeCheck,
      description: "Identity verification status",
    },
    {
      title: "Privacy Policy",
      icon: FileText,
      description: "Read our privacy policy",
    },
    {
      title: "About Fundra",
      icon: Info,
      description: "App information and version",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="
              h-11
              w-11
              rounded-xl
              bg-white
              border
              border-gray-200
              flex
              items-center
              justify-center
              hover:bg-gray-50
              transition-all
              cursor-pointer
            "
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your Fundra account
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Brand Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Fundra Logo"
                className="h-12 w-12 object-contain"
              />

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Fundra
                </h2>

                <p className="text-sm text-gray-500">
                  Secure escrow payments
                </p>
              </div>
            </div>
          </div>

          {/* Settings Items */}
          <div className="p-6 space-y-4">

            {settingsItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={index}
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-100
                    p-5
                    hover:bg-slate-50
                    hover:border-blue-100
                    transition-all
                    cursor-pointer
                  "
                >
                  <div className="flex items-center gap-4">

                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon
                        size={22}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-400"
                  />
                </button>
              );
            })}

          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6">

            <button
              onClick={() => navigate("/login")}
              className="
                w-full
                rounded-2xl
                bg-red-50
                border
                border-red-200
                py-4
                text-red-600
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-red-100
                transition-all
                cursor-pointer
              "
            >
              <LogOut size={18} />
              Logout
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Fundra v1.0.0
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}