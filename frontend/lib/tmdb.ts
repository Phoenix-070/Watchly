import { Movie } from "./types";
import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Mock data to ensure the UI looks good even if the ISP blocks TMDB
const MOCK_MOVIES: Movie[] = [
    { id: 1, title: "Dune: Part Two", poster_path: null, vote_average: 8.3, media_type: "movie" },
    { id: 2, title: "Oppenheimer", poster_path: null, vote_average: 8.1, media_type: "movie" },
    { id: 3, title: "Poor Things", poster_path: null, vote_average: 7.9, media_type: "movie" },
    { id: 4, title: "Godzilla Minus One", poster_path: null, vote_average: 7.8, media_type: "movie" },
    { id: 5, title: "Spider-Man: Across the Spider-Verse", poster_path: null, vote_average: 8.4, media_type: "movie" },
    { id: 6, title: "The Batman", poster_path: null, vote_average: 7.7, media_type: "movie" },
    { id: 7, title: "Interstellar", poster_path: null, vote_average: 8.6, media_type: "movie" },
    { id: 8, title: "Everything Everywhere All at Once", poster_path: null, vote_average: 7.8, media_type: "movie" },
    { id: 9, title: "Parasite", poster_path: null, vote_average: 8.5, media_type: "movie" },
    { id: 10, title: "Joker", poster_path: null, vote_average: 8.2, media_type: "movie" },
];

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is not set in environment variables");
        return { results: MOCK_MOVIES };
    }

    const url = `${BASE_URL}${endpoint}`;

    // Fail fast if TMDB is blocked (e.g. by certain ISPs)
    let retries = 1;
    while (retries > 0) {
        try {
            const res = await axios.get(url, {
                params: {
                    api_key: TMDB_API_KEY,
                    ...params
                },
                headers: { 'Accept': 'application/json' },
                timeout: 3000 // 3 second timeout per request
            });
            return res.data;
        } catch (err: any) {
            retries--;
            if (retries === 0) {
                console.warn("TMDB Fetch failed (Likely blocked by ISP). Serving mock data instead.");
                
                if (endpoint.includes('/search/')) {
                    const q = (params.query || params.q || "").toLowerCase();
                    if (q) {
                        const filtered = MOCK_MOVIES.filter(m => 
                            (m.title || m.name || "").toLowerCase().includes(q)
                        );
                        return { results: filtered };
                    }
                }
                
                return { results: MOCK_MOVIES };
            }
        }
    }
}

export async function getPopularMovies(): Promise<Movie[]> {
    const data = await fetchTMDB('/movie/popular');
    return data.results || [];
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
    const data = await fetchTMDB('/movie/now_playing');
    return data.results || [];
}
