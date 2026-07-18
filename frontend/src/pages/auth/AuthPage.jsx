import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  HeartPulse,
  ArrowRight,
  Loader2,
  User,
  Stethoscope,
  UserCog,
  Mail,
  Lock,
  Phone,
  BookMarked,
} from "lucide-react";
import { useAuth, dashboardPath } from "@/context/AuthContext";

const ROLE_META = {
  patient: {
    label: "Patient",
    Icon: User,
    tagline: "Book, reschedule and manage your visits — all in one calm place.",
    accent: "from-indigo-500 to-blue-500",
  },
  receptionist: {
    label: "Receptionist",
    Icon: UserCog,
    tagline: "Coordinate appointments and send emergency alerts across the clinic.",
    accent: "from-violet-500 to-indigo-500",
  },
  doctor: {
    label: "Doctor",
    Icon: Stethoscope,
    tagline: "Monitor your patients, announce holidays or emergencies.",
    accent: "from-blue-500 to-indigo-600",
  },
};

const Field = ({ id, label, icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
    <input
      id={id}
      data-testid={`auth-input-${id}`}
      className="w-full h-12 rounded-2xl bg-white border border-[#E2E8F0] pl-11 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 transition"
      {...props}
    />
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
  </div>
);

export default function AuthPage({ role, mode }) {
  const meta = ROLE_META[role] || ROLE_META.patient;
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialty: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (user && user !== false) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = isRegister
      ? await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          phone: form.phone || null,
          specialty: role === "doctor" ? form.specialty || null : null,
          bio: role === "doctor" ? form.bio || null : null,
        })
      : await login({ email: form.email, password: form.password, role });
    setLoading(false);

    if (res.ok) {
      toast.success(isRegister ? "Account created!" : "Welcome back!");
      navigate(dashboardPath(res.user.role));
    } else {
      toast.error(res.error);
    }
  };

  const Icon = meta.Icon;
  const otherRoles = Object.keys(ROLE_META).filter((r) => r !== role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] hc-hero-bg relative overflow-hidden" data-testid={`auth-page-${role}-${mode}`}>
      <div className="pointer-events-none absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-300/30 blur-3xl hc-blob" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-300/30 blur-3xl hc-blob" style={{ animationDelay: "-6s" }} />

      <div className="relative hc-container min-h-screen grid lg:grid-cols-2 gap-10 py-12 items-center">
        {/* Left – brand */}
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl hc-gradient-bg text-white">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A]">Healthca</span>
          </Link>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mt-10 text-xs font-semibold uppercase tracking-wider bg-white/70 border border-[#E2E8F0] text-[#4F46E5]`}>
            <Icon className="w-3.5 h-3.5" /> {meta.label} portal
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] text-[#0F172A] tracking-tight">
            {isRegister ? "Join Healthca" : "Welcome back"}
            <span className="block hc-gradient-text">as a {meta.label}.</span>
          </h1>
          <p className="mt-5 text-[#475569] text-lg max-w-md leading-relaxed">{meta.tagline}</p>

          <div className="mt-10 space-y-3 max-w-sm">
            {[
              "Same-day appointment scheduling",
              "Secure records with role-based access",
              "Emergency alerts and real-time updates",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-[#0F172A]">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full hc-gradient-bg text-white">
                  <BookMarked className="w-3.5 h-3.5" />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right – form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-[28px] hc-glass border border-white/70 p-6 sm:p-8"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl hc-gradient-bg text-white">
              <HeartPulse className="w-5 h-5" />
            </span>
            <span className="font-display text-xl font-bold">Healthca</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <Icon className="w-3.5 h-3.5" /> {meta.label} · {isRegister ? "Register" : "Sign in"}
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {isRegister ? `Create your ${meta.label.toLowerCase()} account` : `Sign in to your ${meta.label.toLowerCase()} account`}
          </h2>

          <form onSubmit={submit} className="mt-6 space-y-3" data-testid={`auth-form-${role}-${mode}`}>
            {isRegister && (
              <Field id="name" label="Full name" icon={User} type="text" required placeholder="Full name" value={form.name} onChange={setF("name")} />
            )}
            <Field id="email" label="Email" icon={Mail} type="email" required placeholder="you@example.com" value={form.email} onChange={setF("email")} />
            <Field id="password" label="Password" icon={Lock} type="password" required minLength={6} placeholder="Password (min 6 chars)" value={form.password} onChange={setF("password")} />
            {isRegister && (
              <Field id="phone" label="Phone" icon={Phone} type="tel" placeholder="Phone (optional)" value={form.phone} onChange={setF("phone")} />
            )}
            {isRegister && role === "doctor" && (
              <>
                <Field id="specialty" label="Specialty" icon={Stethoscope} type="text" placeholder="Specialty (e.g. Cardiology)" value={form.specialty} onChange={setF("specialty")} />
                <textarea
                  id="bio"
                  data-testid="auth-input-bio"
                  placeholder="Short bio (optional)"
                  value={form.bio}
                  onChange={setF("bio")}
                  rows={3}
                  className="w-full rounded-2xl bg-white border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 resize-none"
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid={`auth-submit-${role}-${mode}`}
              className="w-full mt-2 group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_14px_35px_rgba(79,70,229,0.35)] hover:shadow-[0_18px_45px_rgba(79,70,229,0.5)] transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
                </>
              ) : (
                <>
                  {isRegister ? "Create account" : "Sign in"} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-[#475569] text-center">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link to={`/login/${role}`} className="text-[#4F46E5] font-semibold hover:underline" data-testid={`auth-switch-login-${role}`}>
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link to={`/register/${role}`} className="text-[#4F46E5] font-semibold hover:underline" data-testid={`auth-switch-register-${role}`}>
                  Create an account
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0]/70 text-center">
            <div className="text-xs text-[#475569] uppercase tracking-wider font-semibold">
              Or continue as
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              {otherRoles.map((r) => {
                const M = ROLE_META[r];
                const RI = M.Icon;
                return (
                  <Link
                    key={r}
                    to={`/${mode === "register" ? "register" : "login"}/${r}`}
                    data-testid={`auth-role-switch-${r}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-colors text-[#0F172A]"
                  >
                    <RI className="w-3.5 h-3.5" /> {M.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
