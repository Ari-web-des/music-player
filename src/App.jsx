import React, { useEffect, useState, useRef } from 'react';
import * as db from './db';
import Player from './components/player';
import Library from './components/Library';
import Playlists from './components/Playlists';
import { parseBlob } from 'music-metadata';
import Albums from "./components/Albums";
import TopTracksEmbed from "./components/SpotifyEmbed";
import SearchAndPlay from "./components/SearchAndPlay";

function createObjectURLFromBlob(blob) {
  try {
    if (blob instanceof Blob) return URL.createObjectURL(blob);
    console.warn("Invalid blob:", blob);
    return null;
  } catch (err) {
    console.error("Failed to create object URL:", err);
    return null;
  }
}

export default function App() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const featuredAlbums = [
    { title: "Bollywood Classics", artist: "Various Artists", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop" },
    { title: "Romantic Hits", artist: "Arijit Singh", cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228" },
    { title: "Dance Beats", artist: "DJ Mix", cover: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop" },
    { title: "Lo-Fi Nights", artist: "Lo-Fi Collective", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop" }
  ];

  function handleAlbumClick(album) {
    const artistSongs = songs.filter(song => song.artist === album.artist);
    if (artistSongs.length > 0) {
      const ids = artistSongs.map(s => s.id);
      setQueue(ids);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }

  useEffect(() => {
    // load songs & playlists from DB
    (async () => {
      const dbSongs = await db.getAllSongs();
      const mapped = dbSongs.map(s => ({
        id: s.id,
        name: s.name,
        title: s.title || s.name, 
        artist: s.artist || 'Unknown Artist',
        duration: s.duration,
        blob: s.blob,
        url: createObjectURLFromBlob(s.blob)
      }));
      setSongs(mapped);

      const pls = await db.getAllPlaylists();
      setPlaylists(pls);
    })();

    // register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    // revoke object URLs on cleanup
    return () => {
      songs.forEach(s => { try { if (s.url) URL.revokeObjectURL(s.url); } catch{} });
    };
  }, [songs]);

  async function handleFiles(files) {
  const arr = Array.from(files);
  for (const f of arr) {
    let title = f.name;
    let artist = 'Unknown Artist';
    let duration = null;

    try {
      const metadata = await parseBlob(f);
      title = metadata.common?.title || f.name;
      artist = metadata.common?.artist || 'Unknown Artist';
      duration = metadata.format?.duration || null;
    } catch (err) {
      console.warn('Metadata extraction failed for', f.name, err);
    }

    const saved = await db.addSong(f); 
    const url = createObjectURLFromBlob(saved.blob);

    setSongs(prev => [
      ...prev,
      {
        id: saved.id,
        name: saved.name,
        title,
        artist,
        duration: duration || saved.duration,
        blob: saved.blob,
        url
      }
    ]);
  }
}

  async function handleDeleteSong(id) {
    await db.deleteSong(id);
    setSongs(prev => prev.filter(s => s.id !== id));
    const newPls = playlists.map(p => ({ ...p, songIds: p.songIds.filter(x => x !== id) }));
    setPlaylists(newPls);
    newPls.forEach(p => db.updatePlaylist(p));
  }

  function playById(id) {
    const allIds = songs.map(s => s.id);
    const idx = allIds.indexOf(id);
    setQueue(allIds);
    setCurrentIndex(idx >= 0 ? idx : 0);
  }
  async function updatePlaylistName(id, newName) {
  // find the playlist
  const pl = playlists.find(p => p.id === id);
  if (!pl) return;

  // update the name
  pl.name = newName;

  // update in IndexedDB
  await db.updatePlaylist(pl);

  // update state
  setPlaylists(prev => prev.map(p => (p.id === id ? pl : p)));
}
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const currentSong = (() => {
    const id = queue[currentIndex];
    if (!id) return null;
    return songs.find(s => s.id === id) || null;
  })();

  function goNext() {
    if (currentIndex + 1 < queue.length) setCurrentIndex(i => i + 1);
  }
  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }

  async function createPlaylist(name) {
    const pl = await db.createPlaylist(name, []);
    setPlaylists(prev => [...prev, pl]);
  }

  async function addSongToPlaylist(songId, playlistId) {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    pl.songIds.push(songId);
    await db.updatePlaylist(pl);
    setPlaylists(prev => prev.map(p => (p.id===pl.id ? pl : p)));
  }

  async function playPlaylist(playlistId) {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || pl.songIds.length === 0) return;
    setQueue(pl.songIds);
    setCurrentIndex(0);
  }

  async function deletePlaylist(playlistId) {
    await db.deletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  }

  const songsMap = Object.fromEntries(songs.map(s => [s.id, s]));

  return (
    <div className="app">
      {/* Left Panel */}
      <div className="panel">
        <div className="header"><h2>Library</h2></div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="file-upload" className="import-btn">📂 Import Songs</label>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
          />
          <div className="small" style={{ marginTop: 6 }}>
            Tip: upload only tracks you own / have rights to.
          </div>
        </div>
        <Library
          songs={songs}
          onPlayById={playById}
          onDelete={handleDeleteSong}
          onAddToPlaylist={async (sid) => {
            if (playlists.length === 0) {
              const pl = await db.createPlaylist('My Playlist', [sid]);
              setPlaylists((prev) => [...prev, pl]);
            } else {
              const pl = playlists[0];
              pl.songIds.push(sid);
              await db.updatePlaylist(pl);
              setPlaylists((prev) =>
                prev.map((p) => (p.id === pl.id ? pl : p))
              );
            }
          }}
        />
      </div>

      {/* Middle Panel */}
      <div>
        <Player
          current={currentSong}
          queue={queue}
          onNext={goNext}
          onPrev={goPrev}
          onEnded={goNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          audioRef={audioRef}
        />
        <div>
          <Albums albums={featuredAlbums} onAlbumClick={handleAlbumClick} />
          <TopTracksEmbed /> {/* Now frontend-only component */}
        </div>
      </div>

      {/* Right Panel */}
      <div>
        <Playlists
          playlists={playlists}
          songsMap={songsMap}
          onCreate={createPlaylist}
          onPlayPlaylist={playPlaylist}
          onDeletePlaylist={deletePlaylist}
          onAddSongToPlaylist={addSongToPlaylist}
          onUpdatePlaylist={updatePlaylistName}
        />
        <SearchAndPlay /> {/* Now frontend-only component */}
      </div>

      {/* Sticky Bottom Player Bar */}
      {currentSong && (
        <div className="player-bar">
          <div
            className="album-art"
            style={{
              animation: "spin 8s linear infinite",
              animationPlayState: isPlaying ? "running" : "paused"
            }}
          >
            <img
              src={currentSong.cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"}
              alt="Album Art"
            />
          </div>
          <div className="player-info">
            <div className="player-title">{currentSong?.title}</div>
            <div className="player-artist">{currentSong?.artist}</div>
          </div>
          <div className="player-controls">
            <button onClick={goPrev}>⏮</button>
            <button onClick={goNext}>⏭</button>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={currentSong ? currentSong.url : null}
        onEnded={goNext}
      />
    </div>
  );
}
