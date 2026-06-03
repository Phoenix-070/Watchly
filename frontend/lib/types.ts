export interface Movie {
    id: number;
    title?: string;
    name?: string; // For TV shows
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average?: number;
    media_type?: string;
    release_date?: string;
    first_air_date?: string;
    popularity?: number;
}

export interface Collection {
    id: string;
    name: string;
    movies: Movie[];
}

export interface UserProfile {
    uid: string;
    username: string;
    email: string;
    likes?: Movie[];
    ratedMovies?: (Movie & { userRating: number })[];
    watchlist?: Movie[];
    history?: Movie[];
    followers?: string[];
    following?: string[];
    collections?: Collection[];
}

export interface Review {
    id: string;
    userId: string;
    movieId: number;
    reviewText: string;
    likes: number;
    createdAt: string;
}
