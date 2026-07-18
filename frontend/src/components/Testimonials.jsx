import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Whitman",
    role: "Patient · Cardiology",
    quote:
      "The team caught something my previous doctor missed for 3 years. Same-day scans, clear explanations, real follow-through.",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "Daniel Osei",
    role: "Patient · Primary Care",
    quote:
      "Booking felt like using a modern app, not a hospital portal. My doctor even texted me my results.",
    avatar: "https://i.pravatar.cc/120?img=15",
  },
  {
    name: "Priya Sharma",
    role: "Patient · Pediatrics",
    quote:
      "Kind, calm, and never rushed. Our son actually looks forward to visits now — that says everything.",
    avatar: "https://i.pravatar.cc/120?img=32",
  },
  {
    name: "Luca Romano",
    role: "Patient · Virtual Care",
    quote:
      "A video visit at 10pm saved me an ER trip. Prescription arrived at my pharmacy before I hung up.",
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    name: "Amelia Foster",
    role: "Patient · Neurology",
    quote:
      "The most human healthcare experience I've had. They treat you like a person, not a case number.",
    avatar: "https://i.pravatar.cc/120?img=45",
  },
  {
    name: "Kenji Watanabe",
    role: "Patient · Diagnostics",
    quote:
      "Results back the same afternoon with a plain-English summary. I finally understand my own labs.",
    avatar: "https://i.pravatar.cc/120?img=59",
  },
];

function Card({ t, idx }) {
  return (
    <div
      data-testid={`testimonial-${idx}`}
      className="shrink-0 w-[340px] sm:w-[400px] rounded-[24px] hc-glass p-6 mx-3"
    >
      <div className="flex items-center gap-1 text-[#F59E0B]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-[#0F172A] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-11 h-11 rounded-full object-cover border border-white"
          loading="lazy"
        />
        <div>
          <div className="font-semibold text-[#0F172A] text-sm">{t.name}</div>
          <div className="text-xs text-[#475569]">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="py-24 sm:py-32 bg-[#F8FAFC] overflow-hidden"
    >
      <div className="hc-container">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            Testimonials
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Loved by patients across the country.
          </h2>
        </div>
      </div>

      <div className="relative mt-14">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10" />

        <div className="flex hc-marquee w-max">
          {loop.map((t, i) => (
            <Card t={t} idx={i} key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
