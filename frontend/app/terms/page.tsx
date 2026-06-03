export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 mt-16 animate-in fade-in duration-700 pb-20">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-brand-light mb-8">
        Terms of Service
      </h1>
      <div className="glass-panel p-8 md:p-12 text-brand-text-lighter leading-relaxed space-y-6 text-sm">
        <p><strong>Last Updated:</strong> May 2026</p>
        <h2 className="text-xl font-bold text-brand-light mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Watchly ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <h2 className="text-xl font-bold text-brand-light mt-8 mb-4">2. User Accounts</h2>
        <p>
          To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account.
        </p>
        <h2 className="text-xl font-bold text-brand-light mt-8 mb-4">3. Data & Privacy</h2>
        <p>
          Your privacy is important to us. Watchly collects and stores data related to your movie preferences, watch history, and account details securely via Google Firebase. We do not sell your personal data to third parties. Movie metadata is provided by the TMDB API.
        </p>
        <h2 className="text-xl font-bold text-brand-light mt-8 mb-4">4. Content Guidelines</h2>
        <p>
          Users are prohibited from posting offensive, inappropriate, or spam content in comments and reviews. We reserve the right to remove any content or terminate accounts that violate these guidelines without prior notice.
        </p>
      </div>
    </div>
  );
}
