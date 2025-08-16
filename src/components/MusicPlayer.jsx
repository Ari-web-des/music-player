import React from "react";
import "./MusicPlayer.css";

export default function MusicPlayer() {
  return (
    <div className="app-container">
      <div className="library">
        <h2>Library</h2>
        <input type="file" multiple />
        <p className="tip">
          Tip: upload only tracks you own / have rights to.
        </p>
        <div className="library-list">
          <p>No songs yet — import using the file picker above.</p>
        </div>
      </div>

      <div className="player">
        <h2>No song selected</h2>
        <div className="controls">
          <button>{"<<"}</button>
          <button>Pause</button>
          <button>{">>"}</button>
        </div>
        <div className="time">0:00 / 0:00</div>
        <label>
          Volume
          <input type="range" min="0" max="100" />
        </label>
      </div>

      <div className="playlists">
        <h2>Playlists</h2>
        <div className="playlist-create">
          <input type="text" placeholder="New playlist name" />
          <button>Create</button>
        </div>
        <p>Add selected song to playlist (use library + button)</p>
      </div>
    </div>
  );
}
