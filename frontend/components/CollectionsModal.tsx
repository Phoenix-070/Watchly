"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Movie, Collection } from "../lib/types";
import CollectionDropZone from "../components/CollectionDropZone";
import DraggableMovieCard from "../components/DraggableMovieCard";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections } from "./CollectionsProvider";

export default function CollectionsModal() {
    const { isCollectionsModalOpen, closeCollectionsModal } = useCollections();
    const { user } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Drag State
    const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

    // New Collection State
    const [newCollectionName, setNewCollectionName] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        if (!user || !isCollectionsModalOpen) return;
        const fetchCollections = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCollections(userDoc.data().collections || []);
                }
            } catch (err) {
                console.error("Failed to load collections", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, [user, isCollectionsModalOpen]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/movies?type=search&q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim() || !user) return;
        
        const newCollection: Collection = {
            id: `col_${Date.now()}`,
            name: newCollectionName.trim(),
            movies: []
        };
        
        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        setNewCollectionName("");
        
        await updateDoc(doc(db, "users", user.uid), {
            collections: updatedCollections
        });
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveMovie(active.data.current.movie);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveMovie(null);
        if (!over || !user) return;
        const collectionId = over.id as string;
        const movie = active.data.current?.movie as Movie;
        if (!movie) return;

        setCollections(prevCollections => {
            const newCollections = [...prevCollections];
            const collectionIndex = newCollections.findIndex(c => c.id === collectionId);
            
            if (collectionIndex !== -1) {
                if (!newCollections[collectionIndex].movies.find(m => m.id === movie.id)) {
                    newCollections[collectionIndex].movies = [...newCollections[collectionIndex].movies, movie];
                    updateDoc(doc(db, "users", user.uid), {
                        collections: newCollections
                    }).catch(err => console.error("Failed to save dropped movie", err));
                }
            }
            return newCollections;
        });
    };

    const handleRemoveMovie = async (collectionId: string, movieId: number) => {
        if (!user) return;
        setCollections(prevCollections => {
            const newCollections = prevCollections.map(c => {
                if (c.id === collectionId) {
                    return { ...c, movies: c.movies.filter(m => m.id !== movieId) };
                }
                return c;
            });
            updateDoc(doc(db, "users", user.uid), {
                collections: newCollections
            }).catch(err => console.error("Failed to remove movie", err));
            return newCollections;
        });
    };

    return (
        <AnimatePresence>
            {isCollectionsModalOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl p-4 sm:p-10"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-[#0f1318] w-full max-w-[1600px] h-[90vh] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,210,255,0.1)] flex flex-col relative overflow-hidden"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={closeCollectionsModal}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition z-50"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8 p-8 h-full">
                                
                                {/* Left Sidebar: Search & Drag Source */}
                                <div className="w-full lg:w-[400px] flex flex-col gap-6 h-full border-r border-white/5 pr-8">
                                    <div>
                                        <h1 className="text-3xl font-black text-brand-light mb-1 tracking-tighter">Collections Workspace</h1>
                                        <p className="text-sm text-brand-text mb-6">Search and drag films into your collections.</p>
                                        
                                        <form onSubmit={handleSearch} className="relative group w-full mb-6">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-[#678]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search films to drag..."
                                                className="bg-[#1a1f26]/50 block w-full pl-10 pr-4 py-3 text-sm text-brand-light rounded-xl border border-white/10 focus:border-[#00d2ff] focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00d2ff]/50 transition-all duration-300 placeholder:text-[#678]"
                                            />
                                        </form>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {loading ? (
                                            <div className="text-center p-10 text-brand-text text-sm">Loading Workspace...</div>
                                        ) : isSearching ? (
                                            <div className="text-center p-10 text-[#00d2ff] text-sm animate-pulse">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4 pb-10">
                                                {searchResults.map(movie => (
                                                    <DraggableMovieCard key={movie.id} id={movie.id.toString()} movie={movie} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-10 border border-dashed border-white/5 rounded-xl text-[#678] text-sm">
                                                Search for a movie to see results here.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Drop Zones */}
                                <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
                                    <form onSubmit={handleCreateCollection} className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="New Collection Name (e.g., Tarantino Films)"
                                            className="bg-[#1a1f26]/50 max-w-md w-full px-4 py-3 text-sm text-brand-light rounded-xl border border-white/10 focus:border-[#00e054] focus:bg-[#1a1f26] focus:ring-1 focus:ring-[#00e054]/50 transition-all duration-300 placeholder:text-[#678]"
                                        />
                                        <button type="submit" className="bg-[#00e054]/10 text-[#00e054] hover:bg-[#00e054]/20 border border-[#00e054]/30 px-6 font-bold tracking-wider text-xs rounded-xl transition-colors">CREATE</button>
                                    </form>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {collections.map(collection => (
                                                <div key={collection.id} className="min-h-[300px]">
                                                    <CollectionDropZone collection={collection} onRemoveMovie={handleRemoveMovie} />
                                                </div>
                                            ))}
                                            {collections.length === 0 && !loading && (
                                                <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-[#678]">
                                                    Create your first collection above.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Render dragged item overlay */}
                            <DragOverlay dropAnimation={null}>
                                {activeMovie ? (
                                    <div className="w-[150px] opacity-80 shadow-2xl scale-105 rotate-3 pointer-events-none">
                                        <MovieCard movie={activeMovie} />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
