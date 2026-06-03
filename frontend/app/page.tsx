import Image from "next/image";
import Link from "next/link";
import MovieCard from "../components/MovieCard";
import Recommendations from "../components/Recommendations";
import { getPopularMovies, getNowPlayingMovies } from "../lib/tmdb";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const popularMoviesData = getPopularMovies();
    const nowPlayingMoviesData = getNowPlayingMovies();

    // Fetch them concurrently
    const [moviesRes, nowPlayingRes] = await Promise.all([
        popularMoviesData,
        nowPlayingMoviesData
    ]);

    const movies = moviesRes.slice(0, 10);
    const nowPlaying = nowPlayingRes.slice(0, 5);

    return (
        <div className="space-y-16 mt-6 max-w-7xl mx-auto px-6">
            {/* Hero Section */}
            <section className="relative w-full rounded-2xl overflow-hidden glass-panel border-white/20 shadow-2xl isolate h-[500px] md:h-[600px] flex items-center">
                <div className="absolute inset-0 -z-10">
                    <Image
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
                        alt="Cinema"
                        fill
                        priority
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent"></div>
                </div>

                <div className="px-8 py-20 md:py-32 text-center max-w-3xl mx-auto flex flex-col items-center relative z-10 w-full animate-in fade-in zoom-in duration-1000">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,224,84,0.15)]">
                        The new social network for film lovers
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-brand-light mb-6 leading-tight drop-shadow-2xl">
                        Track films you&apos;ve watched.<br />
                        <span className="text-gradient">Save those you want to see.</span>
                    </h1>
                    <p className="text-lg text-brand-text-lighter mb-10 max-w-xl drop-shadow-lg">
                        Tell your friends what&apos;s good. Keep a diary of your film life, share lists, and explore new worlds.
                    </p>
                    <Link href="/register" className="btn-primary w-auto px-10 py-4 text-base shadow-[0_0_25px_rgba(0,224,84,0.3)] hover:scale-105 transition-transform duration-300">
                        Get Started — It&apos;s Free
                    </Link>
                </div>
            </section>

            {/* Personalized Recommendations Section (Client Component) */}
            <Recommendations />

            {/* Now Showing Section */}
            <section>
                <div className="flex justify-between items-baseline mb-6 border-b border-brand-orange/30 pb-3">
                    <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase hover:text-brand-light transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(255,128,0,0.8)]"></span> Now Showing in Cinemas
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                    {nowPlaying.map((movie, index) => (
                        <MovieCard key={movie.id} movie={movie} index={index} />
                    ))}
                </div>
            </section>

            {/* Grid Section */}
            <section>
                <div className="flex justify-between items-baseline mb-6 border-b border-white/10 pb-3">
                    <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase hover:text-brand-light transition-colors cursor-pointer">
                        Popular Films This Week
                    </h2>
                    <Link href="/films" className="text-xs font-bold text-brand-text hover:text-brand-blue transition-colors uppercase tracking-widest">
                        More
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                    {movies.map((movie, index) => (
                        <MovieCard key={movie.id} movie={movie} rank={index + 1} index={index} />
                    ))}
                </div>
            </section>
        </div>
    );
}
