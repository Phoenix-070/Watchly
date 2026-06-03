"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import { db } from "../../../lib/firebase";
import { motion } from "framer-motion";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import DiscussionThread from "../../../components/DiscussionThread";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import { 
    doc, 
    updateDoc, 
    setDoc,
    arrayUnion, 
    arrayRemove, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    Timestamp,
    getDoc
} from "firebase/firestore";

interface MovieDetail {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    poster_path: string;
    backdrop_path: string;
    credits: {
        cast: { id: number; name: string; character: string }[];
        crew: { id: number; name: string; job: string }[];
    };
    videos: {
        results: { key: string; site: string; type: string }[];
    };
    "watch/providers"?: {
        results: any;
    };
}

export default function MovieDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [watched, setWatched] = useState(false);
    const [rating, setRating] = useState(0);
    const [showShareMsg, setShowShareMsg] = useState(false);
    const [customLists, setCustomLists] = useState<Record<string, { name: string, movies: any[] }>>({});
    const [showListMenu, setShowListMenu] = useState(false);
    const [newListName, setNewListName] = useState("");

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const res = await fetch(`/api/movies?type=details&id=${id}&media_type=tv`);
                if (res.ok) {
                    const data = await res.json();
                    setMovie(data);
                }
            } catch (err) {
                console.error("Failed to fetch movie details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMovieDetails();

        // Check user data (likes, ratings, watchlist)
        const fetchUserData = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const movieIntId = Number(id);
                    setInWatchlist(data.watchlist?.some((m: any) => m.id === movieIntId) || false);
                    setLiked(data.likes?.some((m: any) => m.id === movieIntId) || false);
                    setWatched(data.history?.some((m: any) => m.id === movieIntId) || false);
                    setRating(data.ratings?.[id as string] || 0);
                    setCustomLists(data.customLists || {});
                }
            }
        };
        fetchUserData();
    }, [id, user]);

    const toggleWatched = async () => {
        if (!user || !movie) return;
        const userRef = doc(db, "users", user.uid);
        const movieData = { 
            id: movie.id, 
            title: movie.title || movie.name || "Unknown", 
            poster_path: movie.poster_path, 
            vote_average: movie.vote_average,
            media_type: "tv",
            viewedAt: Timestamp.now()
        };
        
        try {
            if (watched) {
                const userDocSnap = await getDoc(userRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const existingEntry = userData.history?.find((m: any) => m.id === movie.id);
                    if (existingEntry) {
                        await updateDoc(userRef, { history: arrayRemove(existingEntry) });
                    }
                }
                setWatched(false);
                toast("Removed from watched history");
            } else {
                await setDoc(userRef, {
                    history: arrayUnion(movieData)
                }, { merge: true });
                setWatched(true);
                toast.success("Marked as watched!");
            }
        } catch (err) {
            console.error("Failed to update history", err);
            toast.error("Failed to update history");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", { style: { background: '#1a1f26', color: '#e2e8f0', border: '1px solid #40bcf4' } });
    };

    const toggleLike = async () => {
        if (!user || !movie) return;
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name || "Unknown", poster_path: movie.poster_path, vote_average: movie.vote_average, media_type: "tv" };
        
        try {
            if (liked) {
                await updateDoc(userRef, {
                    likes: arrayRemove(movieData)
                });
                setLiked(false);
                toast("Removed from liked films", { icon: "💔" });
            } else {
                await setDoc(userRef, {
                    likes: arrayUnion(movieData)
                }, { merge: true });
                setLiked(true);
                toast.success("Added to liked films!");
            }
        } catch (err) {
            console.error("Failed to toggle like", err);
            toast.error("Failed to update likes");
        }
    };

    const updateRating = async (val: number) => {
        if (!user || !movie) return;
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name || "Unknown", poster_path: movie.poster_path, vote_average: movie.vote_average, userRating: val, media_type: "tv" };
        
        try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const existingRating = data.ratedMovies?.find((m: any) => m.id === movie.id);
                if (existingRating) {
                    await updateDoc(userRef, {
                        ratedMovies: arrayRemove(existingRating)
                    });
                }
            }

            await setDoc(userRef, {
                ratings: {
                    [movie.id]: val
                },
                ratedMovies: arrayUnion(movieData)
            }, { merge: true });
            setRating(val);
            toast.success(`Rated ${val} stars!`);
        } catch (err) {
            console.error("Failed to update rating", err);
            toast.error("Failed to update rating");
        }
    };

    const toggleWatchlist = async () => {
        if (!user || !movie) return;
        
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name || "Unknown", poster_path: movie.poster_path, vote_average: movie.vote_average, media_type: "tv" };
        
        try {
            if (inWatchlist) {
                await updateDoc(userRef, {
                    watchlist: arrayRemove(movieData)
                });
                setInWatchlist(false);
                toast("Removed from Watchlist", { icon: "📋" });
            } else {
                await setDoc(userRef, {
                    watchlist: arrayUnion(movieData)
                }, { merge: true });
                setInWatchlist(true);
                toast.success("Added to Watchlist!");
            }
        } catch (err) {
            console.error("Failed to update watchlist", err);
            toast.error("Failed to update watchlist");
        }
    };

    const toggleCustomList = async (listId: string, listName: string, currentlyInList: boolean) => {
        if (!user || !movie) return;
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name || "Unknown", poster_path: movie.poster_path, vote_average: movie.vote_average, media_type: "tv" };
        
        try {
            if (currentlyInList) {
                const movieToRemove = customLists[listId].movies.find(m => m.id === movie.id);
                if (movieToRemove) {
                    await updateDoc(userRef, {
                        [`customLists.${listId}.movies`]: arrayRemove(movieToRemove)
                    });
                    setCustomLists(prev => ({...prev, [listId]: {...prev[listId], movies: prev[listId].movies.filter(m => m.id !== movie.id)}}));
                    toast(`Removed from ${listName}`);
                }
            } else {
                await updateDoc(userRef, {
                    [`customLists.${listId}.movies`]: arrayUnion(movieData)
                });
                setCustomLists(prev => ({...prev, [listId]: {...prev[listId], movies: [...(prev[listId].movies || []), movieData]}}));
                toast.success(`Added to ${listName}!`);
            }
        } catch (err) {
            console.error("Failed to update list", err);
            toast.error("Failed to update list");
        }
    };

    const createNewList = async () => {
        if (!user || !movie || !newListName.trim()) return;
        const listId = "list_" + Date.now();
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name || "Unknown", poster_path: movie.poster_path, vote_average: movie.vote_average, media_type: "tv" };
        
        const newList = {
            name: newListName.trim(),
            movies: [movieData]
        };

        try {
            await setDoc(userRef, { customLists: { [listId]: newList } }, { merge: true });
            setCustomLists(prev => ({...prev, [listId]: newList}));
            setNewListName("");
            toast.success(`Created list "${newList.name}"!`);
        } catch (err) {
            console.error("Failed to create list", err);
            toast.error("Failed to create list");
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto mt-8 px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 lg:gap-16">
                    <div className="w-full">
                        <Skeleton variant="rectangular" width="100%" height={420} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                        <div className="mt-6 flex flex-col gap-3">
                            <Skeleton variant="rectangular" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                            <Skeleton variant="rectangular" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                        </div>
                    </div>
                    <div className="pt-4 md:pt-10">
                        <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                        <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 4 }} />
                        <Skeleton variant="rectangular" width="100%" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 6 }} />
                        <Skeleton variant="rectangular" width="100%" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return <div className="flex items-center justify-center min-h-screen text-brand-light">Movie not found.</div>;
    }

    const title = movie.title || movie.name || "Unknown Title";
    const director = movie.credits?.crew?.find(person => person.job === "Director" || person.job === "Executive Producer")?.name || "Unknown Creator";
    const trailer = movie.videos?.results?.find(video => video.type === "Trailer" && video.site === "YouTube");
    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : movie.first_air_date ? movie.first_air_date.split("-")[0] : "N/A";
    
    // Get streaming platforms (US as default for demo)
    const watchProviders = movie["watch/providers"]?.results?.US?.flatrate || [];

    return (
        <div className="max-w-6xl mx-auto mt-8 px-6 pb-20">

            {/* Backdrop Section */}
            <div className="fixed top-0 left-0 w-full h-[70vh] -z-10 pointer-events-none opacity-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt="Backdrop"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 lg:gap-16"
            >

                {/* Left Col - Poster & Actions */}
                <div className="w-full relative">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="aspect-[2/3] rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-brand-green transition-all group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Icon Actions Row */}
                            <div className="flex items-center justify-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 shadow-xl">
                                {/* Watched */}
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleWatched}
                                    title={watched ? "Remove from Watched" : "Mark Watched"}
                                    className={`p-3 rounded-full transition-all ${watched ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {watched ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </motion.button>
                                
                                {/* Like */}
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleLike}
                                    title={liked ? "Unlike" : "Like"}
                                    className={`p-3 rounded-full transition-all ${liked ? 'bg-brand-orange text-white shadow-[0_0_15px_rgba(255,107,0,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </motion.button>

                                {/* Watchlist */}
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleWatchlist}
                                    title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                    className={`p-3 rounded-full transition-all ${inWatchlist ? 'bg-brand-blue text-white shadow-[0_0_15px_rgba(0,210,255,0.5)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {inWatchlist ? <TurnedInIcon /> : <TurnedInNotIcon />}
                                </motion.button>

                                {/* Share */}
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShare}
                                    title="Share"
                                    className="p-3 rounded-full transition-all bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    <ShareIcon />
                                </motion.button>
                            </div>
                            
                            {/* Rating Component */}
                            <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/5 shadow-xl">
                                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Rate</span>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button 
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            key={star} 
                                            onClick={() => updateRating(star)}
                                            className={`transition-colors ${rating >= star ? 'text-brand-orange drop-shadow-[0_0_5px_rgba(255,107,0,0.8)]' : 'text-white/20 hover:text-white/40'}`}
                                        >
                                            {rating >= star ? <StarIcon /> : <StarBorderIcon />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Add to Custom List */}
                            <div className="relative shadow-xl">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowListMenu(!showListMenu)}
                                    className="w-full flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 border border-white/5 rounded-2xl py-4 transition-all text-sm font-semibold tracking-wide"
                                >
                                    <span className="text-lg leading-none">+</span> Add to Custom List
                                </motion.button>
                                
                                {showListMenu && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
                                        <h4 className="text-xs font-bold text-[#89a] uppercase tracking-widest mb-3">Your Lists</h4>
                                        <div className="max-h-48 overflow-y-auto space-y-1 mb-4 no-scrollbar">
                                            {Object.entries(customLists).map(([listId, list]) => {
                                                const isInList = list.movies?.some(m => m.id === movie.id);
                                                return (
                                                    <button 
                                                        key={listId}
                                                        onClick={() => toggleCustomList(listId, list.name, isInList)}
                                                        className="w-full text-left px-3 py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5 rounded-lg flex items-center justify-between transition-colors border border-transparent hover:border-white/5"
                                                    >
                                                        <span className="truncate pr-2">{list.name}</span>
                                                        {isInList && <span className="text-brand-green text-xs drop-shadow-[0_0_5px_rgba(0,224,84,0.5)]">✓</span>}
                                                    </button>
                                                );
                                            })}
                                            {Object.keys(customLists).length === 0 && (
                                                <p className="text-xs text-[#678] italic text-center py-2">No custom lists yet.</p>
                                            )}
                                        </div>
                                        
                                        <div className="pt-3 border-t border-white/5">
                                            <input 
                                                type="text" 
                                                value={newListName}
                                                onChange={(e) => setNewListName(e.target.value)}
                                                placeholder="New list name..."
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-medium text-white placeholder:text-[#678] mb-2 focus:border-[#00d2ff]/50 outline-none transition-colors"
                                            />
                                            <button 
                                                onClick={createNewList}
                                                disabled={!newListName.trim()}
                                                className="w-full bg-gradient-to-r from-brand-blue to-[#0052D4] text-white text-xs font-bold py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all uppercase tracking-wider"
                                            >
                                                Create & Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col - Details & Comments */}
                <div className="pt-4 md:pt-10">
                    <div className="flex justify-between items-start gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-3xl font-black tracking-tighter text-brand-light mb-2 leading-tight">
                                {title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-[#678] mb-8 mt-4">
                                <span className="text-brand-text">{releaseYear}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                                <span>Created by <span className="text-brand-light font-bold hover:text-brand-blue cursor-pointer transition-colors border-b border-transparent hover:border-brand-blue">{director}</span></span>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-center glass-panel px-6 py-4 border-brand-green/20 shadow-xl">
                            <span className="text-xs text-brand-text font-bold uppercase tracking-widest mb-1">Rating</span>
                            <div className="text-brand-green text-3xl font-black">{movie.vote_average.toFixed(1)}</div>
                        </div>
                    </div>

                    <h3 className="text-xs font-bold text-[#89a] tracking-widest uppercase mb-3">Synopsis</h3>
                    <p className="text-brand-text-lighter text-lg leading-relaxed mb-12 max-w-4xl font-medium">
                        {movie.overview}
                    </p>

                    {watchProviders.length > 0 && (
                        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-xs font-bold text-[#89a] tracking-widest uppercase mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_rgba(0,224,84,0.8)]"></span> Available to Stream On
                            </h3>
                            <div className="flex gap-4 flex-wrap">
                                {watchProviders.map((provider: any) => (
                                    <div key={provider.provider_id} className="group relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                                            alt={provider.provider_name}
                                            className="w-14 h-14 rounded-2xl shadow-lg border-2 border-white/5 hover:border-brand-green hover:scale-110 transition-all duration-300 cursor-pointer bg-black/50"
                                        />
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-bg text-white font-bold tracking-wider uppercase text-[10px] px-3 py-1.5 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-20 pointer-events-none">
                                            {provider.provider_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {trailer && (
                        <div className="mb-12">
                            <h3 className="text-xs font-bold text-[#89a] tracking-widest uppercase mb-6">Trailer</h3>
                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-white/10 pt-8 mt-12 mb-16">
                        <h3 className="text-xs font-bold text-[#89a] tracking-widest uppercase mb-6">Cast & Crew</h3>
                        <div className="flex gap-4 text-sm flex-wrap">
                            {movie.credits.cast.slice(0, 10).map(person => (
                                <span key={person.id} className="glass-panel px-5 py-2 hover:bg-white/10 hover:text-brand-light transition-colors cursor-pointer text-brand-text font-semibold inline-block">
                                    {person.name}
                                    <span className="block text-[10px] text-[#678] font-normal">{person.character}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <DiscussionThread mediaId={id as string} />

                </div>
            </motion.div>
        </div>
    );
}


