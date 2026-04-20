import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

import VideoPlayer from "../components/VideoPlayer";
import VideoGrid from "../components/VideoGrid";

// 🔥 socket connect
const socket = io("http://localhost:3000");

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const userSelectedRef = useRef(false);

  // ================= FETCH =================
  const fetchVideos = async (url = "http://localhost:3000/api/videos") => {
    try {
      const res = await fetch(url);
      const data = await res.json();

      setVideos(data);

      // 🔥 IMPORTANT: store FULL OBJECT (not just URL)
      if (!userSelectedRef.current && data.length > 0) {
        setCurrentVideo(data[0]);
      }

    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchVideos();
  }, []);

  // ================= SOCKET =================
  useEffect(() => {
    socket.on("new-video", (video) => {
      setVideos((prev) => [video, ...prev]);

      if (!userSelectedRef.current) {
        setCurrentVideo(video);
      }
    });

    return () => socket.off("new-video");
  }, []);

  // ================= VIDEO CLICK =================
  const handleSelect = (video) => {
    userSelectedRef.current = true;
    setCurrentVideo(video); // 🔥 FULL OBJECT
  };

  // ================= SEARCH =================
  const handleSearch = () => {
    userSelectedRef.current = false;

    if (!search.trim()) {
      fetchVideos();
      return;
    }

    fetchVideos(
      `http://localhost:3000/api/videos/search?q=${search}`
    );
  };

  // ================= DATE FILTER =================
  const handleDateFilter = () => {
    userSelectedRef.current = false;

    if (!fromDate || !toDate) return;

    fetchVideos(
      `http://localhost:3000/api/videos/date?from=${fromDate}&to=${toDate}`
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎬 Streaming Platform (Realtime)</h2>

      {/* SEARCH */}
      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* DATE FILTER */}
      <div style={{ marginBottom: "20px" }}>
        <input type="date" onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" onChange={(e) => setToDate(e.target.value)} />

        <button type="button" onClick={handleDateFilter}>
          Filter
        </button>
      </div>

      {/* ================= PLAYER ================= */}
      {currentVideo && (
        <>
          <VideoPlayer url={currentVideo.url} />

          {/* 🔥 INFO PANEL */}
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              border: "1px solid gray",
              borderRadius: "8px",
              background: "#111",
              color: "#fff",
            }}
          >
            <h3>{currentVideo.name}</h3>

            <p>
              📅 {new Date(currentVideo.createdAt).toLocaleString()}
            </p>

            <p>🆔 {currentVideo.videoId}</p>
          </div>
        </>
      )}

      <hr />

      {/* ================= GRID ================= */}
      <VideoGrid
        videos={videos}
        onSelect={handleSelect}
        currentVideo={currentVideo} // 🔥 important for highlight
      />
    </div>
  );
}