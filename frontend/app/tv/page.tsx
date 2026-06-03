"use client";

import { useEffect, useState } from "react";
import MovieCard from "../../components/MovieCard";

export default function FilmsPage() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch a larger set of popular movies for the dedicated films page
        const fetchFilms = async () => {
            try {
                const res = await fetch("/api/movies?type=popular&media_type=tv");
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data.results || []);
                }
            } catch (err) {
                console.error("Failed to fetch movies", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFilms();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in duration-700">

            <div className="mb-10 border-b border-white/10 pb-6">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-brand-light mb-2">
                    Popular TV Shows
                </h1>
                <p className="text-brand-text font-medium text-lg">
                    Browse the most watched and highest rated TV series this week.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-brand-panel animate-pulse rounded-md border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}

        </div>
    );
}
