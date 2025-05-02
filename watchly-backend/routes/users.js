import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get user profile
router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update user
router.post("/", async (req, res) => {
  try {
    const { firebaseUid, email, fullName } = req.body;
    
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      user.email = email;
      user.fullName = fullName;
    } else {
      user = new User({
        firebaseUid,
        email,
        fullName
      });
    }
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add movie to watchlist
router.post("/:firebaseUid/watchlist", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { movie } = req.body;
    user.addToWatchlist(movie);
    await user.save();
    
    res.json(user.watchlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove movie from watchlist
router.delete("/:firebaseUid/watchlist/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.removeFromWatchlist(parseInt(req.params.movieId));
    await user.save();
    
    res.json(user.watchlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add movie to liked movies
router.post("/:firebaseUid/liked", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { movie } = req.body;
    user.likeMovie(movie);
    await user.save();
    
    res.json(user.likedMovies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove movie from liked movies
router.delete("/:firebaseUid/liked/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.unlikeMovie(parseInt(req.params.movieId));
    await user.save();
    
    res.json(user.likedMovies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add or update review
router.post("/:firebaseUid/reviews", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const review = req.body;
    user.addReview(review);
    await user.save();
    
    res.json(user.reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete("/:firebaseUid/reviews/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.reviews = user.reviews.filter(
      review => review.movieId !== parseInt(req.params.movieId)
    );
    user.updateStats();
    await user.save();
    
    res.json(user.reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user preferences
router.patch("/:firebaseUid/preferences", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { preferences } = req.body;
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.json(user.preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user stats
router.get("/:firebaseUid/stats", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.updateFavoriteGenres();
    await user.save();
    
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if a movie is liked by the user
router.get("/:firebaseUid/liked/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const liked = user.likedMovies.some(m => m.movieId === parseInt(req.params.movieId));
    res.json({ liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if a movie is in the user's watchlist
router.get("/:firebaseUid/watchlist/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const saved = user.watchlist.some(m => m.movieId === parseInt(req.params.movieId));
    res.json({ saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a movie by the user
router.get("/:firebaseUid/comments/:movieId", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const comments = user.reviews.filter(r => r.movieId === parseInt(req.params.movieId) && r.comment);
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
