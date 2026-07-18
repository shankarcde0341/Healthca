import { Navigate } from "react-router-dom";
import { useAuth, dashboardPath } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading || user === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8FAFC]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
      </div>
    );
  }
  if (user === false) {
    return <Navigate to={`/login/${role || "patient"}`} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }
  return children;
}
