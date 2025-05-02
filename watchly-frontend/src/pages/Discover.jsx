import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import MovieCard from "../components/MovieCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Discover = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [yearRange, setYearRange] = useState({ start: 1990, end: 2024 });
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 10 });
  const [randomMovie, setRandomMovie] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchGenres();
    fetchRecommendations();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Fetch movies from different categories for recommendations
      const [actionMovies, comedyMovies, dramaMovies] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=28&sort_by=vote_average.desc`).then(res => res.json()),
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=35&sort_by=vote_average.desc`).then(res => res.json()),
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=18&sort_by=vote_average.desc`).then(res => res.json())
      ]);

      setRecommendations({
        action: actionMovies.results.slice(0, 4),
        comedy: comedyMovies.results.slice(0, 4),
        drama: dramaMovies.results.slice(0, 4)
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchRandomMovie = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${Math.floor(Math.random() * 500) + 1}`
      );
      const data = await response.json();
      const randomIndex = Math.floor(Math.random() * data.results.length);
      setRandomMovie(data.results[randomIndex]);
    } catch (error) {
      console.error("Error fetching random movie:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const genreIds = selectedGenres.join(",");
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&sort_by=${sortBy}&with_genres=${genreIds}&primary_release_date.gte=${
          yearRange.start
        }-01-01&primary_release_date.lte=${
          yearRange.end
        }-12-31&vote_average.gte=${ratingRange.min}&vote_average.lte=${
          ratingRange.max
        }`
      );
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
    setLoading(false);
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  return (
    <div className="discover-container">
      <Navigation />
      
      <main className="discover-main">
        <section className="discover-hero">
          <h1>Discover Your Next Favorite Movie</h1>
          <div className="discover-actions">
            <button className="discover-btn primary" onClick={() => setShowAdvancedFilters(true)}>
              <i className="fas fa-filter"></i> Advanced Search
            </button>
            <button className="discover-btn secondary" onClick={fetchRandomMovie}>
              <i className="fas fa-random"></i> Surprise Me
            </button>
          </div>
        </section>

        {randomMovie && (
          <section className="random-movie-section">
            <h2>Your Random Pick</h2>
            <div className="random-movie-showcase">
              <img 
                src={`https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`} 
                alt={randomMovie.title} 
              />
              <div className="random-movie-info">
                <h3>{randomMovie.title}</h3>
                <p className="rating">⭐ {randomMovie.vote_average.toFixed(1)}</p>
                <p className="overview">{randomMovie.overview}</p>
                <button 
                  className="watch-now-btn"
                  onClick={() => window.location.href = `/movie/${randomMovie.id}`}
                >
                  Watch Now
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="curated-recommendations">
          <h2>Curated Collections</h2>
          <div className="recommendations-grid">
            {recommendations.action && (
              <div className="recommendation-category">
                <h3>Action Picks</h3>
                <div className="category-movies">
                  {recommendations.action.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
            {recommendations.comedy && (
              <div className="recommendation-category">
                <h3>Comedy Gems</h3>
                <div className="category-movies">
                  {recommendations.comedy.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
            {recommendations.drama && (
              <div className="recommendation-category">
                <h3>Drama Masterpieces</h3>
                <div className="category-movies">
                  {recommendations.drama.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {showAdvancedFilters && (
          <div className="advanced-filters-modal">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setShowAdvancedFilters(false)}>
                <i className="fas fa-times"></i>
              </button>
              
              <h2>Advanced Search</h2>
              
              <div className="filter-section">
                <h3>Genres</h3>
                <div className="genres-grid">
                  {genres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`genre-btn ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Sort By</h3>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="popularity.desc">Most Popular</option>
                  <option value="vote_average.desc">Highest Rated</option>
                  <option value="release_date.desc">Latest Releases</option>
                  <option value="revenue.desc">Highest Revenue</option>
                </select>
              </div>

              <div className="filter-section">
                <h3>Year Range</h3>
                <div className="range-inputs">
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    value={yearRange.start}
                    onChange={(e) => setYearRange({ ...yearRange, start: e.target.value })}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    value={yearRange.end}
                    onChange={(e) => setYearRange({ ...yearRange, end: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter-section">
                <h3>Rating Range</h3>
                <div className="rating-slider">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={ratingRange.min}
                    onChange={(e) => setRatingRange({ ...ratingRange, min: e.target.value })}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={ratingRange.max}
                    onChange={(e) => setRatingRange({ ...ratingRange, max: e.target.value })}
                  />
                  <div className="rating-values">
                    <span>{ratingRange.min}⭐</span>
                    <span>to</span>
                    <span>{ratingRange.max}⭐</span>
                  </div>
                </div>
              </div>

              <button className="search-btn" onClick={() => {
                handleSearch();
                setShowAdvancedFilters(false);
              }}>
                Search Movies
              </button>
            </div>
          </div>
        )}

        {movies.length > 0 && (
          <section className="search-results">
            <h2>Search Results</h2>
            {loading ? (
              <div className="loading-container">
                {[...Array(8)].map((_, index) => (
                  <LoadingSkeleton key={index} type="movie-card" />
                ))}
              </div>
            ) : (
              <div className="movies-grid">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Discover;
