"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import MovieCard from "./MovieCard";
import { Movie } from "../lib/types";

export default function DraggableMovieCard({ movie, id }: { movie: Movie, id: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { movie }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
            {/* We pass a disabled state or block clicks while dragging if needed, but MovieCard works fine */}
            <div className="pointer-events-none">
                <MovieCard movie={movie} />
            </div>
        </div>
    );
}
