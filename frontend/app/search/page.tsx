"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import MovieCard from "../../components/MovieCard";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setMovies([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies?type=search&q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setMovies(data.results || []);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <>
            <div className="mb-10 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-black tracking-tighter text-brand-light mb-2">
                    Search Results
                </h1>
                {query && (
                    <p className="text-brand-text font-medium text-sm tracking-wide">
                        Showing matches for &quot;<span className="text-brand-light italic">{query}</span>&quot;
                    </p>
                )}
            </div>

            {!query ? (
                <div className="py-20 text-center text-brand-text">
                    Please enter a search term above.
                </div>
            ) : loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-brand-panel animate-pulse rounded-md border border-white/5"></div>
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4 opacity-50">🍿</div>
                    <h3 className="text-xl font-bold text-brand-light mb-2">No films found</h3>
                    <p className="text-brand-text">We couldn&apos;t find any matches for that search. Try another title.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </>
    );
}

export default function SearchPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in duration-700">
            <Suspense fallback={<div className="py-20 text-center text-brand-text">Loading search results...</div>}>
                <SearchContent />
            </Suspense>
        </div>
    );
}
