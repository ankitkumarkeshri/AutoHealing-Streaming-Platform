import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

import Video from "../models/Video.js";
import redisClient from "../redis.js";

const router = express.Router();

// ================= PATH =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, "../../videos");
const UPLOAD_DIR = path.join(BASE_DIR, "uploads");
const HLS_DIR = path.join(BASE_DIR, "hls");

// ensure folders
[UPLOAD_DIR, HLS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ======================================================
// 🎬 UPLOAD + HLS + DB + REDIS + SOCKET
// ======================================================
router.post("/", upload.single("video"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const videoId = Date.now().toString();
    const inputPath = req.file.path;

    const outputDir = path.join(HLS_DIR, videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    const ffmpeg = spawn("ffmpeg", [
      "-i", inputPath,
      "-c:v", "copy",
      "-c:a", "aac",
      "-hls_time", "4",
      "-hls_list_size", "0",
      "-f", "hls",
      path.join(outputDir, "index.m3u8"),
    ]);

    ffmpeg.on("close", async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "FFmpeg failed" });
      }

      const video = new Video({
        name: req.file.originalname,
        url: `http://localhost:3000/hls/${videoId}/index.m3u8`,
        videoId,
      });

      await video.save();

      // 🔥 CLEAR REDIS CACHE
      await redisClient.del("videos");

      // 🔥 SOCKET EMIT
      req.io.emit("new-video", video);

      res.json(video);
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;