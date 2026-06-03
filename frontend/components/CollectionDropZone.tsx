"use client";

import { useDroppable } from "@dnd-kit/core";
import { Collection } from "../lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function CollectionDropZone({ collection, onRemoveMovie }: { collection: Collection, onRemoveMovie?: (collectionId: string, movieId: number) => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id: collection.id,
        data: { collection }
    });

    return (
        <motion.div
            ref={setNodeRef}
            animate={{
                scale: isOver ? 1.02 : 1,
                borderColor: isOver ? '#00e054' : 'rgba(255,255,255,0.1)',
                backgroundColor: isOver ? 'rgba(0, 224, 84, 0.05)' : 'rgba(255,255,255,0.02)',
                boxShadow: isOver ? '0 0 30px rgba(0, 224, 84, 0.2)' : '0 0 0px rgba(0,0,0,0)'
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col h-full rounded-2xl border-2 border-dashed p-5 relative overflow-hidden group"
        >
            <div className="flex justify-between items-center mb-5 relative z-10">
                <h3 className="text-xl font-black text-brand-light tracking-tight">{collection.name}</h3>
                <motion.span 
                    key={collection.movies.length}
                    initial={{ scale: 1.5, color: '#00e054' }}
                    animate={{ scale: 1, color: '#94a3b8' }}
                    className="text-xs font-black bg-[#1a1f26] px-3 py-1.5 rounded-full border border-white/5"
                >
                    {collection.movies.length} FILMS
                </motion.span>
            </div>
            
            <div className="flex-1 relative z-10">
                <AnimatePresence>
                    {collection.movies.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 0.6 }} 
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6"
                        >
                            <motion.svg 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-12 h-12 mb-4 text-brand-green/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </motion.svg>
                            <p className="text-sm font-semibold tracking-wide text-brand-text">Drop films here to add them to <br/> <span className="text-brand-light">{collection.name}</span></p>
                        </motion.div>
                    ) : (
                        <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            <AnimatePresence>
                                {collection.movies.map((movie, idx) => (
                                    <motion.div 
                                        key={movie.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
                                        className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-white/10 group/movie"
                                    >
                                        <Image
                                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : `https://via.placeholder.com/500x750/1b2228/99aabb?text=No+Poster`}
                                            alt={movie.title || movie.name || "Movie"}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/movie:scale-110"
                                        />
                                        {onRemoveMovie && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveMovie(collection.id, movie.id); }}
                                                className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/movie:opacity-100 transition-all duration-300 z-20 shadow-md"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Background Glow Effect */}
            <motion.div 
                animate={{ opacity: isOver ? 1 : 0 }}
                className="absolute inset-0 bg-gradient-to-t from-brand-green/20 to-transparent mix-blend-overlay pointer-events-none"
            />
        </motion.div>
    );
}
