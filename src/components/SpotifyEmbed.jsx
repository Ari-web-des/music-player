import React from "react";

export default function TopTracksEmbed() {
  // Use a public Spotify playlist URL or search link
  const embedUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator";

  return (
    <div>
      <h3>Your Top Tracks (Public Playlist)</h3>
      <iframe
        title="Top Tracks Playlist"
        src={embedUrl}
        width="100%"
        height="360"
        style={{ border: "none" }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}
