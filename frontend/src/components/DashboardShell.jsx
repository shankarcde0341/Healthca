import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ROLE_COLORS = {
  patient: "bg-indigo-100 text-indigo-700",
  receptionist: "bg-violet-100 text-violet-700",
  doctor: "bg-blue-100 text-blue-700",
};

export default function DashboardShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="dashboard-shell">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-[#E2E8F0]/70">
        <div className="hc-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl hc-gradient-bg text-white">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span className="font-display text-lg font-bold text-[#0F172A]">Healthca</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && user.role && (
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-700"}`}>
                <User className="w-3 h-3" /> {user.role}
              </span>
            )}
            <div className="text-sm text-[#0F172A] font-medium hidden md:block" data-testid="dashboard-user-name">
              {user?.name}
            </div>
            <button
              onClick={handleLogout}
              data-testid="dashboard-logout"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="hc-container py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-[#475569] text-base">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
