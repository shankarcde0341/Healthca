import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  HeartPulse,
  ArrowRight,
  ChevronDown,
  User,
  Stethoscope,
  UserCog,
  LogIn,
} from "lucide-react";
import { useAuth, dashboardPath } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Doctors", href: "#doctors" },
  { label: "FAQ", href: "#faq" },
];

const ROLE_PORTALS = [
  { role: "patient", label: "Patient", icon: User },
  { role: "receptionist", label: "Receptionist", icon: UserCog },
  { role: "doctor", label: "Doctor", icon: Stethoscope },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setPortalOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isAuthed = user && user !== false;

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 backdrop-blur-xl bg-white/70 border-b border-white/60 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="hc-container flex items-center justify-between gap-6">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl hc-gradient-bg text-white shadow-[0_8px_20px_rgba(79,70,229,0.35)]">
            <HeartPulse className="w-5 h-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-[#0F172A]">
            Healthca
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#E2E8F0]/70 bg-white/60 backdrop-blur px-2 py-1.5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthed ? (
            <>
              <Link
                to={dashboardPath(user.role)}
                data-testid="nav-dashboard"
                className="text-sm font-medium text-[#0F172A] hover:text-[#4F46E5]"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                data-testid="nav-logout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setPortalOpen((v) => !v)}
                  data-testid="nav-portal-toggle"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F172A] px-3 py-2 rounded-full hover:bg-white/70"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${portalOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {portalOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl hc-glass border border-white/60 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
                      data-testid="nav-portal-menu"
                    >
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#475569]">
                        Sign in as
                      </div>
                      {ROLE_PORTALS.map((p) => {
                        const Ic = p.icon;
                        return (
                          <Link
                            key={p.role}
                            to={`/login/${p.role}`}
                            onClick={() => setPortalOpen(false)}
                            data-testid={`nav-portal-${p.role}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/80 transition"
                          >
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg hc-gradient-bg text-white">
                              <Ic className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-[#0F172A]">
                                {p.label}
                              </div>
                              <div className="text-xs text-[#475569]">
                                Sign in / Register
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                to="/register/patient"
                data-testid="nav-cta"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_10px_25px_rgba(79,70,229,0.35)] hover:shadow-[0_14px_30px_rgba(79,70,229,0.45)] transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          data-testid="nav-mobile-toggle"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-[#E2E8F0] text-[#0F172A]"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-3 mx-4 rounded-[20px] hc-glass p-4"
            data-testid="nav-mobile-menu"
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl text-[#0F172A] hover:bg-white/70 text-sm font-medium"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 pt-3 border-t border-[#E2E8F0]/60">
                <div className="px-3 text-[10px] uppercase tracking-wider font-semibold text-[#475569] mb-2">
                  Sign in as
                </div>
                {ROLE_PORTALS.map((p) => (
                  <Link
                    key={p.role}
                    to={`/login/${p.role}`}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-white/80 text-sm font-medium text-[#0F172A]"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
              <Link
                to="/register/patient"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white hc-gradient-bg"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
