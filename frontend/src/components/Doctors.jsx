import { motion } from "framer-motion";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const DOCTORS = [
  {
    name: "Dr. Aisha Bennett",
    role: "Cardiologist",
    img: "https://images.pexels.com/photos/35174996/pexels-photo-35174996.jpeg",
  },
  {
    name: "Dr. Marcus Chen",
    role: "Neurologist",
    img: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?w=800",
  },
  {
    name: "Dr. Emily Rivera",
    role: "Pediatrician",
    img: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
  },
  {
    name: "Dr. Jonas Meyer",
    role: "General Physician",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800",
  },
];

export default function Doctors() {
  return (
    <section id="doctors" data-testid="doctors-section" className="py-24 sm:py-32 bg-white">
      <div className="hc-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
              Our Team
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
              Meet the specialists behind the care.
            </h2>
          </div>
          <p className="text-[#475569] text-base sm:text-lg max-w-md leading-relaxed">
            A curated team of board-certified physicians, chosen for both
            clinical excellence and human warmth.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOCTORS.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              data-testid={`doctor-card-${i}`}
              className="group rounded-[24px] bg-white border border-[#E2E8F0] p-3 hc-soft-shadow hover:hc-lift-shadow transition-all"
            >
              <div className="relative rounded-[18px] overflow-hidden aspect-[3/4]">
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover overlay with social icons */}
                <div className="absolute inset-x-3 bottom-3 hc-glass rounded-2xl p-3 flex items-center justify-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {[Facebook, Twitter, Linkedin, Instagram].map((Ic, k) => (
                    <a
                      key={k}
                      href="#"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#4F46E5] hover:hc-gradient-bg hover:text-white transition-colors"
                      aria-label="social"
                    >
                      <Ic className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="px-3 pt-4 pb-2 text-center">
                <div className="font-display text-lg font-bold text-[#0F172A]">
                  {d.name}
                </div>
                <div className="text-sm text-[#4F46E5] font-medium mt-0.5">
                  {d.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
