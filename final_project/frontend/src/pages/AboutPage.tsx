import Header from '../components/Header';
import Footer from '../components/Footer';
import About from '../components/About';
import CurveDivider from '../components/CurveDivider';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Header />
      <div className="pt-20">
        <About />
        <CurveDivider />
        <Footer />
      </div>
    </div>
  );
}
