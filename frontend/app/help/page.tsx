export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 mt-16 animate-in fade-in duration-700 pb-20">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-brand-light mb-8">
        Help & Support
      </h1>
      <div className="grid gap-6">
        <div className="glass-panel p-6 border-white/5">
          <h3 className="text-lg font-bold text-brand-light mb-2">How do I log a movie?</h3>
          <p className="text-brand-text text-sm">Navigate to any movie detail page by searching or clicking a poster. Then use the heart icon to Like, the bookmark icon to Watchlist, or the star icons to Rate it.</p>
        </div>
        <div className="glass-panel p-6 border-white/5">
          <h3 className="text-lg font-bold text-brand-light mb-2">Where do my recommendations come from?</h3>
          <p className="text-brand-text text-sm">Our ML algorithm uses an Item-Based Content-Filtering system that cross-references your liked and highly rated films with the global TMDB database to find specific matches.</p>
        </div>
        <div className="glass-panel p-6 border-white/5">
          <h3 className="text-lg font-bold text-brand-light mb-2">How can I delete my account?</h3>
          <p className="text-brand-text text-sm">Please send an email to support@watchly.example.com from the email address associated with your account, and our team will process the deletion within 48 hours.</p>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-brand-text mb-4">Still need help?</p>
        <button className="btn-primary border-white/20 bg-white/5 text-brand-light px-8">Contact Support</button>
      </div>
    </div>
  );
}
