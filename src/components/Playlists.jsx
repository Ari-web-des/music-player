import React, { useState } from 'react';
import { FaPlay, FaTrash } from 'react-icons/fa';

export default function Playlists({ playlists, onCreate, onPlayPlaylist, onDeletePlaylist }) {
  const [name, setName] = useState('');

  return (
    <div className="panel">
      <div className="header"><h3>🎼 Playlists</h3></div>

      {/* Create Playlist Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', borderRadius: 6 }}
        />
        <button
          onClick={() => {
            if (name.trim()) {
              onCreate(name.trim());
              setName('');
            }
          }}
          style={{ background: '#3b82f6', color: '#fff', borderRadius: 6 }}
        >
          Create
        </button>
      </div>

      {/* Playlist List */}
      <div>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              marginBottom: 8,
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* Playlist Name & Song Count */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {pl.name}
              </div>
              <div className="small" style={{ marginTop: 2 }}>
                {pl.songIds.length} songs
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => onPlayPlaylist(pl.id)}
                style={{ background: '#22c55e', borderRadius: 6, padding: '4px 6px', color: 'white' }}
              >
                <FaPlay />
              </button>
              <button
                onClick={() => onDeletePlaylist(pl.id)}
                style={{ background: '#ef4444', borderRadius: 6, padding: '4px 6px', color: 'white' }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
