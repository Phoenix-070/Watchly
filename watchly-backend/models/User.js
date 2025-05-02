import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  movieTitle: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const watchlistItemSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  movieTitle: { type: String, required: true },
  poster_path: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  fullName: { type: String },
  email: { type: String, required: true },
  watchlist: [watchlistItemSchema],
  reviews: [reviewSchema],
  likedMovies: [{
    movieId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    likedAt: { type: Date, default: Date.now }
  }],
  stats: {
    totalWatchTime: { type: Number, default: 0 }, // in minutes
    favoriteGenres: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  preferences: {
    favoriteGenres: [{ type: String }],
    contentRating: { type: String, default: 'All' },
    language: { type: String, default: 'en' }
  },
  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating when a review is added
userSchema.methods.updateStats = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.averageRating = totalRating / this.reviews.length;
    this.stats.totalReviews = this.reviews.length;
  }
};

// Add a movie to watchlist
userSchema.methods.addToWatchlist = function(movie) {
  if (!this.watchlist.some(item => item.movieId === movie.id)) {
    this.watchlist.push({
      movieId: movie.id,
      movieTitle: movie.title,
      poster_path: movie.poster_path || '',
    });
  }
};

// Remove a movie from watchlist
userSchema.methods.removeFromWatchlist = function(movieId) {
  this.watchlist = this.watchlist.filter(item => item.movieId !== movieId);
};

// Add a movie to liked movies
userSchema.methods.likeMovie = function(movie) {
  if (!this.likedMovies.some(item => item.movieId === movie.id)) {
    this.likedMovies.push({
      movieId: movie.id,
      movieTitle: movie.title
    });
  }
};

// Remove a movie from liked movies
userSchema.methods.unlikeMovie = function(movieId) {
  this.likedMovies = this.likedMovies.filter(item => item.movieId !== movieId);
};

// Add a review
userSchema.methods.addReview = function(review) {
  const existingReviewIndex = this.reviews.findIndex(r => r.movieId === review.movieId);
  
  if (existingReviewIndex !== -1) {
    // Update existing review
    this.reviews[existingReviewIndex] = {
      ...this.reviews[existingReviewIndex],
      ...review,
      createdAt: Date.now()
    };
  } else {
    // Add new review
    this.reviews.push(review);
  }
  
  this.updateStats();
};

// Update favorite genres based on user activity
userSchema.methods.updateFavoriteGenres = function(genres) {
  const genreCount = {};
  
  // Count occurrences of each genre from reviews and liked movies
  [...this.reviews, ...this.likedMovies].forEach(item => {
    if (item.genres) {
      item.genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    }
  });
  
  // Sort genres by count and get top 5
  this.stats.favoriteGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);
};

export default mongoose.model("User", userSchema);
