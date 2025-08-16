import React from "react";
import "./Albums.css"; // Import the styles

export default function Albums({ albums }) {
  const handleAlbumClick = async (album) => {
    try {
      // 1️⃣ Get a fresh token from your backend
      const res = await fetch("http://localhost:4000/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "your_refresh_token_here" }),
      });
      const tokenData = await res.json();
      const token = tokenData.access_token;

      // 2️⃣ Use that token to search Spotify for the album
      const query = encodeURIComponent(`${album.title} ${album.artist}`);
      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const spotifyData = await spotifyRes.json();

      // 3️⃣ Handle the response safely
      if (
        spotifyData.albums &&
        spotifyData.albums.items &&
        spotifyData.albums.items.length > 0
      ) {
        const albumUrl = spotifyData.albums.items[0].external_urls.spotify;
        window.open(albumUrl, "_blank");
      } else {
        console.error("Spotify API error:", spotifyData);
        alert("Album not found or token expired. Please login again.");
      }
    } catch (err) {
      console.error("Error in handleAlbumClick:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  return (
    <div className="albums-section">
      <h3 className="albums-heading">Featured Albums</h3>
      <div className="albums-container">
        {albums.map((album, idx) => (
          <div
            key={idx}
            className="album-card"
            onClick={() => handleAlbumClick(album)}
          >
            <img src={album.cover} alt={album.title} className="album-cover" />
            <div className="album-title">{album.title}</div>
            <div className="album-artist">{album.artist}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
