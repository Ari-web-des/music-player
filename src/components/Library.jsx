import React, { useRef } from "react";
import { formatTime } from '../utils';

export default function Library({ songs, onPlayById, onDelete, onAddToPlaylist }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImport(files);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="panel">
      <div className="header">
        <h3> 🎵 Library</h3>
      </div>

      <div className="song-list">
        {songs.length === 0 && (
          <div className="small">No songs yet — import using the button above.</div>
        )}
        {songs.map((s) => (
          <div className="song-item" key={s.id}>
            <button onClick={() => onPlayById(s.id)}>▶</button>
            <div className="meta">
              <div
                style={{
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </div>
              <div className="small">{formatTime(s.duration)}</div>
            </div>
            <div className="hstack">
              <button onClick={() => onAddToPlaylist(s.id)}>+ playlist</button>
              <button onClick={() => onDelete(s.id)}>delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
