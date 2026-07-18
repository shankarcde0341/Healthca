import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, CalendarDays, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Primary Care",
  "Diagnostics",
  "Virtual Care",
];

const initial = {
  name: "",
  email: "",
  phone: "",
  department: "",
  date: "",
  message: "",
};

const FloatingInput = ({ id, label, type = "text", value, onChange, ...rest }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder=" "
      data-testid={`appointment-input-${id}`}
      className="peer w-full h-14 rounded-2xl bg-white border border-[#E2E8F0] px-4 pt-5 pb-2 text-sm text-[#0F172A] placeholder-transparent focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 transition"
      {...rest}
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-1.5 text-[11px] font-medium uppercase tracking-wider text-[#475569] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[#94A3B8] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#4F46E5]"
    >
      {label}
    </label>
  </div>
);

export default function Appointment() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.department || !form.date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/appointments", form);
      toast.success("Appointment requested! We'll be in touch shortly.");
      setForm(initial);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong. Try again.";
      toast.error(typeof msg === "string" ? msg : "Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="appointment"
      data-testid="appointment-section"
      className="relative py-24 sm:py-32 bg-white overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-24 left-1/3 w-[520px] h-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-violet-200/40 blur-3xl" />

      <div className="hc-container relative grid lg:grid-cols-12 gap-14 items-center">
        {/* Left illustration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            Appointment
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Book a visit in
            <br />
            <span className="hc-gradient-text">under a minute.</span>
          </h2>
          <p className="mt-5 text-[#475569] text-base sm:text-lg leading-relaxed max-w-md">
            Pick a specialty and a time that works for you. We&rsquo;ll confirm within
            a few minutes &mdash; no phone calls required.
          </p>

          <div className="mt-8 rounded-[24px] overflow-hidden border border-[#E2E8F0] hc-soft-shadow relative">
            <img
              src="https://images.pexels.com/photos/7108340/pexels-photo-7108340.jpeg"
              alt="Doctor consultation"
              className="w-full h-72 object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 hc-glass rounded-2xl p-4 flex items-center gap-3 max-w-[80%]">
              <div className="w-11 h-11 rounded-xl hc-gradient-bg text-white flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">
                  Instant confirmation
                </div>
                <div className="text-xs text-[#475569]">
                  Reply from our team within 15 min.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form card */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="appointment-form"
          className="lg:col-span-7 rounded-[28px] hc-glass p-6 sm:p-10 border border-white/70"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <FloatingInput id="name" label="Full Name" value={form.name} onChange={handle("name")} required />
            <FloatingInput id="email" label="Email" type="email" value={form.email} onChange={handle("email")} required />
            <FloatingInput id="phone" label="Phone Number" value={form.phone} onChange={handle("phone")} required />
            <FloatingInput id="date" label="Preferred Date" type="date" value={form.date} onChange={handle("date")} required />

            <div className="sm:col-span-2 relative">
              <select
                id="department"
                value={form.department}
                onChange={handle("department")}
                data-testid="appointment-select-department"
                required
                className="peer w-full h-14 rounded-2xl bg-white border border-[#E2E8F0] px-4 pt-5 pb-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 transition appearance-none"
              >
                <option value="" disabled></option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <label
                htmlFor="department"
                className="absolute left-4 top-1.5 text-[11px] font-medium uppercase tracking-wider text-[#475569]"
              >
                Department
              </label>
            </div>

            <div className="sm:col-span-2 relative">
              <textarea
                id="message"
                value={form.message}
                onChange={handle("message")}
                placeholder=" "
                rows={4}
                data-testid="appointment-input-message"
                className="peer w-full rounded-2xl bg-white border border-[#E2E8F0] px-4 pt-6 pb-3 text-sm text-[#0F172A] placeholder-transparent focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 transition resize-none"
              />
              <label
                htmlFor="message"
                className="absolute left-4 top-2 text-[11px] font-medium uppercase tracking-wider text-[#475569] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[#94A3B8] peer-focus:top-2 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#4F46E5] transition-all"
              >
                Message (optional)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="appointment-submit"
            className="mt-6 group inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_14px_35px_rgba(79,70,229,0.35)] hover:shadow-[0_18px_45px_rgba(79,70,229,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Confirm Appointment
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-[#475569]">
            By submitting, you agree to our privacy policy. We never share your
            information.
          </p>
        </motion.form>
      </div>
    </section>
  );
}
