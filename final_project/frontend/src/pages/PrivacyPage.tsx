import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20 px-6 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-10">Effective: January 1, 2025</p>

        <div className="prose dark:prose-invert prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly when you register, including your name, email address, phone number, and program type. We also collect usage data such as lessons completed, quiz results, and session duration to personalise your learning experience.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve the Tilla platform, process payments, send service updates, and generate anonymised learning analytics. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Data Storage and Security</h2>
            <p>Data is stored on secured servers. We use industry-standard encryption for data in transit (TLS) and at rest. Access to personal data is restricted to authorised personnel only.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:support@tillalearn.com" className="text-mango hover:underline">support@tillalearn.com</a>. Account deletion requests are processed within 30 days.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Cookies</h2>
            <p>We use essential cookies to maintain your login session and preferences. No third-party tracking or advertising cookies are used.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Contact</h2>
            <p>Questions about this policy should be sent to <a href="mailto:support@tillalearn.com" className="text-mango hover:underline">support@tillalearn.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
