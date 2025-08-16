import React, { useState } from "react";

export default function SearchAndPlay() {
  const [query, setQuery] = useState("");
  const [spotifyEmbed, setSpotifyEmbed] = useState(null);
  const [youtubeEmbed, setYoutubeEmbed] = useState(null);

  const token = import.meta.env.VITE_SPOTIFY_TOKEN;
  const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;  

  const searchSong = async () => {
    setSpotifyEmbed(null);
    setYoutubeEmbed(null);

    // --- Step 1: Search Spotify API ---
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (data.tracks && data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        setSpotifyEmbed(
          `https://open.spotify.com/embed/track/${track.id}?utm_source=generator`
        );
        return;
      }
    } catch (err) {
      console.error("Spotify error:", err);
    }

    // --- Step 2: If not found on Spotify → fallback to YouTube ---
    try {
      const ytRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
          query
        )}&key=${youtubeApiKey}`
      );
      const ytData = await ytRes.json();

      if (ytData.items && ytData.items.length > 0) {
        const videoId = ytData.items[0].id.videoId;
        setYoutubeEmbed(`https://www.youtube.com/embed/${videoId}`);
      } else {
        alert("Song not found on Spotify or YouTube");
      }
    } catch (err) {
      console.error("YouTube error:", err);
    }
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

      <div style={{ marginTop: "20px" }}>
        {spotifyEmbed && (
          <iframe
            title="Spotify Player"
            src={spotifyEmbed}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        )}

        {youtubeEmbed && (
          <iframe
            title="YouTube Player"
            src={youtubeEmbed}
            width="100%"
            height="380"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
