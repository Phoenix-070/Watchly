import { useEffect, useState, useRef, useCallback } from "react";
import Navigation from "../components/Navigation";
import MovieCard from "../components/MovieCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("trending");
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastMovieElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchMovies = async (query = "", pageNum = 1, cat = category) => {
    try {
      setLoading(true);
      let url;
      switch (cat) {
        case 'trending':
          url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${pageNum}`;
          break;
        case 'top_rated':
          url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${pageNum}`;
          break;
        case 'upcoming':
          url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${pageNum}`;
          break;
        case 'search':
          url = `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${pageNum}`;
          break;
        default:
          url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${pageNum}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setMovies(prevMovies => 
        pageNum === 1 ? data.results : [...prevMovies, ...data.results]
      );
      setHasMore(data.page < data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMovies(searchTerm, 1);
  }, [category]);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(searchTerm, page);
    }
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setCategory('search');
    setPage(1);
    fetchMovies(query, 1, 'search');
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchTerm("");
  };

  return (
    <div className="home-container">
      <Navigation />
      
      <main className="main-content">
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          <div className="category-filters">
            <button 
              className={`category-btn ${category === 'trending' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('trending')}
            >
              <i className="fas fa-fire"></i> Trending
            </button>
            <button 
              className={`category-btn ${category === 'top_rated' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('top_rated')}
            >
              <i className="fas fa-star"></i> Top Rated
            </button>
            <button 
              className={`category-btn ${category === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('upcoming')}
            >
              <i className="fas fa-calendar"></i> Upcoming
            </button>
          </div>
        </div>

        <h2 className="section-title">
          {searchTerm ? "Search Results" : `${category.replace('_', ' ').toUpperCase()} MOVIES`}
        </h2>

        <div className="movies-grid">
          {movies.map((movie, index) => {
            if (movies.length === index + 1) {
              return (
                <div ref={lastMovieElementRef} key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              );
            } else {
              return <MovieCard key={movie.id} movie={movie} />;
            }
          })}
        </div>

        {loading && (
          <div className="loading-container">
            {[...Array(4)].map((_, index) => (
              <LoadingSkeleton key={index} type="movie-card" />
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="no-results">
            <i className="fas fa-film"></i>
            <p>No movies found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
