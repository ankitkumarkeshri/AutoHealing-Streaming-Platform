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


connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);


export const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/upload", uploadRoute);


const VIDEO_ROOT = path.resolve(__dirname, "../videos");
const HLS_DIR = path.join(VIDEO_ROOT, "hls");


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


app.get("/", (req, res) => {
  res.json({
    status: "OK",
    stack: "Mongo + Redis + Socket + HLS",
  });
});


app.get("/api/videos", async (req, res) => {
  try {
    const cache = await redisClient.get("videos");

    if (cache) {
      console.log("⚡ Redis HIT");
      return res.json(JSON.parse(cache));
    }

    console.log(" Mongo HIT");
    const videos = await Video.find().sort({ createdAt: -1 });

    await redisClient.set("videos", JSON.stringify(videos), {
      EX: 60,
    });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});


app.post("/api/videos/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

  
    await redisClient.del("videos");

    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "View update failed" });
  }
});

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


io.on("connection", (socket) => {
  console.log("⚡ Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
});