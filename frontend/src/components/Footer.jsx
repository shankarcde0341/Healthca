import { useState } from "react";
import { toast } from "sonner";
import {
  HeartPulse,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

const COLS = [
  {
    title: "Services",
    links: ["Cardiology", "Neurology", "Pediatrics", "Diagnostics", "Virtual Care"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact", "Blog"],
  },
  {
    title: "Resources",
    links: ["Patient Portal", "Insurance", "Pricing", "Privacy", "Terms"],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/newsletter", { email });
      toast.success("Subscribed! Watch for your first Healthca update.");
      setEmail("");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) toast.info("You're already subscribed.");
      else toast.error("Couldn't subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer data-testid="footer" className="relative bg-[#0B1120] text-white overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[420px] h-[420px] rounded-full bg-violet-600/20 blur-3xl" />

      <div className="hc-container relative pt-20 pb-10">
        {/* Newsletter */}
        <div className="rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Newsletter
            </div>
            <h3 className="mt-3 font-display text-2xl sm:text-4xl font-bold leading-tight">
              Get health tips that don&rsquo;t
              <br className="hidden sm:block" />
              waste your time.
            </h3>
            <p className="mt-3 text-white/70 max-w-md">
              One thoughtful email a week. No spam, no fear-mongering.
            </p>
          </div>
          <form onSubmit={subscribe} className="w-full" data-testid="newsletter-form">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white/10 p-2 border border-white/15">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="newsletter-input"
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="newsletter-submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hc-gradient-bg shadow-[0_14px_35px_rgba(79,70,229,0.4)] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Main */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 md:col-span-3">
            <a href="#home" className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl hc-gradient-bg text-white">
                <HeartPulse className="w-5 h-5" />
              </span>
              <span className="font-display text-2xl font-bold">Healthca</span>
            </a>
            <p className="mt-5 text-white/60 max-w-sm leading-relaxed">
              A modern healthcare experience that puts calm, clarity and outcomes first.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-indigo-300" /> 240 Wellness Ave, Suite 500, Boston MA
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-300" /> +1 (800) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-300" /> hello@healthca.com
              </li>
            </ul>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Healthca. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                data-testid={`footer-social-${i}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:hc-gradient-bg hover:text-white hover:border-transparent transition-colors"
                aria-label="social"
              >
                <I className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
