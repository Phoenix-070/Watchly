import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // Fetch movie details
        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch cast
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const creditsData = await creditsResponse.json();
        setCast(creditsData.cast.slice(0, 10));

        // Fetch similar movies
        const similarResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const similarData = await similarResponse.json();
        setSimilarMovies(similarData.results.slice(0, 6));

        // Fetch trailer
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const videosData = await videosResponse.json();
        const trailer = videosData.results.find(
          video => video.type === "Trailer" && video.site === "YouTube"
        );
        setTrailer(trailer);

        // Fetch comments from backend (all users)
        const commentsRes = await axios.get(`/api/movies/${id}`);
        let allComments = commentsRes.data.comments || [];

        // Fetch like, watchlist, and user comments status for this movie
        if (user) {
          // Like status
          try {
            const likeRes = await axios.get(`/api/users/${user.uid}/liked/${movieData.id}`);
            setLiked(!!likeRes.data.liked);
          } catch (e) {
            setLiked(false);
          }
          // Watchlist status
          try {
            const watchlistRes = await axios.get(`/api/users/${user.uid}/watchlist/${movieData.id}`);
            setInWatchlist(!!watchlistRes.data.saved);
          } catch (e) {
            setInWatchlist(false);
          }
          // Fetch user comments for this movie
          try {
            const userCommentsRes = await axios.get(`/api/users/${user.uid}/comments/${movieData.id}`);
            const userComments = userCommentsRes.data.comments || [];
            // Prepend user comments if not already present
            userComments.forEach(uc => {
              if (!allComments.some(c => c.comment === uc.comment && c.movieId === uc.movieId)) {
                allComments = [{ user: user.displayName || user.email, text: uc.comment, timestamp: uc.createdAt }, ...allComments];
              }
            });
          } catch (e) {
            // ignore
          }
        } else {
          setLiked(false);
          setInWatchlist(false);
        }
        setComments(allComments);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie data:", error);
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;
    try {
      if (!liked) {
        await axios.post(`/api/users/${user.uid}/liked`, {
          movie: { id: movie.id, title: movie.title }
        });
        setLiked(true);
      } else {
        await axios.delete(`/api/users/${user.uid}/liked/${movie.id}`);
        setLiked(false);
      }
    } catch (err) {
      alert("Error updating like status");
    }
  };

  const handleWatchlist = async () => {
    if (!user) return;
    try {
      if (!inWatchlist) {
        await axios.post(`/api/users/${user.uid}/watchlist`, {
          movie: { id: movie.id, title: movie.title, poster_path: movie.poster_path }
        });
        setInWatchlist(true);
      } else {
        await axios.delete(`/api/users/${user.uid}/watchlist/${movie.id}`);
        setInWatchlist(false);
      }
    } catch (err) {
      alert("Error updating watchlist");
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    try {
      await axios.post(`/api/movies/comment`, {
        firebaseUid: user.uid,
        movieId: movie.id,
        text: newComment
      });
      setComments([{ user: user.displayName || user.email, text: newComment, timestamp: new Date().toISOString() }, ...comments]);
      setNewComment("");
    } catch (err) {
      alert("Error posting comment");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Movie link copied to clipboard!");
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    // TODO: Implement rating functionality with backend
  };

  if (loading) return <LoadingSkeleton type="movie-details" />;
  if (!movie) return <div>Movie not found</div>;

  return (
    <div className="movie-details-container">
      <Navigation />
      
      <div className="movie-hero" style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), 
        url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
      }}>
        <div className="movie-hero-content">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="movie-poster"
          />
          
          <div className="movie-info">
            <h1>{movie.title}</h1>
            <div className="movie-meta">
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>{movie.runtime} min</span>
              <span>{movie.vote_average.toFixed(1)} ⭐</span>
            </div>
            
            <div className="genres">
              {movie.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="overview">{movie.overview}</p>

            <div className="user-actions">
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-btn ${star <= userRating ? 'active' : ''}`}
                    onClick={() => handleRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <button className={`action-btn like${liked ? ' active' : ''}`} onClick={handleLike}>
                <i className="fas fa-heart"></i> {liked ? "Liked" : "Like"}
              </button>
              <button className={`action-btn watchlist${inWatchlist ? ' active' : ''}`} onClick={handleWatchlist}>
                <i className="fas fa-bookmark"></i> {inWatchlist ? "Saved" : "Save"}
              </button>
              <button className="action-btn share" onClick={handleShare}>
                <i className="fas fa-share"></i> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {trailer && (
        <div className="trailer-section">
          <h2>Trailer</h2>
          <div className="trailer-container">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Movie Trailer"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div className="cast-section">
        <h2>Cast</h2>
        <div className="cast-list">
          {cast.map(person => (
            <div key={person.id} className="cast-card">
              <img
                src={person.profile_path 
                  ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                  : 'https://via.placeholder.com/200x300'}
                alt={person.name}
              />
              <h4>{person.name}</h4>
              <p>{person.character}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="similar-movies">
        <h2>Similar Movies</h2>
        <div className="similar-movies-grid">
          {similarMovies.map(similar => (
            <Link to={`/movie/${similar.id}`} key={similar.id} className="similar-movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w200${similar.poster_path}`}
                alt={similar.title}
              />
              <h4>{similar.title}</h4>
              <span className="rating">⭐ {similar.vote_average.toFixed(1)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        <div className="comment-input">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button onClick={handleComment}>
            <i className="fas fa-paper-plane"></i> Post
          </button>
        </div>
        
        <div className="comments-list">
          {comments.map((comment, idx) => (
            <div key={idx} className="comment">
              <div className="comment-header">
                <strong>{comment.user}</strong>
                <span className="timestamp">
                  {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ""}
                </span>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
