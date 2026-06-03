"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, setDoc, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface TournamentMatch {
    movieA: any | null;
    movieB: any | null;
    winner: any | null;
}

export default function BracketTournamentPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [tournamentWinner, setTournamentWinner] = useState<any>(null);
    const [animatingVote, setAnimatingVote] = useState<string | null>(null);

    useEffect(() => {
        const fetchTournamentMovies = async () => {
            try {
                // Fetch ALL users to get community favorites
                const usersSnap = await getDocs(collection(db, "users"));
                const allUserMovies = new Map();
                
                usersSnap.forEach(userDoc => {
                    const data = userDoc.data();
                    const collections = [data.likes, data.watchlist, data.history, data.ratedMovies];
                    collections.forEach(col => {
                        if (col && Array.isArray(col)) {
                            col.forEach(m => {
                                if (m && m.id && m.poster_path) {
                                    if (!allUserMovies.has(m.id)) {
                                        allUserMovies.set(m.id, { ...m, count: 1 });
                                    } else {
                                        allUserMovies.get(m.id).count += 1;
                                    }
                                }
                            });
                        }
                    });
                });

                let moviesPool = Array.from(allUserMovies.values()).sort((a, b) => b.count - a.count);
                
                // Fallback to TMDB trending if community hasn't logged enough movies
                if (moviesPool.length < 8) {
                    const res = await fetch("/api/movies?type=trending");
                    if (res.ok) {
                        const data = await res.json();
                        const tmdbMovies = data.results || [];
                        tmdbMovies.forEach((m: any) => {
                            if (!moviesPool.find(p => p.id === m.id) && m.poster_path) {
                                moviesPool.push(m);
                            }
                        });
                    }
                }

                // Shuffle the top 16 movies and pick 8 for variety
                const topPicks = moviesPool.slice(0, 16).sort(() => 0.5 - Math.random()).slice(0, 8);
                
                setMatches([
                    { movieA: topPicks[0], movieB: topPicks[1], winner: null },
                    { movieA: topPicks[2], movieB: topPicks[3], winner: null },
                    { movieA: topPicks[4], movieB: topPicks[5], winner: null },
                    { movieA: topPicks[6], movieB: topPicks[7], winner: null },
                    { movieA: null, movieB: null, winner: null },
                    { movieA: null, movieB: null, winner: null },
                    { movieA: null, movieB: null, winner: null }
                ]);
                setLoading(false);
            } catch(err) {
                console.error("Failed to fetch tournament data", err);
                setLoading(false);
            }
        };
        fetchTournamentMovies();
    }, []);

    const handleVote = async (winnerMovie: any, loserMovie: any, side: "A" | "B") => {
        if (animatingVote) return;
        setAnimatingVote(side);

        // Small delay for animation
        setTimeout(async () => {
            const newMatches = [...matches];
            newMatches[currentMatchIndex].winner = winnerMovie;
            
            // Propagate winner to next match
            if (currentMatchIndex === 0) newMatches[4].movieA = winnerMovie;
            if (currentMatchIndex === 1) newMatches[4].movieB = winnerMovie;
            if (currentMatchIndex === 2) newMatches[5].movieA = winnerMovie;
            if (currentMatchIndex === 3) newMatches[5].movieB = winnerMovie;
            if (currentMatchIndex === 4) newMatches[6].movieA = winnerMovie;
            if (currentMatchIndex === 5) newMatches[6].movieB = winnerMovie;
            
            setMatches(newMatches);
            
            if (currentMatchIndex === 6) {
                setTournamentWinner(winnerMovie);
                // Save winner to profile
                if (user) {
                    try {
                        const userRef = doc(db, "users", user.uid);
                        await setDoc(userRef, {
                            tournamentWinners: arrayUnion({
                                ...winnerMovie,
                                wonAt: new Date().toISOString()
                            })
                        }, { merge: true });
                        toast.success("Tournament Winner Saved!");
                    } catch (err) {
                        console.error("Error saving winner", err);
                    }
                }
            } else {
                setCurrentMatchIndex(c => c + 1);
            }
            setAnimatingVote(null);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(0,210,255,0.5)]"></div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase animate-pulse">Sourcing Community Favorites...</h2>
            </div>
        );
    }

    if (tournamentWinner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in zoom-in-95 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 via-transparent to-transparent pointer-events-none"></div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    ULTIMATE CHAMPION
                </h1>
                <p className="text-brand-text text-lg max-w-xl mx-auto mb-12">
                    The community has spoken, and your votes have crowned the undisputed winner of this bracket!
                </p>
                
                <motion.div 
                    initial={{ scale: 0.8, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                    className="relative w-64 md:w-80 group"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${tournamentWinner.poster_path}`} 
                        alt={tournamentWinner.title}
                        className="w-full rounded-2xl border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.6)] relative z-10"
                    />
                    <div className="absolute -top-6 -right-6 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 animate-bounce">👑</div>
                </motion.div>

                <h2 className="text-3xl font-black text-white mt-10 mb-8 tracking-wide">{tournamentWinner.title || tournamentWinner.name}</h2>
                
                <button 
                    onClick={() => window.location.reload()}
                    className="btn-primary px-8 py-4 text-sm tracking-widest uppercase bg-white/10 hover:bg-white/20"
                >
                    Start New Tournament
                </button>
            </div>
        );
    }

    const currentMatch = matches[currentMatchIndex];

    if (!currentMatch || !currentMatch.movieA || !currentMatch.movieB) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-4">Not enough community data</h2>
                <p className="text-brand-text mb-6">We couldn't generate a full tournament bracket. Try exploring more movies or refreshing.</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
            </div>
        );
    }

    const roundName = currentMatchIndex < 4 ? "Quarterfinals" : currentMatchIndex < 6 ? "Semifinals" : "Grand Finale";

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            
            <div className="text-center mb-16 relative z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                    Community Bracket
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
                    {roundName}
                </h1>
                <p className="text-brand-text text-sm uppercase tracking-widest font-semibold">Match {currentMatchIndex + 1} of 7</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentMatch.movieA.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ 
                            opacity: animatingVote === "B" ? 0.2 : 1, 
                            x: 0,
                            scale: animatingVote === "A" ? 1.05 : animatingVote === "B" ? 0.9 : 1,
                            filter: animatingVote === "B" ? "grayscale(100%)" : "grayscale(0%)"
                        }}
                        exit={{ opacity: 0, x: -50 }}
                        className="relative w-full max-w-[280px] group cursor-pointer"
                        onClick={() => handleVote(currentMatch.movieA, currentMatch.movieB, "A")}
                    >
                        {animatingVote === "A" && (
                            <div className="absolute -inset-4 bg-brand-blue rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                        )}
                        <div className="relative rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-brand-blue group-hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] group-hover:-translate-y-2">
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${currentMatch.movieA.poster_path}`} 
                                alt={currentMatch.movieA.title}
                                className="w-full aspect-[2/3] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                                    {currentMatch.movieA.title || currentMatch.movieA.name}
                                </h3>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="flex flex-col items-center justify-center z-20 my-4 md:my-0">
                    <div className="w-16 h-16 rounded-full bg-black/80 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl relative">
                        <div className="absolute inset-0 rounded-full border-2 border-brand-orange border-dashed animate-[spin_10s_linear_infinite] opacity-50"></div>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-orange to-red-500 italic pr-1">VS</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentMatch.movieB.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ 
                            opacity: animatingVote === "A" ? 0.2 : 1, 
                            x: 0,
                            scale: animatingVote === "B" ? 1.05 : animatingVote === "A" ? 0.9 : 1,
                            filter: animatingVote === "A" ? "grayscale(100%)" : "grayscale(0%)"
                        }}
                        exit={{ opacity: 0, x: 50 }}
                        className="relative w-full max-w-[280px] group cursor-pointer"
                        onClick={() => handleVote(currentMatch.movieB, currentMatch.movieA, "B")}
                    >
                        {animatingVote === "B" && (
                            <div className="absolute -inset-4 bg-brand-orange rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                        )}
                        <div className="relative rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-brand-orange group-hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] group-hover:-translate-y-2">
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${currentMatch.movieB.poster_path}`} 
                                alt={currentMatch.movieB.title}
                                className="w-full aspect-[2/3] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                                    {currentMatch.movieB.title || currentMatch.movieB.name}
                                </h3>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>
            
            <div className="text-center mt-16 text-brand-text text-sm">
                Click on the movie you prefer to advance it to the next round.
            </div>
        </div>
    );
}
