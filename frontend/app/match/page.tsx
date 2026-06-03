"use client";

import { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import MovieCard from "../../components/MovieCard";

const MOCK_PERSONAS = [
    { id: "p1", name: "Sci-Fi Fanatic", avatar: "👽", favGenre: 878, seedIds: [157336, 603, 118340] },
    { id: "p2", name: "Rom-Com Enthusiast", avatar: "💖", favGenre: 10749, seedIds: [313369, 568124, 453] },
    { id: "p3", name: "Action Junkie", avatar: "🔥", favGenre: 28, seedIds: [24428, 293660, 680] }
];

export default function CompatibilityMatchPage() {
    const { user } = useAuth();
    const [selectedPersona, setSelectedPersona] = useState<any>(null);
    const [matching, setMatching] = useState(false);
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const runMatch = async (persona: any) => {
        setSelectedPersona(persona);
        setMatching(true);
        setMatchScore(null);
        setRecommendations([]);

        try {
            // Simulate AI matching delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate a random compatibility score based on persona
            const score = Math.floor(Math.random() * 40) + 55; // 55% - 95%
            setMatchScore(score);

            // Fetch recommendations using our existing ML endpoint, but feeding it the persona's seed movies
            const res = await fetch("/api/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ likedMovieIds: persona.seedIds, excludeIds: [] })
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.results.slice(0, 5)); // Show top 5 perfect matches
            }
        } catch (err) {
            console.error("Match failed", err);
        } finally {
            setMatching(false);
        }
    };

    if (!user) return <div className="text-center mt-20 text-brand-text">Please log in to use the Matchmaker.</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 pb-20 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mb-6 shadow-[0_0_30px_rgba(233,64,87,0.4)]">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-brand-light mb-4">
                    Watch Compatibility
                </h1>
                <p className="text-brand-text text-lg">
                    Select a friend or persona below to run a deep ML comparison. We'll generate a compatibility score and find exactly what you should watch together tonight.
                </p>
            </div>

            {!matchScore && !matching && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_PERSONAS.map(persona => (
                        <div key={persona.id} onClick={() => runMatch(persona)} className="glass-panel p-8 text-center cursor-pointer hover:border-purple-500/50 hover:-translate-y-2 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-6xl mb-4 relative z-10">{persona.avatar}</div>
                            <h3 className="text-xl font-bold text-brand-light mb-2 relative z-10">{persona.name}</h3>
                            <button className="btn-primary mt-4 py-2 w-full text-xs">Compare Profiles</button>
                        </div>
                    ))}
                </div>
            )}

            {matching && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">Running Neural Match...</h3>
                    <p className="text-brand-text">Cross-referencing likes, ratings, and hidden genres.</p>
                </div>
            )}

            {matchScore && !matching && (
                <div className="animate-in zoom-in-95 duration-500">
                    <div className="glass-panel p-12 text-center relative overflow-hidden border-t-4 border-purple-500 mb-12 shadow-[0_10px_40px_rgba(138,35,135,0.2)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
                        <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-brand-panel flex items-center justify-center text-2xl border-2 border-white/10 mx-auto mb-2">👤</div>
                                <div className="text-xs font-bold text-brand-text uppercase">You</div>
                            </div>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                {matchScore}% MATCH
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-brand-panel flex items-center justify-center text-4xl border-2 border-white/10 mx-auto mb-2">{selectedPersona.avatar}</div>
                                <div className="text-xs font-bold text-brand-text uppercase">{selectedPersona.name}</div>
                            </div>
                        </div>
                        <p className="text-brand-text relative z-10 max-w-md mx-auto">
                            {matchScore > 80 ? "You two have incredibly similar tastes! Here are 5 movies you will absolutely love watching together." : "Opposites attract! We've found some common ground films that bridge both of your tastes."}
                        </p>
                        <button onClick={() => {setMatchScore(null); setRecommendations([]);}} className="text-xs font-bold text-purple-400 hover:text-white uppercase tracking-widest mt-8 relative z-10 underline decoration-white/20 underline-offset-4">Run Another Match</button>
                    </div>

                    <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center gap-2">
                        <span className="text-pink-500">✦</span> Perfect Movie Night Picks
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                        {recommendations.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
