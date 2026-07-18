import { motion } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Play,
  Sparkles,
  Users,
  Video,
  Siren,
  Star,
  Award,
} from "lucide-react";

const HERO_IMG =
  "https://images.pexels.com/photos/37476745/pexels-photo-37476745.jpeg";

const floatCards = [
  {
    testId: "hero-card-patients",
    icon: Users,
    title: "12k+",
    subtitle: "Happy Patients",
    className: "top-6 -left-4 md:-left-10",
    accent: "from-indigo-500 to-blue-500",
    delay: 0,
  },
  {
    testId: "hero-card-online",
    icon: Video,
    title: "Online",
    subtitle: "Consultation",
    className: "top-40 -right-4 md:-right-10",
    accent: "from-violet-500 to-indigo-500",
    delay: 0.15,
  },
  {
    testId: "hero-card-rating",
    icon: Star,
    title: "4.9/5",
    subtitle: "Patient Rating",
    className: "bottom-40 -left-6 md:-left-14",
    accent: "from-amber-400 to-orange-500",
    delay: 0.3,
  },
  {
    testId: "hero-card-emergency",
    icon: Siren,
    title: "24/7",
    subtitle: "Emergency Care",
    className: "bottom-8 right-2 md:right-4",
    accent: "from-rose-500 to-pink-500",
    delay: 0.45,
  },
  {
    testId: "hero-card-experience",
    icon: Award,
    title: "25+",
    subtitle: "Years of Care",
    className: "top-1/2 -left-6 md:-left-16",
    accent: "from-emerald-500 to-teal-500",
    delay: 0.6,
  },
];

export default function Hero() {
  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 hc-hero-bg overflow-hidden"
    >
      {/* Abstract shapes */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-300/30 blur-3xl hc-blob" />
      <div className="pointer-events-none absolute top-40 right-0 w-[360px] h-[360px] rounded-full bg-violet-300/30 blur-3xl hc-blob" style={{ animationDelay: "-4s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-3xl hc-blob" style={{ animationDelay: "-8s" }} />

      <div className="hc-container relative grid lg:grid-cols-12 gap-14 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-6"
        >
          <span
            data-testid="hero-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#E2E8F0] text-xs font-semibold uppercase tracking-wider text-[#4F46E5]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hospital & Medical Clinic
          </span>

          <h1
            data-testid="hero-heading"
            className="mt-6 font-display font-extrabold text-[#0F172A] leading-[1.05] text-[44px] sm:text-6xl lg:text-[68px]"
          >
            Modern Healthcare
            <br />
            Built Around{" "}
            <span className="hc-gradient-text">You.</span>
          </h1>

          <p
            data-testid="hero-subheading"
            className="mt-6 text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed"
          >
            Healthca is a full-service digital clinic with world-class specialists,
            same-day appointments, and 24/7 emergency support — all wrapped in a
            calm, human experience.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#appointment"
              data-testid="hero-cta-primary"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_14px_35px_rgba(79,70,229,0.35)] hover:shadow-[0_18px_45px_rgba(79,70,229,0.5)] transition-all"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              data-testid="hero-cta-secondary"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full hc-gradient-bg text-white">
                <Play className="w-3 h-3 ml-0.5" />
              </span>
              How it works
            </a>
          </div>

          {/* Emergency + Hours */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div
              data-testid="hero-emergency"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E2E8F0] hc-soft-shadow"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl hc-gradient-bg text-white">
                <Phone className="w-5 h-5" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#475569] font-semibold">
                  Emergency Call
                </div>
                <div className="text-sm font-bold text-[#0F172A]">
                  +1 (800) 123-4567
                </div>
              </div>
            </div>

            <div
              data-testid="hero-hours"
              className="px-5 py-3 rounded-2xl bg-white border border-[#E2E8F0] hc-soft-shadow"
            >
              <div className="text-[11px] uppercase tracking-wider text-[#475569] font-semibold">
                Opening Hours
              </div>
              <div className="flex items-center gap-6 mt-1 text-sm">
                <div>
                  <span className="text-[#475569]">Mon–Fri</span>{" "}
                  <span className="font-semibold text-[#0F172A]">8:00 – 20:00</span>
                </div>
                <div>
                  <span className="text-[#475569]">Sat–Sun</span>{" "}
                  <span className="font-semibold text-[#0F172A]">9:00 – 15:30</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Doctor image + floating cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="lg:col-span-6 relative"
        >
          <div className="relative mx-auto max-w-[520px]">
            {/* Gradient glow ring */}
            <div className="absolute -inset-6 rounded-[36px] hc-gradient-bg opacity-20 blur-2xl" />

            <div className="relative rounded-[28px] overflow-hidden border border-white/60 bg-white/60 backdrop-blur-md hc-soft-shadow">
              <img
                src={HERO_IMG}
                alt="Doctor smiling"
                className="w-full h-[560px] object-cover"
                data-testid="hero-image"
                loading="eager"
              />
            </div>

            {/* Floating glass cards */}
            {floatCards.map((c) => (
              <motion.div
                key={c.testId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + c.delay }}
                data-testid={c.testId}
                className={`absolute ${c.className} hc-glass rounded-2xl px-4 py-3 flex items-center gap-3 hc-float`}
                style={{ animationDelay: `${c.delay}s` }}
              >
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-lg`}
                >
                  <c.icon className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-base font-bold text-[#0F172A] leading-none">
                    {c.title}
                  </div>
                  <div className="text-xs text-[#475569] mt-1">{c.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
