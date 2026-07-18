import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How quickly can I get an appointment?",
    a: "Most specialties offer same-day or next-day slots. For urgent needs, our virtual care team is available 24/7.",
  },
  {
    q: "Do you accept my insurance?",
    a: "We work with all major insurers and provide transparent, upfront pricing for out-of-pocket visits.",
  },
  {
    q: "Can I see my records and results online?",
    a: "Yes. Every visit, lab result and prescription lives in your Healthca account, with plain-English summaries.",
  },
  {
    q: "Do you offer virtual consultations?",
    a: "Absolutely — connect with a board-certified doctor over video, usually within 15 minutes.",
  },
  {
    q: "Is my data secure?",
    a: "All records are encrypted end-to-end and HIPAA-compliant. Your data is yours — always.",
  },
  {
    q: "How do I cancel or reschedule?",
    a: "Tap 'Reschedule' in your confirmation email or from your account. No fees for changes made 12+ hours in advance.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" data-testid="faq-section" className="py-24 sm:py-32 bg-[#F8FAFC]">
      <div className="hc-container grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
            FAQ
          </div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Questions,
            <br />
            answered.
          </h2>
          <p className="mt-5 text-[#475569] text-base sm:text-lg max-w-md leading-relaxed">
            Can&rsquo;t find what you&rsquo;re looking for? Our care team replies within a few minutes.
          </p>
        </div>

        <div className="lg:col-span-7">
          <Accordion type="single" collapsible className="w-full space-y-3" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                data-testid={`faq-item-${i}`}
                className="rounded-2xl bg-white border border-[#E2E8F0] px-5 sm:px-6 overflow-hidden hc-soft-shadow"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-[#0F172A] hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#475569] pb-5 pr-8 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
