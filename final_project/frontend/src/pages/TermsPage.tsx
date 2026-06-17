import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20 px-6 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-10">Effective: January 1, 2025</p>

        <div className="prose dark:prose-invert prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Acceptance</h2>
            <p>By creating an account or using the Tilla platform, you agree to these Terms. If you do not agree, do not use the service.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Subscriptions and Payments</h2>
            <p>Access to course content requires an active subscription. Payments are processed manually via the bank or mobile-money accounts listed on the checkout page. Access is granted after payment verification, typically within 5 hours. Subscriptions are non-transferable.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Refund Policy</h2>
            <p>Refund requests must be submitted within 7 days of payment and before accessing more than 20% of course content. Approved refunds are processed within 14 business days.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Acceptable Use</h2>
            <p>You may not share your account credentials, reproduce or distribute course content, or use the platform for any unlawful purpose. Violations may result in immediate account termination without refund.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Intellectual Property</h2>
            <p>All course content, materials, and platform code are the property of Tilla or its content providers. No content may be reproduced without written permission.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Limitation of Liability</h2>
            <p>Tilla is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">7. Contact</h2>
            <p>Questions about these terms should be directed to <a href="mailto:support@tillalearn.com" className="text-mango hover:underline">support@tillalearn.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
