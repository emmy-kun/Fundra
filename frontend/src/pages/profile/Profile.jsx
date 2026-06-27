import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500"></div>

          {/* Profile Section */}
          <div className="px-8 pb-8">
            <div className="relative -mt-16 w-fit">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-50 flex items-center justify-center">
                    <User size={50} className="text-blue-600" />
                  </div>
                )}
              </div>

              <label className="absolute bottom-2 right-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                <Camera size={18} />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Name */}
            <div className="mt-5">
              <h2 className="text-3xl font-bold text-gray-900">John Buyer</h2>

              <p className="text-gray-500 mt-1">Buyer Account</p>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-5 mt-10">
              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-blue-600" />

                  <span className="font-semibold">Email Address</span>
                </div>

                <p className="text-gray-500">johnbuyer@example.com</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={18} className="text-blue-600" />

                  <span className="font-semibold">Phone Number</span>
                </div>

                <p className="text-gray-500">+234 XXX XXX XXXX</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={18} className="text-green-600" />

                  <span className="font-semibold">Verification Status</span>
                </div>

                <p className="font-medium text-green-600">Verified</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <User size={18} className="text-blue-600" />

                  <span className="font-semibold">Account Type</span>
                </div>

                <p className="text-gray-500">Buyer</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-4">
              <button
                className="
      w-full
      flex
      items-center
      justify-between
      rounded-2xl
      border
      border-gray-100
      bg-white
      p-5
      hover:bg-gray-50
      transition-all
      cursor-pointer
    "
              >
                <span className="font-medium text-gray-900">Edit Profile</span>

                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="
      w-full
      flex
      items-center
      justify-between
      rounded-2xl
      border
      border-gray-100
      bg-white
      p-5
      hover:bg-gray-50
      transition-all
      cursor-pointer
    "
              >
                <span className="font-medium text-gray-900">Settings</span>

                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
