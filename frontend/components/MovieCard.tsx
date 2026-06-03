"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Movie } from "../lib/types";

export default function MovieCard({ movie, rank, index = 0 }: { movie: Movie, rank?: number, index?: number }) {
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : `https://via.placeholder.com/500x750/1b2228/99aabb?text=No+Poster`;

    const displayTitle = movie.title || movie.name || "Unknown Title";
    const mediaType = movie.media_type || (movie.name && !movie.title ? 'tv' : 'movie');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="block relative h-full"
        >
            <Link href={`/${mediaType}/${movie.id}`} className="block group relative h-full">
                <div className="relative aspect-[2/3] rounded-md overflow-hidden border border-white/5 group-hover:border-brand-green transition-all duration-300 shadow-xl group-hover:shadow-[0_0_20px_rgba(0,224,84,0.3)] h-full">
                    <Image
                        src={posterUrl}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={rank !== undefined && rank <= 5}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 text-center">
                        <h3 className="text-white font-bold text-sm leading-tight mb-2 tracking-wide">{displayTitle}</h3>
                        {movie.vote_average !== undefined && movie.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-xs font-black text-brand-green tracking-widest drop-shadow-[0_0_5px_rgba(0,224,84,0.5)]">
                                ★ {movie.vote_average.toFixed(1)}
                            </div>
                        )}
                    </div>
                </div>
                {rank && (
                    <span className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-brand-panel-light text-brand-light font-black text-sm rounded-full border border-white/10 shadow-lg z-10">
                        {rank}
                    </span>
                )}
            </Link>
        </motion.div>
    );
}
