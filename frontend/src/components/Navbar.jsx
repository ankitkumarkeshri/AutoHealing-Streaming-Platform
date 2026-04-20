import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{ display: "flex", gap: 20, padding: 10 }}>
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
    </div>
  );
}