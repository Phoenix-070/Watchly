"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import MovieCard from "./MovieCard";
import { Skeleton } from "@mui/material";
import { Movie } from "../lib/types";

export default function Recommendations() {
    const { user } = useAuth();
    const [recommended, setRecommended] = useState<Movie[]>([]);
    const [recLoading, setRecLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) return;
            setRecLoading(true);
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    
                    const likedIds = (data.likes || []).map((m: any) => m.id);
                    const ratedIds = (data.ratedMovies || []).filter((m: any) => m.userRating >= 4).map((m: any) => m.id);
                    const watchIds = (data.watchlist || []).map((m: any) => m.id);
                    
                    const combinedSeedIds = Array.from(new Set([...likedIds, ...ratedIds, ...watchIds]));
                    
                    const historyIds = (data.history || []).map((m: any) => m.id);
                    const excludeIds = Array.from(new Set([...combinedSeedIds, ...historyIds]));
                    
                    if (combinedSeedIds.length > 0) {
                        const res = await fetch("/api/recommendations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ likedMovieIds: combinedSeedIds, excludeIds })
                        });
                        if (res.ok) {
                            const recData = await res.json();
                            setRecommended(recData.results || []);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            } finally {
                setRecLoading(false);
            }
        };
        fetchRecommendations();
    }, [user]);

    if (!user) return null;
    if (!recLoading && recommended.length === 0) return null;

    return (
        <section>
            <div className="flex justify-between items-baseline mb-6 border-b border-brand-blue/30 pb-3">
                <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase hover:text-brand-light transition-colors flex items-center gap-2">
                    <span className="text-brand-blue">✦</span> Recommended For You
                </h2>
            </div>

            {recLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width="100%" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                    {recommended.map((movie, index) => (
                        <MovieCard key={movie.id} movie={movie} rank={index + 1} index={index} />
                    ))}
                </div>
            )}
        </section>
    );
}
