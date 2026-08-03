import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { loading, user, role } = useAuth();

  const getRolePath = () => {
    if (role === "client") return "/client";
    if (role === "freelancer") return "/freelancer";
    if (role === "admin") return "/admin";
    return "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col justify-center items-center relative overflow-hidden bg-gradient-mesh">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-[#6366F1]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-2xl bg-[#6366F1]/20 blur-xl animate-pulse"></div>
            <div className="w-14 h-14 rounded-2xl border-t-2 border-r-2 border-[#6366F1] animate-spin"></div>
            <div className="absolute inset-1.5 bg-[#111827] rounded-xl flex items-center justify-center border border-white/5">
              <span className="text-[#6366F1] font-extrabold text-base font-display">F</span>
            </div>
          </div>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">
            Authenticating Session
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getRolePath()} replace />;
  }

  return children;
};

export default ProtectedRoute;