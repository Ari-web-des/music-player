import React, { useState, useEffect } from "react";

export default function TopTracksEmbed({ spotifyToken }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!spotifyToken) {
      setError("Missing Spotify token.");
      return;
    }

    async function fetchAndEmbedTopTracks() {
      try {
        // 1. Fetch top tracks
        const tracksRes = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=10",
          { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );

        if (!tracksRes.ok) {
          throw new Error(`Top tracks error: ${tracksRes.status}`);
        }

        const tracksData = await tracksRes.json();
        if (!tracksData.items || tracksData.items.length === 0) {
          throw new Error("No top tracks found.");
        }

        const uris = tracksData.items.map((t) => t.uri);

        // 2. Get user profile
        const userRes = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${spotifyToken}` },
        });

        if (!userRes.ok) {
          throw new Error(`User fetch error: ${userRes.status}`);
        }

        const userData = await userRes.json();
        const userId = userData.id;

        // 3. Create playlist
        const playlistRes = await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "Top Tracks",
              description: "Your top 10 tracks 🎵",
              public: false,
            }),
          }
        );

        if (!playlistRes.ok) {
          throw new Error(`Playlist creation error: ${playlistRes.status}`);
        }

        const playlistData = await playlistRes.json();
        const playlistId = playlistData.id;

        // 4. Add tracks to playlist
        await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${spotifyToken}` },
            body: JSON.stringify({ uris }),
          }
        );

        // 5. Set embed URL
        setEmbedUrl(
          `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`
        );
      } catch (err) {
        console.error("Spotify embed error:", err);
        setError(err.message);
      }
    }

    fetchAndEmbedTopTracks();
  }, [spotifyToken]);

  if (error) return <div style={{ color: "red" }}>⚠ {error}</div>;
  if (!embedUrl) return <div>Loading your top tracks...</div>;

  return (
    <iframe
      title="Your Top Songs"
      src={embedUrl}
      width="100%"
      height="360"
      style={{ border: "none" }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  );
}
