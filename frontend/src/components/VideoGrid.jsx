export default function VideoGrid({ videos, onSelect, currentVideo }) {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {videos.map((v) => {
        // 🔥 FIX: compare by unique id (NOT url)
        const isActive =
          currentVideo &&
          (v._id === currentVideo._id || v.id === currentVideo.id);

        return (
          <div
            key={v._id || v.id}
            onClick={() => onSelect(v)}
            style={{
              padding: "10px",
              border: isActive
                ? "2px solid #ff4d4f"
                : "1px solid gray",
              cursor: "pointer",
              borderRadius: "8px",
              userSelect: "none",

              
              backgroundColor: isActive ? "#ffeaea" : "#fff",

            
              transition: "all 0.2s ease",
            }}
          >
            🎬 {v.name}
          </div>
        );
      })}
    </div>
  );
}