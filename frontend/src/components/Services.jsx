import { motion } from "framer-motion";
import {
  ArrowRight,
  HeartPulse,
  Stethoscope,
  Baby,
  Microscope,
  Brain,
  ShieldPlus,
} from "lucide-react";

const SERVICES = [
  {
    icon: HeartPulse,
    title: "Cardiology",
    desc: "Advanced heart care with non-invasive diagnostics and rehabilitation programs.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=900",
    tint: "from-rose-500/80 to-indigo-600/80",
  },
  {
    icon: Microscope,
    title: "Diagnostics Lab",
    desc: "Same-day results from a fully accredited on-site laboratory and imaging suite.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900",
    tint: "from-indigo-500/80 to-violet-600/80",
  },
  {
    icon: Stethoscope,
    title: "Primary Care",
    desc: "Preventive checkups, screenings and long-term care from your family doctor.",
    image: "https://images.pexels.com/photos/5207102/pexels-photo-5207102.jpeg",
    tint: "from-blue-500/80 to-indigo-600/80",
  },
  {
    icon: Baby,
    title: "Pediatrics",
    desc: "Gentle, evidence-based care for infants, children and adolescents.",
    image: "https://images.pexels.com/photos/7108396/pexels-photo-7108396.jpeg",
    tint: "from-violet-500/80 to-blue-600/80",
  },
  {
    icon: Brain,
    title: "Neurology",
    desc: "Comprehensive care for the brain, spine, and nervous system disorders.",
    image: "https://images.pexels.com/photos/5827294/pexels-photo-5827294.jpeg",
    tint: "from-fuchsia-500/80 to-indigo-600/80",
  },
  {
    icon: ShieldPlus,
    title: "Virtual Care",
    desc: "Talk to a certified doctor in minutes — from anywhere, on any device.",
    image: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=900",
    tint: "from-emerald-500/80 to-blue-600/80",
  },
];

export default function Services() {
  return (
    <section id="services" data-testid="services-section" className="py-24 sm:py-32 bg-[#F8FAFC]">
      <div className="hc-container">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            Services
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Care that spans every stage of life.
          </h2>
          <p className="mt-4 text-[#475569] text-base sm:text-lg leading-relaxed">
            From routine visits to complex specialties, our multidisciplinary
            team is on-call to deliver the right care, at the right time.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative rounded-[24px] bg-white border border-[#E2E8F0] p-3 hc-soft-shadow hover:hc-lift-shadow transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient border on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 rounded-[24px] p-[1.5px] bg-gradient-to-br from-[#4F46E5]/40 via-[#8B5CF6]/40 to-transparent">
                  <div className="w-full h-full rounded-[22px] bg-white" />
                </div>
              </div>

              <div className="relative rounded-[18px] overflow-hidden aspect-[16/11]">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${s.tint} mix-blend-multiply opacity-60`} />
                <div className="absolute top-4 left-4 inline-flex items-center justify-center w-11 h-11 rounded-xl hc-glass text-[#4F46E5]">
                  <s.icon className="w-5 h-5" />
                </div>
              </div>

              <div className="relative px-4 pt-5 pb-4">
                <h3 className="font-display text-xl font-bold text-[#0F172A]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  {s.desc}
                </p>
                <a
                  href="#appointment"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] group/link"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
