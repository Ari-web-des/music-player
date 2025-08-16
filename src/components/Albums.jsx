import React from "react";
import "./Albums.css"; // Import the styles

export default function Albums({ albums }) {
  const handleAlbumClick = (album) => {
    // Directly open Spotify search for the album
    const query = encodeURIComponent(`${album.title} ${album.artist}`);
    const spotifyUrl = `https://open.spotify.com/search/${query}`;
    window.open(spotifyUrl, "_blank");
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
