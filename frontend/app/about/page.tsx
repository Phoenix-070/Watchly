export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 mt-16 animate-in fade-in duration-700 pb-20">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-brand-light mb-8">
        About Watchly
      </h1>
      <div className="glass-panel p-8 md:p-12 text-brand-text-lighter leading-relaxed space-y-6">
        <p className="text-lg">
          Watchly is the premier social network for film lovers. Our mission is to connect people through their shared love of cinema, allowing you to track films you've watched, save those you want to see, and tell your friends what's good.
        </p>
        <p>
          Whether you're a casual viewer or a hardcore cinephile, Watchly provides the tools you need to keep a diary of your film life, share curated lists, and discover hidden gems through our intelligent, community-driven recommendation engine.
        </p>
        <p>
          Built with cutting-edge technology and a passion for design, we strive to make logging movies as enjoyable as watching them.
        </p>
      </div>
    </div>
  );
}
