import Link from "next/link";
import "./globals.css";
import { ReactNode } from "react";
import HeaderAuth from "../components/HeaderAuth";
import { AuthProvider } from "../components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { CollectionsProvider } from "../components/CollectionsProvider";
import CollectionsModal from "../components/CollectionsModal";
import CollectionsNavButton from "../components/CollectionsNavButton";

export const metadata = {
  title: "Watchly — Discover & Track Films",
  description: "Track movies, discover new content, and share your movie taste.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-bg text-brand-text antialiased selection:bg-brand-green selection:text-brand-bg relative">
        <AuthProvider>
          <CollectionsProvider>
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#1a1f26', color: '#e2e8f0', border: '1px solid #40bcf4', fontSize: '14px' } }} />
            
            {/* The Global Pop-up */}
            <CollectionsModal />

            <header className="bg-[#0b0f14]/80 backdrop-blur-lg border-b border-[#00d2ff]/10 sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                
                {/* Left Logo and Links */}
                <div className="flex flex-1 items-center gap-8">
                  <Link href="/" className="flex items-center group">
                    <span 
                      className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#0052D4] text-[44px] leading-normal py-2 pr-3 -mr-2 transform group-hover:scale-105 transition-transform duration-500"
                      style={{ fontFamily: "'Pacifico', cursive", filter: "drop-shadow(0 4px 10px rgba(0, 82, 212, 0.3))" }}
                    >
                      W
                    </span>
                    <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 pt-2">atchly</span>
                  </Link>

                  <nav className="hidden md:flex items-center gap-8 font-bold text-[11px] tracking-[0.2em] uppercase text-brand-text ml-4">
                    <Link href="/films" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#00d2ff] hover:to-[#0052D4] transition-all duration-300 py-2">Films</Link>
                    <Link href="/tv" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#00d2ff] hover:to-[#0052D4] transition-all duration-300 py-2">TV Shows</Link>
                    <Link href="/discover" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#00d2ff] hover:to-[#0052D4] transition-all duration-300 py-2">Discover</Link>
                    <Link href="/bracket" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-brand-orange to-[#ff0055] transition-all duration-300 py-2 flex items-center gap-1"><span className="text-brand-orange text-[10px]"></span> Brackets</Link>
                    <Link href="/match" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-500 transition-all duration-300 py-2 flex items-center gap-1"><span className="text-pink-500 text-[10px]">✦</span> Match</Link>
                  </nav>
                </div>

                {/* Center Search Bar & Collections Icon */}
                <div className="flex-none w-auto hidden sm:flex justify-center items-center gap-3 mx-4">
                  <div className="relative group w-full max-w-md">
                    <form action="/search" className="w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-[#678] group-focus-within:text-[#00d2ff] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="q"
                        placeholder="Search films, actors..."
                        className="bg-[#1a1f26]/50 form-input block w-full pl-10 pr-4 py-2.5 text-sm text-brand-light rounded-full border border-white/5 focus:border-[#00d2ff]/50 focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00d2ff]/50 focus:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-300 placeholder:text-[#678] w-48 md:w-64 lg:w-80 focus:w-full"
                      />
                    </form>
                  </div>
                  
                  {/* Collections Pop-up Trigger */}
                  <CollectionsNavButton />

                </div>

                {/* Right Profile Icon */}
                <div className="flex flex-1 justify-end items-center">
                    <HeaderAuth />
                </div>
              </div>
            </header>

            <main className="min-h-screen">
              {children}
            </main>

            <footer className="mt-20 py-12 border-t border-white/5 bg-[#111417]">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <div className="text-brand-light font-bold text-lg tracking-tight mb-2">Watchly</div>
                  <p className="text-sm text-[#678]">The social network for film lovers.</p>
                </div>
                <div className="flex gap-6 text-sm font-semibold text-brand-text tracking-wide">
                  <Link href="/about" className="hover:text-brand-light transition">About</Link>
                  <Link href="/pro" className="hover:text-brand-light transition">Pro</Link>
                  <Link href="/help" className="hover:text-brand-light transition">Help</Link>
                  <Link href="/terms" className="hover:text-brand-light transition">Terms</Link>
                </div>
              </div>
            </footer>
          </CollectionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
