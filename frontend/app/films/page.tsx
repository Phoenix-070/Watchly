import MovieCard from "../../components/MovieCard";
import { getPopularMovies } from "../../lib/tmdb";

// Exporting dynamic to ensure it runs on the server dynamically or fetches fresh data
export const dynamic = 'force-dynamic';

export default async function FilmsPage() {
    // Fetch a larger set of popular movies for the dedicated films page
    // For now, we fetch one page (20 movies). We could expand this to fetch multiple pages if needed.
    const movies = await getPopularMovies();

    return (
        <div className="max-w-7xl mx-auto px-6 mt-12 animate-in fade-in duration-700">

            <div className="mb-10 border-b border-white/10 pb-6">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-brand-light mb-2">
                    Popular Films
                </h1>
                <p className="text-brand-text font-medium text-lg">
                    Browse the most watched and highest rated films this week.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
                {movies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
            </div>

        </div>
    );
}
