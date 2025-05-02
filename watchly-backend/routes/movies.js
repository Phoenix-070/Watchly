import express from "express";
import Movie from "../models/Movie.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get movie details and comments
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdbId: req.params.id });
    if (!movie) {
      // If not found, return empty comments
      return res.json({ comments: [] });
    }
    res.json({ comments: movie.comments || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a movie
router.post("/like", requireAuth, async (req, res) => {
  const { firebaseUid, movieId } = req.body;
  try {
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      // Create movie if it doesn't exist
      movie = new Movie({ tmdbId: movieId, likes: [], comments: [] });
    }
    if (!movie.likes.includes(firebaseUid)) {
      movie.likes.push(firebaseUid);
      await movie.save();
    }
    res.json({ message: "Movie liked", likes: movie.likes.length });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Comment on a movie
router.post("/comment", requireAuth, async (req, res) => {
  const { firebaseUid, movieId, text } = req.body;
  try {
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      // Create movie if it doesn't exist
      movie = new Movie({ tmdbId: movieId, likes: [], comments: [] });
    }
    movie.comments.push({ user: firebaseUid, text });
    await movie.save();
    res.json({ message: "Comment added", comments: movie.comments });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
