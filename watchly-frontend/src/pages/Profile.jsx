import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Profile = () => {
  const { user, updateUserProfile, resetPassword, signout } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    favoriteGenres: [],
    watchTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!user) return;
        const res = await fetch(`/api/users/${user.uid}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        const userData = await res.json();
        setWatchlist((userData.watchlist || []).map(m => ({
          id: m.movieId,
          title: m.movieTitle,
          poster_path: m.poster_path || '',
          rating: m.rating || 0
        })));
        setLikedMovies((userData.likedMovies || []).map(m => ({
          id: m.movieId,
          title: m.movieTitle,
          poster_path: m.poster_path || '',
          rating: m.rating || 0
        })));
        setReviews((userData.reviews || []).map(r => ({
          id: r._id || r.movieId,
          movieId: r.movieId,
          movieTitle: r.movieTitle,
          rating: r.rating,
          text: r.comment,
          date: r.createdAt
        })));
        setStats({
          totalReviews: userData.stats?.totalReviews || 0,
          averageRating: userData.stats?.averageRating || 0,
          favoriteGenres: userData.stats?.favoriteGenres || [],
          watchTime: userData.stats?.totalWatchTime || 0
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await updateUserProfile({ displayName });
      setMessage("Profile updated!");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setMessage("");
    setError("");
    try {
      await resetPassword(user.email);
      setMessage("Password reset email sent!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signout();
  };

  if (loading) return <LoadingSkeleton type="profile" />;

  return (
    <div className="profile-container">
      <Navigation />
      
      <div className="profile-header">
        <div className="profile-info">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}`} 
            alt="Profile" 
            className="profile-avatar"
          />
          <div className="profile-details">
            <h1>{user?.displayName}</h1>
            <p className="join-date">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <i className="fas fa-star"></i>
            <h3>{stats.averageRating.toFixed(1)}</h3>
            <p>Average Rating</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-comment"></i>
            <h3>{stats.totalReviews}</h3>
            <p>Reviews</p>
          </div>
          <div className="stat-card">
            <i className="fas fa-clock"></i>
            <h3>{Math.round(stats.watchTime / 60)}</h3>
            <p>Watch Hours</p>
          </div>
        </div>

        <div className="favorite-genres">
          <h3>Favorite Genres</h3>
          <div className="genre-tags">
            {stats.favoriteGenres.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <i className="fas fa-list"></i> Watchlist
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fas fa-star"></i> Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            <i className="fas fa-heart"></i> Liked Movies
          </button>
        </div>

        {activeTab === 'watchlist' && (
          <div className="watchlist-grid">
            {watchlist.length > 0 ? (
              watchlist.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    alt={movie.title} 
                  />
                  <div className="movie-card-overlay">
                    <h4>{movie.title}</h4>
                    <span className="rating">⭐ {movie.rating}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-content">Your watchlist is empty</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <Link to={`/movie/${review.movieId}`}>
                    <h4>{review.movieTitle}</h4>
                  </Link>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="review-text">{review.text}</p>
                  <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="no-content">No reviews yet</p>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="liked-movies-grid">
            {likedMovies.length > 0 ? (
              likedMovies.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    alt={movie.title} 
                  />
                  <div className="movie-card-overlay">
                    <h4>{movie.title}</h4>
                    <span className="rating">⭐ {movie.rating}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-content">No liked movies yet</p>
            )}
          </div>
        )}
      </div>

      <div className="profile-card">
        <h2>Profile</h2>
        <form onSubmit={handleUpdate} className="profile-form">
          <label>Email</label>
          <input type="email" value={user.email} disabled className="profile-input" />
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="profile-input"
          />
          <button type="submit" className="profile-btn" disabled={loading}>
            Update Profile
          </button>
        </form>
        <button className="profile-btn secondary" onClick={handlePasswordReset}>
          Send Password Reset Email
        </button>
        <button className="profile-btn logout" onClick={handleSignOut}>
          Sign Out
        </button>
        {message && <div className="profile-message">{message}</div>}
        {error && <div className="profile-error">{error}</div>}
      </div>
    </div>
  );
};

export default Profile;
