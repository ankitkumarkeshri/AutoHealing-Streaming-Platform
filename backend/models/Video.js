import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    // 🔥 NEW FIELD: views count
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;