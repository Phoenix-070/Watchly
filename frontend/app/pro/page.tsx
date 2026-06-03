import Link from "next/link";

export default function ProPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 mt-16 animate-in fade-in duration-700 pb-20 text-center">
      <div className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6">
        Watchly Pro
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-brand-light mb-6">
        Unlock the ultimate film experience.
      </h1>
      <p className="text-lg text-brand-text-lighter mb-12 max-w-2xl mx-auto">
        Upgrade to Watchly Pro to access advanced statistics, custom profile themes, unlimited list creation, and an ad-free browsing experience.
      </p>
      
      <div className="glass-panel p-10 max-w-md mx-auto border-brand-orange/20 shadow-[0_0_50px_rgba(255,165,0,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent"></div>
        <h2 className="text-2xl font-black text-white mb-2 relative z-10">Pro Membership</h2>
        <div className="text-4xl font-black text-brand-orange mb-6 relative z-10">$3<span className="text-lg text-brand-text">/mo</span></div>
        <ul className="text-left space-y-4 mb-8 text-brand-text relative z-10">
          <li className="flex items-center gap-3"><span className="text-brand-orange">✓</span> Advanced annual stats</li>
          <li className="flex items-center gap-3"><span className="text-brand-orange">✓</span> Custom profile backdrops</li>
          <li className="flex items-center gap-3"><span className="text-brand-orange">✓</span> Clone & filter friends' lists</li>
          <li className="flex items-center gap-3"><span className="text-brand-orange">✓</span> Support independent development</li>
        </ul>
        <button className="w-full btn-primary bg-brand-orange border-brand-orange text-white py-3 shadow-[0_0_15px_rgba(255,165,0,0.4)] relative z-10">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
