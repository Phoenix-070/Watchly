import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div 
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="movie-poster">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title}
          loading="lazy"
        />
        {isHovered && (
          <div className="movie-info-overlay">
            <h3>{movie.title}</h3>
            <div className="movie-rating">
              <i className="fas fa-star"></i>
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
            <p className="movie-release-date">
              {new Date(movie.release_date).getFullYear()}
            </p>
            <div className="quick-actions">
              <button className="action-btn watchlist">
                <i className="fas fa-plus"></i>
              </button>
              <button className="action-btn like">
                <i className="fas fa-heart"></i>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="movie-details">
        <h4>{movie.title}</h4>
        <div className="movie-meta">
          <span className="rating">
            <i className="fas fa-star"></i> {movie.vote_average.toFixed(1)}
          </span>
          <span className="year">
            {new Date(movie.release_date).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
