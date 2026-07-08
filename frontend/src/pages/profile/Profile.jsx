import { useState, useEffect } from "react";
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
  const [user, setUser] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verifyType, setVerifyType] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);

  const appendTimestamp = (url) =>
    url ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` : url;

  useEffect(() => {
    (async () => {
      try {
        const { getProfile } = await import('../../services/authService');
        const res = await getProfile();
        setUser(res.data);
        setProfileImage(res.data.profile_image);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      // upload to backend
      (async () => {
        try {
          const { updateProfile } = await import('../../services/authService');
          const fd = new FormData();
          fd.append('profile_image', file);
          const res = await updateProfile(fd);
          const imageUrl = appendTimestamp(res.data.profile_image);
          setUser({ ...res.data, profile_image: imageUrl });
          setProfileImage(imageUrl);
        } catch (err) {
          // fallback to local preview on error
          setProfileImage(URL.createObjectURL(file));
        }
      })();
    }
  };

  const startVerification = async (type) => {
    try {
      const { sendVerification } = await import('../../services/authService');
      await sendVerification(type);
    } catch (e) {
      // ignore
    }
  };

  const submitCode = async () => {
    if (!verifyType || !codeInput) return;
    setLoadingVerify(true);
    try {
      const { verifyOtp, getProfile } = await import('../../services/authService');
      await verifyOtp(verifyType, codeInput);
      const res = await getProfile();
      setUser(res.data);
      setProfileImage(res.data.profile_image);
      setShowCodeModal(false);
      setCodeInput('');
    } catch (err) {
      alert(err?.response?.data?.error || 'Verification failed');
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
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
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
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
              <h2 className="text-3xl font-bold text-gray-900">{user ? (user.first_name + (user.last_name ? ' ' + user.last_name : '')) : 'User'}</h2>

              <p className="text-gray-500 mt-1">{user?.role === 'SELLER' ? 'Seller Account' : 'Buyer Account'}</p>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-5 mt-10">
              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-blue-600" />

                  <span className="font-semibold">Email Address</span>
                </div>

                <p className="text-gray-500">{user?.email}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={18} className="text-blue-600" />

                  <span className="font-semibold">Phone Number</span>
                </div>

                <p className="text-gray-500">{user?.phone_number || '—'}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={18} className="text-green-600" />

                  <span className="font-semibold">Verification Status</span>
                </div>

                <p className={`font-medium ${user && (user.is_email_verified && user.is_phone_verified) ? 'text-green-600' : 'text-amber-500'}`}>
                  {user && user.is_email_verified && user.is_phone_verified ? 'Verified' : 'Unverified'}
                </p>
                {!user?.is_email_verified || !user?.is_phone_verified ? (
                  <div className="mt-3">
                    <button onClick={async () => { setVerifyType('email'); setShowCodeModal(true); await startVerification('email'); }} disabled={user?.is_email_verified} className={`mr-2 px-4 py-2 rounded ${user?.is_email_verified ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'}`}>Verify Email</button>
                    <button onClick={async () => { setVerifyType('phone'); setShowCodeModal(true); await startVerification('phone'); }} disabled={user?.is_phone_verified} className={`${user?.is_phone_verified ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'} px-4 py-2 rounded`}>Verify Phone</button>
                  </div>
                ) : null}
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <User size={18} className="text-blue-600" />

                  <span className="font-semibold">Account Type</span>
                </div>

                <p className="text-gray-500">{user?.role === 'SELLER' ? 'Seller' : 'Buyer'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-4">
              <button onClick={() => navigate('/profile/edit')} className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 hover:bg-gray-50 transition-all cursor-pointer">
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
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Verify {verifyType}</h3>
            <p className="text-sm text-gray-500 mb-4">A verification code was sent. Enter it below.</p>
            <div className="mb-4">
              <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Enter code" className="w-full rounded border px-3 py-2" />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowCodeModal(false); setCodeInput(''); }} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
              <button onClick={submitCode} disabled={loadingVerify} className="px-4 py-2 rounded bg-blue-600 text-white">{loadingVerify ? 'Verifying...' : 'Verify'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
