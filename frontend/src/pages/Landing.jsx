import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Features from "@/components/Features";
import Doctors from "@/components/Doctors";
import Testimonials from "@/components/Testimonials";
import Appointment from "@/components/Appointment";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div data-testid="landing-page" className="bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Features />
        <Doctors />
        <Testimonials />
        <Appointment />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
