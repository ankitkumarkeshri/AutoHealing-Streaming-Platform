import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !url) return;

    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

  
    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;

      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        style={{
          width: "100%",
          borderRadius: "10px",
          background: "black",
        }}
      />
    </div>
  );
}