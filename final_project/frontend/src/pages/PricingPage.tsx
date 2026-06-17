import Header from '../components/Header';
import Footer from '../components/Footer';
import Pricing from '../components/Pricing';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24 mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-mango transition-colors font-bold group text-sm"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Pricing />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
