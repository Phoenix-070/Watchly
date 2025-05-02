import { useEffect, useState } from "react";
import { fetchTrendingMovies } from "../api/tmdb";

const Movies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      const data = await fetchTrendingMovies();
      setMovies(data);
    };
    loadMovies();
  }, []);

  return (
    <div className="movies-container">
      <h2>Trending Movies</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img 
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} 
              alt={movie.title} 
            />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;
