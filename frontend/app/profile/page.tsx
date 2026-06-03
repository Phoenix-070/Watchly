"use client";

import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MovieCard from "../../components/MovieCard";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';

export default function Profile() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("activity");

    // State for live data
    const [userData, setUserData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [likes, setLikes] = useState<any[]>([]);
    const [ratedMovies, setRatedMovies] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [customLists, setCustomLists] = useState<Record<string, { name: string, movies: any[] }>>({});
    const [dataLoading, setDataLoading] = useState(true);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        const fetchUserData = async () => {
            if (!user) return;
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserData(data);
                    setEditUsername(data.username || user.displayName || user.email?.split('@')[0] || "");
                    
                    // Sort history by viewedAt descending if available
                    const sortedHistory = [...(data.history || [])].sort((a, b) => 
                        (b.viewedAt?.seconds || 0) - (a.viewedAt?.seconds || 0)
                    );
                    
                    // Filter out duplicates by keeping only the most recently viewed entry for each movie
                    const uniqueHistory = [];
                    const seenIds = new Set();
                    for (const movie of sortedHistory) {
                        if (movie.id && !seenIds.has(movie.id)) {
                            uniqueHistory.push(movie);
                            seenIds.add(movie.id);
                        }
                    }
                    
                    setHistory(uniqueHistory);
                    setWatchlist(data.watchlist || []);
                    setLikes(data.likes || []);
                    setRatedMovies(data.ratedMovies || []);
                    setCollections(data.collections || []);
                    setCustomLists(data.customLists || {});
                } else {
                    setEditUsername(user.displayName || user.email?.split('@')[0] || "");
                }
            } catch (err) {
                console.error("Error fetching user data", err);
            } finally {
                setDataLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user, loading, router]);

    const saveProfile = async () => {
        if (!user || !editUsername.trim()) return;
        setSavingProfile(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                username: editUsername.trim()
            });
            setUserData((prev: any) => ({ ...prev, username: editUsername.trim() }));
            setIsEditingProfile(false);
            toast.success("Profile updated!");
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const removeFromHistory = async (movieId: number) => {
        if (!user || !userData) return;
        try {
            const updatedHistory = (userData.history || []).filter((m: any) => m.id !== movieId);
            await updateDoc(doc(db, "users", user.uid), { history: updatedHistory });
            setUserData({ ...userData, history: updatedHistory });
            
            const uniqueHistory = [];
            const seenIds = new Set();
            for (const movie of updatedHistory.sort((a: any, b: any) => (b.viewedAt?.seconds || 0) - (a.viewedAt?.seconds || 0))) {
                if (movie.id && !seenIds.has(movie.id)) {
                    uniqueHistory.push(movie);
                    seenIds.add(movie.id);
                }
            }
            setHistory(uniqueHistory);
            toast.success("Removed from recently viewed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove from history");
        }
    };

    const removeMovie = async (listName: 'watchlist' | 'likes' | 'ratedMovies', movieData: any) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                [listName]: arrayRemove(movieData)
            });
            
            if (listName === 'watchlist') setWatchlist(prev => prev.filter(m => m.id !== movieData.id));
            if (listName === 'likes') setLikes(prev => prev.filter(m => m.id !== movieData.id));
            if (listName === 'ratedMovies') setRatedMovies(prev => prev.filter(m => m.id !== movieData.id));
            
            toast.success("Film removed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove film");
        }
    };

    if (loading || !user || dataLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in duration-700 pb-20">
                <div className="glass-panel p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden mb-12 border-t border-brand-green/30">
                    <Skeleton variant="circular" width={128} height={128} sx={{ bgcolor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                    <div className="flex-1 w-full flex flex-col items-center md:items-start gap-4">
                        <Skeleton variant="text" width={200} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        <div className="flex justify-center md:justify-start gap-8 w-full mt-2">
                            <Skeleton variant="rectangular" width={60} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={60} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={60} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 mb-8 border-b border-white/10 pb-4">
                    <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} variant="rectangular" width="100%" height={260} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    ))}
                </div>
            </div>
        );
    }

    const getRankDetails = (watchedCount: number) => {
        if (watchedCount < 10) return { rank: "Novice Viewer", next: 10, color: "text-brand-text", border: "border-brand-text", bg: "bg-brand-text", percent: (watchedCount / 10) * 100, topPercent: 90 };
        if (watchedCount < 50) return { rank: "Casual Watcher", next: 50, color: "text-[#00d2ff]", border: "border-[#00d2ff]", bg: "bg-[#00d2ff]", percent: (watchedCount / 50) * 100, topPercent: 75 };
        if (watchedCount < 150) return { rank: "Film Enthusiast", next: 150, color: "text-brand-green", border: "border-brand-green", bg: "bg-brand-green", percent: (watchedCount / 150) * 100, topPercent: 40 };
        if (watchedCount < 500) return { rank: "Cinephile", next: 500, color: "text-brand-orange", border: "border-brand-orange", bg: "bg-brand-orange", percent: (watchedCount / 500) * 100, topPercent: 10 };
        return { rank: "Movie Master", next: watchedCount, color: "text-purple-400", border: "border-purple-400", bg: "bg-purple-400", percent: 100, topPercent: 1 };
    };

    const rankDetails = getRankDetails(history.length);
    const displayUsername = userData?.username || user.displayName || user.email?.split('@')[0];
    const initial = displayUsername ? displayUsername[0].toUpperCase() : "U";

    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in duration-700 pb-20">

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 max-w-md w-full animate-in zoom-in-95 shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-6">Edit Profile</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#89a] uppercase tracking-widest mb-2 pl-1">Username</label>
                                <input 
                                    type="text" 
                                    value={editUsername} 
                                    onChange={e => setEditUsername(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:border-[#00d2ff] outline-none transition-colors"
                                    placeholder="Your username..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                onClick={() => setIsEditingProfile(false)} 
                                className="px-5 py-2 text-brand-text hover:text-white font-bold text-sm transition-colors rounded-lg hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveProfile} 
                                disabled={savingProfile || !editUsername.trim()}
                                className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                            >
                                {savingProfile ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="glass-panel p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden mb-12 border-t border-white/10 shadow-2xl">
                {/* Dynamic Backdrop Background based on most recently liked film */}
                {likes.length > 0 && likes[0].backdrop_path ? (
                    <div 
                        className="absolute inset-0 z-0 opacity-40 mix-blend-screen" 
                        style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${likes[0].backdrop_path})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(4px)'
                        }}
                    ></div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/10 to-[#0052D4]/10 opacity-50 pointer-events-none z-0"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 to-brand-panel/40 z-0"></div>

                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#0052D4] flex items-center justify-center text-white font-black text-5xl shadow-[0_0_30px_rgba(0,210,255,0.4)] shrink-0 z-10 border-4 border-white/10 backdrop-blur-md">
                    {initial}
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-4xl font-black tracking-tighter text-brand-light mb-1">
                        {displayUsername}
                    </h1>
                    <p className="text-brand-text mb-6">User since {new Date(user.metadata.creationTime || Date.now()).getFullYear()}</p>

                    <div className="flex justify-center md:justify-start gap-8">
                        <div className="flex flex-col items-center md:items-start group cursor-pointer" onClick={() => setActiveTab("activity")}>
                            <span className="text-2xl font-black text-brand-light group-hover:text-brand-blue transition-colors">
                                {history.length}
                            </span>
                            <span className="text-xs font-bold text-[#89a] uppercase tracking-widest">Logged</span>
                        </div>
                        <div className="w-px bg-white/10 h-10"></div>
                        <div className="flex flex-col items-center md:items-start group cursor-pointer" onClick={() => setActiveTab("likes")}>
                            <span className="text-2xl font-black text-brand-light group-hover:text-brand-orange transition-colors">
                                {likes.length}
                            </span>
                            <span className="text-xs font-bold text-[#89a] uppercase tracking-widest">Likes</span>
                        </div>
                        <div className="w-px bg-white/10 h-10"></div>
                        <div className="flex flex-col items-center md:items-start group cursor-pointer" onClick={() => setActiveTab("ratings")}>
                            <span className="text-2xl font-black text-brand-light group-hover:text-brand-green transition-colors">
                                {ratedMovies.length}
                            </span>
                            <span className="text-xs font-bold text-[#89a] uppercase tracking-widest">Rated</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 absolute top-8 right-8 flex gap-3">
                    <button onClick={() => setIsEditingProfile(true)} className="glass-panel px-4 py-2 hover:bg-white/10 transition-colors text-sm font-bold text-brand-light border border-white/20 rounded">
                        Edit Profile
                    </button>
                    <button 
                        onClick={async () => { await signOut(auth); router.push('/login'); }} 
                        className="px-4 py-2 hover:bg-red-500/20 text-sm font-bold text-red-400 border border-red-500/30 rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* User Preferences Section */}
            {userData?.preferences && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            My Preferences
                        </h2>
                        <button 
                            onClick={() => router.push("/onboarding")} 
                            className="text-xs font-bold text-[#89a] hover:text-white uppercase tracking-widest underline decoration-white/20 underline-offset-4"
                        >
                            Update
                        </button>
                    </div>
                    <div className="glass-panel p-6 border-white/5 relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            {/* Genres */}
                            <div>
                                <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-3">Top Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {userData.preferences.genres?.length > 0 ? userData.preferences.genres.map((g: string) => (
                                        <span key={g} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-brand-blue/10 text-[#00d2ff] rounded border border-brand-blue/20">{g}</span>
                                    )) : <span className="text-xs text-[#678] italic">Not set</span>}
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-3">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {userData.preferences.languages?.length > 0 ? userData.preferences.languages.map((l: string) => (
                                        <span key={l} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">{l}</span>
                                    )) : <span className="text-xs text-[#678] italic">Not set</span>}
                                </div>
                            </div>

                            {/* Actors */}
                            <div>
                                <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-3">Favorite Actors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {userData.preferences.actors?.length > 0 ? userData.preferences.actors.map((a: string) => (
                                        <span key={a} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-brand-orange/10 text-brand-orange rounded border border-brand-orange/20">{a}</span>
                                    )) : <span className="text-xs text-[#678] italic">Not set</span>}
                                </div>
                            </div>

                            {/* Directors */}
                            <div>
                                <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-3">Favorite Directors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {userData.preferences.directors?.length > 0 ? userData.preferences.directors.map((d: string) => (
                                        <span key={d} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-[#ff0055]/10 text-[#ff0055] rounded border border-[#ff0055]/20">{d}</span>
                                    )) : <span className="text-xs text-[#678] italic">Not set</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Achievement Bar */}
            <div className={`glass-panel p-6 mb-8 border-l-4 ${rankDetails.border} animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-5 relative z-10">
                    <div>
                        <h3 className="text-[10px] font-bold text-[#89a] tracking-widest uppercase mb-1 flex items-center gap-2">
                            <svg className="w-3 h-3 text-brand-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            Current Status
                        </h3>
                        <div className={`text-2xl font-black ${rankDetails.color} flex items-center gap-3 drop-shadow-lg`}>
                            {rankDetails.rank}
                            <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-white/80 border border-white/10 backdrop-blur-sm shadow-sm">
                                Top {rankDetails.topPercent}% of Viewers
                            </span>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-[#89a] uppercase tracking-widest">
                        <span className={`text-lg ${rankDetails.color} font-black drop-shadow-md`}>{history.length}</span> / {rankDetails.next} Films
                    </div>
                </div>

                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 relative z-10">
                    <div 
                        className={`absolute top-0 left-0 h-full ${rankDetails.bg} transition-all duration-1500 ease-out`}
                        style={{ width: `${rankDetails.percent}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Time Machine Analytics */}
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#00d2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Time Machine Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 border-white/5 relative overflow-hidden group hover:border-[#00d2ff]/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-1 relative z-10">Time Watched</h3>
                        <div className="text-4xl font-black text-white relative z-10">{Math.floor((history.length * 120) / 60)} <span className="text-lg text-brand-text font-bold">hrs</span></div>
                    </div>
                    <div className="glass-panel p-6 border-white/5 relative overflow-hidden group hover:border-brand-orange/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-1 relative z-10">Avg Rating Given</h3>
                        <div className="text-4xl font-black text-white relative z-10">
                            {ratedMovies.length > 0 ? (ratedMovies.reduce((acc, m) => acc + m.userRating, 0) / ratedMovies.length).toFixed(1) : "0.0"} 
                            <span className="text-lg text-brand-orange ml-1">★</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-bold text-[#678] uppercase tracking-widest mb-1 relative z-10">Cinephile Score</h3>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 relative z-10">
                            {history.length + (likes.length * 2) + (ratedMovies.length * 3)} <span className="text-lg text-brand-text font-bold">pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-white/10 mb-8 gap-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'activity', label: 'Activity', color: 'bg-brand-green' },
                    { id: 'watchlist', label: 'Watchlist', color: 'bg-brand-blue' },
                    { id: 'likes', label: 'Likes', color: 'bg-brand-orange' },
                    { id: 'ratings', label: 'Ratings', color: 'bg-brand-green' },
                    { id: 'collections', label: 'Collections', color: 'bg-[#00d2ff]' },
                    { id: 'lists', label: 'Legacy Lists', color: 'bg-[#ff0055]' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap min-w-fit ${activeTab === tab.id ? 'text-brand-light' : 'text-brand-text hover:text-brand-light/80'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <span className={`absolute bottom-0 left-0 w-full h-0.5 ${tab.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></span>}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "activity" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>Recently Viewed</span>
                        </h2>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                                {history.map((movie: any, idx) => (
                                    <div key={`${movie.id}-${idx}`} className="relative group/card">
                                        <MovieCard movie={movie} />
                                        <button 
                                            onClick={(e) => { e.preventDefault(); removeFromHistory(movie.id); }}
                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="🎬" 
                                title="No activity yet" 
                                message="Start tracking what you watch to build your profile." 
                                linkText="Explore Movies"
                                linkHref="/discover"
                            />
                        )}
                    </div>
                )}

                {activeTab === "watchlist" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>My Watchlist</span>
                            <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-1 rounded border border-brand-blue/20">{watchlist.length} films</span>
                        </h2>

                        {watchlist.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                                {watchlist.map((movie: any) => (
                                    <div key={movie.id} className="relative group/card">
                                        <MovieCard movie={movie} />
                                        <button 
                                            onClick={(e) => { e.preventDefault(); removeMovie('watchlist', movie); }}
                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="📋" 
                                title="Your watchlist is empty" 
                                message="Save films you want to see later." 
                                linkText="Add to Watchlist"
                                linkHref="/discover"
                            />
                        )}
                    </div>
                )}

                {activeTab === "likes" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>Liked Films</span>
                            <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-2 py-1 rounded border border-brand-orange/20">{likes.length} films</span>
                        </h2>

                        {likes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                                {likes.map((movie: any) => (
                                    <div key={movie.id} className="relative group/card">
                                        <MovieCard movie={movie} />
                                        <button 
                                            onClick={(e) => { e.preventDefault(); removeMovie('likes', movie); }}
                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="❤️" 
                                title="No liked films" 
                                message="Films you like will appear here." 
                                linkText="Explore Movies"
                                linkHref="/discover"
                            />
                        )}
                    </div>
                )}

                {activeTab === "ratings" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>Rated Films</span>
                            <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-1 rounded border border-brand-green/20">{ratedMovies.length} films</span>
                        </h2>

                        {ratedMovies.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-6">
                                {ratedMovies.map((movie: any) => (
                                    <div key={movie.id} className="relative group/card">
                                        <MovieCard movie={movie} />
                                        <div className="absolute top-2 right-2 bg-brand-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg z-20 group-hover/card:opacity-0 transition-opacity">
                                            ★ {movie.userRating}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); removeMovie('ratedMovies', movie); }}
                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="⭐" 
                                title="No rated films" 
                                message="Rate films to see them here." 
                                linkText="Explore Movies"
                                linkHref="/discover"
                            />
                        )}
                    </div>
                )}

                {activeTab === "collections" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>My Collections</span>
                            <span className="text-[10px] bg-[#00d2ff]/10 text-[#00d2ff] px-2 py-1 rounded border border-[#00d2ff]/20">{collections.length} collections</span>
                        </h2>

                        {collections.length > 0 ? (
                            <div className="space-y-12">
                                {collections.map((collection) => (
                                    <div key={collection.id} className="glass-panel p-6 border-white/5 relative">
                                        <h3 className="text-xl font-black text-white mb-2 tracking-wide flex items-center gap-3">
                                            {collection.name}
                                            <span className="text-xs font-bold text-[#89a] bg-black/50 px-3 py-1 rounded-full border border-white/5 tracking-widest uppercase">
                                                {collection.movies?.length || 0} films
                                            </span>
                                        </h3>
                                        
                                        {collection.movies && collection.movies.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                                                {collection.movies.map((movie: any) => (
                                                    <div key={movie.id} className="relative group/card scale-95 origin-left hover:scale-100 transition-transform">
                                                        <MovieCard movie={movie} />
                                                        <button 
                                                            onClick={async (e) => { 
                                                                e.preventDefault();
                                                                try {
                                                                    const userRef = doc(db, "users", user.uid);
                                                                    const updatedCollections = collections.map(c => {
                                                                        if (c.id === collection.id) {
                                                                            return { ...c, movies: c.movies.filter((m: any) => m.id !== movie.id) };
                                                                        }
                                                                        return c;
                                                                    });
                                                                    await updateDoc(userRef, {
                                                                        collections: updatedCollections
                                                                    });
                                                                    setCollections(updatedCollections);
                                                                    toast.success("Removed from collection");
                                                                } catch (err) {
                                                                    toast.error("Failed to remove item");
                                                                }
                                                            }}
                                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[#678] text-sm mt-4 italic">No films in this collection yet. Open the Collections pop-up to add some.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="📁" 
                                title="No collections yet" 
                                message="Use the Collections pop-up to create beautiful custom lists of your favorite films." 
                                linkText="Open Collections"
                                linkHref="#"
                            />
                        )}
                    </div>
                )}

                {activeTab === "lists" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>Legacy Watchlists</span>
                            <span className="text-[10px] bg-[#ff0055]/10 text-[#ff0055] px-2 py-1 rounded border border-[#ff0055]/20">{Object.keys(customLists).length} lists</span>
                        </h2>
                        <pre className="text-xs text-brand-orange bg-black/50 p-4 rounded mb-4 overflow-auto max-h-60">
                            {JSON.stringify(customLists, null, 2)}
                        </pre>

                        {Object.keys(customLists).length > 0 ? (
                            <div className="space-y-12">
                                {Object.entries(customLists).map(([listId, listData]) => {
                                    const isArray = Array.isArray(listData);
                                    const listName = isArray ? listId : (listData as any).name || "Unnamed List";
                                    const movies = isArray ? listData : (listData as any).movies;
                                    
                                    return (
                                    <div key={listId} className="glass-panel p-6 border-white/5 relative">
                                        <h3 className="text-xl font-black text-white mb-2 tracking-wide flex items-center gap-3">
                                            {listName}
                                            <span className="text-xs font-bold text-[#89a] bg-black/50 px-3 py-1 rounded-full border border-white/5 tracking-widest uppercase">
                                                {movies?.length || 0} items
                                            </span>
                                        </h3>
                                        
                                        {movies && movies.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                                                {movies.map((movie: any) => (
                                                    <div key={movie.id} className="relative group/card scale-95 origin-left hover:scale-100 transition-transform">
                                                        <MovieCard movie={movie} />
                                                        <button 
                                                            onClick={async (e) => { 
                                                                e.preventDefault();
                                                                try {
                                                                    const userRef = doc(db, "users", user.uid);
                                                                    const fieldPath = isArray ? `customLists.${listId}` : `customLists.${listId}.movies`;
                                                                    await updateDoc(userRef, {
                                                                        [fieldPath]: arrayRemove(movie)
                                                                    });
                                                                    setCustomLists(prev => ({
                                                                        ...prev, 
                                                                        [listId]: {
                                                                            ...prev[listId], 
                                                                            movies: prev[listId].movies.filter(m => m.id !== movie.id)
                                                                        }
                                                                    }));
                                                                    toast.success("Removed from list");
                                                                } catch (err) {
                                                                    toast.error("Failed to remove item");
                                                                }
                                                            }}
                                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-md"
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[#678] text-sm mt-4 italic">No items in this list yet.</p>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <NoDataPlaceholder 
                                icon="📁" 
                                title="No legacy lists" 
                                message="Your old custom lists will appear here." 
                                linkText="Explore Content"
                                linkHref="/discover"
                            />
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}

function NoDataPlaceholder({ icon, title, message, linkText, linkHref }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-brand-panel/30 border border-white/5 rounded-xl border-dashed">
            <span className="text-4xl mb-4 opacity-50">{icon}</span>
            <h3 className="text-lg font-bold text-brand-light mb-2">{title}</h3>
            <p className="text-brand-text text-sm mb-6 max-w-sm text-center">{message}</p>
            <a href={linkHref} className="btn-primary text-sm px-8 py-2 w-fit border border-brand-green">{linkText}</a>
        </div>
    );
}
