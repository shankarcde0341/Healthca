import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  CalendarClock,
  MessageCircle,
  FileHeart,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Same-day appointments",
    desc: "Get care within hours, not weeks — book online in 60 seconds.",
    className: "lg:col-span-2 lg:row-span-2",
    gradient:
      "bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] text-white",
    large: true,
  },
  {
    icon: ShieldCheck,
    title: "HIPAA-grade privacy",
    desc: "Encrypted records, always yours.",
    className: "",
    gradient: "bg-white border border-[#E2E8F0] text-[#0F172A]",
  },
  {
    icon: CalendarClock,
    title: "24/7 scheduling",
    desc: "Reschedule any time from your phone.",
    className: "",
    gradient: "bg-white border border-[#E2E8F0] text-[#0F172A]",
  },
  {
    icon: MessageCircle,
    title: "Message your doctor",
    desc: "Skip the phone tag. Get answers in-thread.",
    className: "lg:col-span-2",
    gradient:
      "bg-gradient-to-br from-[#F1F5FF] to-[#EEF2FF] border border-[#E2E8F0] text-[#0F172A]",
  },
  {
    icon: FileHeart,
    title: "Unified record",
    desc: "Every result, prescription and note in one calm timeline.",
    className: "",
    gradient: "bg-white border border-[#E2E8F0] text-[#0F172A]",
  },
  {
    icon: Sparkles,
    title: "Wellness plans",
    desc: "Personalized programs for lasting habits.",
    className: "",
    gradient: "bg-white border border-[#E2E8F0] text-[#0F172A]",
  },
];

export default function Features() {
  return (
    <section id="features" data-testid="features-section" className="py-24 sm:py-32 bg-[#F8FAFC]">
      <div className="hc-container">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            Why Healthca
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            A calmer, smarter way to get care.
          </h2>
          <p className="mt-4 text-[#475569] text-base sm:text-lg leading-relaxed">
            Everything you need — bookings, messaging, records, results — in one
            beautifully simple experience.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              data-testid={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
              className={`relative overflow-hidden rounded-[24px] p-6 sm:p-7 hc-soft-shadow hover:hc-lift-shadow transition-all duration-300 hover:-translate-y-1 ${f.gradient} ${f.className}`}
            >
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${
                  f.large
                    ? "bg-white/15 text-white"
                    : "bg-[#EEF2FF] text-[#4F46E5]"
                }`}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3
                className={`mt-5 font-display font-bold ${
                  f.large ? "text-2xl sm:text-3xl" : "text-lg"
                }`}
              >
                {f.title}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  f.large ? "text-white/85" : "text-[#475569]"
                }`}
              >
                {f.desc}
              </p>

              {f.large && (
                <>
                  <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute right-6 bottom-6 hc-glass rounded-xl px-3 py-2 text-xs text-white/90 font-medium">
                    Avg. booking time · 47s
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
