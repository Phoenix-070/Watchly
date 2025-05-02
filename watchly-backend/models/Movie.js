import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  tmdbId: { type: String, required: true, unique: true }, // TMDB Movie ID
  title: { type: String, required: true },
  poster: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ user: String, text: String }],
});

export default mongoose.model("Movie", movieSchema);
