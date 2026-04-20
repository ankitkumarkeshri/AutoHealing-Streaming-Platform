import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import uploadRoute from "./routes/upload.js";
import { connectDB } from "./db.js";
import { connectRedis } from "./redis.js";
import redisClient from "./redis.js";
import Video from "./models/Video.js";

// ================= CONNECT =================
connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);

// ================= SOCKET =================
export const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = 3000;

// ================= PATH =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// inject socket into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/upload", uploadRoute);

// ================= VIDEO PATH =================
const VIDEO_ROOT = path.resolve(__dirname, "../videos");
const HLS_DIR = path.join(VIDEO_ROOT, "hls");

// ================= STATIC =================
app.use(
  "/hls",
  express.static(HLS_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      }
      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    stack: "Mongo + Redis + Socket + HLS",
  });
});

// ======================================================
// 🎬 GET VIDEOS (REDIS CACHE)
// ======================================================
app.get("/api/videos", async (req, res) => {
  try {
    const cache = await redisClient.get("videos");

    if (cache) {
      console.log("⚡ Redis HIT");
      return res.json(JSON.parse(cache));
    }

    console.log("💾 Mongo HIT");
    const videos = await Video.find().sort({ createdAt: -1 });

    await redisClient.set("videos", JSON.stringify(videos), {
      EX: 60,
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ======================================================
// 👁️ INCREMENT VIEWS (WITH REDIS INVALIDATION)
// ======================================================
app.post("/api/videos/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    // 🔥 VERY IMPORTANT: clear cache
    await redisClient.del("videos");

    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "View update failed" });
  }
});

// ======================================================
// 🔍 SEARCH
// ======================================================
app.get("/api/videos/search", async (req, res) => {
  try {
    const q = req.query.q || "";

    const results = await Video.find({
      name: { $regex: q, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ======================================================
// 📅 DATE FILTER
// ======================================================
app.get("/api/videos/date", async (req, res) => {
  try {
    const { from, to } = req.query;

    const videos = await Video.find({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    }).sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Date filter failed" });
  }
});

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("⚡ Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ================= START =================
server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});