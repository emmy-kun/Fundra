import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getProfile } from "../services/authService";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"];

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const publicPath = PUBLIC_PATHS.includes(location.pathname);
    const token = localStorage.getItem("accessToken");

    if (!token || publicPath) {
      setAuthorized(!token ? false : true);
      setChecking(false);
      return;
    }

    let isMounted = true;

    const verifySession = async () => {
      try {
        await getProfile();
        if (isMounted) {
          setAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (isMounted) {
          setAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!authorized || checking) {
      return;
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const resetTimer = () => setSecondsLeft(60);

    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.replace("/login");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.clearInterval(interval);
    };
  }, [authorized, checking]);

  useEffect(() => {
    if (secondsLeft <= 15 && secondsLeft > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [secondsLeft]);

  if (checking) {
    return null;
  }

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <>
      {showWarning ? (
        <div className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-3">
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
            You will be logged out in {secondsLeft} seconds due to inactivity.
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
