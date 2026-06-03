"use client";

import { useEffect, useState } from "react";
import MovieCard from "../../components/MovieCard";

const GENRES = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
];

export default function DiscoverPage() {
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [sortBy, setSortBy] = useState("popularity.desc");

    useEffect(() => {
        const fetchDiscoverData = async () => {
            try {
                const [upcomingRes, topRatedRes] = await Promise.all([
                    fetch("/api/movies?type=upcoming"),
                    fetch("/api/movies?type=top_rated")
                ]);
                
                if (upcomingRes.ok) {
                    const data = await upcomingRes.json();
                    setUpcoming(data.results.slice(0, 10));
                }
                
                if (topRatedRes.ok) {
                    const data = await topRatedRes.json();
                    setRecommended(data.results.slice(0, 10));
                }
            } catch (err) {
                console.error("Failed to fetch discovery data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscoverData();
    }, []);

    const handleApplyFilters = async () => {
        setLoading(true);
        try {
            let url = `/api/movies?type=discover&sort_by=${sortBy}`;
            if (selectedGenre) url += `&with_genres=${selectedGenre}`;
            if (selectedYear) url += `&primary_release_year=${selectedYear}`;
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setFilteredMovies(data.results || []);
            }
        } catch (err) {
            console.error("Failed to fetch filtered movies", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSurpriseMe = () => {
        const allPool = [...upcoming, ...recommended, ...filteredMovies];
        if (allPool.length > 0) {
            const randomMovie = allPool[Math.floor(Math.random() * allPool.length)];
            window.location.href = `/movie/${randomMovie.id}`;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 pb-20 animate-in fade-in duration-700">
            
            <Header sectionTitle="Discover" subtitle="Explore the world of cinema with advanced filters and curated lists." />

            {/* Quick Actions */}
            <div className="flex gap-4 mb-12">
                <button 
                    onClick={handleSurpriseMe}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest bg-gradient-to-r from-[#8a2387] via-[#e94057] to-[#f27121] hover:scale-105 transition-all duration-300 shadow-[0_10px_20px_rgba(233,64,87,0.3)] text-white text-xs"
                >
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Surprise Me
                </button>
            </div>

            {/* Filters Section */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0b0f14]/80 backdrop-blur-xl border border-[#00d2ff]/10 shadow-2xl p-8 mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/5 to-[#0052D4]/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <h3 className="relative z-10 flex items-center gap-2 text-xs font-bold text-white tracking-widest uppercase mb-8">
                    <svg className="w-4 h-4 text-[#00d2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Advanced Filters
                </h3>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Genre */}
                    <div className="group/input">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-[#678] uppercase mb-2 group-focus-within/input:text-[#00d2ff] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            Genre
                        </label>
                        <select 
                            value={selectedGenre} 
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full bg-[#1a1f26]/50 text-brand-light py-3.5 px-4 rounded-xl border border-white/5 focus:border-[#00d2ff]/50 focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00d2ff]/50 focus:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-300 outline-none cursor-pointer"
                        >
                            <option value="">All Genres</option>
                            {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    {/* Release Year */}
                    <div className="group/input">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-[#678] uppercase mb-2 group-focus-within/input:text-[#00d2ff] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Release Year
                        </label>
                        <input 
                            type="number" 
                            placeholder="e.g. 2024"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-[#1a1f26]/50 text-brand-light py-3.5 px-4 rounded-xl border border-white/5 focus:border-[#00d2ff]/50 focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00d2ff]/50 focus:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-300 outline-none placeholder:text-[#678]"
                        />
                    </div>

                    {/* Sort By */}
                    <div className="group/input">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-[#678] uppercase mb-2 group-focus-within/input:text-[#00d2ff] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                            Sort By
                        </label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-[#1a1f26]/50 text-brand-light py-3.5 px-4 rounded-xl border border-white/5 focus:border-[#00d2ff]/50 focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00d2ff]/50 focus:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-300 outline-none cursor-pointer"
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Highest Rated</option>
                            <option value="primary_release_date.desc">Newest First</option>
                        </select>
                    </div>

                    {/* Apply Button */}
                    <div className="flex items-end">
                        <button 
                            onClick={handleApplyFilters}
                            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 rounded-xl"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {loading && !filteredMovies.length ? (
                <div className="py-20 text-center text-brand-text">Loading cinematic wonders...</div>
            ) : (
                <>
                    {filteredMovies.length > 0 && (
                        <Section title="Search Results" movies={filteredMovies} />
                    )}
                    
                    <Section title="Upcoming Movies" movies={upcoming} />
                    <Section title="Today's Recommendations" movies={recommended} />
                </>
            )}
        </div>
    );
}

function Header({ sectionTitle, subtitle }: { sectionTitle: string, subtitle: string }) {
    return (
        <div className="mb-10 border-b border-white/10 pb-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-brand-light mb-2">
                {sectionTitle}
            </h1>
            <p className="text-brand-text font-medium text-lg max-w-2xl">
                {subtitle}
            </p>
        </div>
    );
}

function Section({ title, movies }: { title: string, movies: any[] }) {
    if (!movies.length) return null;
    return (
        <div className="mb-16">
            <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-8 flex items-center gap-4">
                {title}
                <div className="h-px bg-white/5 flex-1"></div>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
}
