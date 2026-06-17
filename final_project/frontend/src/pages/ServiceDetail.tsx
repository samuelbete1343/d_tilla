import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import CourseListingSection from '../components/CourseListingSection';
import { 
  GraduationCap, 
  Compass, 
  CheckCircle2, 
  ArrowLeft,
  BookOpen,
  FileText,
  Target,
  Zap,
  X,
  Smartphone,
  CreditCard,
  Building2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  Video,
  Trophy,
  ClipboardList,
  Presentation,
  Send,
  ArrowRight
} from 'lucide-react';

const serviceData: Record<string, any> = {
  "entrance-prep": {
    title: "Entrance Prep",
    icon: GraduationCap,
    description: "Our Entrance Prep service is designed to give you the ultimate edge in university entrance examinations. We provide a comprehensive suite of tools and resources tailored to the new Ethiopian curriculum.",
    price: 300,
    benefits: [
      "Full Mock Exams with real-time feedback",
      "New Curriculum Notes summarized by top students",
      "Amharic Explanations for complex concepts",
      "Subject-specific practice questions",
      "Performance tracking and analytics",
      "Offline study materials in PDF format"
    ],
    whatYouGet: "With access to our Entrance Prep program, you gain a structured learning path covering all major subjects. You'll receive weekly mock tests that simulate the actual exam environment, helping you build confidence and time management skills.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10"
  },
  "freshman-portal": {
    title: "Freshman Portal",
    icon: Compass,
    description: "The Freshman Portal is your essential companion for navigating the first year of university. We help you stay on track with your GPA and make informed decisions about your future department.",
    price: 500,
    benefits: [
      "Advanced GPA Calculator",
      "Course Summaries for all subjects",
      "Senior student mentorship and advice",
      "Rich Resources",
      "24/7 Support"
    ],
    whatYouGet: "The Freshman Portal provides you with the data and tools needed to excel in your first year. You'll be able to track your academic progress accurately and understand the requirements for your desired department, reducing the stress of university life.",
    services: [
      { 
        title: "1. Snap-Notes", 
        desc: "We know you don't have time to read hundreds of pages. Snap-Notes are the best short notes for every chapter. We take the long, confusing books and \"snap\" them into simple points. It is the fastest way to get the main idea without getting tired." 
      },
      { 
        title: "2. Concept-Crush", 
        desc: "If a chapter feels too hard, Concept-Crush will fix it. These are high-quality videos we share on our website and our private Telegram channel. We \"crush\" difficult topics until they are easy to understand. It’s like having a private tutor in your pocket." 
      },
      { 
        title: "3. Exam-Cracker", 
        desc: "Don't just read—practice! Exam-Cracker gives you a set of practice questions for every single chapter. These questions are designed to look like the real national exams. If you can \"crack\" these questions, you are ready for the real thing." 
      },
      { 
        title: "4. Snap-Quiz", 
        desc: "After every lesson, take a Snap-Quiz. These are very short, quick tests to see if you understood what you just learned. It only takes a few minutes, but it helps you remember everything much better." 
      },
      { 
        title: "5. Custom Mid & Final Exams", 
        desc: "Every university is different. With this service, you choose which chapters your teacher is testing you on. We then give you a mock Mid-Exam or Final-Exam based only on those specific chapters. It is the best way to practice for your actual campus tests." 
      },
      { 
        title: "6. Bright-Slides", 
        desc: "Bright-Slides are the beautiful PowerPoints we prepare for you. Instead of looking at boring text, these slides use clear pictures and modern designs to make the lesson \"bright.\" They are perfect for a final review before your big exam." 
      }
    ],
    color: "text-mango",
    bgColor: "bg-mango/10"
  }
};

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const service = serviceId ? serviceData[serviceId] : null;
  const [unauthModalOpen, setUnauthModalOpen] = useState(false);


  const handleRegisterFlow = (tier: any) => {
    if (user) {
      // Navigate to course selection (freshman) or packages (entrance)
      if (serviceId === 'freshman-portal') {
        navigate('/explore-courses');
      } else {
        navigate('/packages');
      }
    } else {
      setUnauthModalOpen(true);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service not found</h1>
            <Link to="/" className="text-mango font-bold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      
      <main className="flex-grow">
        {/* Back Button */}
        <div className="absolute top-24 left-6 z-10">
          <Link 
            to="/#services" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-mango transition-colors font-bold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative pt-32 md:pt-48 pb-12 md:pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className={`absolute inset-0 ${service.bgColor} opacity-50 dark:opacity-20`} />
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className={`absolute -top-24 -right-24 w-96 h-96 ${service.bgColor} rounded-full blur-3xl opacity-50`} />
            <div className={`absolute top-1/2 -left-24 w-64 h-64 ${service.bgColor} rounded-full blur-3xl opacity-30`} />
          </div>

          <div className="relative w-full px-5 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-8xl font-display font-black text-slate-900 dark:text-white leading-[0.9] tracking-tight mb-6 md:mb-8 uppercase">
                {serviceId === 'freshman-portal' ? t('freshman.portal.title') : service.title}
              </h1>
              
              <p className="text-sm md:text-3xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl font-medium">
                {serviceId === 'freshman-portal' ? t('freshman.portal.desc') : service.description}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="w-full px-5 md:px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-16 md:space-y-24">
              {/* What You Get Section */}
              <section>
                <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10 overflow-hidden">
                  <div className="w-6 md:w-12 h-1 bg-mango rounded-full shrink-0" />
                  <h3 className="text-xl md:text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight shrink-0">
                    {serviceId === 'freshman-portal' ? t('freshman.whatYouGet.title') : 'What You Get'}
                  </h3>
                  <div className="h-1 bg-mango rounded-full flex-grow" />
                </div>
                
                <div className={`border p-6 md:p-10 rounded-2xl md:rounded-[40px] mb-8 md:mb-12 relative overflow-hidden group bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
                  <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 transition-transform group-hover:scale-150 duration-700 bg-blue-100/50 dark:bg-blue-700/10`} />
                  <p className="text-base md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed relative z-10 font-bold">
                    {serviceId === 'freshman-portal' ? t('freshman.whatYouGet.desc') : service.whatYouGet}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {service.benefits.map((benefit: string, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 md:gap-4 p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-mango/30"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                      </div>
                      <span className="text-[10px] md:text-base text-slate-800 dark:text-slate-200 font-bold">{benefit}</span>
                    </motion.div>
                  ))}
                  {serviceId === 'freshman-portal' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: service.benefits.length * 0.1 }}
                      className="flex items-center gap-3 md:gap-4 p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-mango/30"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                      </div>
                      <span className="text-[10px] md:text-base text-slate-800 dark:text-slate-200 font-bold">{t('freshman.subscription.note')}</span>
                    </motion.div>
                  )}
                </div>
              </section>

              {/* Included Services Section */}
              {serviceId === 'freshman-portal' && (
                <section>
                  <div className="flex items-center gap-3 md:gap-4 mb-4 overflow-hidden">
                    <div className="w-6 md:w-12 h-1 bg-mango rounded-full shrink-0" />
                    <h3 className="text-xl md:text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight shrink-0">{t('freshman.included.title')}</h3>
                    <div className="h-1 bg-mango rounded-full flex-grow" />
                  </div>
                  <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 mb-8 md:mb-12 max-w-2xl leading-relaxed font-medium">
                    {t('freshman.included.desc')}
                  </p>
                  
                  <div className="grid gap-6 md:gap-8">
                    {[
                      { 
                        title: t('freshman.snapnotes.title'), 
                        desc: t('freshman.snapnotes.desc'),
                        icon: FileText
                      },
                      { 
                        title: t('freshman.conceptcrush.title'), 
                        desc: t('freshman.conceptcrush.desc'),
                        icon: Video
                      },
                      { 
                        title: t('freshman.examcracker.title'), 
                        desc: t('freshman.examcracker.desc'),
                        icon: Trophy
                      },
                      { 
                        title: t('freshman.snapquiz.title'), 
                        desc: t('freshman.snapquiz.desc'),
                        icon: Zap
                      },
                      { 
                        title: t('freshman.mockexams.title'), 
                        desc: t('freshman.mockexams.desc'),
                        icon: ClipboardList
                      },
                      { 
                        title: t('freshman.brightslides.title'), 
                        desc: t('freshman.brightslides.desc'),
                        icon: Presentation
                      }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 hover:border-mango transition-all group shadow-sm hover:shadow-xl hover:shadow-mango/5"
                      >
                        <div className="flex flex-col md:flex-row gap-5 md:gap-8">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center text-mango shrink-0 group-hover:scale-110 shadow-sm transition-transform">
                            <item.icon className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg md:text-2xl font-display font-black mb-3 md:mb-4 text-slate-900 dark:text-white group-hover:text-mango transition-colors uppercase tracking-tight">
                              {item.title}
                            </h4>
                            <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Removed Included Subjects Section */}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4">
              <div className="static lg:sticky top-32 space-y-6 md:space-y-8">
                {/* Pricing Section */}
                <div className="space-y-4 md:space-y-6">
                  {serviceId === 'freshman-portal' ? (
                    // Single flat plan — 100 ETB, any 7 courses
                    <div className="bg-slate-900 border border-mango ring-2 ring-mango/20 p-6 md:p-8 rounded-3xl md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-mango text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest">
                        Flat Rate
                      </div>
                      <h4 className="font-display font-black text-xl md:text-2xl mb-2 uppercase tracking-tight">
                        Course Access
                      </h4>
                      <p className="text-slate-400 text-xs mb-4 uppercase tracking-tight">Any 7 courses · one-time payment</p>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl md:text-4xl font-black text-mango">100</span>
                        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">ETB</span>
                      </div>
                      <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        {["Chapter Practice", "Step-by-Step Answers", "PDF Course Summaries", "Video Explanations", "Progress Tracking"].map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-tight">
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-mango shrink-0" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleRegisterFlow({})}
                        className="w-full py-3.5 md:py-4 font-black rounded-xl md:rounded-2xl transition-all text-xs border-2 uppercase tracking-widest bg-mango border-mango hover:bg-mango/90 text-white shadow-lg shadow-mango/20"
                      >
                        Select My 7 Courses
                      </button>
                    </div>
                  ) : (
                    // Entrance Prep — two tiers unchanged
                    <>
                    {[
                      { 
                        name: "Standard Account", 
                        price: "399", 
                        features: ["All Exam Questions", "Detailed Answer Keys", "Subject Summaries", "Progress Tracking"]
                      },
                      { 
                        name: "Premium Account", 
                        price: "899", 
                        features: ["Everything in Standard", "Unlimited Mock Exams", "AI Performance Analysis", "Priority Support", "PDF Downloads"]
                      }
                    ].map((tier, i) => (
                      <div key={i} className={`bg-slate-900 border p-6 md:p-8 rounded-3xl md:rounded-[40px] text-white shadow-2xl relative overflow-hidden group ${i === 1 ? 'border-mango ring-2 ring-mango/20' : 'border-slate-800'}`}>
                        {i === 1 && (
                          <div className="absolute top-0 right-0 bg-mango text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest">
                            Premium Support
                          </div>
                        )}
                        <h4 className="font-display font-black text-xl md:text-2xl mb-2 uppercase tracking-tight">{tier.name}</h4>
                        <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-3xl md:text-4xl font-black text-mango">{tier.price}</span>
                          <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">ETB</span>
                        </div>
                        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                          {tier.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5 text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-tight">
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-mango shrink-0" />
                              <span className="leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleRegisterFlow(tier)}
                          className={`w-full py-3.5 md:py-4 font-black rounded-xl md:rounded-2xl transition-all text-xs border-2 uppercase tracking-widest ${
                            i === 1
                              ? 'bg-mango border-mango hover:bg-mango/90 text-white shadow-lg shadow-mango/20'
                              : 'bg-white/5 border-white/10 hover:border-mango hover:text-mango text-white'
                          }`}
                        >
                          Register Now
                        </button>
                      </div>
                    ))}
                    </>
                  )}
                </div>

                {/* Support Card */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl md:rounded-[40px] text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 md:mb-6">
                    <Send className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h4 className="text-lg md:text-xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Need Help?</h4>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-5 md:mb-6 font-medium">Our team is active on Telegram to support you.</p>
                  <a 
                    href="https://t.me/Tilla_Register" 
                    target="_blank"
                    className="inline-flex items-center justify-center w-full md:w-auto gap-2 text-[10px] md:text-sm text-blue-600 font-black hover:gap-3 transition-all uppercase tracking-widest"
                  >
                    Chat on Telegram
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Course Listing Section */}
          <div className="mt-20 md:mt-32 pt-16 md:pt-24 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="w-full text-center mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="h-1 bg-mango rounded-full flex-grow min-w-[50px] md:min-w-[100px]" />
                <h3 className="text-2xl md:text-5xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight shrink-0">
                  {serviceId === 'freshman-portal' ? t('freshman.explore.title') : 'Explore Courses'}
                </h3>
                <div className="h-1 bg-mango rounded-full flex-grow min-w-[50px] md:min-w-[100px]" />
              </div>
              <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto px-5 font-medium">
                {serviceId === 'freshman-portal' ? t('freshman.explore.desc') : 'Explore our comprehensive list of academic subjects.'}
              </p>
            </div>
            {serviceId === 'entrance-prep' ? (
              <CourseListingSection type="entrance" hideHeader />
            ) : (
              <CourseListingSection type="freshman" hideHeader />
            )}
          </div>
        </div>
      </main>



      <AnimatePresence>
        {unauthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setUnauthModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-mango/10 rounded-full flex items-center justify-center mx-auto text-mango">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Account Required</h3>
                  <p className="text-slate-600 dark:text-slate-400">Please sign in or sign up for free to register for this service.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link 
                    to="/login"
                    className="flex items-center justify-center py-3.5 rounded-xl border-2 border-mango text-mango font-bold hover:bg-mango/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className="flex items-center justify-center py-3.5 rounded-xl bg-mango text-white font-bold hover:bg-mango/90 transition-colors shadow-lg shadow-mango/20"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
              <button 
                onClick={() => setUnauthModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
