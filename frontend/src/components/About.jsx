import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Award, Clock, Smile } from "lucide-react";

const ABOUT_IMG =
  "https://images.pexels.com/photos/31499386/pexels-photo-31499386.jpeg";

function Counter({ to, suffix = "", duration = 1600 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    icon: Smile,
    to: 12000,
    suffix: "+",
    label: "Patients Recovered",
    highlight: true,
  },
  { icon: Clock, to: 15, suffix: " min", label: "Avg. Waiting Time" },
  { icon: Award, to: 25, suffix: "+", label: "Years of Excellence" },
];

export default function About() {
  return (
    <section id="about" data-testid="about-section" className="py-24 sm:py-32 bg-white">
      <div className="hc-container grid lg:grid-cols-12 gap-14 items-center">
        {/* Image + floating card */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-6 relative"
        >
          <div className="relative rounded-[28px] overflow-hidden hc-soft-shadow">
            <img
              src={ABOUT_IMG}
              alt="Doctor with patient"
              className="w-full h-[520px] object-cover"
              loading="lazy"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            data-testid="about-floating-card"
            className="absolute -bottom-6 left-6 right-16 md:right-24 rounded-[20px] hc-glass p-5 md:p-6 flex items-center gap-4"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl hc-gradient-bg text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-[#0F172A]">
                Quality Healthcare
              </div>
              <div className="text-sm text-[#475569] mt-0.5">
                JCI-accredited multidisciplinary care team.
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right content */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-6"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            About Us
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Excellent care.
            <br />
            Humane principles.
          </h2>
          <p className="mt-5 text-[#475569] text-base sm:text-lg leading-relaxed max-w-xl">
            We&rsquo;re rebuilding the clinic experience around calm, clarity and
            outcomes. Our specialists collaborate on every case — so you get
            answers faster and treatments that actually fit your life.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                data-testid={`about-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-2xl p-5 border ${
                  s.highlight
                    ? "hc-gradient-bg text-white border-transparent shadow-[0_16px_40px_rgba(79,70,229,0.35)]"
                    : "bg-white text-[#0F172A] border-[#E2E8F0]"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                    s.highlight ? "bg-white/20" : "bg-[#EEF2FF] text-[#4F46E5]"
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <div className={`mt-4 text-3xl font-display font-extrabold ${s.highlight ? "text-white" : "text-[#0F172A]"}`}>
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <div className={`mt-1 text-sm ${s.highlight ? "text-white/85" : "text-[#475569]"}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#appointment"
            data-testid="about-cta"
            className="mt-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_14px_35px_rgba(79,70,229,0.35)] hover:shadow-[0_18px_45px_rgba(79,70,229,0.5)] transition-all"
          >
            Learn more about us
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
