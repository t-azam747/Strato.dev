import { Navbar } from '../components/layout/LandingNavbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { Stats } from '../components/sections/Stats';
import { CTA } from '../components/sections/CTA';

function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-black text-white font-cyber">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-cyber-grid bg-[size:50px_50px] opacity-20 pointer-events-none" />

      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}
export default LandingPage;