import React, { useState } from "react";

export default function SearchAndPlay() {
  const [query, setQuery] = useState("");

  const searchSong = () => {
    if (!query) return;

    // Open Spotify search in new tab
    const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(
      query
    )}`;
    window.open(spotifyUrl, "_blank");

    // Optional: also open YouTube search in new tab
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    window.open(youtubeUrl, "_blank");
  };

  return (
    <div style={{ marginTop: "30px", textAlign: "center" }}>
      <h3>Search & Play a Song</h3>
      <input
        type="text"
        placeholder="Enter song or artist..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", width: "250px", borderRadius: "6px" }}
      />
      <button
        onClick={searchSong}
        style={{
          marginLeft: "10px",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </div>
  );
}
