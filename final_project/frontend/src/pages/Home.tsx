import Header from '../components/Header';
import Hero from '../components/Hero';
import UniversityTicker from '../components/UniversityTicker';
import Services from '../components/Services';
import WhyTilla from '../components/WhyTilla';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import CurveDivider from '../components/CurveDivider';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <Hero />
      <UniversityTicker />
      <Services />
      <CurveDivider 
        className="bg-white dark:bg-slate-950" 
        fillClassName="fill-slate-100 dark:fill-slate-900" 
      />
      <WhyTilla />
      <CurveDivider 
        className="bg-slate-100 dark:bg-slate-900" 
        fillClassName="fill-white dark:fill-slate-950" 
      />
      <Pricing />
      <CurveDivider 
        className="bg-white dark:bg-slate-950" 
        fillClassName="fill-slate-100 dark:fill-slate-900" 
      />
      <FAQ />
      <CurveDivider 
        className="bg-slate-100 dark:bg-slate-900" 
        fillClassName="fill-white dark:fill-slate-950" 
      />
      <Footer />
    </main>
  );
}
